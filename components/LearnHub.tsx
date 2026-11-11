"use client";

import { useState } from "react";
import { MODULES, SOURCES } from "@/lib/data";

const CATS = ["All", "Govern", "Build", "Operate", "Contain"] as const;

export default function LearnHub() {
  const [cat, setCat] = useState<(typeof CATS)[number]>("All");
  const [openId, setOpenId] = useState<string>(MODULES[0].id);
  const list = MODULES.filter((m) => cat === "All" || m.category === cat);
  const open = MODULES.find((m) => m.id === openId) ?? MODULES[0];

  return (
    <section id="learn">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Learning path</span>
          <h2>8 pillars, <span className="grad-text">step by step</span></h2>
          <p>Pick a category, open a pillar, and follow the steps. Each card shows which OpenAI surface delivers it and links to the source.</p>
        </div>

        <div className="filters">
          {CATS.map((c) => (
            <button key={c} className={`filter ${cat === c ? "active" : ""}`} onClick={() => setCat(c)}>
              {c}
            </button>
          ))}
        </div>

        <div className="modules">
          {list.map((m) => (
            <div
              key={m.id}
              className="card module"
              style={{ ["--accent" as string]: `var(--${m.color})`, borderColor: openId === m.id ? `var(--${m.color})` : undefined }}
              onClick={() => {
                setOpenId(m.id);
                document.getElementById("module-detail")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setOpenId(m.id)}
            >
              <span className="num">{m.num}</span>
              <div className="m-ico">{m.icon}</div>
              <h3>{m.title}</h3>
              <p>{m.tagline}</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                <span className="chip">{m.category}</span>
              </div>
              <div className="bar" />
            </div>
          ))}
        </div>

        <div id="module-detail" className="detail" style={{ ["--accent" as string]: `var(--${open.color})` }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
            <div className="m-ico" style={{ width: 56, height: 56, borderRadius: 16, display: "grid", placeItems: "center", fontSize: 28, background: `color-mix(in srgb, var(--${open.color}) 25%, transparent)` }}>
              {open.icon}
            </div>
            <div>
              <div className="chip" style={{ marginBottom: 6 }}>Pillar {open.num} · {open.where}</div>
              <h3 style={{ fontSize: 26 }}>{open.title}</h3>
            </div>
          </div>
          <div className="detail-grid">
            <div>
              <h4>What OpenAI ships</h4>
              <ul className="points">
                {open.keyPoints.map((k) => (
                  <li key={k}>{k}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4>How to implement it</h4>
              <ol className="steps">
                {open.steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
              <div className="pitfall">⚠️ <b>Common pitfall:</b> {open.pitfall}</div>
            </div>
          </div>
          <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap", fontSize: 13 }}>
            <span className="note-small">Sources:</span>
            {open.sources.map((id) => {
              const s = SOURCES.find((x) => x.id === id);
              return s ? (
                <a key={id} href={s.url} target="_blank" rel="noreferrer">
                  {s.title} ↗
                </a>
              ) : null;
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
