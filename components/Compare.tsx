import { CAPABILITIES, VENDORS, type Level } from "@/lib/data";

const SYMBOL: Record<Level, string> = { yes: "✓", partial: "◐", no: "✕", unknown: "?" };

export default function Compare() {
  return (
    <section id="compare">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Industry comparison</span>
          <h2>Who else is building an <span className="grad-text">agent control plane?</span></h2>
          <p>
            OpenAI isn&apos;t alone. Microsoft, Google, Anthropic and AWS all shipped agent-governance layers between 2025 and 2026 — each from a
            different starting point. Analysts note each one mostly governs agents inside its own stack.
          </p>
        </div>

        <div className="vendors">
          {VENDORS.map((v) => (
            <div key={v.id} className="card vendor" style={{ ["--vc" as string]: v.color }}>
              <h3>{v.name}</h3>
              <div className="prod">{v.product}</div>
              <p>📅 {v.launched}</p>
              <p>🧭 {v.approach}</p>
              <p>🎯 {v.scope}</p>
            </div>
          ))}
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Capability</th>
                {VENDORS.map((v) => (
                  <th key={v.id} style={{ textAlign: "center" }}>
                    <span className="dot" style={{ background: v.color }} />
                    {v.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CAPABILITIES.map((c) => (
                <tr key={c.capability}>
                  <td>
                    <b>{c.capability}</b>
                    {c.note && <div className="note-small">{c.note}</div>}
                  </td>
                  {VENDORS.map((v) => {
                    const lv = c.values[v.id] ?? "unknown";
                    return (
                      <td key={v.id} className="cell">
                        <span className={`lv lv-${lv}`} title={lv}>{SYMBOL[lv]}</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="legend">
          <span><span className="lv lv-yes">✓</span> available</span>
          <span><span className="lv lv-partial">◐</span> partial / via add-on</span>
          <span><span className="lv lv-no">✕</span> not reported</span>
          <span>Based on public reporting as of Nov 2026, not hands-on testing.</span>
        </div>
      </div>
    </section>
  );
}
