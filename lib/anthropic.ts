// Thin wrapper around the OpenAI SDK used by our API routes.
// - Builds a layered system prompt from the harness config
// - Supports an optional list of uploaded deliverables injected as user context

import OpenAI from "openai";
import {
  getActiveStandard,
  renderReferenceBrief,
  type HarnessConfig,
} from "./standards";

let _client: OpenAI | null = null;
function client(): OpenAI {
  if (_client) return _client;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");
  _client = new OpenAI({ apiKey });
  return _client;
}

export type UploadedDoc = {
  id: string;
  name: string;
  size: number;
  mime: string;
  content: string; // extracted text (truncated if huge)
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

// Loose types so we don't depend on exact SDK type paths.
type AnyBlock = Record<string, unknown>;

// Compose the layered system prompt string from the harness config.
// The reference knowledge is auto-injected from the currently active
// standard's `reference` array, filtered by the harness's `scope_item_ids`.
async function buildSystemPrompt(cfg: HarnessConfig): Promise<string> {
  const standard = await getActiveStandard();
  const parts: string[] = [];

  parts.push(
    `# Active Standard\n\nYou are acting as an assessor for: **${standard.name}** (version ${standard.version}).\nTarget maturity level: ${cfg.target_maturity_level}.\nDescription: ${standard.description}`
  );

  for (const layer of cfg.prompt_layers) {
    let content = layer.content;
    if (layer.id === "reference_knowledge" || layer.id === "aspice_knowledge") {
      content = renderReferenceBrief(standard.reference, cfg.scope_item_ids);
    }
    parts.push(`# ${layer.label}\n\n${content}`);
  }

  const rubricText =
    "# Scoring Dimensions (weights)\n" +
    cfg.rubric
      .map((r) => `- ${r.label} (${r.id}, weight=${r.weight}): ${r.description}`)
      .join("\n");
  parts.push(rubricText);

  return parts.join("\n\n---\n\n");
}

function buildDocsBlock(docs: UploadedDoc[]): string {
  if (!docs.length) return "";
  const parts = docs.map((d) => {
    const body = d.content.length > 20000 ? d.content.slice(0, 20000) + "\n...[truncated]" : d.content;
    return `## 파일: ${d.name}  (id=${d.id}, ${d.size} bytes, ${d.mime})\n\n${body}`;
  });
  return `다음은 평가 대상 산출물입니다. 각 파일을 분석하고 어떤 ASPICE Work Product에 대응하는지 식별하세요.\n\n${parts.join(
    "\n\n---\n\n"
  )}`;
}

function buildTools(harness: HarnessConfig) {
  return harness.tools
    .filter((t) => t.enabled)
    .map((t) => ({
      type: "function" as const,
      function: {
        name: t.name,
        description: t.description,
        parameters: t.input_schema,
      },
    }));
}

export async function runAgent(params: {
  harness: HarnessConfig;
  history: ChatMessage[];
  userMessage: string;
  docs: UploadedDoc[];
}) {
  const { harness, history, userMessage, docs } = params;
  const systemPrompt = await buildSystemPrompt(harness);

  const messages: AnyBlock[] = [{ role: "system", content: systemPrompt }];
  for (const m of history) {
    messages.push({ role: m.role, content: m.content });
  }

  const userContent: AnyBlock[] = [];
  const docsText = buildDocsBlock(docs);
  if (docsText) {
    userContent.push({ type: "text", text: docsText });
  }
  userContent.push({ type: "text", text: userMessage });
  messages.push({ role: "user", content: userContent });

  const tools = buildTools(harness);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = await client().chat.completions.create({
    model: harness.model,
    max_tokens: harness.max_tokens,
    temperature: harness.temperature,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    messages: messages as any,
    tools: tools.length ? tools : undefined,
  });

  const choice = response.choices[0];
  const text = choice.message.content ?? "";
  const toolUses = (choice.message.tool_calls ?? []).map((tc) => ({
    name: tc.function.name,
    input: (() => {
      try { return JSON.parse(tc.function.arguments || "{}"); } catch { return {}; }
    })(),
  }));

  return {
    text,
    toolUses,
    usage: response.usage,
    stopReason: choice.finish_reason,
  };
}

// Streaming variant. Emits incremental text deltas through callbacks so the
// UI can render a live "assessment in progress" view.
export type AgentStreamCallbacks = {
  onStart?: () => void;
  onDelta: (textDelta: string) => void;
  onDone: (result: {
    text: string;
    toolUses: { name: string; input: unknown }[];
    usage: unknown;
    stopReason: unknown;
  }) => void | Promise<void>;
  onError: (err: unknown) => void | Promise<void>;
};

export async function runAgentStream(
  params: {
    harness: HarnessConfig;
    history: ChatMessage[];
    userMessage: string;
    docs: UploadedDoc[];
  },
  cb: AgentStreamCallbacks
) {
  const { harness, history, userMessage, docs } = params;
  const systemPrompt = await buildSystemPrompt(harness);

  const messages: AnyBlock[] = [{ role: "system", content: systemPrompt }];
  for (const m of history) {
    messages.push({ role: m.role, content: m.content });
  }

  const userContent: AnyBlock[] = [];
  const docsText = buildDocsBlock(docs);
  if (docsText) {
    userContent.push({ type: "text", text: docsText });
  }
  userContent.push({ type: "text", text: userMessage });
  messages.push({ role: "user", content: userContent });

  const tools = buildTools(harness);

  try {
    cb.onStart?.();

    const stream = await client().chat.completions.create({
      model: harness.model,
      max_tokens: harness.max_tokens,
      temperature: harness.temperature,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      messages: messages as any,
      tools: tools.length ? tools : undefined,
      stream: true,
      stream_options: { include_usage: true },
    });

    const textParts: string[] = [];
    const toolCallsAcc: Record<number, { id: string; name: string; arguments: string }> = {};
    let stopReason: string | null = null;
    let usage: unknown = null;

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;

      if (delta?.content) {
        cb.onDelta(delta.content);
        textParts.push(delta.content);
      }

      if (delta?.tool_calls) {
        for (const tc of delta.tool_calls) {
          if (!toolCallsAcc[tc.index]) {
            toolCallsAcc[tc.index] = { id: tc.id ?? "", name: tc.function?.name ?? "", arguments: "" };
          }
          toolCallsAcc[tc.index].arguments += tc.function?.arguments ?? "";
        }
      }

      if (chunk.choices[0]?.finish_reason) {
        stopReason = chunk.choices[0].finish_reason;
      }
      if (chunk.usage) {
        usage = chunk.usage;
      }
    }

    const toolUses = Object.values(toolCallsAcc).map((tc) => ({
      name: tc.name,
      input: (() => {
        try { return JSON.parse(tc.arguments || "{}"); } catch { return {}; }
      })(),
    }));

    await cb.onDone({
      text: textParts.join(""),
      toolUses,
      usage,
      stopReason,
    });
  } catch (e) {
    await cb.onError(e);
  }
}
