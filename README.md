# Agent Control Center Hub

A Next.js 16 learning app about AI-agent control centers: governance, guardrails and containment.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
```

Click **🤖 Ask Control Tower**, then paste your Groq key (`gsk_…`, from https://console.groq.com/keys).

## Sections

| Section | What it does |
|---|---|
| Control Stack | Infographic showing the 7 layers of agent governance |
| Learn | The 8 pillars, filterable by category, each with key points, steps, a pitfall and sources |
| Timeline | Dated updates from OpenAI, Microsoft, Google, Anthropic, AWS and the EU, each tagged with a source-confidence level |
| Guardrail Lab | End-to-end policy simulator: kill switch → identity → scope → input guard → data class → spend → egress → human approval → output guard → audit |
| Compare | Vendor cards plus a capability matrix |

## Agentic architecture

- `lib/agent.ts`: a bounded plan → act → observe loop (max 5 steps) using Groq tool calling. It has 5 tools: `search_knowledge_base`, `get_timeline`, `compare_vendors`, `simulate_guardrail` and `future_rules`.
- The assistant has its own guardrails. An input guard checks for prompt injection and messages that are too long before any model call. An output guard redacts secrets. Every answer shows its trace.
- `lib/guardrails.ts`: a deterministic policy engine shared by the Lab and the agent.
- `lib/data.ts`: all research content and sources. Edit this file to update the hub.

## BYOK

The key is kept in the browser's localStorage, only if you choose to. It is sent with each request in the `x-groq-key` header. The server forwards it to Groq and never logs or stores it.
