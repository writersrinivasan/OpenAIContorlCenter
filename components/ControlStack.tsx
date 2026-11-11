const LAYERS = [
  { icon: "🎛️", color: "#3b82f6", title: "Admin & Compliance", text: "See every agent, set who can build/share, export runs, suspend instantly.", chip: "Admin Console" },
  { icon: "🪪", color: "#8b5cf6", title: "Identity & Access", text: "Each agent is a principal with least-privilege scopes tied to enterprise IAM.", chip: "Frontier" },
  { icon: "🧠", color: "#22d3ee", title: "Business Context", text: "Governed connectors to CRM, docs, warehouses — permission-aware.", chip: "Connectors" },
  { icon: "🛡️", color: "#ec4899", title: "Guardrails & Policy", text: "Input/output checks and policy-as-code that fail closed.", chip: "Agents SDK · AgentKit" },
  { icon: "🙋", color: "#f59e0b", title: "Human Approvals", text: "Risky tiers pause for a person who sees the exact payload.", chip: "Workspace agents" },
  { icon: "🧱", color: "#ef4444", title: "Sandbox & Egress", text: "Isolated execution, deny-by-default network, no long-lived secrets.", chip: "Agents API" },
  { icon: "📡", color: "#22c55e", title: "Observe & Improve", text: "Traces, evals, simulations and a versioned improvement loop.", chip: "Presence · Logs" },
];

export default function ControlStack() {
  return (
    <section id="stack">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Infographic</span>
          <h2>The agent <span className="grad-text">control stack</span></h2>
          <p>Seven layers, top to bottom. Every agent action should pass through all of them — governance on top, containment at the base.</p>
        </div>
        <div className="stack">
          {LAYERS.map((l, i) => (
            <div key={l.title} className="stack-layer" style={{ ["--layer" as string]: l.color, marginInline: `${i * 1.2}%` }}>
              <div className="ico">{l.icon}</div>
              <div>
                <h4>{l.title}</h4>
                <p>{l.text}</p>
              </div>
              <span className="chip">{l.chip}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
