// Research dataset for the Agent Control Center Hub.
// Compiled 11 Nov 2026 from OpenAI announcements and press coverage.
// "confidence" marks how well each item is sourced:
//   official   = OpenAI / vendor's own page or help center
//   reported   = several independent news outlets agree
//   secondary  = blogs / aggregators only — verify before relying on it

export type Confidence = "official" | "reported" | "secondary";

export interface Source {
  id: string;
  title: string;
  url: string;
}

export const SOURCES: Source[] = [
  { id: "oai-tools", title: "OpenAI — New tools for building agents (Mar 2025)", url: "https://openai.com/index/new-tools-for-building-agents/" },
  { id: "oai-frontier", title: "OpenAI — Introducing OpenAI Frontier", url: "https://openai.com/index/introducing-openai-frontier/" },
  { id: "axios-frontier", title: "Axios — OpenAI launches platform to manage AI agents", url: "https://axios.com/2026/02/05/openai-platform-ai-agents" },
  { id: "decoder-frontier", title: "The Decoder — Frontier gives agents employee-like identities", url: "https://the-decoder.com/openais-frontier-gives-ai-agents-employee-like-identities-shared-context-and-enterprise-permissions/" },
  { id: "oai-workspace", title: "OpenAI — Introducing workspace agents in ChatGPT", url: "https://openai.com/index/introducing-workspace-agents-in-chatgpt/" },
  { id: "oai-admin", title: "OpenAI Help — Global Admin Console", url: "https://help.openai.com/en/articles/12289294-admin-portal" },
  { id: "oai-apps-admin", title: "OpenAI Help — Admin controls for plugins and apps", url: "https://help.openai.com/en/articles/11509118-admin-controls-security-and-compliance-for-plugins-and-apps" },
  { id: "hns-presence", title: "Help Net Security — OpenAI Presence with built-in guardrails", url: "https://www.helpnetsecurity.com/2026/07/22/openai-presence-ai-agent-platform/" },
  { id: "oai-agents-api", title: "OpenAI — Introducing the Agents API", url: "https://openai.com/index/introducing-the-agents-api/" },
  { id: "oai-agents-faq", title: "OpenAI Help — Agents API beta FAQ", url: "https://help.openai.com/en/articles/20001551-agents-api-beta-faq" },
  { id: "thn-escape", title: "The Hacker News — OpenAI agents demonstrate VM escapes", url: "https://thehackernews.com/2026/10/openai-ai-agents-demonstrate-vm-escapes.html" },
  { id: "da-training", title: "Digital Applied — OpenAI training resumes with sandbox controls", url: "https://www.digitalapplied.com/blog/openai-training-resumes-agent-sandbox-controls" },
  { id: "aiw-probe", title: "AI Weekly — OpenAI widens probe on agent containment", url: "https://aiweekly.co/alerts/openai-widens-probe-finds-more-agents-escaped-containment" },
  { id: "pymnts-biz", title: "PYMNTS — OpenAI gives businesses new tools in ChatGPT", url: "https://www.pymnts.com/news/artificial-intelligence/2026/openai-gives-businesses-new-tools-to-reach-chatgpt-users/" },
  { id: "tnw-odessia", title: "TNW — OpenAI buys Odessia", url: "https://thenextweb.com/news/openai-acquires-odessia-ai-travel-agent" },
  { id: "wiki-codex", title: "Wikipedia — Codex (AI agent)", url: "https://en.wikipedia.org/wiki/OpenAI_Codex_(AI_agent)" },
  { id: "hns-euai", title: "Help Net Security — EU begins enforcing AI Act", url: "https://helpnetsecurity.com/2026/08/04/eu-ai-act-enforcement-ai-models" },
  { id: "cio-gov", title: "CIO — Microsoft, Google push agent governance mainstream", url: "https://www.cio.com/article/4167059/microsoft-google-push-ai-agent-governance-into-enterprise-it-mainstream-2.html" },
  { id: "innobu", title: "Innobu — AI agent governance: AWS, Microsoft, Anthropic compared", url: "https://www.innobu.com/en/articles/ai-agent-governance-enterprise-aws-microsoft-anthropic.html" },
  { id: "flywheel", title: "Enterprise agent platforms 2026: Frontier vs Agent 365 vs AgentCore vs Vertex", url: "https://wetheflywheel.com/en/guides/enterprise-ai-agent-platforms-2026/" },
  { id: "techtimes-enf", title: "Tech Times — Guardrails are not enough: enforcement layer", url: "https://www.techtimes.com/articles/327329/20260911/ai-agent-guardrails-are-not-enough-enterprise-security-needs-enforcement-layer.htm" },
  { id: "techtimes-gemini", title: "Tech Times — Gemini Enterprise Agent Platform & governance", url: "https://www.techtimes.com/articles/320956/20260719/gemini-enterprise-agent-platform-leads-enterprise-ai-governance-openai-starts-billing-agents.htm" },
];

/* ------------------------------------------------------------------ */
/* 1. LEARNING MODULES — the "control center" capabilities, by pillar  */
/* ------------------------------------------------------------------ */

export interface Module {
  id: string;
  num: string;
  title: string;
  tagline: string;
  icon: string;
  color: string; // CSS var name suffix
  category: "Govern" | "Build" | "Operate" | "Contain";
  where: string; // which OpenAI surface delivers it
  keyPoints: string[];
  steps: string[];
  pitfall: string;
  sources: string[];
}

export const MODULES: Module[] = [
  {
    id: "identity",
    num: "01",
    title: "Agent Identity & Scoped Access",
    tagline: "Every agent is a named principal, not a shared API key.",
    icon: "🪪",
    color: "violet",
    category: "Govern",
    where: "OpenAI Frontier · ChatGPT Enterprise IAM",
    keyPoints: [
      "Frontier (5 Feb 2026) gives each AI coworker its own identity with explicit permissions and guardrails.",
      "Access is scoped to exactly what a task requires and tied into enterprise IAM — the same system that governs human employees.",
      "Identity is what makes every later control (approvals, audit, revocation) attributable to one agent.",
    ],
    steps: [
      "Register each agent as its own identity (owner, purpose, environment).",
      "Grant least-privilege scopes per tool / dataset — deny by default.",
      "Bind the identity to your IdP groups so offboarding a team offboards its agents.",
      "Review scopes on a schedule, exactly like human access reviews.",
    ],
    pitfall: "Sharing one service account across many agents — you lose attribution and can't revoke one without breaking all.",
    sources: ["oai-frontier", "decoder-frontier", "axios-frontier"],
  },
  {
    id: "context",
    num: "02",
    title: "Shared Business Context",
    tagline: "Agents act on the same governed data map your people use.",
    icon: "🧠",
    color: "cyan",
    category: "Build",
    where: "OpenAI Frontier · Connectors",
    keyPoints: [
      "Frontier connects agents to enterprise systems (CRM, data warehouses, ticketing) to give them shared business context.",
      "Context is permission-aware: an agent only sees what its identity is allowed to see.",
      "Workspace agents plug into Slack, Salesforce, Notion, Google Drive and Microsoft apps (reported).",
    ],
    steps: [
      "Inventory the systems an agent needs; connect them via approved connectors only.",
      "Classify data (public / internal / confidential / regulated).",
      "Map classifications to agent scopes before go-live.",
    ],
    pitfall: "Giving an agent a broad read connector 'just for context' — that context later leaks through outputs.",
    sources: ["oai-frontier", "decoder-frontier", "oai-workspace"],
  },
  {
    id: "guardrails",
    num: "03",
    title: "Guardrails & Policies",
    tagline: "Checks that run before input reaches the model and before output reaches the world.",
    icon: "🛡️",
    color: "pink",
    category: "Build",
    where: "Agents SDK · AgentKit Guardrails · OpenAI Presence",
    keyPoints: [
      "Agents SDK (Mar 2025) introduced input/output guardrails that run in parallel and trip a wire to halt a run.",
      "AgentKit (Oct 2025) added configurable guardrails such as PII masking and jailbreak detection.",
      "Presence (22 Jul 2026) packages policies, SOPs, guardrails and an approved-actions list for enterprise voice & chat agents.",
    ],
    steps: [
      "Write policies as code: allowed actions, forbidden data, spend limits.",
      "Add an input guardrail (injection / jailbreak / off-topic).",
      "Add an output guardrail (PII, secrets, policy violations).",
      "Fail closed: a tripped guardrail stops the run and logs why.",
    ],
    pitfall: "Prompt-only rules ('please don't…'). A guardrail must be enforced in code outside the model.",
    sources: ["oai-tools", "hns-presence", "techtimes-enf"],
  },
  {
    id: "hitl",
    num: "04",
    title: "Human-in-the-Loop Approvals",
    tagline: "Risky actions pause for a person — by design, not by luck.",
    icon: "🙋",
    color: "amber",
    category: "Govern",
    where: "Workspace agents · Apps admin controls",
    keyPoints: [
      "Workspace agents (22 Apr 2026) let builders set per-agent controls for which app actions are available and when end users must approve them.",
      "Admins control which connected tools and actions each user group may access.",
      "Approval thresholds should scale with blast radius: money, external email, deletes, production writes.",
    ],
    steps: [
      "Tier every tool action: read · write-internal · write-external · irreversible.",
      "Require approval for write-external and irreversible tiers.",
      "Show the approver the exact payload, not a summary.",
      "Time-box approvals; auto-deny on timeout.",
    ],
    pitfall: "Approval fatigue — too many prompts and people click 'Allow' blindly. Tier carefully.",
    sources: ["oai-workspace", "oai-apps-admin"],
  },
  {
    id: "observe",
    num: "05",
    title: "Observability, Evals & Simulation",
    tagline: "You can't govern what you can't replay.",
    icon: "📡",
    color: "green",
    category: "Operate",
    where: "Agents SDK tracing · Platform Logs · Presence simulations",
    keyPoints: [
      "Tracing in the Agents SDK records every model call, tool call, handoff and guardrail trip.",
      "Agents API sessions can be reviewed in the Platform dashboard under Logs.",
      "Presence adds simulations and evaluation tools before agents reach customers.",
    ],
    steps: [
      "Turn tracing on from day one, in every environment.",
      "Build an eval set of real tasks + adversarial tasks.",
      "Simulate before launch; gate releases on eval scores.",
      "Alert on drift: new tools used, cost spikes, guardrail trip rates.",
    ],
    pitfall: "Only logging the final answer. Most incidents live in the intermediate tool calls.",
    sources: ["oai-tools", "oai-agents-faq", "hns-presence"],
  },
  {
    id: "sandbox",
    num: "06",
    title: "Execution Sandboxes & Containment",
    tagline: "Assume the agent will probe its walls — build the walls accordingly.",
    icon: "🧱",
    color: "red",
    category: "Contain",
    where: "Agents API hosted / self-hosted sandboxes · OpenAI containment program",
    keyPoints: [
      "Agents API (10 Sep 2026) runs a managed Codex harness with an OpenAI-hosted sandbox, a self-hosted sandbox, or no environment.",
      "OpenAI's 23 Oct 2026 containment disclosure (via press) described red-team agents chaining bugs to escape hardened microVMs; failure classes: VM escape, egress, cross-isolation channels.",
      "Lesson for builders: egress allowlists and monitoring of side services (metrics, logging, identity) matter as much as the VM.",
    ],
    steps: [
      "Run tool execution in an isolated sandbox per session.",
      "Default-deny network egress; allowlist domains.",
      "Isolate secrets — never mount long-lived credentials.",
      "Monitor side channels: logging, metrics and identity endpoints.",
    ],
    pitfall: "Treating the container boundary as the only control. Defense in depth means identity + egress + monitoring too.",
    sources: ["oai-agents-api", "thn-escape", "da-training", "aiw-probe"],
  },
  {
    id: "admin",
    num: "07",
    title: "Admin Console & Compliance",
    tagline: "One pane of glass to see, suspend and audit every agent.",
    icon: "🎛️",
    color: "blue",
    category: "Operate",
    where: "Global Admin Console · Compliance API",
    keyPoints: [
      "The Global Admin Console is a single surface for identity & access, analytics, agents, billing and governance (Business, Enterprise, Edu).",
      "Through the Compliance API admins see every agent's configuration, updates and runs — and can suspend agents.",
      "OpenAI said an org-wide view of every agent with usage patterns is coming to the console.",
    ],
    steps: [
      "Decide who may use, build and share agents (role-based).",
      "Export agent runs to your SIEM via the Compliance API.",
      "Define a 'kill switch' runbook: who suspends, how fast, who is told.",
    ],
    pitfall: "No owner. Every agent needs a named human accountable for it.",
    sources: ["oai-admin", "oai-workspace"],
  },
  {
    id: "lifecycle",
    num: "08",
    title: "Lifecycle & Continuous Improvement",
    tagline: "Agents are software — version, review, roll back.",
    icon: "♻️",
    color: "teal",
    category: "Operate",
    where: "OpenAI Presence · Frontier",
    keyPoints: [
      "Presence includes a Codex-powered improvement process to refine agents from real conversations.",
      "Presence ships via limited GA with Forward Deployed Engineers — governance is partly a services motion.",
      "Workspace agents are positioned as the successor to custom GPTs, so migrations need their own review.",
    ],
    steps: [
      "Version prompts, tools and policies together.",
      "Promote via dev → staging → prod with eval gates.",
      "Keep one-click rollback to the last good version.",
      "Retire agents formally: revoke identity, archive logs.",
    ],
    pitfall: "Editing a production agent's instructions live with no diff, no review and no rollback.",
    sources: ["hns-presence", "oai-workspace"],
  },
];

/* ------------------------------------------------------------------ */
/* 2. TIMELINE — dated updates                                         */
/* ------------------------------------------------------------------ */

export interface TimelineItem {
  date: string; // ISO yyyy-mm-dd (day 01 + approx flag when only month known)
  approx?: boolean;
  org: "OpenAI" | "Anthropic" | "Google" | "Microsoft" | "AWS" | "Regulator";
  title: string;
  detail: string;
  tag: "Platform" | "Guardrails" | "Governance" | "Safety" | "Regulation" | "Commerce";
  confidence: Confidence;
  source: string;
}

export const TIMELINE: TimelineItem[] = [
  { date: "2025-03-11", org: "OpenAI", title: "Responses API + Agents SDK", detail: "New agent building blocks: built-in tools, the open-source Agents SDK with handoffs, input/output guardrails and tracing.", tag: "Guardrails", confidence: "official", source: "oai-tools" },
  { date: "2025-07-16", org: "AWS", title: "Bedrock AgentCore (preview)", detail: "Runtime, identity, memory, gateway and observability services for running agents on AWS; GA followed in Oct 2025.", tag: "Platform", confidence: "reported", source: "flywheel" },
  { date: "2025-08-02", org: "Regulator", title: "EU AI Act — GPAI obligations apply", detail: "Obligations for general-purpose AI model providers begin to apply (enforcement powers follow one year later).", tag: "Regulation", confidence: "reported", source: "hns-euai" },
  { date: "2025-10-06", org: "OpenAI", title: "AgentKit at DevDay 2025", detail: "Agent Builder, ChatKit, Connector Registry and configurable Guardrails (e.g. PII masking, jailbreak detection).", tag: "Guardrails", confidence: "reported", source: "oai-tools" },
  { date: "2026-02-05", org: "OpenAI", title: "OpenAI Frontier launches", detail: "Enterprise platform to build, deploy and manage AI coworkers — each with its own identity, explicit permissions, shared business context and audit logs. Early adopters reported: HP, Intuit, Oracle, Uber.", tag: "Governance", confidence: "official", source: "oai-frontier" },
  { date: "2026-03-24", org: "Anthropic", title: "Compliance API generally available", detail: "Real-time monitoring and compliance access for enterprise Claude usage (per secondary analysis).", tag: "Governance", confidence: "secondary", source: "innobu" },
  { date: "2026-04-01", approx: true, org: "Google", title: "Agent Identity & Agent Gateway (Cloud Next)", detail: "Policy enforcement for agent-to-agent and agent-to-tool connections inside Google Cloud.", tag: "Governance", confidence: "reported", source: "cio-gov" },
  { date: "2026-04-22", org: "OpenAI", title: "Workspace agents in ChatGPT (research preview)", detail: "Codex-powered team agents, successor to custom GPTs. Admins control tools/actions per group, who can build & share, see runs via Compliance API and suspend agents.", tag: "Governance", confidence: "official", source: "oai-workspace" },
  { date: "2026-05-01", org: "Microsoft", title: "Microsoft Agent 365 GA", detail: "Unified control plane to observe, govern and secure agents; every agent gets an Entra Agent ID.", tag: "Governance", confidence: "reported", source: "cio-gov" },
  { date: "2026-07-09", org: "OpenAI", title: "Codex merges into ChatGPT desktop", detail: "The Codex app is folded into the ChatGPT desktop app.", tag: "Platform", confidence: "secondary", source: "wiki-codex" },
  { date: "2026-07-22", org: "OpenAI", title: "OpenAI Presence", detail: "Enterprise voice & chat agents with policies, SOPs, guardrails, approved actions, simulations, evals and a Codex-powered improvement loop. Limited GA with Forward Deployed Engineers.", tag: "Guardrails", confidence: "reported", source: "hns-presence" },
  { date: "2026-08-02", org: "Regulator", title: "EU AI Office enforcement powers go live", detail: "The AI Office can request documentation, run evaluations, demand corrective action and fine GPAI providers (up to 3% of global turnover or €15M).", tag: "Regulation", confidence: "reported", source: "hns-euai" },
  { date: "2026-09-10", org: "OpenAI", title: "Agents API public beta", detail: "Managed Codex harness for all API developers; OpenAI-hosted or self-hosted sandboxes (partners incl. Modal, Cloudflare, Daytona, E2B, Vercel). US-only data residency, no ZDR in beta.", tag: "Platform", confidence: "official", source: "oai-agents-api" },
  { date: "2026-10-01", org: "OpenAI", title: "Frontier training resumes after containment upgrade", detail: "Press reports a training pause from 20 Sep, resumed 1 Oct after strengthening containment architecture.", tag: "Safety", confidence: "secondary", source: "da-training" },
  { date: "2026-10-23", org: "OpenAI", title: "Containment program disclosure", detail: "Red-team agents chained vulnerabilities to escape hardened microVMs in test environments. Failure classes: VM escape, egress, cross-isolation channels.", tag: "Safety", confidence: "reported", source: "thn-escape" },
  { date: "2026-11-10", approx: true, org: "OpenAI", title: "Business Agents in ChatGPT (beta) + Odessia acquisition", detail: "Business Hub profiles and Business Agents for eligible US firms; businesses can't see individual chats. OpenAI also acquired travel-agent startup Odessia.", tag: "Commerce", confidence: "reported", source: "pymnts-biz" },
];

/* ------------------------------------------------------------------ */
/* 3. COMPARISON — how other vendors approach the same problem         */
/* ------------------------------------------------------------------ */

export type Level = "yes" | "partial" | "no" | "unknown";

export interface Vendor {
  id: string;
  name: string;
  product: string;
  color: string;
  launched: string;
  approach: string;
  scope: string;
}

export const VENDORS: Vendor[] = [
  { id: "openai", name: "OpenAI", product: "Frontier · Admin Console · Agents API", color: "#10a37f", launched: "Feb 2026 → Sep 2026", approach: "Agents as 'AI coworkers' with identities, business context and app-tier governance.", scope: "OpenAI agents + agents built elsewhere (Frontier is described as open)" },
  { id: "microsoft", name: "Microsoft", product: "Agent 365 · Entra Agent ID", color: "#0078d4", launched: "GA 1 May 2026", approach: "Identity-first: every agent is managed like a user in Entra.", scope: "Broadest — described as covering agents from any source" },
  { id: "google", name: "Google", product: "Gemini Enterprise Agent Platform · Agent Gateway", color: "#ea4335", launched: "Apr 2026 (Cloud Next)", approach: "Connection-level policy at the gateway between agents and tools.", scope: "Google Cloud / Workspace agents" },
  { id: "anthropic", name: "Anthropic", product: "Compliance API · Claude Managed Agents", color: "#d97757", launched: "Mar 2026 (Compliance API GA)", approach: "Customer-hosted tool execution with vendor-managed orchestration + compliance APIs.", scope: "Claude agents; tools can run in customer infrastructure" },
  { id: "aws", name: "AWS", product: "Bedrock AgentCore", color: "#ff9900", launched: "Preview Jul 2025 · GA Oct 2025", approach: "Infrastructure primitives: runtime, identity, gateway, memory, observability.", scope: "Model-agnostic agents on AWS" },
];

export interface CapabilityRow {
  capability: string;
  values: Record<string, Level>;
  note?: string;
}

export const CAPABILITIES: CapabilityRow[] = [
  { capability: "Per-agent identity", values: { openai: "yes", microsoft: "yes", google: "yes", anthropic: "partial", aws: "yes" } },
  { capability: "Central admin / control plane", values: { openai: "yes", microsoft: "yes", google: "yes", anthropic: "partial", aws: "partial" } },
  { capability: "Built-in guardrails (PII, jailbreak)", values: { openai: "yes", microsoft: "yes", google: "yes", anthropic: "partial", aws: "yes" }, note: "AWS via Bedrock Guardrails" },
  { capability: "Human approval per action", values: { openai: "yes", microsoft: "partial", google: "partial", anthropic: "yes", aws: "partial" } },
  { capability: "Tracing & audit logs", values: { openai: "yes", microsoft: "yes", google: "yes", anthropic: "yes", aws: "yes" } },
  { capability: "Gateway-level policy enforcement", values: { openai: "no", microsoft: "partial", google: "yes", anthropic: "no", aws: "yes" }, note: "Critics say OpenAI governance stays at the app tier" },
  { capability: "Self-hosted execution sandbox", values: { openai: "yes", microsoft: "partial", google: "partial", anthropic: "yes", aws: "yes" } },
  { capability: "Governs third-party agents", values: { openai: "partial", microsoft: "yes", google: "partial", anthropic: "no", aws: "yes" } },
];

/* ------------------------------------------------------------------ */
/* 4. FUTURE RESTRICTIONS — where agent rules are heading              */
/* ------------------------------------------------------------------ */

export const FUTURE_RULES = [
  { icon: "🪪", title: "Identity is mandatory", text: "No anonymous agents: every action traceable to an agent ID and a human owner." },
  { icon: "🌐", title: "Egress is deny-by-default", text: "After the 2026 containment findings, outbound network access becomes allowlisted, monitored and per-session." },
  { icon: "💳", title: "Money needs a human", text: "Payments and commerce (e.g. agent payments with card networks) gated by spend caps and explicit approval." },
  { icon: "🧾", title: "Audit-ready by default", text: "EU AI Act enforcement (Aug 2026) pushes documentation, evals and logs from 'nice to have' to required." },
  { icon: "🚦", title: "Enforcement below the app", text: "Policy moves into gateways and infrastructure so a jailbroken prompt can't bypass it." },
  { icon: "🛑", title: "Kill switch SLAs", text: "Org-wide suspend-in-seconds, with tested runbooks — the agent equivalent of incident response." },
];
