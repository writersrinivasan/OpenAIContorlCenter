"use client";

import { useEffect, useRef, useState } from "react";

interface TraceStep { kind: string; label: string; detail?: string }
interface Msg { role: "user" | "assistant" | "error"; content: string; trace?: TraceStep[] }

const MODELS = ["llama-3.3-70b-versatile", "openai/gpt-oss-120b", "openai/gpt-oss-20b", "llama-3.1-8b-instant"];
const SUGGESTIONS = [
  "What are the 8 pillars of an agent control center?",
  "List OpenAI's agent updates since July 2026 with dates",
  "Compare OpenAI Frontier with Microsoft Agent 365 in a table",
  "Would a $500 refund to stripe.com pass the guardrails?",
  "What did the Oct 2026 containment disclosure teach builders?",
];

const KEY_STORE = "acc.groqKey";
const MODEL_STORE = "acc.groqModel";

function safeGet(k: string) { try { return localStorage.getItem(k) ?? ""; } catch { return ""; } }
function safeSet(k: string, v: string) { try { v ? localStorage.setItem(k, v) : localStorage.removeItem(k); } catch {} }

// Tiny, escape-first markdown renderer (headings, bold, code, links, lists, tables).
function md(src: string): string {
  const esc = src.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  const inline = (s: string) =>
    s
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
  const lines = esc.split("\n");
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (/^\s*\|.*\|\s*$/.test(l) && i + 1 < lines.length && /^\s*\|[\s:-|]+\|\s*$/.test(lines[i + 1])) {
      const row = (r: string) => r.trim().replace(/^\||\|$/g, "").split("|").map((c) => inline(c.trim()));
      const head = row(l);
      i += 2;
      const body: string[][] = [];
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) body.push(row(lines[i++]));
      out.push(`<div style="overflow-x:auto"><table><thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${body.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`);
      continue;
    }
    if (/^\s*[-*] /.test(l)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*] /.test(lines[i])) items.push(inline(lines[i++].replace(/^\s*[-*] /, "")));
      out.push(`<ul>${items.map((x) => `<li>${x}</li>`).join("")}</ul>`);
      continue;
    }
    if (/^\s*\d+\. /.test(l)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\. /.test(lines[i])) items.push(inline(lines[i++].replace(/^\s*\d+\. /, "")));
      out.push(`<ol>${items.map((x) => `<li>${x}</li>`).join("")}</ol>`);
      continue;
    }
    const h = l.match(/^(#{1,4}) (.*)$/);
    if (h) out.push(`<h3>${inline(h[2])}</h3>`);
    else if (l.trim()) out.push(`<p>${inline(l)}</p>`);
    i++;
  }
  return out.join("");
}

export default function Assistant() {
  const [open, setOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [key, setKey] = useState("");
  const [model, setModel] = useState(MODELS[0]);
  const [remember, setRemember] = useState(true);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const k = safeGet(KEY_STORE);
    const m = safeGet(MODEL_STORE);
    if (k) setKey(k);
    if (m) setModel(m);
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, busy]);

  const saveSettings = () => {
    safeSet(KEY_STORE, remember ? key.trim() : "");
    safeSet(MODEL_STORE, model);
    setShowSettings(false);
  };

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    if (!key.trim()) {
      setShowSettings(true);
      return;
    }
    const history = [...msgs.filter((m) => m.role !== "error"), { role: "user" as const, content: q }];
    setMsgs((m) => [...m, { role: "user", content: q }]);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-groq-key": key.trim() },
        body: JSON.stringify({ model, messages: history.map(({ role, content }) => ({ role, content })) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setMsgs((m) => [...m, { role: "assistant", content: data.answer, trace: data.trace }]);
    } catch (e) {
      setMsgs((m) => [...m, { role: "error", content: e instanceof Error ? e.message : "Request failed" }]);
    } finally {
      setBusy(false);
    }
  }

  if (!open)
    return (
      <button className="fab" onClick={() => setOpen(true)}>
        🤖 Ask Control Tower
      </button>
    );

  return (
    <div className="drawer" role="dialog" aria-label="AI assistant">
      <div className="drawer-head">
        <div>
          <b>🤖 Control Tower</b>
          <small>Agentic assistant · Groq · {key ? "key set ✓" : "no key yet"}</small>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button className="icon-btn" title="Settings" onClick={() => setShowSettings((s) => !s)}>⚙️</button>
          <button className="icon-btn" title="Clear chat" onClick={() => setMsgs([])}>🗑️</button>
          <button className="icon-btn" title="Close" onClick={() => setOpen(false)}>✕</button>
        </div>
      </div>

      {(showSettings || !key) && (
        <div className="settings">
          <div className="field">
            <label>Groq API key (BYOK)</label>
            <input type="password" placeholder="gsk_..." value={key} onChange={(e) => setKey(e.target.value)} autoComplete="off" />
          </div>
          <div className="field">
            <label>Model</label>
            <input list="groq-models" value={model} onChange={(e) => setModel(e.target.value)} />
            <datalist id="groq-models">{MODELS.map((m) => <option key={m} value={m} />)}</datalist>
          </div>
          <label style={{ display: "flex", gap: 8, fontSize: 13, marginBottom: 10, alignItems: "center" }}>
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Remember key in this browser
          </label>
          <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "space-between" }}>
            <p>
              Your key goes straight to this app&apos;s server route and on to Groq per request — never stored server-side. Get one at{" "}
              <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer">console.groq.com</a>.
            </p>
            <button className="btn" style={{ padding: "8px 14px" }} onClick={saveSettings}>Save</button>
          </div>
        </div>
      )}

      <div className="msgs">
        {msgs.length === 0 && (
          <>
            <div className="msg assistant">
              Hi! I&apos;m an agent with 5 tools: knowledge search, timeline, vendor comparison, guardrail simulator and future rules. Each answer shows
              the steps I took. Try:
            </div>
            <div className="suggest">
              {SUGGESTIONS.map((s) => <button key={s} onClick={() => send(s)}>{s}</button>)}
            </div>
          </>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            {m.role === "assistant" ? <div dangerouslySetInnerHTML={{ __html: md(m.content) }} /> : m.content}
            {m.trace && m.trace.length > 0 && (
              <details className="trace">
                <summary>🧭 Agent trace · {m.trace.filter((t) => t.kind === "tool").length} tool calls</summary>
                {m.trace.map((t, j) => (
                  <div key={j} className="trace-step">
                    <span>{t.kind === "guard" ? "🛡️" : t.kind === "tool" ? "🔧" : t.kind === "result" ? "👁️" : t.kind === "final" ? "🏁" : "💭"}</span>
                    <span>{t.label}{t.detail && <> · <code>{t.detail.slice(0, 140)}</code></>}</span>
                  </div>
                ))}
              </details>
            )}
          </div>
        ))}
        {busy && <div className="msg assistant"><span className="typing"><i /><i /><i /></span> planning & calling tools…</div>}
        <div ref={endRef} />
      </div>

      <div className="composer">
        <textarea
          placeholder={key ? "Ask about agent guardrails…" : "Add your Groq key in ⚙️ first"}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
        />
        <button className="btn" onClick={() => send(input)} disabled={busy}>➤</button>
      </div>
    </div>
  );
}
