// ASPICE PAM v4.0 process definitions
export const ASPICE_DATA = JSON.parse(`{"SYS.2": {"id": "SYS.2", "name": "System Requirements Analysis", "purpose": "The purpose is to establish a structured and analyzed set of system requirements consistent with the stakeholder requirements.", "outcomes": ["System requirements are specified.", "System requirements are structured and prioritized.", "System requirements are analyzed for correctness and technical feasibility.", "The impact of system requirements on the operating environment is analyzed.", "Consistency and bidirectional traceability are established between system requirements and stakeholder requirements.", "The system requirements are agreed and communicated to all affected parties."], "bps": [{"id": "BP1", "title": "Specify system requirements", "description": "Use the stakeholder requirements to identify and document the functional and non-functional requirements for the system according to defined characteristics for requirements."}, {"id": "BP2", "title": "Structure system requirements", "description": "Structure and prioritize the system requirements."}, {"id": "BP3", "title": "Analyze system requirements", "description": "Analyze the specified system requirements including their interdependencies to ensure correctness, technical feasibility, and to support project management regarding project estimates."}, {"id": "BP4", "title": "Analyze the impact on the system context", "description": "Analyze the impact that the system requirements will have on elements in the relevant system context."}, {"id": "BP5", "title": "Ensure consistency and establish bidirectional traceability", "description": "Ensure consistency and establish bidirectional traceability between system requirements and stakeholder requirements."}, {"id": "BP6", "title": "Communicate agreed system requirements and impact on the system context", "description": "Communicate the agreed system requirements, and results of the impact analysis on the system context, to all affected parties."}], "guideline": "SYS.2 establishes structured system requirements consistent with stakeholder requirements. Requires specification, structuring/prioritization, analysis for correctness and technical feasibility, impact analysis on system context, bidirectional traceability, and communication to affected parties."}, "SYS.3": {"id": "SYS.3", "name": "System Architectural Design", "purpose": "The purpose is to establish an analyzed system architecture, comprising static and dynamic aspects, consistent with the system requirements.", "outcomes": ["A system architecture is designed including a definition of the system elements with their behavior, their interfaces, their relationships, and their interactions.", "The system architecture is analyzed against defined criteria, and special characteristics are identified.", "Consistency and bidirectional traceability are established between system architecture and system requirements.", "The agreed system architecture and the special characteristics are communicated to all affected parties."], "bps": [{"id": "BP1", "title": "Specify static aspects of the system architecture", "description": "Specify and document the static aspects of the system architecture with respect to functional and non-functional system requirements, including external interfaces and a defined set of system elements."}, {"id": "BP2", "title": "Specify dynamic aspects of the system architecture", "description": "Specify and document the dynamic aspects of the system architecture, including the behavior of the system elements and their interaction in different system modes."}, {"id": "BP3", "title": "Analyze system architecture", "description": "Analyze the system architecture regarding relevant technical design aspects, support project estimates, derive special characteristics. Document a rationale for design decisions."}, {"id": "BP4", "title": "Ensure consistency and establish bidirectional traceability", "description": "Ensure consistency and establish bidirectional traceability between the elements of the system architecture and the system requirements."}, {"id": "BP5", "title": "Communicate agreed system architecture", "description": "Communicate the agreed system architecture, including special characteristics, to all affected parties."}], "guideline": "SYS.3 establishes analyzed system architecture with static and dynamic views. Architecture is mainly non-functional requirements driven. Recursive decomposition with high cohesion and low coupling. Analysis covers cybersecurity, functional safety per ISO 26262, and robustness."}, "SYS.4": {"id": "SYS.4", "name": "System Integration and Integration Verification", "purpose": "The purpose is to integrate systems elements and verify that the integrated system elements are consistent with the system architecture.", "outcomes": ["Verification measures are specified for system integration verification.", "System elements are integrated up to a complete integrated system consistent with the release scope.", "Verification measures are selected according to the release scope.", "Integrated system elements are verified using the selected verification measures.", "Consistency and bidirectional traceability are established between verification measures and the system architecture.", "Bidirectional traceability between verification results and verification measures is established.", "Results are summarized and communicated to all affected parties."], "bps": [{"id": "BP1", "title": "Specify verification measures for system integration", "description": "Specify the verification measures with techniques, pass/fail criteria, entry/exit criteria, and required verification infrastructure."}, {"id": "BP2", "title": "Select verification measures", "description": "Document the selection of verification measures for each integration step considering selection criteria including criteria for regression verification."}, {"id": "BP3", "title": "Integrate system elements and perform integration verification", "description": "Integrate the system elements until fully integrated, perform the selected integration verification measures, and record results."}, {"id": "BP4", "title": "Ensure consistency and establish bidirectional traceability", "description": "Ensure consistency and establish bidirectional traceability between verification measures and the system architecture, and between verification results and verification measures."}, {"id": "BP5", "title": "Summarize and communicate results", "description": "Summarize the system integration and integration verification results and communicate them to all affected parties."}], "guideline": "SYS.4 verifies that integrated system elements are consistent with the system architecture. Supports HIL simulation, vehicle network simulation, digital mock-up. Explorative testing cannot be traced to system architectural design."}, "SYS.5": {"id": "SYS.5", "name": "System Verification", "purpose": "The purpose is to ensure that the system is verified to be consistent with the system requirements.", "outcomes": ["Verification measures are specified for system verification based on the system requirements.", "Verification measures are selected according to the release scope.", "The integrated system is verified using the selected verification measures.", "Consistency and bidirectional traceability are established between verification measures and system requirements.", "Bidirectional traceability is established between verification results and verification measures.", "Verification results are summarized and communicated to all affected parties."], "bps": [{"id": "BP1", "title": "Specify verification measures for system verification", "description": "Specify the verification measures suitable to provide evidence for compliance with the system requirements."}, {"id": "BP2", "title": "Select verification measures", "description": "Document the selection of verification measures considering selection criteria including criteria for regression verification."}, {"id": "BP3", "title": "Perform verification of the integrated system", "description": "Perform the verification of the integrated system using the selected verification measures and record results."}, {"id": "BP4", "title": "Ensure consistency and establish bidirectional traceability", "description": "Ensure consistency and establish bidirectional traceability between verification measures and system requirements."}, {"id": "BP5", "title": "Summarize and communicate results", "description": "Summarize the system verification results and communicate them to all affected parties."}], "guideline": "SYS.5 ensures the integrated system is verified against the system requirements. Black-box view. Supports HIL and similar verification environments."}, "SWE.1": {"id": "SWE.1", "name": "Software Requirements Analysis", "purpose": "The purpose is to establish a structured and analyzed set of software requirements consistent with the system requirements and the system architecture.", "outcomes": ["Software requirements are specified.", "Software requirements are structured and prioritized.", "Software requirements are analyzed for correctness and technical feasibility.", "The impact of software requirements on the operating environment is analyzed.", "Consistency and bidirectional traceability are established between software requirements and system requirements.", "Consistency and bidirectional traceability are established between software requirements and system architecture.", "The software requirements are agreed and communicated to all affected parties."], "bps": [{"id": "BP1", "title": "Specify software requirements", "description": "Use the system requirements and architecture to identify and document the functional and non-functional requirements for the software."}, {"id": "BP2", "title": "Structure software requirements", "description": "Structure and prioritize the software requirements."}, {"id": "BP3", "title": "Analyze software requirements", "description": "Analyze the software requirements including dependencies to ensure correctness, technical feasibility, and to support project estimates."}, {"id": "BP4", "title": "Analyze the impact on the operating environment", "description": "Analyze the impact that the software requirements will have on elements in the operating environment."}, {"id": "BP5", "title": "Ensure consistency and establish bidirectional traceability", "description": "Ensure consistency and establish bidirectional traceability between software requirements, system architecture, and system requirements."}, {"id": "BP6", "title": "Communicate agreed software requirements", "description": "Communicate the agreed software requirements and the impact analysis results to all affected parties."}], "guideline": "SWE.1 establishes software requirements consistent with system requirements and architecture. In software-only development, traceability may go directly to stakeholder requirements."}, "SWE.2": {"id": "SWE.2", "name": "Software Architectural Design", "purpose": "The purpose is to establish an analyzed software architecture, comprising static and dynamic aspects, consistent with the software requirements.", "outcomes": ["A software architecture is designed including static and dynamic aspects.", "The software architecture is analyzed against defined criteria.", "Consistency and bidirectional traceability are established between software architecture and software requirements.", "The software architecture is agreed and communicated to all affected parties."], "bps": [{"id": "BP1", "title": "Specify static aspects of the software architecture", "description": "Specify and document the static aspects of the software architecture with respect to functional and non-functional requirements, including external interfaces and software components."}, {"id": "BP2", "title": "Specify dynamic aspects of the software architecture", "description": "Specify and document the dynamic aspects, including behavior of software components and their interaction in different software modes, and concurrency aspects."}, {"id": "BP3", "title": "Analyze software architecture", "description": "Analyze the software architecture regarding relevant technical design aspects and to support project estimates. Document a rationale for design decisions."}, {"id": "BP4", "title": "Ensure consistency and establish bidirectional traceability", "description": "Ensure consistency and establish bidirectional traceability between the software architecture and the software requirements."}, {"id": "BP5", "title": "Communicate agreed software architecture", "description": "Communicate the agreed software architecture to all affected parties."}], "guideline": "SWE.2 establishes analyzed software architecture with static and dynamic aspects. Decomposition into manageable elements with high cohesion and low coupling. Analysis covers cybersecurity, functional safety per ISO 26262, robustness."}, "SWE.3": {"id": "SWE.3", "name": "Software Detailed Design and Unit Construction", "purpose": "The purpose is to establish a software detailed design consistent with the software architecture, and to construct software units consistent with the software detailed design.", "outcomes": ["A detailed design is specified including static and dynamic aspects.", "Software units as specified in the software detailed design are produced.", "Consistency and bidirectional traceability are established between software detailed design, software architecture, source code, and software requirements.", "The source code and the agreed software detailed design are communicated to all affected parties."], "bps": [{"id": "BP1", "title": "Specify the static aspects of the detailed design", "description": "For each software component specify the behavior of its software units, their static structure and relationships, their interfaces including valid data value ranges and physical units."}, {"id": "BP2", "title": "Specify dynamic aspects of the detailed design", "description": "Specify and document the dynamic aspects of the detailed design, including the interactions between relevant software units."}, {"id": "BP3", "title": "Develop software units", "description": "Develop and document the software units consistent with the detailed design and according to coding principles."}, {"id": "BP4", "title": "Ensure consistency and establish bidirectional traceability", "description": "Ensure consistency and establish bidirectional traceability between the software detailed design, the software architecture, the software units, and the software requirements."}, {"id": "BP5", "title": "Communicate agreed software detailed design", "description": "Communicate the agreed software detailed design and developed software units to all affected parties."}], "guideline": "SWE.3 - software unit is a logical modeling-level term, not implementation-level. Coding principles expected at CL1 include no implicit type conversions, single entry/exit point, encapsulation, defensive programming, range checks."}, "SWE.4": {"id": "SWE.4", "name": "Software Unit Verification", "purpose": "The purpose is to verify that software units are consistent with the software detailed design.", "outcomes": ["Verification measures for software unit verification are specified.", "Software unit verification measures are selected according to the release scope.", "Software units are verified using the selected verification measures.", "Consistency and bidirectional traceability are established between verification measures and software units.", "Results of the software unit verification are summarized and communicated to all affected parties."], "bps": [{"id": "BP1", "title": "Specify software unit verification measures", "description": "Specify verification measures for each software unit including pass/fail criteria, entry and exit criteria, and the required verification infrastructure."}, {"id": "BP2", "title": "Select software unit verification measures", "description": "Document the selection of verification measures considering selection criteria including criteria for regression verification."}, {"id": "BP3", "title": "Verify software units", "description": "Perform software unit verification using the selected verification measures and record results."}], "guideline": "SWE.4 covers unit testing and static verification. Code coverage is accompanying information that helps judging completeness, not a verification objective on its own."}, "SWE.5": {"id": "SWE.5", "name": "Software Component Verification and Integration Verification", "purpose": "The purpose is to verify software components against the software architectural design, and to integrate software elements and verify the integrated software elements.", "outcomes": ["Verification measures are specified for software integration verification.", "Verification measures for software components are specified.", "Software elements are integrated up to a complete integrated software.", "Verification measures are selected according to the release scope.", "Software components are verified using the selected verification measures.", "Integrated software elements are verified using the selected verification measures.", "Consistency and bidirectional traceability are established.", "Results are summarized and communicated to all affected parties."], "bps": [{"id": "BP1", "title": "Specify software integration verification measures", "description": "Specify verification measures based on a defined sequence and preconditions for the integration of software elements."}, {"id": "BP2", "title": "Specify verification measures for verifying software component behavior", "description": "Specify verification measures for software component verification against the defined components behavior and interfaces."}, {"id": "BP3", "title": "Select verification measures", "description": "Document the selection of integration verification measures for each integration step considering selection criteria."}, {"id": "BP4", "title": "Integrate software elements and perform integration verification", "description": "Integrate the software elements until fully integrated and perform the selected integration verification measures."}, {"id": "BP5", "title": "Perform software component verification", "description": "Perform the selected verification measures for verifying software component behavior and record results."}, {"id": "BP6", "title": "Ensure consistency and establish bidirectional traceability", "description": "Ensure consistency and establish bidirectional traceability between verification measures and the software architecture and detailed design."}, {"id": "BP7", "title": "Summarize and communicate results", "description": "Summarize the verification results and communicate them to all affected parties."}], "guideline": "SWE.5 verifies software components against the architectural design and integrates software elements."}, "SWE.6": {"id": "SWE.6", "name": "Software Verification", "purpose": "The purpose is to ensure that the integrated software is verified to be consistent with the software requirements.", "outcomes": ["Verification measures are specified for software verification based on the software requirements.", "Verification measures are selected according to the release scope.", "The integrated software is verified using the selected verification measures.", "Consistency and bidirectional traceability are established between verification measures and software requirements.", "Results of the software verification are summarized and communicated to all affected parties."], "bps": [{"id": "BP1", "title": "Specify verification measures for software verification", "description": "Specify the verification measures suitable to provide evidence for compliance of the integrated software with the software requirements."}, {"id": "BP2", "title": "Select verification measures", "description": "Document the selection of verification measures considering selection criteria including criteria for regression verification."}, {"id": "BP3", "title": "Verify the integrated software", "description": "Perform the verification of the integrated software using the selected verification measures and record results."}, {"id": "BP4", "title": "Ensure consistency and establish bidirectional traceability", "description": "Ensure consistency and establish bidirectional traceability between verification measures and software requirements."}, {"id": "BP5", "title": "Summarize and communicate results", "description": "Summarize the software verification results and communicate them to all affected parties."}], "guideline": "SWE.6 verifies the integrated software against software requirements. Black-box view of the software."}, "SUP.1": {"id": "SUP.1", "name": "Quality Assurance", "purpose": "The purpose is to provide independent and objective assurance that work products and processes comply with defined criteria and that non-conformances are resolved.", "outcomes": ["Quality assurance is performed independently and objectively.", "Criteria for the quality of work products and process performance are defined.", "Conformance with the defined criteria is verified.", "Non-conformances are tracked, resolved, and further prevented.", "Non-conformances are escalated to appropriate levels of management.", "Management ensures that escalated non-conformances are resolved."], "bps": [{"id": "BP1", "title": "Ensure independence of quality assurance", "description": "Ensure that quality assurance is performed independently and objectively without conflicts of interest."}, {"id": "BP2", "title": "Define criteria for quality assurance", "description": "Define quality criteria for work products as well as for process tasks and their performance."}, {"id": "BP3", "title": "Assure quality of work products", "description": "Identify work products subject to quality assurance, perform appropriate evaluation, and document results."}, {"id": "BP4", "title": "Assure quality of process activities", "description": "Identify processes subject to quality assurance, perform appropriate evaluation against quality criteria, and document results."}, {"id": "BP5", "title": "Summarize and communicate quality assurance activities", "description": "Regularly report performance, non-conformances, and trends of quality assurance activities."}, {"id": "BP6", "title": "Ensure resolution of non-conformances", "description": "Analyze, track, correct, resolve, and further prevent non-conformances found in quality assurance activities."}, {"id": "BP7", "title": "Escalate non-conformances", "description": "Escalate relevant non-conformances to appropriate levels of management and other relevant stakeholders."}], "guideline": "SUP.1 - independence means unbiased and free of conflict of interest. Quality assurance based on review-oriented methods. Just checking existence of work products is insufficient."}, "SUP.8": {"id": "SUP.8", "name": "Configuration Management", "purpose": "The purpose is to establish and maintain the integrity of relevant configuration items and baselines.", "outcomes": ["Selection criteria for configuration items are defined and applied.", "Configuration item properties are defined.", "Configuration management is established.", "Modifications are controlled.", "Baselining is applied.", "The status of the configuration items is recorded and reported.", "The completeness and consistency of the baselines is ensured.", "The availability of backup and recovery mechanisms is verified."], "bps": [{"id": "BP1", "title": "Identify configuration items", "description": "Define selection criteria for identifying relevant work products to be subject to configuration management."}, {"id": "BP2", "title": "Define configuration item properties", "description": "Define the necessary properties needed for the modification and control of configuration items."}, {"id": "BP3", "title": "Establish configuration management", "description": "Establish configuration management mechanisms for control of identified configuration items including parallel modification control."}, {"id": "BP4", "title": "Control modifications", "description": "Control modifications using the configuration management mechanisms."}, {"id": "BP5", "title": "Establish baselines", "description": "Define and establish baselines for internal purposes and for external product delivery."}, {"id": "BP6", "title": "Summarize and communicate configuration status", "description": "Record, summarize, and communicate the status of configuration items and established baselines."}, {"id": "BP7", "title": "Ensure completeness and consistency", "description": "Ensure that configuration items information is correct and complete, and baselines are complete and consistent."}, {"id": "BP8", "title": "Verify backup and recovery mechanisms availability", "description": "Verify the availability of appropriate backup and recovery mechanisms for the configuration management."}], "guideline": "SUP.8 - configuration items may include externally procured software. Branching and merging supports parallel work. Backup and recovery is foundational, not the same as archiving."}, "SUP.9": {"id": "SUP.9", "name": "Problem Resolution Management", "purpose": "The purpose is to ensure that problems are identified, recorded, analyzed, and their resolution is managed and controlled.", "outcomes": ["Problems are uniquely identified, recorded and classified.", "Problems are analyzed and assessed to determine an appropriate solution.", "Problem resolution is initiated.", "Problems are tracked to closure.", "The status of problems including trends identified are reported to stakeholders."], "bps": [{"id": "BP1", "title": "Identify and record the problem", "description": "Each problem is uniquely identified, described and recorded with supporting information."}, {"id": "BP2", "title": "Determine the cause and the impact of the problem", "description": "Analyze the problem, determine its cause and impact, involve relevant parties, and categorize the problem."}, {"id": "BP3", "title": "Authorize urgent resolution action", "description": "Obtain authorization for immediate action if a problem requires an urgent resolution."}, {"id": "BP4", "title": "Raise alert notifications", "description": "Raise alert notifications if the problem has a high impact on other systems or affected parties."}, {"id": "BP5", "title": "Initiate problem resolution", "description": "Initiate appropriate actions to resolve the problem long-term, including review of those actions or initiate a change request."}, {"id": "BP6", "title": "Track problems to closure", "description": "Track the status of problems to closure including all related change requests."}, {"id": "BP7", "title": "Report the status of problem resolution activities", "description": "Collect and analyze problem resolution data, identify trends, and regularly report results."}], "guideline": "SUP.9 - problems may be hierarchically organized. Status of a problem must be consistent with the status of all consequent change requests and tasks."}, "SUP.10": {"id": "SUP.10", "name": "Change Request Management", "purpose": "The purpose is to ensure that change requests are recorded, analyzed, tracked, approved, and implemented.", "outcomes": ["Requests for changes are recorded and identified.", "Change requests are analyzed and impact is estimated.", "Change requests are approved before implementation and prioritized.", "Bidirectional traceability is established between change requests and affected work products.", "Implementation of change requests is confirmed.", "Change requests are tracked to closure."], "bps": [{"id": "BP1", "title": "Identify and record the change requests", "description": "Each change request is uniquely identified, described, and recorded, including the initiator and reason."}, {"id": "BP2", "title": "Analyze and assess change requests", "description": "Change requests are analyzed by relevant parties. Affected work products and dependencies are determined. Impact is assessed."}, {"id": "BP3", "title": "Approve change requests before implementation", "description": "Change requests are prioritized and approved for implementation based on analysis results and resource availability."}, {"id": "BP4", "title": "Establish bidirectional traceability", "description": "Establish bidirectional traceability between change requests and affected work products, and between change requests and corresponding problem reports."}, {"id": "BP5", "title": "Confirm the implementation of change requests", "description": "The implementation of change requests is confirmed before closure by relevant stakeholders."}, {"id": "BP6", "title": "Track change requests to closure", "description": "Change requests are tracked to closure and status is communicated to all affected parties."}], "guideline": "SUP.10 - Change Control Board (CCB) is example mechanism. All affected disciplines and stakeholders must be represented. Decisions taken in time."}, "MAN.3": {"id": "MAN.3", "name": "Project Management", "purpose": "The purpose is to identify and control the activities, and establish resources necessary for a project to develop a product, in the context of the project's requirements and constraints.", "outcomes": ["The scope of the work for the project is defined.", "The feasibility of achieving the goals of the project is evaluated.", "The activities and resources necessary to complete the work are sized and estimated.", "Interfaces within the project, and with other projects and organizational units, are identified and monitored.", "Plans for the execution of the project are developed, implemented and maintained.", "Progress of the project is monitored and reported.", "Adjustment is performed when project goals are not achieved."], "bps": [{"id": "BP1", "title": "Define the scope of work", "description": "Identify the project's goals, motivation and boundaries."}, {"id": "BP2", "title": "Define project life cycle", "description": "Define the life cycle for the project, appropriate to the scope, context, and complexity."}, {"id": "BP3", "title": "Evaluate feasibility of the project", "description": "Evaluate the feasibility of achieving the goals with respect to time, project estimates, and available resources."}, {"id": "BP4", "title": "Define and monitor work packages", "description": "Define and monitor work packages and their dependencies according to the project life cycle and estimations."}, {"id": "BP5", "title": "Define and monitor project estimates and resources", "description": "Define and monitor project estimates of effort and resources based on goals, risks, motivation and boundaries."}, {"id": "BP6", "title": "Define and monitor required skills, knowledge, and experience", "description": "Identify and monitor the required skills, knowledge, and experience for the project."}, {"id": "BP7", "title": "Define and monitor project interfaces and agreed commitments", "description": "Identify and agree interfaces of the project with affected stakeholders and monitor agreed commitments."}, {"id": "BP8", "title": "Define and monitor project schedule", "description": "Allocate resources to work packages and schedule each activity. Monitor the performance against schedule."}, {"id": "BP9", "title": "Ensure consistency", "description": "Regularly adjust estimates, resources, skills, work packages, schedules, plans, interfaces, and commitments for consistency."}, {"id": "BP10", "title": "Review and report progress of the project", "description": "Regularly review and report the status of the project and the fulfillment of work packages."}], "guideline": "MAN.3 - scope of work covers motivation, boundaries, and constraints. Work packages should not exceed two monitoring cycles. Weekly monitoring is appropriate as a rule of thumb."}}`);

const PROCESS_GROUPS = [
  { label: "SYS ??System Engineering",     color: "#60A5FA", ids: ["SYS.2","SYS.3","SYS.4","SYS.5"] },
  { label: "SWE ??Software Engineering",   color: "#A78BFA", ids: ["SWE.1","SWE.2","SWE.3","SWE.4","SWE.5","SWE.6"] },
  { label: "MAN ??Management",             color: "#34D399", ids: ["MAN.3"] },
  { label: "SUP ??Support",                color: "#FBBF24", ids: ["SUP.1","SUP.8","SUP.9","SUP.10"] },
];

const SUPPORTED_FORMATS = {
  pdf:  { mediaType: "application/pdf",   label: "PDF",  mode: "pdf"  },
  docx: { mediaType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", label: "DOCX", mode: "docx" },
  doc:  { mediaType: "application/msword", label: "DOC", mode: "docx" },
  xlsx: { mediaType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", label: "XLSX", mode: "xlsx" },
  md:   { mediaType: "text/markdown",     label: "MD",   mode: "text" },
};

const ACCEPT_ATTR = ".pdf,.doc,.docx,.xlsx,.md";

const getFormatByName = (name) => {
  const ext = name.split(".").pop().toLowerCase();
  return SUPPORTED_FORMATS[ext] || null;
};

// ?뚯씪紐??ㅼ썙????ASPICE ?꾨줈?몄뒪 ?먮룞 媛먯? ?뚯씠釉?// ?쒖꽌 以묒슂: ??援ъ껜?곸씤 ?⑦꽩???욎뿉 諛곗튂
const PROCESS_DETECT_RULES = [
  // ?? 吏곸젒 ?꾨줈?몄뒪 ID ?⑦꽩 ??
  // SUP.10??SUP.1蹂대떎 癒쇱? 寃??(??援ъ껜?곸씤 ?⑦꽩 ?곗꽑)
  { id: "SUP.10", patterns: [/sup[\._\-]?10(?!\d)/i] },
  { id: "SYS.2",  patterns: [/sys[\._\-]?2(?!\d)/i] },
  { id: "SYS.3",  patterns: [/sys[\._\-]?3(?!\d)/i] },
  { id: "SYS.4",  patterns: [/sys[\._\-]?4(?!\d)/i] },
  { id: "SYS.5",  patterns: [/sys[\._\-]?5(?!\d)/i] },
  { id: "SWE.1",  patterns: [/swe[\._\-]?1(?!\d)/i] },
  { id: "SWE.2",  patterns: [/swe[\._\-]?2(?!\d)/i] },
  { id: "SWE.3",  patterns: [/swe[\._\-]?3(?!\d)/i] },
  { id: "SWE.4",  patterns: [/swe[\._\-]?4(?!\d)/i] },
  { id: "SWE.5",  patterns: [/swe[\._\-]?5(?!\d)/i] },
  { id: "SWE.6",  patterns: [/swe[\._\-]?6(?!\d)/i] },
  { id: "SUP.1",  patterns: [/sup[\._\-]?1(?!\d)/i] },
  { id: "SUP.8",  patterns: [/sup[\._\-]?8(?!\d)/i] },
  { id: "SUP.9",  patterns: [/sup[\._\-]?9(?!\d)/i] },
  { id: "MAN.3",  patterns: [/man[\._\-]?3(?!\d)/i] },
  // ?? 臾몄꽌 ?좏삎 ?쎌뼱 (?곷Ц) ??
  { id: "SYS.2",  patterns: [/\bsrs\b/i, /system[_\-\s]req/i, /sys[_\-\s]req/i] },
  { id: "SYS.3",  patterns: [/\bsad\b/i, /system[_\-\s]arch/i, /sys[_\-\s]arch/i] },
  { id: "SYS.4",  patterns: [/\bsiv\b/i, /system[_\-\s]integ/i] },
  { id: "SYS.5",  patterns: [/\bsvs\b/i, /system[_\-\s]verif/i] },
  { id: "SWE.1",  patterns: [/\bswrs\b/i, /sw[_\-\s]req/i, /software[_\-\s]req/i] },
  { id: "SWE.2",  patterns: [/\bswad\b/i, /sw[_\-\s]arch/i, /software[_\-\s]arch/i] },
  { id: "SWE.3",  patterns: [/\bddd\b/i, /detailed[_\-\s]design/i, /unit[_\-\s]design/i] },
  { id: "SWE.4",  patterns: [/\bsut\b/i, /unit[_\-\s]test/i, /unit[_\-\s]verif/i] },
  { id: "SWE.5",  patterns: [/sw[_\-\s]integr/i, /software[_\-\s]integr/i] },
  { id: "SWE.6",  patterns: [/sw[_\-\s]verif/i, /sw[_\-\s]test/i, /software[_\-\s]verif/i] },
  { id: "SUP.1",  patterns: [/\bqap?\b/i, /quality[_\-\s]assur/i] },
  { id: "SUP.8",  patterns: [/\bcmp\b/i, /config[_\-\s]mgmt/i, /config[_\-\s]man/i, /cm[_\-\s]plan/i] },
  { id: "SUP.9",  patterns: [/\bprm\b/i, /problem[_\-\s]res/i, /incident[_\-\s]rep/i] },
  { id: "SUP.10", patterns: [/\bcrm\b/i, /change[_\-\s]req/i, /change[_\-\s]man/i] },
  { id: "MAN.3",  patterns: [/project[_\-\s]plan/i, /project[_\-\s]man/i, /\bpmp\b/i, /project[_\-\s]sched/i] },
  // ?? ?쒓뎅???ㅼ썙????
  { id: "SYS.2",  patterns: [/?쒖뒪????붽뎄?ы빆/, /?쒖뒪????붽뎄/, /?쒖뒪???紐낆꽭/, /sys.??붽뎄?ы빆/i] },
  { id: "SYS.3",  patterns: [/?쒖뒪????꾪궎?띿쿂/, /?쒖뒪???援ъ“?ㅺ퀎/, /?쒖뒪????ㅺ퀎/, /?쒖뒪???援ъ“??] },
  { id: "SYS.4",  patterns: [/?쒖뒪????듯빀/, /?쒖뒪????듯빀寃利?, /?쒖뒪????듯빀?쒗뿕/] },
  { id: "SYS.5",  patterns: [/?쒖뒪???寃利?, /?쒖뒪????쒗뿕/, /?쒖뒪????뺤씤/] },
  { id: "SWE.1",  patterns: [/?뚰봽?몄썾????붽뎄?ы빆/, /sw.??붽뎄?ы빆/i, /?뚰봽?몄썾????붽뎄/, /?뚰봽?몄썾???紐낆꽭/] },
  { id: "SWE.2",  patterns: [/?뚰봽?몄썾????꾪궎?띿쿂/, /?뚰봽?몄썾???援ъ“?ㅺ퀎/, /sw.??꾪궎?띿쿂/i, /?뚰봽?몄썾????ㅺ퀎/, /sw.??ㅺ퀎/i] },
  { id: "SWE.3",  patterns: [/?곸꽭.??ㅺ퀎/, /?뚰봽?몄썾????곸꽭/, /?⑥쐞.??ㅺ퀎/, /sw.??곸꽭?ㅺ퀎/i] },
  { id: "SWE.4",  patterns: [/?⑥쐞.??뚯뒪??, /?⑥쐞.??쒗뿕/, /?⑥쐞.?寃利?, /?좊떅.??뚯뒪??, /?좊떅.?寃利?] },
  { id: "SWE.5",  patterns: [/?뚰봽?몄썾????듯빀/, /sw.??듯빀/i, /而댄룷?뚰듃.?寃利?, /?뚰봽?몄썾????듯빀寃利?] },
  { id: "SWE.6",  patterns: [/?뚰봽?몄썾???寃利?, /?뚰봽?몄썾????쒗뿕/, /sw.?寃利?i, /sw.??쒗뿕/i, /?뚰봽?몄썾????뚯뒪??] },
  { id: "SUP.1",  patterns: [/?덉쭏.?蹂댁쬆/, /?덉쭏.?愿由?, /?덉쭏.?怨꾪쉷/, /qa.?怨꾪쉷/i, /?덉쭏.?媛먯궗/] },
  { id: "SUP.8",  patterns: [/?뺤긽.?愿由?, /援ъ꽦.?愿由?, /?뺤긽.?怨꾪쉷/, /cm.?怨꾪쉷/i] },
  { id: "SUP.9",  patterns: [/臾몄젣.??닿껐/, /寃고븿.?愿由?, /臾몄젣.?愿由?, /?댁뒋.?愿由?, /?μ븷.?愿由?] },
  { id: "SUP.10", patterns: [/蹂寃???붿껌/, /蹂寃??愿由?, /蹂寃???대젰/] },
  { id: "MAN.3",  patterns: [/?꾨줈?앺듃.?怨꾪쉷/, /?꾨줈?앺듃.?愿由?, /?ъ뾽.?怨꾪쉷/, /媛쒕컻.?怨꾪쉷/, /?쇱젙.?怨꾪쉷/] },
];

const detectProcess = (filename) => {
  // ?뺤옣??紐⑤몢 ?쒓굅 ??援щ텇??_, -, .)瑜?怨듬갚?쇰줈 ?뺢퇋?뷀븯??寃??  const stem = filename.replace(/\.[^.]+$/, "");        // ?뺤옣???쒓굅
  const normalized = stem.replace(/[_\-\.]/g, " ");     // 援щ텇????怨듬갚
  for (const rule of PROCESS_DETECT_RULES) {
    // ?먮낯 stem怨??뺢퇋??臾몄옄??????寃??    if (rule.patterns.some(p => p.test(stem) || p.test(normalized))) return rule.id;
  }
  return null;
};

const RATING_META = {
  F: { label: "Fully",     kor: "?꾩쟾 ?ъ꽦",   range: "86??00%", bg: "#052E1A", fg: "#6EE7B7", bar: "#10B981", pct: 95 },
  L: { label: "Largely",   kor: "?遺遺??ъ꽦", range: "51??5%",  bg: "#1A2E05", fg: "#BEF264", bar: "#84CC16", pct: 72 },
  P: { label: "Partially", kor: "遺遺??ъ꽦",   range: "16??0%",  bg: "#2E1A05", fg: "#FED7AA", bar: "#F97316", pct: 35 },
  N: { label: "Not",       kor: "誘몃떖??,       range: "0??5%",   bg: "#2E0A0A", fg: "#FCA5A5", bar: "#EF4444", pct: 8  },
};

// Dark theme tokens
const T = {
  bg:        "#0A0A0C",
  bgGrad:    "radial-gradient(ellipse at top, #14141A 0%, #0A0A0C 60%, #050507 100%)",
  surface:   "#121217",
  surface2:  "#181820",
  surface3:  "#1F1F28",
  borderL:   "#26262F",
  borderM:   "#33333F",
  borderH:   "#44444F",
  textHi:    "#FAFAFA",
  textMd:    "#B4B4BE",
  textLo:    "#74747E",
  textDim:   "#52525C",
  accent:    "#60A5FA",
  accentSoft:"#1E3A5F",
  warm:      "#F59E0B",
  ok:        "#10B981",
  err:       "#EF4444",
};

const FONT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
`;

export default function App() {
  const [selectedProcess, setSelectedProcess] = useState("SYS.2");
  const [fileB64, setFileB64] = useState(null);   // PDF only
  const [fileText, setFileText] = useState(null);  // DOCX / XLSX / MD
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [fileMediaType, setFileMediaType] = useState("application/pdf");
  const [autoDetected, setAutoDetected] = useState(null); // ?먮룞 媛먯????꾨줈?몄뒪 ID
  const [showConfirm, setShowConfirm] = useState(false);  // 遺꾩꽍 ?뺤씤 ?앹뾽
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [phase, setPhase] = useState("");
  const [history, setHistory] = useState(() => {
    // Lazy initializer: read from localStorage synchronously so the initial
    // state is already populated before any effects run, preventing the race
    // condition where the save-effect overwrites stored data with [].
    try {
      const raw = localStorage.getItem("aspice_history");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });
  const [selectedHistoryId, setSelectedHistoryId] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = FONT_CSS;
    document.head.appendChild(style);
    return () => { try { document.head.removeChild(style); } catch {} };
  }, []);

  // Persist history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("aspice_history", JSON.stringify(history));
    } catch {}
  }, [history]);

  const addHistoryEntry = (entry) => {
    setHistory(prev => {
      const next = [entry, ...prev].slice(0, 50); // cap at 50 entries
      return next;
    });
  };

  const proc = ASPICE_DATA[selectedProcess];

  const toBase64 = (f) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = rej;
    r.readAsDataURL(f);
  });

  const readArrayBuffer = (f) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsArrayBuffer(f);
  });

  const readAsText = (f) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsText(f, "utf-8");
  });

  const extractDocxText = async (f) => {
    const buf = await readArrayBuffer(f);
    const result = await mammoth.extractRawText({ arrayBuffer: buf });
    return result.value;
  };

  const extractXlsxText = async (f) => {
    const buf = await readArrayBuffer(f);
    const wb = XLSX.read(buf, { type: "array" });
    return wb.SheetNames.map(name => {
      const rows = XLSX.utils.sheet_to_csv(wb.Sheets[name]);
      return `[Sheet: ${name}]\n${rows}`;
    }).join("\n\n");
  };

  const handleFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const fmt = getFormatByName(f.name);
    if (!fmt) {
      setError("吏???뺤떇: PDF, DOC, DOCX, XLSX, MD");
      return;
    }
    if (f.size > 30 * 1024 * 1024) {
      setError("?뚯씪 ?ш린媛 30MB瑜?珥덇낵?⑸땲??");
      return;
    }

    setFileB64(null);
    setFileText(null);

    if (fmt.mode === "pdf") {
      const b64 = await toBase64(f);
      setFileB64(b64);
    } else if (fmt.mode === "docx") {
      const text = await extractDocxText(f);
      setFileText(text);
    } else if (fmt.mode === "xlsx") {
      const text = await extractXlsxText(f);
      setFileText(text);
    } else {
      // md / plain text
      const text = await readAsText(f);
      setFileText(text);
    }

    setFileName(f.name);
    setFileSize(f.size);
    setFileMediaType(fmt.mediaType);
    setError("");
    setResults(null);
    setSelectedHistoryId(null);

    // ?뚯씪紐낆쑝濡??꾨줈?몄뒪 ?먮룞 媛먯?
    const detected = detectProcess(f.name);
    if (detected) {
      setSelectedProcess(detected);
      setAutoDetected(detected);
    } else {
      setAutoDetected(null);
    }
  };

  const resetAll = () => {
    setFileB64(null); setFileText(null); setFileName(""); setFileSize(0);
    setFileMediaType("application/pdf");
    setResults(null); setError(""); setPhase("");
    setSelectedHistoryId(null);
    setAutoDetected(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ?곕え???섑뵆 由ы룷??(API ?몄텧 ?놁씠 UI 誘몃━蹂닿린)
  const loadSample = () => {
    const sampleRatingCycle = ["F", "L", "L", "P", "F", "L", "P", "N"];
    const sampleRationales = [
      "?붽뎄?ы빆 ?ъ뼇?쒖뿉 湲곕뒫/鍮꾧린????ぉ??泥닿퀎?곸쑝濡??앸퀎?섏뼱 ?덇퀬, ?곗꽑?쒖쐞쨌ID쨌?묒꽦?먃룹텛?곸꽦 ?꾨뱶媛 ?쇨??섍쾶 湲곗옱??",
      "援ъ“??諛??곗꽑?쒖쐞???쒗뵆由우씠 ?곸슜?섏뿀?쇰굹, ?쇰? ?뱀뀡?먯꽌 ?곗꽑?쒖쐞 ?꾨씫 耳?댁뒪 3嫄??뺤씤??",
      "湲곗닠????뱀꽦 遺꾩꽍???섑뻾?섏뿀怨?由щ럭 ?뚯쓽濡앹쑝濡?洹쇨굅媛 ?⑥븘 ?덉쓬. ?쇰? ?곹뼢??遺꾩꽍 寃곌낵媛 ?꾨씫??",
      "?댁쁺 ?섍꼍 ?곹뼢 遺꾩꽍??遺遺꾩쟻?쇰줈留??섑뻾?? HW 由ъ냼???곹뼢留??ㅻ（怨??듭떊 遺??愿?먯? 誘명룷??",
      "?묐갑??異붿쟻??留ㅽ듃由?뒪媛 Teamer??援ъ텞?섏뼱 ?곸쐞 ?붽뎄?ы빆怨??꾩쟾???곌껐??",
      "?댄빐愿怨꾩옄 ?⑹쓽??MoM?쇰줈 湲곕줉?? ?쇰? 蹂寃??대젰??援щ몢 ?꾨떖濡쒕쭔 泥섎━???뺥솴 ?뺤씤.",
      "?곹뼢 遺꾩꽍???섑뻾?섏뿀?쇰굹 ?곗텧臾?媛?遺덉씪移섍? ?쇰? 議댁옱??",
      "?섑뻾 利앷굅媛 ?뺤씤?섏? ?딆쓬. 愿???쒗뵆由용쭔 鍮꾩뼱?덈뒗 ?곹깭濡?議댁옱.",
    ];
    const sampleEvidence = [
      "SRS_v2.3.docx 짠3.2 Functional Requirements 쨌 짠4.1 Non-functional (pp. 12??8)",
      "SRS_v2.3.docx 짠2 Requirement Attributes 쨌 Priority ?꾨뱶 ?꾨씫: REQ-114, REQ-202, REQ-308",
      "TechFeasibility_Review_MoM_2026-02-14.pdf 쨌 李몄꽍??5紐? action item 3嫄?,
      "ImpactAnalysis_v1.1.xlsx ??HW ?쒗듃留?梨꾩썙吏? Network/Timing ?쒗듃 怨듬?",
      "Polarion Traceability Report 2026-03-28 (100% coverage, 0 orphans)",
      "Stakeholder_Agreement_MoM_2026-01-22.docx ??蹂寃??대젰 짠5 誘몄셿??,
      "Impact_Analysis.xlsx vs SRS_v2.3 짠3.2 ??3媛???ぉ 遺덉씪移?,
      "?놁쓬",
    ];
    const ratings = proc.bps.map((bp, i) => ({
      bp: bp.id,
      rating: sampleRatingCycle[i % sampleRatingCycle.length],
      rationale: sampleRationales[i % sampleRationales.length],
      evidence: sampleEvidence[i % sampleEvidence.length],
    }));
    const hasN = ratings.some(r => r.rating === "N");
    const hasP = ratings.some(r => r.rating === "P");
    const sampleResults = {
      ratings,
      summary: hasN
        ? "?쇰? BP?먯꽌 ?섑뻾 利앷굅媛 ?뺤씤?섏? ?딆븘 CL1 異⑹”??誘몃떖?⑸땲?? ?뱁엳 異붿쟻?굿룹쁺?λ텇???곸뿭??蹂닿컯???꾩슂?⑸땲??"
        : hasP
          ? "二쇱슂 BP???섑뻾?섏뿀?쇰굹, ?쇰? ??ぉ??遺遺꾩쟻?쇰줈留??ъ꽦?섏뼱 CL1 異⑹”???꾪빐 蹂댁셿???꾩슂?⑸땲??"
          : "紐⑤뱺 BP媛 Largely ?댁긽?쇰줈 ?ъ꽦?섏뼱 CL1 ?곹빀?깆쓣 異⑹”?⑸땲??",
      strengths: "泥닿퀎?곸씤 ?붽뎄?ы빆 援ъ“?? Polarion 湲곕컲 ?묐갑??異붿쟻?? ?뺢린 由щ럭 臾명솕",
      gaps: "?댁쁺 ?섍꼍 ?곹뼢 遺꾩꽍??踰붿쐞 ?쒗븳, 蹂寃??대젰??臾몄꽌???꾨씫, ?곗꽑?쒖쐞 ?꾨뱶 ?쇰? 誘멸린??,
    };
    setResults(sampleResults);
    setFileName("sample_SRS_v2.3.pdf");
    setFileSize(2458112);
    setError("");
    setPhase("");
    setSelectedHistoryId(null);
    addHistoryEntry({
      id: `h_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      date: new Date().toISOString(),
      processId: proc.id,
      processName: proc.name,
      fileName: "sample_SRS_v2.3.pdf",
      fileSize: 2458112,
      results: sampleResults,
      isSample: true,
    });
  };

  const analyze = async () => {
    const fileReady = !!(fileB64 || fileText);
    if (!fileReady) { setError("癒쇱? 利앹쟻 臾몄꽌瑜??낅줈?쒗븯?몄슂."); return; }
    setAnalyzing(true); setError(""); setResults(null);
    try {
      setPhase("BP 湲곗? 쨌 媛?대뱶?쇱씤 濡쒕뱶");
      await new Promise(r => setTimeout(r, 250));

      const bpList = proc.bps.map(b => `- ${b.id} (${b.title}): ${b.description}`).join("\n");
      const outcomes = proc.outcomes.map((o,i) => `${i+1}) ${o}`).join(" ");
      const guidelineTrim = proc.guideline.slice(0, 5500);

      const systemMsg = `You are a certified Automotive SPICE 4.0 Lead Assessor (intacs). Rate Base Practices strictly per the NPLF scale defined in ISO/IEC 33020 and the VDA Automotive SPICE Guidelines (2024-03-12). Be evidence-based and objective. Output only JSON. Respond in Korean for rationale fields.`;

      const prompt = `[????꾨줈?몄뒪]
${proc.id} ??${proc.name}
Purpose: ${proc.purpose}
Outcomes: ${outcomes}

[?됯???Base Practices]
${bpList}

[ASPICE Guidelines (VDA 2024-03-12) ?댁꽍/?됯? 湲곗? 諛쒖톸]
${guidelineTrim}

[?묒뾽]
泥⑤???利앹쟻 臾몄꽌(?꾨줈?앺듃 ?곗텧臾?/ ?꾨줈?몄뒪 利앹쟻, ?뺤떇: ${fileName})瑜?遺꾩꽍?섏뿬, ??媛?BP媛 ?쇰쭏???섑뻾/利앸챸?섏뿀?붿?瑜?NPLF ?깃툒?쇰줈 ?됯??섏꽭??
- F (Fully, 86??00%): 紐⑤뱺 痢〓㈃??利앷굅? ?④퍡 ?꾩쟾???섑뻾??- L (Largely, 51??5%): 二쇱슂 痢〓㈃???섑뻾?섏뿀?쇰굹 ?쇰? ?쎌젏 議댁옱
- P (Partially, 16??0%): ?쇰?留??섑뻾, 泥닿퀎??遺議?- N (Not, 0??5%): ?섑뻾 利앷굅 ?놁쓬

CL1 ?⑷꺽 湲곗?: 紐⑤뱺 BP媛 L ?먮뒗 F ?댁뼱????

[異쒕젰 ?뺤떇 ???쒖닔 JSON留? 留덊겕?ㅼ슫 湲덉?]
{"ratings":[{"bp":"BP1","rating":"F|L|P|N","rationale":"洹쇨굅 ?붿빟(?쒓뎅?? 40?⑥뼱 ?대궡)","evidence":"臾몄꽌?먯꽌 李얠? 援ъ껜 ?뱀뀡/臾멸뎄(?놁쑝硫?\\"?놁쓬\\")"}],"summary":"?꾩껜 CL1 ?곹빀???먮떒(?쒓뎅?? 30?⑥뼱 ?대궡)","strengths":"媛뺤젏(?쒓뎅?? 20?⑥뼱)","gaps":"二쇱슂 寃고븿(?쒓뎅?? 30?⑥뼱)"}
諛섎뱶??${proc.bps.length}媛쒖쓽 BP瑜?紐⑤몢 ?ы븿?섏꽭?? BP ?ㅻ뒗 "BP1"..."BP${proc.bps.length}" ?뺤떇.`;

      setPhase("臾몄꽌 遺꾩꽍 쨌 BP蹂?NPLF ?됯? 以?);

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-5",
          max_tokens: 2000,
          system: systemMsg,
          messages: [{
            role: "user",
            content: [
              fileB64
                ? { type: "document", source: { type: "base64", media_type: "application/pdf", data: fileB64 } }
                : { type: "text", text: `[泥⑤? 臾몄꽌 ?댁슜 ??${fileName}]\n\n${fileText}` },
              { type: "text", text: prompt }
            ]
          }]
        })
      });

      if (!response.ok) {
        const txt = await response.text();
        throw new Error(`API ${response.status}: ${txt.slice(0,200)}`);
      }
      const data = await response.json();
      const combined = (data.content || [])
        .filter(c => c.type === "text")
        .map(c => c.text)
        .join("\n")
        .replace(/```json|```/g, "")
        .trim();

      const match = combined.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("?묐떟?먯꽌 JSON??李얠쓣 ???놁뒿?덈떎. ?먮Ц: " + combined.slice(0,200));
      const parsed = JSON.parse(match[0]);
      if (!parsed.ratings || !Array.isArray(parsed.ratings)) throw new Error("ratings ?꾨뱶 ?꾨씫");

      setPhase("寃곌낵 吏묎퀎 以?);
      await new Promise(r => setTimeout(r, 200));
      setResults(parsed);
      setPhase("");
      setSelectedHistoryId(null);
      addHistoryEntry({
        id: `h_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        date: new Date().toISOString(),
        processId: proc.id,
        processName: proc.name,
        fileName: fileName,
        fileSize: fileSize,
        results: parsed,
        isSample: false,
      });
    } catch (e) {
      setError(`遺꾩꽍 ?ㅽ뙣 ??${e.message}`);
      setPhase("");
    } finally {
      setAnalyzing(false);
    }
  };

  const reportRef = useRef(null);
  const [exporting, setExporting] = useState(false);

  const downloadTxt = () => {
    const r0 = displayResults;
    const p0 = displayProc;
    if (!r0) return;
    const lines = [];
    lines.push(`ASPICE 4.0 CL1 吏꾨떒 由ы룷??);
    lines.push(`================================`);
    lines.push(`?꾨줈?몄뒪: ${p0.id} ${p0.name}`);
    lines.push(`臾몄꽌: ${displayFileName}`);
    lines.push(`?쇱떆: ${displayDate.toLocaleString('ko-KR')}`);
    lines.push(``);
    lines.push(`[Summary] ${r0.summary || ""}`);
    lines.push(`[Strengths] ${r0.strengths || ""}`);
    lines.push(`[Gaps] ${r0.gaps || ""}`);
    lines.push(``);
    lines.push(`BP蹂??됯?`);
    lines.push(`--------------------------------`);
    r0.ratings.forEach(r => {
      const bpDef = p0.bps.find(b => b.id === r.bp);
      lines.push(`${r.bp} [${r.rating}] ${bpDef?.title || ""}`);
      lines.push(`  洹쇨굅: ${r.rationale}`);
      lines.push(`  利앷굅: ${r.evidence}`);
      lines.push(``);
    });
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ASPICE_${p0.id}_report.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPdf = async () => {
    if (!displayResults || !reportRef.current) return;
    setExporting(true);
    try {
      const node = reportRef.current;

      const canvas = await html2canvas(node, {
        scale: 2,
        backgroundColor: "#FFFFFF",
        useCORS: true,
        logging: false,
        windowWidth: node.scrollWidth,
        onclone: (clonedDoc) => {
          // Locate the cloned report section by its heading text.
          const sections = clonedDoc.querySelectorAll("section");
          let target = null;
          sections.forEach(el => {
            if (el.textContent && el.textContent.includes("NPLF VERDICT")) target = el;
          });
          if (!target) return;
          target.id = "pdf-export-root";

          // Inject scoped stylesheet that overrides inline styles with !important.
          // This gives us: white backgrounds, dark borders, dark-gray body text,
          // and compressed spacing to fit 1-2 A4 pages.
          const s = clonedDoc.createElement("style");
          s.textContent = `
            #pdf-export-root {
              background: #FFFFFF !important;
              color: #3F3F46 !important;
              border: 1.5px solid #0A0A0C !important;
              border-radius: 4px !important;
              padding: 20px 24px 22px !important;
              font-family: 'Inter', system-ui, sans-serif !important;
            }
            /* Default body text: dark gray */
            #pdf-export-root, #pdf-export-root * {
              color: #3F3F46 !important;
              letter-spacing: -0.005em !important;
            }
            /* Verdict badge ribbon */
            #pdf-export-root > div:first-child {
              background: #FFFFFF !important;
              color: #0A0A0C !important;
              border: 1.5px solid #0A0A0C !important;
              font-size: 9px !important;
              padding: 3px 10px !important;
              top: -9px !important;
            }
            #pdf-export-root > div:first-child * { color: #0A0A0C !important; }

            /* Verdict row + heading compression */
            #pdf-export-root h3 {
              color: #0A0A0C !important;
              font-size: 22px !important;
              margin: 0 0 6px 0 !important;
              font-weight: 700 !important;
              letter-spacing: -0.025em !important;
            }
            #pdf-export-root h3 > span { font-size: 12px !important; color: #52525C !important; }
            #pdf-export-root p { font-size: 10.5px !important; line-height: 1.45 !important; margin: 0 !important; color: #3F3F46 !important; }

            /* Verdict label (Capability Level 1 쨌 Verdict) */
            #pdf-export-root h3 + * { /* no-op ??selector placeholder */ }

            /* The 4 NPLF stat cards (grid with repeat(4, 1fr)) */
            #pdf-export-root div[style*="repeat(4, 1fr)"] {
              gap: 8px !important;
              margin-bottom: 14px !important;
            }
            #pdf-export-root div[style*="repeat(4, 1fr)"] > div {
              background: #FFFFFF !important;
              color: #0A0A0C !important;
              border: 1.5px solid #0A0A0C !important;
              border-radius: 3px !important;
              padding: 8px 10px !important;
            }
            #pdf-export-root div[style*="repeat(4, 1fr)"] > div > div {
              color: #0A0A0C !important;
              opacity: 1 !important;
            }
            #pdf-export-root div[style*="repeat(4, 1fr)"] > div > div:nth-child(1) {
              font-size: 9px !important;
              color: #3F3F46 !important;
              font-weight: 700 !important;
            }
            #pdf-export-root div[style*="repeat(4, 1fr)"] > div > div:nth-child(2) {
              font-size: 28px !important;
              line-height: 1 !important;
              margin-top: 2px !important;
              font-weight: 800 !important;
              color: #0A0A0C !important;
            }
            #pdf-export-root div[style*="repeat(4, 1fr)"] > div > div:nth-child(3) {
              font-size: 9px !important;
              color: #71717A !important;
              margin-top: 2px !important;
            }

            /* Strengths / Gaps 2-col grid */
            #pdf-export-root div[style*="1fr 1fr"] {
              gap: 10px !important;
              margin-bottom: 14px !important;
            }
            #pdf-export-root div[style*="1fr 1fr"] > div {
              background: #FAFAFA !important;
              border: 1px solid #D4D4D8 !important;
              border-left: 2.5px solid #0A0A0C !important;
              border-radius: 0 3px 3px 0 !important;
              padding: 10px 12px !important;
            }
            #pdf-export-root div[style*="1fr 1fr"] > div > div:nth-child(1) {
              font-size: 9px !important;
              color: #0A0A0C !important;
              font-weight: 700 !important;
              margin-bottom: 3px !important;
            }
            #pdf-export-root div[style*="1fr 1fr"] > div > div:nth-child(2) {
              font-size: 11px !important;
              color: #3F3F46 !important;
              line-height: 1.45 !important;
            }

            /* BP-level Ratings section header */
            #pdf-export-root > div[style*="BP-level"],
            #pdf-export-root > div[style*="letter-spacing: 0.2em"] {
              font-size: 9px !important;
              color: #0A0A0C !important;
              margin-bottom: 8px !important;
              padding-bottom: 4px !important;
              border-bottom: 1px solid #D4D4D8 !important;
              font-weight: 700 !important;
            }

            /* BP rating rows (grid 60px 1fr) */
            #pdf-export-root div[style*="60px 1fr"] {
              background: #FFFFFF !important;
              border: 1px solid #0A0A0C !important;
              border-radius: 3px !important;
              margin-bottom: 0 !important;
            }
            #pdf-export-root div[style*="60px 1fr"] > div:nth-child(1) {
              background: #FFFFFF !important;
              color: #0A0A0C !important;
              border-right: 1px solid #0A0A0C !important;
              padding: 6px 0 !important;
            }
            #pdf-export-root div[style*="60px 1fr"] > div:nth-child(1) > div:nth-child(1) {
              font-size: 22px !important;
              font-weight: 800 !important;
              color: #0A0A0C !important;
              line-height: 1 !important;
            }
            #pdf-export-root div[style*="60px 1fr"] > div:nth-child(1) > div:nth-child(2) {
              font-size: 7px !important;
              color: #52525C !important;
              opacity: 1 !important;
              margin-top: 2px !important;
            }
            #pdf-export-root div[style*="60px 1fr"] > div:nth-child(2) {
              padding: 8px 12px !important;
            }
            #pdf-export-root div[style*="60px 1fr"] > div:nth-child(2) > div:nth-child(1) {
              margin-bottom: 3px !important;
            }
            #pdf-export-root div[style*="60px 1fr"] > div:nth-child(2) > div:nth-child(1) > span:nth-child(1) {
              font-size: 9px !important;
              color: #0A0A0C !important;
              font-weight: 700 !important;
            }
            #pdf-export-root div[style*="60px 1fr"] > div:nth-child(2) > div:nth-child(1) > span:nth-child(2) {
              font-size: 11px !important;
              color: #0A0A0C !important;
              font-weight: 700 !important;
            }
            #pdf-export-root div[style*="60px 1fr"] > div:nth-child(2) > div:nth-child(2) {
              font-size: 10px !important;
              color: #3F3F46 !important;
              line-height: 1.4 !important;
              margin-bottom: 3px !important;
            }
            #pdf-export-root div[style*="60px 1fr"] > div:nth-child(2) > div:nth-child(2) > strong {
              color: #0A0A0C !important;
            }
            #pdf-export-root div[style*="60px 1fr"] > div:nth-child(2) > div:nth-child(3) {
              font-size: 9px !important;
              color: #52525C !important;
              line-height: 1.4 !important;
            }
            #pdf-export-root div[style*="60px 1fr"] > div:nth-child(2) > div:nth-child(3) > strong {
              color: #0A0A0C !important;
            }
            /* Outer BP list wrapper ??tighten row gap */
            #pdf-export-root > div[style*="flex-direction: column"]:last-child {
              gap: 5px !important;
            }
          `;
          clonedDoc.head.appendChild(s);
        },
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();   // 210
      const pageHeight = pdf.internal.pageSize.getHeight(); // 297
      const margin = 8;
      const usableW = pageWidth - margin * 2;
      const imgW = usableW;
      let imgH = (canvas.height * imgW) / canvas.width;

      // Hard target: fit within 2 A4 pages. If the image is taller than the
      // usable area across 2 pages, scale the image width down proportionally
      // (effectively zoom-out) so it always fits.
      const headerH = 16;
      const usablePerPage = pageHeight - headerH - margin;
      const twoPageCapacity = usablePerPage * 2 - 4; // slight safety buffer
      let scaledImgW = imgW;
      if (imgH > twoPageCapacity) {
        const scale = twoPageCapacity / imgH;
        scaledImgW = imgW * scale;
        imgH = twoPageCapacity;
      }
      const imgX = (pageWidth - scaledImgW) / 2;

      // White page background (jsPDF default is white but we set it explicitly
      // so that any slice painting below is guaranteed to composite on white).
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pageWidth, pageHeight, "F");

      // Light header strip (compact)
      pdf.setFillColor(248, 248, 250);
      pdf.rect(0, 0, pageWidth, headerH, "F");
      pdf.setDrawColor(180, 180, 188);
      pdf.setLineWidth(0.3);
      pdf.line(0, headerH, pageWidth, headerH);
      pdf.setTextColor(10, 10, 12);
      pdf.setFontSize(10);
      pdf.text(`ASPICE 4.0 쨌 ${displayProc.id} ${displayProc.name}`, margin, 10);
      pdf.setFontSize(7.5);
      pdf.setTextColor(100, 100, 110);
      pdf.text(new Date().toLocaleString("ko-KR"), pageWidth - margin, 10, { align: "right" });

      // Place image. If everything fits in one page ??single addImage.
      // Otherwise slice the canvas into per-page chunks (max 2 pages thanks to
      // the proportional downscale above).
      const positionY = headerH + 4;
      const pxPerMm = canvas.width / scaledImgW;

      if (imgH + positionY + margin <= pageHeight) {
        pdf.addImage(imgData, "PNG", imgX, positionY, scaledImgW, imgH);
      } else {
        const firstSliceMm = pageHeight - positionY - margin;
        const otherSliceMm = pageHeight - headerH - 4 - margin;

        const drawSlice = (yMmTop, sliceMm, sliceCanvasYpx, sliceHeightPx) => {
          const tmp = document.createElement("canvas");
          tmp.width = canvas.width;
          tmp.height = sliceHeightPx;
          const ctx = tmp.getContext("2d");
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, tmp.width, tmp.height);
          ctx.drawImage(canvas, 0, sliceCanvasYpx, canvas.width, sliceHeightPx, 0, 0, canvas.width, sliceHeightPx);
          pdf.addImage(tmp.toDataURL("image/png"), "PNG", imgX, yMmTop, scaledImgW, sliceMm);
        };

        const firstSlicePx = Math.min(canvas.height, Math.floor(firstSliceMm * pxPerMm));
        drawSlice(positionY, firstSlicePx / pxPerMm, 0, firstSlicePx);
        let sliceY = firstSlicePx;
        let remainingH = canvas.height - sliceY;

        while (remainingH > 0) {
          pdf.addPage();
          pdf.setFillColor(255, 255, 255);
          pdf.rect(0, 0, pageWidth, pageHeight, "F");
          pdf.setFillColor(248, 248, 250);
          pdf.rect(0, 0, pageWidth, headerH, "F");
          pdf.setDrawColor(180, 180, 188);
          pdf.setLineWidth(0.3);
          pdf.line(0, headerH, pageWidth, headerH);
          pdf.setTextColor(10, 10, 12);
          pdf.setFontSize(10);
          pdf.text(`ASPICE 4.0 쨌 ${displayProc.id} ${displayProc.name} (cont.)`, margin, 10);

          const slicePx = Math.min(remainingH, Math.floor(otherSliceMm * pxPerMm));
          drawSlice(positionY, slicePx / pxPerMm, sliceY, slicePx);
          sliceY += slicePx;
          remainingH -= slicePx;
        }
      }

      // Footer
      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(7);
        pdf.setTextColor(120, 120, 130);
        pdf.text(
          `Automotive SPICE짰 VDA QMC 쨌 Generated by ASPICE Workbench  쨌  ${i}/${pageCount}`,
          pageWidth / 2,
          pageHeight - 4,
          { align: "center" }
        );
      }

      pdf.save(`ASPICE_${displayProc.id}_report_${Date.now()}.pdf`);
    } catch (e) {
      setError(`PDF ?앹꽦 ?ㅽ뙣 ??${e.message}`);
