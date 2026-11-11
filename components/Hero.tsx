import { MODULES, TIMELINE, VENDORS } from "@/lib/data";

export default function Hero() {
  const oai = TIMELINE.filter((t) => t.org === "OpenAI" && t.date.startsWith("2026")).length;
  return (
    <header id="top" className="hero">
      <div className="container">
        <span className="eyebrow">✦ Learning hub · Updated 11 Nov 2026</span>
        <h1>
          How to run a <span className="grad-text">control center</span>
          <br />
          for <span className="grad-text-2">AI agents</span>
        </h1>
        <p className="lead">
          A visual, step-by-step guide to the governance layer OpenAI has been building for agents — identity, guardrails,
          approvals, sandboxes and admin controls — plus a hands-on guardrail lab, a dated timeline, and how Microsoft,
          Google, Anthropic and AWS compare.
        </p>
        <div className="hero-cta">
          <a href="#learn" className="btn">Start learning →</a>
          <a href="#lab" className="btn btn-ghost">Try the Guardrail Lab</a>
        </div>

        <div className="stats">
          <div className="stat"><b>{MODULES.length}</b><span>control pillars, step by step</span></div>
          <div className="stat"><b>{oai}</b><span>OpenAI agent updates in 2026</span></div>
          <div className="stat"><b>{VENDORS.length}</b><span>vendors compared side by side</span></div>
          <div className="stat"><b>9</b><span>checks in the guardrail pipeline</span></div>
        </div>

        <div className="notice">
          <span>ℹ️</span>
          <span>
            OpenAI hasn&apos;t shipped a product literally named &ldquo;Control Center&rdquo;. The capabilities this hub covers are
            spread across <b>Frontier</b> (Feb 2026), the <b>Global Admin Console</b>, <b>workspace agents</b> (Apr 2026),{" "}
            <b>Agents SDK / AgentKit guardrails</b>, <b>Presence</b> (Jul 2026) and the <b>Agents API</b> (Sep 2026).
          </span>
        </div>
      </div>
    </header>
  );
}
