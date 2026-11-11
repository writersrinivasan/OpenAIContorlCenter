import { NextResponse } from "next/server";
import { runAgent } from "@/lib/agent";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_MODEL = /^[a-zA-Z0-9._\/-]{3,80}$/;

export async function POST(req: Request) {
  // BYOK: key comes from the browser per request; never logged or persisted.
  const apiKey = req.headers.get("x-groq-key")?.trim();
  if (!apiKey || !apiKey.startsWith("gsk_")) {
    return NextResponse.json({ error: "Add your Groq API key (starts with gsk_) in the assistant settings." }, { status: 401 });
  }

  let body: { model?: string; messages?: { role: string; content: string }[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const model = body.model && ALLOWED_MODEL.test(body.model) ? body.model : "llama-3.3-70b-versatile";
  const history = (body.messages ?? [])
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content.slice(0, 8000) }));

  if (!history.length || history[history.length - 1].role !== "user") {
    return NextResponse.json({ error: "Last message must be from the user." }, { status: 400 });
  }

  try {
    const out = await runAgent({ apiKey, model, history });
    return NextResponse.json(out);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg.replace(/gsk_[A-Za-z0-9]+/g, "[REDACTED]") }, { status: 502 });
  }
}
