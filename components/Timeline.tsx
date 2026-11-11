"use client";

import { useMemo, useState } from "react";
import { TIMELINE, SOURCES, type TimelineItem } from "@/lib/data";

const ORG_COLOR: Record<TimelineItem["org"], string> = {
  OpenAI: "#10a37f",
  Anthropic: "#d97757",
  Google: "#ea4335",
  Microsoft: "#0078d4",
  AWS: "#ff9900",
  Regulator: "#a78bfa",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function fmt(t: TimelineItem) {
  const [y, m, d] = t.date.split("-").map(Number);
  return t.approx ? `${MONTHS[m - 1]} ${y}` : `${d} ${MONTHS[m - 1]} ${y}`;
}

export default function Timeline() {
  const orgs = ["All", ...Object.keys(ORG_COLOR)] as const;
  const [org, setOrg] = useState<string>("All");

  const grouped = useMemo(() => {
    const items = [...TIMELINE].filter((t) => org === "All" || t.org === org).sort((a, b) => b.date.localeCompare(a.date));
    const map = new Map<string, TimelineItem[]>();
    items.forEach((t) => {
      const y = t.date.slice(0, 4);
      map.set(y, [...(map.get(y) ?? []), t]);
    });
    return [...map.entries()];
  }, [org]);

  return (
    <section id="timeline">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Recent updates</span>
          <h2>Dated <span className="grad-text">timeline</span>, newest first</h2>
          <p>Every update with day, month and year. Each one is tagged with how well it&apos;s sourced, so you can tell OpenAI&apos;s own announcements apart from press reports.</p>
        </div>

        <div className="tl-filters">
          {orgs.map((o) => (
            <button
              key={o}
              className={`filter ${org === o ? "active" : ""}`}
              onClick={() => setOrg(o)}
              style={o !== "All" && org !== o ? { borderColor: ORG_COLOR[o as TimelineItem["org"]] + "66" } : undefined}
            >
              {o}
            </button>
          ))}
        </div>

        <div className="timeline">
          {grouped.map(([year, items]) => (
            <div key={year}>
              <div className="tl-year grad-text">{year}</div>
              {items.map((t) => {
                const src = SOURCES.find((s) => s.id === t.source);
                return (
                  <div key={t.date + t.title} className="tl-item" style={{ ["--org" as string]: ORG_COLOR[t.org] }}>
                    <div className="card tl-card">
                      <div className="tl-top">
                        <span className="tl-date">📅 {fmt(t)}</span>
                        <span className="chip" style={{ color: ORG_COLOR[t.org] }}>{t.org}</span>
                        <span className="chip">{t.tag}</span>
                        <span className={`conf conf-${t.confidence}`}>{t.confidence}</span>
                      </div>
                      <h3>{t.title}</h3>
                      <p>{t.detail}</p>
                      {src && (
                        <a href={src.url} target="_blank" rel="noreferrer" style={{ fontSize: 13, display: "inline-block", marginTop: 8 }}>
                          {src.title} ↗
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
