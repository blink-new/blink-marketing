# Blink Claw — Product Overview

> Blink's managed AI agent hosting. Deploy personal AI agents with one click.
>
> Raw Research: [open-claw/RESEARCH.md](./open-claw/RESEARCH.md)
> User Pain Points: [open-claw/frustrations.md](./open-claw/frustrations.md)
> Market Landscape: [open-claw/market-landscape.md](./open-claw/market-landscape.md)

---

## The Problem

OpenClaw is the **fastest-growing open-source project in GitHub history** — 250,000+ stars in 60 days. It lets AI agents autonomously do real work: browse the web, execute code, manage files, send messages — all accessible via WhatsApp, Telegram, Slack, and more.

**The gap:** 90%+ of people who want OpenClaw cannot successfully run it. It requires Docker, server setup, security hardening, and ongoing maintenance. Most give up. Those who do succeed face unpredictable LLM costs, security vulnerabilities, and unreliable agent execution.

The managed hosting market is exploding (Clawctl $49–$999/month, Kilo, EveryClaw, ClawBox) — but all require separate accounts, separate billing, and separate API key management on top.

---

## What Is Blink Claw?

One-click deployment of personal AI agents on Blink's infrastructure.

**No Docker. No VPS. No security configuration. No API keys.**

1. Click "Deploy New Claw Agent"
2. Choose a machine size + AI model
3. Connect your messaging apps (Telegram, Discord, Slack)
4. Your agent works 24/7 — from any app you already use

Each agent is always-on, automatically restarted on crash, and secured by default. LLM usage is bundled — no separate API bills.

---

## Who Uses Blink Claw

- **Blink builders** — want agents that act on their world beyond the Blink app
- **OpenClaw enthusiasts** — gave up self-hosting, want managed + Blink ecosystem
- **Non-technical users** — saw the demos, blocked by setup complexity
- **Power users** — run multiple specialized agents (email agent, research agent, monitor agent)

### No Agent Slot Limits
Deploy as many agents as you want. Each agent has its own billing — more specialized agents = more powerful workflows.

---

## Pricing

Two billing streams per agent:

### Container Hosting (Flat Monthly)

Pick a machine size at deploy time. Resize anytime.

| Size | Specs | Monthly |
|------|-------|---------|
| **Starter** *(recommended)* | 2 GB RAM, shared CPU | **$45/mo (180 cr)** |
| **Standard** | 4 GB RAM, shared CPU | **$90/mo (360 cr)** |
| **Pro** | 4 GB RAM, dedicated CPU | **$180/mo (720 cr)** |

All tiers include: full browser automation, file operations, shell execution, npm/pip packages.

**Starter is OpenClaw's own recommended spec** — handles the vast majority of tasks.

### LLM Usage (Usage-Based)

Every AI call the agent makes is charged at provider cost + 20% markup — same as Blink's AI today. No separate API keys needed. Usage is visible per-agent in Settings > Usage.

**What this means in practice:** If you run Claude Sonnet with moderate usage, expect $5–20/month on top of hosting. Heavy power users may spend more.

### The Real Comparison

| Option | Cost | What you get |
|--------|------|-------------|
| **Blink Claw Starter** | **$45/mo flat** | LLM included, browser, shell, everything |
| Clawctl Starter | $49/mo + $20–80/mo LLM | Bring your own API keys |
| Self-hosted VPS | $18–20/mo + $20–80/mo LLM | DIY Docker/nginx/SSL + full ops burden |

**Blink's advantage:** LLM is bundled. Clawctl's real total cost is $69–129/month. A DigitalOcean self-host with Claude is $38–100/month. Blink Claw Starter at **$45 flat beats both** for most users.

> *"$45/month. Browser automation + AI included. No API keys. No VPS setup. Cancel anytime."*

---

## User Flows

### Deploying Your First Agent

```
[Deploy New Agent]
  ↓
Name your agent:  "My Personal Assistant"
Choose model:     Claude Sonnet 4.5
Choose size:      ● Starter  2GB  · $45/mo  ← recommended
                  ○ Standard 4GB  · $90/mo
                  ○ Pro      4GB  · $180/mo

  ↓  LLM usage is billed from your credits
     ☑ Enable auto-reload (add $25 when balance < $5)
  ↓
  [Deploy Agent →]
  ↓
  ✓  Creating machine            (~5 sec)
  ✓  Starting agent runtime      (~2 sec)
  ✓  Connecting AI               (~1 sec)
  ✓  Ready!
  ↓
  🎉 Your Claw Agent is Live
     [Connect Telegram]  [Connect Discord]  [Connect Slack]
```

Total time from click to running agent: **under 30 seconds.**

---

### Connecting Messaging Apps

After deploy, connect any messaging app:

**Telegram:**
1. Message @BotFather, send `/newbot`
2. Get your bot token
3. Paste it into Blink Claw
4. "✓ Connected — message @yourbotname to start"

**Discord / Slack:** Same pattern — create a bot in the developer portal, paste the token.

Once connected, message your bot from any device, any time. The agent responds autonomously.

---

### The Agent Dashboard

```
┌──────────────────────────────────────────────────────────────┐
│ My Personal Assistant          [Running ●]                   │
│ Starter · 2GB · Claude Sonnet · Telegram ✓                   │
│ $45/mo hosting  +  ~$7 LLM this month                        │
│ Last active: 2 min ago                       [Manage] [···]  │
├──────────────────────────────────────────────────────────────┤
│ Code Review Agent              [Running ●]                   │
│ Standard · 4GB · Claude Sonnet · Slack ✓                     │
│ $90/mo hosting  +  ~$24 LLM this month                       │
│ Last active: 1 hour ago                      [Manage] [···]  │
├──────────────────────────────────────────────────────────────┤
│ [+ Deploy New Agent]                                         │
│ Monthly hosting: $135  ·  LLM this month: ~$31               │
└──────────────────────────────────────────────────────────────┘
```

---

### Agent Detail Page

Each agent has a full management interface:

**Chat tab** — Talk to your agent directly from the browser. See tool calls, file operations, and web browsing in real time as they happen.

**Files tab** — Browse and edit files your agent created. Full file explorer with code editor.

**Secrets tab** — Store API keys and credentials securely. Your agent uses them via `$MY_API_KEY` — never exposed in chat logs.

**Terminal tab** — Run shell commands directly on the agent's machine.

**Settings tab** — Rename, resize, connect/disconnect messaging apps, pause or delete.

---

### Pausing and Resuming

**User-initiated pause** (going on vacation, cost control):
```
[Manage] → [Pause Agent]
→ Agent stops. State preserved.
→ Messaging apps: "⏸ Agent paused by owner"
→ Hosting NOT charged while paused
→ Data preserved indefinitely
→ [Resume] restarts in under 5 seconds
```

**Grace period** (if payment fails):
```
Day 0:   Charge fails → agent paused, messaging auto-replies
Day 3:   Email reminder
Day 7:   "Data will be deleted in 23 days"
Day 30:  Agent and all data permanently deleted
```
Top up at any time → agent back online in under 5 seconds, memory intact.

---

### Deleting an Agent

```
[Manage] → [Delete Agent]
→ "Delete 'My Assistant'? This permanently deletes the agent and all data."
→ [Delete Permanently]
→ Agent removed, all data gone immediately
```

---

## What Agents Can Do

Every Blink Claw agent includes:

**Browser automation** — visit websites, fill forms, extract data, take screenshots

**Shell execution** — run scripts, install npm/pip packages, automate anything with a CLI

**File operations** — read, write, create, organize files in persistent storage

**Web search** — search the web natively, no configuration needed

**Messaging** — receive and send messages via Telegram, Discord, or Slack

**Blink-powered tools (skills):**
- Generate images and videos via AI
- Fetch from any external API
- Send emails to your app users
- Scrape and extract structured data from websites
- Push live events to Blink apps
- Query knowledge bases

**Connectors (coming soon):** Notion, Google Calendar, Google Drive, Google Sheets, Slack, HubSpot, and more — connected directly from your workspace.

---

## Security

Blink Claw is more secure than self-hosting by design:

| Self-Hosting Risk | Blink Claw |
|-----------------|------------|
| WebSocket zero-click exploit (CVE-2026-25253) | Private network — never exposed to public internet |
| 341 malicious skills found on ClawHub (Feb 2026) | Curated Blink skill set only in Phase 1 |
| Agent accesses your personal machine's filesystem | Isolated VM — your laptop is never touched |
| Exposed API keys in Docker configs | No API keys — Blink handles all LLM routing |
| Manual security updates | Blink manages the runtime, patches ship automatically |

---

## Competitive Positioning

| Provider | Price | LLM | Setup |
|----------|-------|-----|-------|
| **Blink Claw Starter** | **$45/mo** | ✅ Included | One click |
| Clawctl Starter | $49/mo + $20–80 LLM | ❌ BYOK | Separate account |
| Kilo | Unknown | ❌ BYOK | Separate account |
| Self-hosted DigitalOcean | $18–20/mo + $20–80 LLM | ❌ BYOK | Docker/nginx/SSL |
| Self-hosted Hetzner | ~$6.50/mo + $20–80 LLM | ❌ BYOK | Full ops knowledge |

**Unique advantage:** Blink users already have credits, already have an account, already use Blink AI. Claw is one click inside a product they already pay for.

---

## Launch Status — March 2026

**Phase 1 — LIVE:**
- One-click deploy, 24/7 uptime
- 12 human-role agent templates (researcher, developer, assistant, etc.)
- Full agent management: chat, files, secrets, terminal, settings
- Telegram / Discord / Slack integrations
- Monthly billing + grace period + data lifecycle
- Marketing page at `/claw`

**Phase 2 — In Progress:**
- Connector skills (Notion, Google Calendar, Drive, Sheets, HubSpot, etc.)
- Skill store (curated, one-click install from ClawHub)
- Agent memory viewer and editor
- WhatsApp integration

**Phase 3 — Roadmap:**
- Agent marketplace (share/publish agent configs)
- Custom skill builder via Blink's coding AI
- Team sharing (workspace members share an agent)
- Agent analytics (success rate, cost breakdown per task)

---

## Success Metrics (90-day targets)

| Metric | Target |
|--------|--------|
| Paid users with ≥1 Claw agent | >15% |
| Average agents per Claw user | >1.5 |
| Monthly Claw revenue as % of total | >10% |
| Agent uptime p95 | >99.5% |
| Time from "Deploy" to usable agent | <30 seconds |
| Claw user 7-day retention vs non-Claw | 2× |
