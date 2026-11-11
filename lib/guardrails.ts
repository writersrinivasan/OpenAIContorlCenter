// Deterministic agent-action policy engine.
// Models a control-center pipeline: identity → scope → input guard →
// policy → human approval → sandbox/egress → output guard → audit.

export type Tier = "read" | "write-internal" | "write-external" | "irreversible";
export type DataClass = "public" | "internal" | "confidential" | "regulated";

export interface Policy {
  agentId: string;
  allowedTools: string[];
  maxSpendUsd: number;
  approvalTiers: Tier[];
  egressAllowlist: string[];
  maxDataClass: DataClass;
  killSwitch: boolean;
}

export interface AgentAction {
  tool: string;
  tier: Tier;
  spendUsd: number;
  targetDomain: string;
  dataClass: DataClass;
  prompt: string;
  output: string;
}

export type StageStatus = "pass" | "block" | "approval" | "warn";

export interface StageResult {
  id: string;
  label: string;
  icon: string;
  status: StageStatus;
  detail: string;
}

export interface Decision {
  verdict: "ALLOWED" | "BLOCKED" | "NEEDS APPROVAL";
  stages: StageResult[];
  audit: Record<string, unknown>;
}

export const TOOLS = [
  { id: "crm.read", label: "Read CRM record", tier: "read" as Tier },
  { id: "docs.search", label: "Search internal docs", tier: "read" as Tier },
  { id: "ticket.update", label: "Update support ticket", tier: "write-internal" as Tier },
  { id: "email.send", label: "Send external email", tier: "write-external" as Tier },
  { id: "payments.refund", label: "Issue refund", tier: "irreversible" as Tier },
  { id: "db.delete", label: "Delete production rows", tier: "irreversible" as Tier },
  { id: "web.fetch", label: "Fetch a web page", tier: "read" as Tier },
];

export const DEFAULT_POLICY: Policy = {
  agentId: "agent://support-copilot-01",
  allowedTools: ["crm.read", "docs.search", "ticket.update", "email.send", "payments.refund", "web.fetch"],
  maxSpendUsd: 200,
  approvalTiers: ["write-external", "irreversible"],
  egressAllowlist: ["api.company.com", "docs.company.com", "stripe.com"],
  maxDataClass: "confidential",
  killSwitch: false,
};

const DATA_RANK: Record<DataClass, number> = { public: 0, internal: 1, confidential: 2, regulated: 3 };

const INJECTION_PATTERNS = [
  /ignore (all|any|previous|prior) (instructions|rules)/i,
  /disregard (the )?(system|above)/i,
  /you are now (dan|in developer mode)/i,
  /reveal (your|the) (system prompt|instructions|secrets?)/i,
  /exfiltrate|base64 the (key|token|secret)/i,
  /disable (the )?(guardrails?|safety|filters?)/i,
];

const PII_PATTERNS: { name: string; re: RegExp }[] = [
  { name: "email address", re: /[\w.+-]+@[\w-]+\.[\w.]+/ },
  { name: "card number", re: /\b(?:\d[ -]?){13,16}\b/ },
  { name: "US SSN", re: /\b\d{3}-\d{2}-\d{4}\b/ },
  { name: "API key", re: /\b(sk|gsk|pk|AKIA)[-_A-Za-z0-9]{12,}\b/ },
];

export function detectInjection(text: string): string | null {
  for (const re of INJECTION_PATTERNS) {
    const m = text.match(re);
    if (m) return m[0];
  }
  return null;
}

export function detectPII(text: string): string[] {
  return PII_PATTERNS.filter((p) => p.re.test(text)).map((p) => p.name);
}

export function evaluate(policy: Policy, action: AgentAction, ts: string = new Date().toISOString()): Decision {
  const stages: StageResult[] = [];
  let blocked = false;
  let needsApproval = false;

  const push = (s: StageResult) => {
    if (blocked) {
      stages.push({ ...s, status: "warn", detail: "Skipped — run already halted upstream." });
      return;
    }
    stages.push(s);
    if (s.status === "block") blocked = true;
    if (s.status === "approval") needsApproval = true;
  };

  // 0. Kill switch
  push(
    policy.killSwitch
      ? { id: "kill", label: "Kill switch", icon: "🛑", status: "block", detail: "Agent suspended by admin. All actions refused." }
      : { id: "kill", label: "Kill switch", icon: "🛑", status: "pass", detail: "Agent is active." }
  );

  // 1. Identity
  push(
    /^agent:\/\/[a-z0-9-]+$/i.test(policy.agentId)
      ? { id: "identity", label: "Identity", icon: "🪪", status: "pass", detail: `Authenticated as ${policy.agentId}.` }
      : { id: "identity", label: "Identity", icon: "🪪", status: "block", detail: "Unregistered or malformed agent identity." }
  );

  // 2. Scope
  push(
    policy.allowedTools.includes(action.tool)
      ? { id: "scope", label: "Tool scope", icon: "🔑", status: "pass", detail: `'${action.tool}' is in this agent's scope.` }
      : { id: "scope", label: "Tool scope", icon: "🔑", status: "block", detail: `'${action.tool}' is not granted to this agent (deny by default).` }
  );

  // 3. Input guardrail
  const inj = detectInjection(action.prompt);
  push(
    inj
      ? { id: "input", label: "Input guardrail", icon: "🧲", status: "block", detail: `Prompt-injection pattern tripped: "${inj}".` }
      : { id: "input", label: "Input guardrail", icon: "🧲", status: "pass", detail: "No injection / jailbreak patterns found." }
  );

  // 4. Data classification
  push(
    DATA_RANK[action.dataClass] <= DATA_RANK[policy.maxDataClass]
      ? { id: "data", label: "Data class", icon: "🗂️", status: "pass", detail: `'${action.dataClass}' ≤ ceiling '${policy.maxDataClass}'.` }
      : { id: "data", label: "Data class", icon: "🗂️", status: "block", detail: `'${action.dataClass}' data exceeds this agent's ceiling '${policy.maxDataClass}'.` }
  );

  // 5. Spend
  push(
    action.spendUsd <= policy.maxSpendUsd
      ? { id: "spend", label: "Spend limit", icon: "💳", status: "pass", detail: `$${action.spendUsd} within cap $${policy.maxSpendUsd}.` }
      : { id: "spend", label: "Spend limit", icon: "💳", status: "block", detail: `$${action.spendUsd} exceeds cap $${policy.maxSpendUsd}.` }
  );

  // 6. Egress
  const domain = action.targetDomain.trim().toLowerCase();
  const egressOk = !domain || policy.egressAllowlist.some((d) => domain === d || domain.endsWith("." + d));
  push(
    egressOk
      ? { id: "egress", label: "Egress", icon: "🌐", status: "pass", detail: domain ? `${domain} is allowlisted.` : "No outbound network call." }
      : { id: "egress", label: "Egress", icon: "🌐", status: "block", detail: `${domain} is not on the egress allowlist.` }
  );

  // 7. Human approval
  push(
    policy.approvalTiers.includes(action.tier)
      ? { id: "hitl", label: "Human approval", icon: "🙋", status: "approval", detail: `Tier '${action.tier}' requires a human to approve the exact payload.` }
      : { id: "hitl", label: "Human approval", icon: "🙋", status: "pass", detail: `Tier '${action.tier}' runs autonomously.` }
  );

  // 8. Output guardrail
  const pii = detectPII(action.output);
  push(
    pii.length
      ? { id: "output", label: "Output guardrail", icon: "🔏", status: "warn", detail: `Redacting before release: ${pii.join(", ")}.` }
      : { id: "output", label: "Output guardrail", icon: "🔏", status: "pass", detail: "No PII or secrets in output." }
  );

  const verdict: Decision["verdict"] = blocked ? "BLOCKED" : needsApproval ? "NEEDS APPROVAL" : "ALLOWED";

  // 9. Audit (always runs)
  const audit = {
    ts,
    agent: policy.agentId,
    tool: action.tool,
    tier: action.tier,
    spendUsd: action.spendUsd,
    target: domain || null,
    dataClass: action.dataClass,
    verdict,
    trippedAt: stages.find((s) => s.status === "block")?.id ?? null,
  };
  stages.push({ id: "audit", label: "Audit log", icon: "🧾", status: "pass", detail: "Immutable record written (always, even when blocked)." });

  return { verdict, stages, audit };
}
