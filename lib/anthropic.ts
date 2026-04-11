// Thin wrapper around the Anthropic SDK used by our API routes.
// - Builds a layered system prompt from the harness config
// - Uses prompt caching on stable layers (identity / aspice knowledge / rubric)
// - Supports an optional list of uploaded deliverables injected as user context

import Anthropic from "@anthropic-ai/sdk";
import type { HarnessConfig } from "./harness";
import { renderProcessBrief } from "./aspice";

let _client: Anthropic | null = null;
function client(): Anthropic {
  if (_client) return _client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");
  _client = new Anthropic({ apiKey });
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

// Loose types so we don't depend on exact SDK type paths — the SDK will
// validate at runtime. All blocks we build are plain JSON objects.
type AnyBlock = Record<string, unknown>;

// Compose the layered system prompt with cache_control breakpoints on stable
// layers. The ASPICE reference knowledge is auto-injected from the harness's
// selected processes.
export function buildSystemBlocks(cfg: HarnessConfig): AnyBlock[] {
  const blocks: AnyBlock[] = [];

  for (const layer of cfg.prompt_layers) {
    let content = layer.content;
    if (layer.id === "aspice_knowledge") {
      content = renderProcessBrief(cfg.aspice_processes);
    }
    const block: AnyBlock = {
      type: "text",
      text: `# ${layer.label}\n\n${content}`,
    };
    if (layer.cache) {
      block.cache_control = { type: "ephemeral" };
    }
    blocks.push(block);
  }

  const rubricText =
    "# Scoring Dimensions (weights)\n" +
    cfg.rubric
      .map((r) => `- ${r.label} (${r.id}, weight=${r.weight}): ${r.description}`)
      .join("\n");
  blocks.push({
    type: "text",
    text: rubricText,
    cache_control: { type: "ephemeral" },
  });

  return blocks;
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

export async function runAgent(params: {
  harness: HarnessConfig;
  history: ChatMessage[];
  userMessage: string;
  docs: UploadedDoc[];
}) {
  const { harness, history, userMessage, docs } = params;
  const system = buildSystemBlocks(harness);

  const messages: AnyBlock[] = [];
  for (const m of history) {
    messages.push({ role: m.role, content: m.content });
  }

  const userContentBlocks: AnyBlock[] = [];
  const docsText = buildDocsBlock(docs);
  if (docsText) {
    userContentBlocks.push({
      type: "text",
      text: docsText,
      cache_control: { type: "ephemeral" },
    });
  }
  userContentBlocks.push({ type: "text", text: userMessage });

  messages.push({ role: "user", content: userContentBlocks });

  const tools = harness.tools
    .filter((t) => t.enabled)
    .map((t) => ({
      name: t.name,
      description: t.description,
      input_schema: t.input_schema,
    }));

  // Cast to the SDK's expected shape at the boundary. The SDK accepts these
  // structures and validates them server-side.
  const response = await client().messages.create({
    model: harness.model,
    max_tokens: harness.max_tokens,
    temperature: harness.temperature,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    system: system as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    messages: messages as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tools: tools.length ? (tools as any) : undefined,
  });

  const textParts: string[] = [];
  const toolUses: { name: string; input: unknown }[] = [];
  for (const block of response.content) {
    if (block.type === "text") textParts.push(block.text);
    if (block.type === "tool_use") toolUses.push({ name: block.name, input: block.input });
  }

  return {
    text: textParts.join("\n\n"),
    toolUses,
    usage: response.usage,
    stopReason: response.stop_reason,
  };
}
