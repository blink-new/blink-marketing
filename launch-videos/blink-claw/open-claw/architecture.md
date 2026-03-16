# OpenClaw: Technical Architecture

## Overview
OpenClaw is a **local-first, hub-and-spoke AI agent runtime** built in TypeScript (Node.js 22+). The core concept: a persistent Gateway process runs on your machine, connecting messaging apps to an AI agent that can control your computer.

## Core Components

### 1. The Gateway (Hub)
- Long-running **Node.js process** bound to `127.0.0.1:18789` (WebSocket)
- Serves as the unified control plane for all operations
- Manages: session state, channel connections, tool execution, security boundaries
- Single authoritative state despite distributed interaction points

**Gateway responsibilities:**
- Connect/auth handshake (HMAC token-based)
- Route messages to appropriate agent lanes
- Broadcast streaming results back to clients
- Manage tool execution permissions

### 2. The WebSocket Protocol
Frame-based JSON protocol:
```
Request:  { type: "req", id, method, params }
Response: { type: "res", id, ok, result | error }
Event:    { type: "event", event, payload }
```
Methods ACK quickly with a `runId`, then results stream back asynchronously via event broadcasts.

### 3. Hub-and-Spoke Topology
**Hub:** One Gateway per host — owns all messaging surfaces

**Spokes (Nodes):**
- `role: "node"` — iOS app, Android app, macOS app, headless server
- `role: "operator"` — CLI client, web UI, macOS native app

All spokes connect to the single hub gateway. This enables:
- Single authoritative session state
- Multiple input surfaces (WhatsApp, Telegram, Slack, Discord, Signal, iMessage, Teams, 50+ total)
- Multiple client interfaces (phone, desktop, web UI)

### 4. Lane-Based Execution Queue
OpenClaw partitions work into independent **lanes** to prevent blocking:

| Lane | Purpose |
|------|---------|
| `main` | Real-time chat/interactive tasks |
| `cron` | Scheduled/background jobs |
| `subagent` | Spawned sub-tasks |
| `nested` | Recursive/nested agent calls |

"Starvation-free" system — a heavy cron job never blocks real-time chat.

### 5. Agent Runtime (`runEmbeddedPiAgent`)
Each message triggers an agent execution:
1. Channel inbound → normalized to shared model
2. Route by `sessionKey` (lane) to preserve ordering
3. Enqueue in command queue
4. Execute `runEmbeddedPiAgent(model, tools, context)`
5. Stream results via `chat` events back to client

### 6. Memory System
- **Short-term**: Conversation history in JSONL files (`~/.openclaw/sessions/`)
- **Long-term**: Markdown memory files (`~/.openclaw/memories/`) — plain text, greppable
- **Vector search**: Local SQLite-powered embeddings for semantic memory retrieval
- All memory is local — nothing sent to cloud

### 7. Browser Tool: Semantic Snapshots™
Instead of taking screenshots (expensive for vision models):
- Parses the page's **ARIA accessibility tree**
- Understands web elements semantically
- **95% token cost reduction** vs vision-based agents
- Enables fast, cheap web automation

### 8. Execution Modes
| Mode | Description |
|------|------------|
| **Sandbox** | Docker container isolation (safest) |
| **Host** | Direct access to host machine |
| **Remote** | Pair with another device via gateway |

### 9. Skills/Tool System
Skills are self-contained extensions with a `SKILL.md` file:
```
skill-name/
  SKILL.md    (YAML frontmatter + natural language instructions)
  tools/      (optional executable tool scripts)
  config/     (optional configuration)
```
Loaded from:
1. Workspace skills (`/skills/`) — highest priority
2. Managed/local skills (`~/.openclaw/skills/`)
3. Bundled built-in skills

### 10. Authentication
- `OPENCLAW_GATEWAY_TOKEN`: HMAC secret (256-bit, set via `openssl rand -hex 32`)
- Device pairing with signature verification
- Non-loopback connections require explicit approval
- Metadata pinning across reconnects

## Stack
- **Runtime**: Node.js 22+
- **Language**: TypeScript
- **Protocol**: WebSocket (local) + HTTPS (remote access via Tailscale/SSH tunnel)
- **Storage**: SQLite (vector search), JSONL (sessions), Markdown (memories)
- **Port**: `18789` (configurable)

## Deployment Patterns (Self-Hosted)
1. **Local machine** (Mac Mini, most common) — always-on with personal data access
2. **VPS/Docker** — headless server deployment, no local tools access
3. **Raspberry Pi** — low-power always-on home server
4. **NAS/Home Server** — alongside Homelab setups
