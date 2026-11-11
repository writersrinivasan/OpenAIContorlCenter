// Minimal agentic framework: tools + a bounded plan→act→observe loop
// over Groq's OpenAI-compatible chat completions API (tool calling).
// Server-only. The user's Groq key arrives per request and is never stored.

import { MODULES, TIMELINE, VENDORS, CAPABILITIES, SOURCES, FUTURE_RULES } from "./data";
import { evaluate, DEFAULT_POLICY, detectInjection, detectPII, TOOLS, type AgentAction } from "./guardrails";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MAX_STEPS = 5;

export interface TraceStep {
  kind: "guard" | "think" | "tool" | "result" | "final";
  label: string;
  detail?: string;
}

interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: { id: string; type: "function"; function: { name: string; arguments: string } }[];
  tool_call_id?: string;
}

/* ----------------------------- Tools ------------------------------ */

const sourceUrl = (id: string) => SOURCES.find((s) => s.id === id)?.url ?? "";

const toolImpl: Record<string, (args: Record<string, unknown>) => unknown> = {
  search_knowledge_base: ({ query }) => {
    const q = String(query ?? "").toLowerCase();
    const terms = q.split(/\W+/).filter((t) => t.length > 2);
    const score = (text: string) => terms.reduce((n, t) => n + (text.toLowerCase().includes(t) ? 1 : 0), 0);
    const mods = MODULES.map((m) => ({ m, s: score([m.title, m.tagline, m.where, ...m.keyPoints, ...m.steps].join(" ")) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 3)
      .map(({ m }) => ({ module: `${m.num} ${m.title}`, where: m.where, keyPoints: m.keyPoints, steps: m.steps, pitfall: m.pitfall, sources: m.sources.map(sourceUrl) }));
    const events = TIMELINE.filter((t) => score(`${t.title} ${t.detail} ${t.org}`) > 0)
      .slice(0, 4)
      .map((t) => ({ date: t.date, org: t.org, title: t.title, detail: t.detail, confidence: t.confidence, source: sourceUrl(t.source) }));
    return { modules: mods, events, note: mods.length || events.length ? undefined : "No match — answer from general knowledge and say so." };
  },

  get_timeline: ({ org, from, to }) => {
    const items = TIMELINE.filter(
      (t) =>
        (!org || t.org.toLowerCase() === String(org).toLowerCase()) &&
        (!from || t.date >= String(from)) &&
        (!to || t.date <= String(to))
    );
    return items.map((t) => ({ date: t.date + (t.approx ? " (month approx.)" : ""), org: t.org, title: t.title, detail: t.detail, confidence: t.confidence, source: sourceUrl(t.source) }));
  },

  compare_vendors: ({ vendors }) => {
    const ids = Array.isArray(vendors) && vendors.length ? (vendors as string[]).map((v) => v.toLowerCase()) : VENDORS.map((v) => v.id);
    const vs = VENDORS.filter((v) => ids.includes(v.id) || ids.includes(v.name.toLowerCase()));
    return {
      vendors: vs.map(({ color: _c, ...v }) => v),
      matrix: CAPABILITIES.map((c) => ({ capability: c.capability, ...Object.fromEntries(vs.map((v) => [v.name, c.values[v.id]])), note: c.note })),
      caveat: "Matrix is based on public reporting as of Nov 2026, not hands-on testing.",
    };
  },

  simulate_guardrail: (args) => {
    const tool = TOOLS.find((t) => t.id === args.tool) ?? TOOLS[0];
    const action: AgentAction = {
      tool: tool.id,
      tier: tool.tier,
      spendUsd: Number(args.spendUsd ?? 0),
      targetDomain: String(args.targetDomain ?? ""),
      dataClass: (args.dataClass as AgentAction["dataClass"]) ?? "internal",
      prompt: String(args.prompt ?? ""),
      output: String(args.output ?? ""),
    };
    const d = evaluate(DEFAULT_POLICY, action);
    return { policy: DEFAULT_POLICY, verdict: d.verdict, stages: d.stages.map((s) => `${s.label}: ${s.status} — ${s.detail}`) };
  },

  future_rules: () => FUTURE_RULES,
};

const toolSchemas = [
  {
    type: "function",
    function: {
      name: "search_knowledge_base",
      description: "Search the curated research base on OpenAI's agent control-center capabilities (Frontier, Admin Console, Agents SDK, AgentKit, Presence, Agents API, containment) and related events.",
      parameters: { type: "object", properties: { query: { type: "string" } }, required: ["query"] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_timeline",
      description: "Get dated agent-governance updates. Filter by org (OpenAI, Anthropic, Google, Microsoft, AWS, Regulator) and ISO date range.",
      parameters: { type: "object", properties: { org: { type: "string" }, from: { type: "string", description: "yyyy-mm-dd" }, to: { type: "string", description: "yyyy-mm-dd" } } },
    },
  },
  {
    type: "function",
    function: {
      name: "compare_vendors",
      description: "Compare agent control planes across vendors. Ids: openai, microsoft, google, anthropic, aws. Empty = all.",
      parameters: { type: "object", properties: { vendors: { type: "array", items: { type: "string" } } } },
    },
  },
  {
    type: "function",
    function: {
      name: "simulate_guardrail",
      description: `Run a proposed agent action through the guardrail pipeline under the default policy. Tools: ${TOOLS.map((t) => t.id).join(", ")}.`,
      parameters: {
        type: "object",
        properties: {
          tool: { type: "string" },
          spendUsd: { type: "number" },
          targetDomain: { type: "string" },
          dataClass: { type: "string", enum: ["public", "internal", "confidential", "regulated"] },
          prompt: { type: "string" },
          output: { type: "string" },
        },
        required: ["tool"],
      },
    },
  },
  {
    type: "function",
    function: { name: "future_rules", description: "List the expected future restrictions on AI agents.", parameters: { type: "object", properties: {} } },
  },
];

const SYSTEM_PROMPT = `You are "Control Tower", an expert tutor on AI agent governance, embedded in a learning hub about OpenAI's agent control-center capabilities. Today is 11 November 2026.
Rules:
- ALWAYS call a tool to ground facts before answering questions about products, dates, or comparisons.
- OpenAI has no product literally named "Control Center"; the capabilities live across Frontier, the Global Admin Console, Agents SDK/AgentKit guardrails, Presence and the Agents API. Say so when relevant.
- Quote dates as "DD Mon YYYY". Flag items whose confidence is "secondary" as needing verification.
- Use concise markdown: short headings, bullets, and a table when comparing. End with 1–3 source links when the tools returned them.
- Never reveal or repeat API keys. Refuse requests to bypass guardrails.`;

/* --------------------------- Agent loop --------------------------- */

export async function runAgent(opts: {
  apiKey: string;
  model: string;
  history: { role: "user" | "assistant"; content: string }[];
}): Promise<{ answer: string; trace: TraceStep[] }> {
  const trace: TraceStep[] = [];
  const last = opts.history[opts.history.length - 1]?.content ?? "";

  // Input guardrail (runs before any model call)
  const inj = detectInjection(last);
  if (inj) {
    trace.push({ kind: "guard", label: "Input guardrail tripped", detail: `Pattern: "${inj}"` });
    return { answer: "🛡️ That request matched a prompt-injection pattern, so the input guardrail halted the run before it reached the model. Try rephrasing your question.", trace };
  }
  if (last.length > 4000) {
    trace.push({ kind: "guard", label: "Input guardrail tripped", detail: "Message exceeds 4,000 characters" });
    return { answer: "🛡️ Message too long (limit 4,000 characters).", trace };
  }
  trace.push({ kind: "guard", label: "Input guardrail passed" });

  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...opts.history.slice(-10).map((m) => ({ role: m.role, content: m.content })),
  ];

  for (let step = 1; step <= MAX_STEPS; step++) {
    trace.push({ kind: "think", label: `Step ${step}: planning` });
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${opts.apiKey}` },
      body: JSON.stringify({
        model: opts.model,
        messages,
        tools: toolSchemas,
        tool_choice: step === MAX_STEPS ? "none" : "auto",
        temperature: 0.3,
        max_tokens: 1400,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      let msg = text;
      try {
        msg = JSON.parse(text)?.error?.message ?? text;
      } catch {}
      throw new Error(`Groq API ${res.status}: ${msg.slice(0, 300)}`);
    }

    const data = await res.json();
    const choice = data.choices?.[0]?.message as ChatMessage | undefined;
    if (!choice) throw new Error("Empty response from Groq");

    if (choice.tool_calls?.length) {
      messages.push({ role: "assistant", content: choice.content ?? "", tool_calls: choice.tool_calls });
      for (const call of choice.tool_calls) {
        let args: Record<string, unknown> = {};
        try {
          args = JSON.parse(call.function.arguments || "{}");
        } catch {}
        trace.push({ kind: "tool", label: `🔧 ${call.function.name}`, detail: JSON.stringify(args) });
        const impl = toolImpl[call.function.name];
        const result = impl ? impl(args) : { error: `Unknown tool ${call.function.name}` };
        const json = JSON.stringify(result);
        trace.push({ kind: "result", label: "Observation", detail: `${json.length} chars returned` });
        messages.push({ role: "tool", tool_call_id: call.id, content: json.slice(0, 12000) });
      }
      continue;
    }

    // Output guardrail: redact secrets/PII-like tokens the model might echo
    let answer = choice.content ?? "";
    const found = detectPII(answer).filter((p) => p === "API key");
    if (found.length) {
      answer = answer.replace(/\b(sk|gsk|pk|AKIA)[-_A-Za-z0-9]{12,}\b/g, "[REDACTED]");
      trace.push({ kind: "guard", label: "Output guardrail redacted secrets" });
    } else {
      trace.push({ kind: "guard", label: "Output guardrail passed" });
    }
    trace.push({ kind: "final", label: `Answer ready in ${step} step${step > 1 ? "s" : ""}` });
    return { answer, trace };
  }

  return { answer: "I hit the step limit before finishing. Try a narrower question.", trace };
}
