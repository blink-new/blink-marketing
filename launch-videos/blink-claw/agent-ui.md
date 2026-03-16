# Blink Claw — Agent Chat UI Design

> The web interface for interacting with deployed Claw agents inside Blink.
> Phase 1: private networking proxy. Phase 2: public agent URL with embedded UI.

---

## Key Research Findings

### OpenClaw UI
- **Framework: Lit Web Components** (NOT React). Single-file `OpenClawApp` LitElement with 300+ `@state()` fields.
- **Transport: WebSocket only** — `GatewayBrowserClient` sends JSON frames (`chat.send`, `config.get`, etc.). No REST API from the UI.
- **Built-in views:** chat, sessions, channels (Telegram/Discord/Slack config), skills, cron, logs, usage, agents, debug.
- **Can't be directly embedded in React** — different framework, different transport assumptions.

### Blink Chat UI (existing — `src/components/chat/`)
- **Framework: React + AI SDK v5**
- **30+ specialized tool display components** — fully modular, self-contained. Almost all are reusable as-is.
- **Key reusable chain:** `MessageThread` → `ChatMessage` → `ToolCallDisplay` → `ToolDisplayRouter` → individual tool displays
- **Hooks available:** `useMessageOperations`, `useAttachmentHandling`, `useChatConfiguration`, `useAuthToken`
- **Design system:** shadcn, lucide-react, `react-resizable-panels`, react-virtuoso

---

## Networking Architecture

### Phase 1 (private networking — `fly.private.toml`)

Agent gateway runs on port 3000 on Fly.io's **private network** (`{appname}.internal:3000`). Not publicly accessible from browsers or Railway.

```
Browser → Blink auto-engineer → Claw Manager (on Fly.io) → Agent gateway (:3000)
                                    (private network proxy)
```

**Claw Manager must run on Fly.io** (same org, same network) to reach `{appname}.internal:3000`. It acts as a WebSocket-to-SSE proxy:

```
User sends message via Blink UI
  → POST /api/claw/agents/:id/chat (auto-engineer, Railway)
    → Claw Manager Fly.io service
      → WebSocket: {appname}.internal:3000
        → OpenClaw gateway: method "chat.send"
          → streams tokens back
      ← SSE stream → auto-engineer → browser
```

### Phase 2 (public HTTP — `fly.toml` with `[http_service]`)

Each agent gets `blink-claw-{agentId}.fly.dev`. Browser can hit the OpenClaw gateway HTTP directly. We can either:
- Serve a Blink-branded version of the OpenClaw web UI (adapted Lit app)
- Or proxy the WebSocket through Blink's auth layer for security

---

## UI Structure

### Page Route
`/account/{workspace}/claw/{agentId}` — new page, similar to `/project/{id}`

### Layout (3-column on desktop, stacked on mobile)
```
┌────────────────────────────────────────────────────────────┐
│  ← Agents    My Personal Assistant  [Running ●]  [⚙ ···]  │  ← Header
├──────────────┬─────────────────────────┬───────────────────┤
│              │                         │                   │
│  Agent       │    Chat Thread          │  Agent Details    │
│  Sidebar     │    (MessageThread)      │  Panel            │
│              │                         │                   │
│  ● Running   │  [Messages...]          │  Messaging        │
│  Nano/1GB    │                         │  ✓ Telegram       │
│  Claude S4.6 │  [Tool calls...]        │  ✓ Discord        │
│              │                         │                   │
│  Telegram ✓  │  [StreamingDot...]     │  Integrations     │
│  Discord ✓   │                         │  Notion ✓         │
│  Slack       │                         │  Gmail            │
│              │  ─────────────          │                   │
│  [Pause]     │  [ Type message... ] → │  Memory           │
│  [Delete]    │                         │  Skills           │
│              │                         │                   │
└──────────────┴─────────────────────────┴───────────────────┘
```

---

## Components to Build

### New components (Claw-specific)

**Page:**
- `src/app/account/[workspace]/claw/[agentId]/page.tsx` — Agent page, resolves agent by ID from PG2
- `src/components/claw/ClawAgentLayout.tsx` — 3-panel layout (sidebar + chat + details)

**Sidebar (`src/components/claw/sidebar/`):**
- `AgentStatusCard.tsx` — machine size, status badge, uptime, model, last active
- `AgentMessagingList.tsx` — connected platforms (Telegram @botname, Discord, Slack)
- `AgentActions.tsx` — Pause/Resume/Delete buttons
- `AgentCreditSummary.tsx` — hosting credits/mo + LLM used this month

**Chat (`src/components/claw/chat/`):**
- `ClawChatPanel.tsx` — owns connection to Claw gateway proxy, wraps MessageThread
- `ClawChatInput.tsx` — extends ChatInput.tsx with agent-specific context
- `ClawStreamingIndicator.tsx` — "Agent is thinking..." with heartbeat state

**Tool displays (extend existing `tool-displays/`):**
- `BashCommandDisplay.tsx` — shell command execution (reuse `TerminalDisplay` as base)
- `BrowserSnapshotDisplay.tsx` — OpenClaw semantic snapshot (ARIA tree output)
- `FileReadDisplay.tsx` — file content reading tool
- `MemoryWriteDisplay.tsx` — agent memory operations
- `AgentCronDisplay.tsx` — scheduled task output
- `BlinkSearchDisplay.tsx` — reuse `WebSearchDisplay.tsx` directly

**Details panel (`src/components/claw/details/`):**
- `AgentMessagingTab.tsx` — connect/disconnect Telegram/Discord/Slack
- `AgentIntegrationsTab.tsx` — link/unlink workspace connections (Notion, Gmail, etc.)
- `AgentMemoryTab.tsx` — read-only view of `/data/.openclaw/memories/`
- `AgentSkillsTab.tsx` — installed skills list + Phase 2: skill store
- `AgentLogsTab.tsx` — live log stream from Fly.io machine events

**Settings modal (`src/components/claw/`):**
- `AgentSettingsModal.tsx` — machine size selector, model picker, name, danger zone

### Directly reused from `src/components/chat/` (no changes needed)
| Component | Used for |
|-----------|---------|
| `MessageThread.tsx` | Chat message list |
| `ChatMessage.tsx` | Individual message rendering |
| `MessageContent.tsx` | Markdown text |
| `FoldedToolsDisplay.tsx` | Collapsed tool accordion |
| `ToolCallDisplay.tsx` | Tool call wrapper |
| `ToolDisplayRouter.tsx` | Route to correct display |
| `BaseToolDisplay.tsx` | Loading/stopped shell |
| `FileEditDisplay.tsx` | File write/edit tools |
| `TerminalDisplay.tsx` | Shell command output |
| `WebSearchDisplay.tsx` | Web search results |
| `MessageSkeleton.tsx` | Loading skeleton |
| All hooks | `useMessageOperations`, `useAttachmentHandling`, etc. |
| `CodeBlock.tsx` | Code in messages |

---

## Data Flow

### Connecting to Agent

```typescript
// Phase 1: via Claw Manager proxy on Fly.io
// auto-engineer provides an SSE stream that proxies the agent's WebSocket

// POST /api/claw/agents/:id/chat/send
// GET  /api/claw/agents/:id/chat/stream  (SSE)
// POST /api/claw/agents/:id/chat/abort

// The SSE stream emits:
// data: { type: "token", content: "Hello " }
// data: { type: "tool_start", name: "web_search", callId: "xxx", args: {...} }
// data: { type: "tool_result", callId: "xxx", result: {...} }
// data: { type: "done", usage: {...} }
// data: { type: "error", message: "..." }
```

### Message Format

Messages stored in PG2 `messages` table (same as project chat). Format follows `ExtendedMessage` / `UIMessage` from AI SDK v5 — same structure Blink already uses. Tool calls use the same `tool-*` part types.

This means: **the same MessageThread + ChatMessage pipeline works unchanged for agent chat.**

### Gateway Proxy (Claw Manager on Fly.io)

```typescript
// Claw Manager: POST /chat/send
// 1. Validate BLINK_SERVICE_API_KEY from auto-engineer
// 2. Look up agent: appName, gateway_token from claw_agents table
// 3. Open WebSocket to {appName}.internal:3000
// 4. Auth: standard OpenClaw gateway challenge/token auth
// 5. Send: { type: "req", id: "...", method: "chat.send", params: { message, sessionKey } }
// 6. Stream events back as SSE: tokens, tool_start, tool_result, done
// 7. Auto-engineer forwards SSE to browser

// Also needed:
// GET /chat/history — returns past messages via sessions.list + chat.history
// POST /chat/abort  — aborts via chat.abort
// GET /logs/stream  — streams gateway logs via logs.stream
```

---

## OpenClaw Gateway Protocol (from source)

Key methods we need to call from the proxy:

```typescript
// Send a chat message
{ type: "req", method: "chat.send", params: {
  text: string,
  agentId?: string,
  sessionKey?: string,
  images?: string[]
}}

// Abort current generation
{ type: "req", method: "chat.abort", params: {} }

// Load chat history
{ type: "req", method: "sessions.list", params: {} }
{ type: "req", method: "chat.history", params: { sessionKey: string, limit: number } }

// Events streamed back:
// { type: "event", event: "chat.token", payload: { text: string } }
// { type: "event", event: "chat.tool", payload: { ... } }
// { type: "event", event: "chat.done", payload: { usage: {...} } }
// { type: "event", event: "chat.abort" }
```

Authentication: `OPENCLAW_GATEWAY_TOKEN` (set as env var on every Fly machine) — sent in the connect handshake as the gateway password.

---

## OpenClaw UI — What to Port to React

The OpenClaw Lit views serve as **design reference** for building React equivalents. Key views to port:

| OpenClaw view | Blink React equivalent | Priority |
|---------------|----------------------|---------|
| `views/chat.ts` | `ClawChatPanel` + reused Blink chat components | P0 |
| `views/channels.ts` | `AgentMessagingTab` | P0 |
| `views/overview.ts` | Agent detail sidebar + status | P0 |
| `views/sessions.ts` | Session selector dropdown in chat | P1 |
| `views/logs.ts` | `AgentLogsTab` | P1 |
| `views/cron.ts` | Part of `AgentSettingsModal` | P2 |
| `views/skills.ts` | `AgentSkillsTab` | P2 |
| `views/usage.ts` | Agent credit usage in details panel | P1 |
| `tool-display.ts` resolveToolDisplay() | Tool label/icon config in ToolDisplayRouter | P0 |
| `chat/slash-commands.ts` | Slash commands in ClawChatInput | P1 |

Copy these from `openclaw/ui/src/ui/` and adapt to React + Blink's design system.

---

## Phase 1 Scope (MVP)

**New files to create:**
```
src/app/account/[workspace]/claw/
  [agentId]/
    page.tsx
    loading.tsx

src/components/claw/
  ClawAgentLayout.tsx
  ClawChatPanel.tsx           ← owns SSE connection to proxy
  ClawChatInput.tsx
  sidebar/
    AgentStatusCard.tsx
    AgentMessagingList.tsx
    AgentActions.tsx
  details/
    AgentMessagingTab.tsx     ← connect Telegram/Discord/Slack
    AgentLogsTab.tsx          ← live log stream
  tool-displays/
    BashCommandDisplay.tsx
    BrowserSnapshotDisplay.tsx
    FileReadDisplay.tsx
    MemoryWriteDisplay.tsx

src/app/api/claw/
  agents/[id]/
    chat/
      send/route.ts           ← proxy: POST message to Claw Manager
      stream/route.ts         ← proxy: SSE stream from Claw Manager
      abort/route.ts

services/claw-manager/        ← new Fly.io service (Bun/TS)
  src/
    proxy/
      gateway-client.ts       ← WebSocket client to agent gateway
      chat-proxy.ts           ← HTTP/SSE ↔ WebSocket bridge
    index.ts                  ← Express server
```

**Removed from scope for P1:**
- Agent settings / config editing (just view settings, change via API)
- Multi-session selector (single default session)
- Full cron manager
- Skills marketplace browser
- Memory editor

---

## Decisions

| Topic | Decision |
|-------|---------|
| Framework for agent UI | React (Blink's existing system) — NOT the OpenClaw Lit UI |
| Reuse from OpenClaw | WebSocket protocol + views as design reference only |
| Reuse from Blink | MessageThread, ChatMessage, all tool-displays, hooks |
| Transport (Phase 1) | SSE from auto-engineer → Claw Manager (Fly.io) → WebSocket to agent |
| Transport (Phase 2) | Public `blink-claw-{id}.fly.dev` → direct WebSocket from browser |
| Claw Manager location | Fly.io service (same org as agents) for private network access |
| Message storage | PG2 `messages` table — same as project chat |
| New tool displays needed | BashCommand, BrowserSnapshot, FileRead, MemoryWrite |
| Existing displays reused | TerminalDisplay, FileEditDisplay, WebSearchDisplay, and 25+ others |
