# OpenClaw: Research Overview

> Research compiled for Blink Claw feature design. Last updated: Mar 14, 2026.

---

## What Is OpenClaw?

OpenClaw is the **fastest-growing open-source project in GitHub history** — reaching 250,000+ stars in ~60 days (Jan–Mar 2026). It is an open-source, local-first AI agent framework that connects large language models to your machine's filesystem, shell, browser, and messaging apps.

**Core value prop:** "Stop Chatting. Start Doing." — shifts AI from a conversational toy to an autonomous worker that executes real tasks 24/7.

**GitHub:** https://github.com/openclaw/openclaw (MIT license, 40,000+ lines TypeScript)

---

## TL;DR Summary

| Aspect | Key Fact |
|--------|---------|
| Creator | Peter Steinberger (PSPDFKit founder, sold for ~$100M) |
| Launched | January 25, 2026 |
| Stars | 250,000+ in 60 days (record) |
| Stack | TypeScript, Node.js 22+, WebSocket gateway on port 18789 |
| Hosting | Self-hosted (Docker/VPS/Mac Mini) or managed ($49-$999/month) |
| Skills | 5,700+ community skills on ClawHub |
| Access | WhatsApp, Telegram, Slack, Discord, Signal, iMessage, 50+ total |
| Main Love | Autonomous 24/7 agents, messaging app interface, local-first privacy |
| Main Frustration | Complex setup, unreliable task execution, security vulnerabilities |
| Business opportunity | Managed hosting is exploding — huge gap between "want it" and "running it" |

---

## How OpenClaw Works

OpenClaw runs a persistent **WebSocket Gateway** process (`127.0.0.1:18789`) that acts as the hub connecting:
- **Messaging apps** (WhatsApp, Telegram, Slack, etc.) as input channels
- **AI models** (Claude, GPT, Gemini, local) as the reasoning engine
- **Tools** (shell, filesystem, browser, skills) as execution capabilities
- **Client apps** (web UI, mobile app, CLI) as control surfaces

When you send a WhatsApp message to your agent:
1. Channel receives message → Gateway
2. Gateway routes to agent lane (preserves ordering)
3. Agent runs with appropriate tools
4. Results stream back to your WhatsApp

The agent runs **autonomously on a heartbeat** (every 30 min) checking for pending tasks — no need to prompt it for scheduled work.

Read more: [architecture.md](./architecture.md)

---

## History & Name Changes

OpenClaw went through **3 names in 2 months** due to trademark issues:
1. **Clawdbot** (Nov 2025) — original name
2. **Moltbot** (Jan 2026) — renamed after Anthropic C&D
3. **OpenClaw** (Jan 30, 2026) — final name after 106K stars

Growth was unprecedented: 9K stars day 1 → 34K stars in one 48-hour window → 200K by early March. Surpassed React's 10-year record in 60 days.

Read more: [history.md](./history.md)

---

## Why People Love It (Viral Reasons)

1. **Messaging app interface** — WhatsApp/Telegram your agent, no developer terminal needed
2. **Actually does things** — executes shell commands, edits files, browses web, sends emails
3. **24/7 autonomous** — heartbeat system works while you sleep
4. **Privacy/sovereignty** — local-first, nothing leaves your machine
5. **Demo-able magic** — "negotiate car purchase over email" demos went insane viral
6. **Mac Mini shortage** — OpenClaw caused actual hardware shortage, became its own news story
7. **5,700+ skills** — huge ecosystem of things it can do

Read more: [why-viral.md](./why-viral.md)

---

## Main Frustrations

1. **Setup complexity** — Docker, nginx, SSL, port configs; non-technical users fail constantly
2. **Unreliable execution** — agent says "on it" but doesn't actually do the task (#1 bug)
3. **High token costs** — 20-40K tokens for simple operations; €200+/month bills
4. **Security anxiety** — zero-click exploits, marketplace compromises (see security)
5. **No good web UI** — primarily messaging-app controlled, poor visibility
6. **Opaque memory** — hard to see/edit what agent "knows"
7. **Update friction** — manual Docker image pulls for updates

Read more: [frustrations.md](./frustrations.md)

---

## Security Issues

Critical vulnerabilities emerged in February 2026:
- **CVE-2026-25253** (CVSS 8.8): Zero-click WebSocket hijacking — malicious website could take over your agent
- **Prompt injection via email**: Gmail hook + prompt injection = zero-click RCE
- **ClawHub supply chain attack**: 341 malicious skills (20% of marketplace) with backdoors
- **40K–135K instances** exposed on public internet with default insecure configs
- Andrej Karpathy called it "a dumpster fire" and stopped recommending it

A managed hosting platform that handles security patches automatically = key competitive advantage.

Read more: [security.md](./security.md)

---

## Hosting & Deployment

**Self-hosted methods:**
- Mac Mini (caused M4 Pro shortage), VPS + Docker, Raspberry Pi
- Requires: Docker, port config, nginx/caddy, SSL, credential management
- Most non-technical users fail to complete setup

**Managed providers (Q1 2026 market):**
- Clawctl: $49-$999/month (most complete)
- Kilo, EveryClaw, ClawBox, OpenClawd, DigitalOcean Marketplace
- One-click deploy is the winning product motion

**The gap:** 90%+ of people who want OpenClaw cannot successfully self-host it. Managed hosting wins.

Read more: [hosting-deployment.md](./hosting-deployment.md)

---

## Skills & ClawHub Ecosystem

Skills are `SKILL.md` files with YAML frontmatter + instructions that give the agent new capabilities. **Same spec as Blink's own skills system** (`.agents/skills/`).

- **ClawHub**: 5,700+ community skills, vector search, versioning
- Stack: TanStack Start + Convex + GitHub OAuth + OpenAI embeddings
- **Economy**: 112+ startups, some generating $40K+ MRR from the ecosystem

Blink can leverage the existing ClawHub skill ecosystem for Blink Claw.

Read more: [skills-ecosystem.md](./skills-ecosystem.md)

---

## Market Landscape

The OpenClaw ecosystem is Q1 2026's hottest infrastructure category:
- Managed hosting market exploding
- $49-$999/month existing price points
- Kilo (GitLab co-founder backed), multiple VC-backed competitors

**Blink Claw differentiation:**
- Bundled into Blink subscription (credits, no separate account)
- Blink AI tools → build skills for your own agents
- Apps + Agents unified in one product
- Much simpler (pure one-click, no Docker knowledge)

Read more: [market-landscape.md](./market-landscape.md)

---

## Key Numbers for PRD

| Metric | Value |
|--------|-------|
| OpenClaw GitHub stars | 250,000+ |
| Discord community | 116,000+ members |
| ClawHub skills | 5,700+ |
| Internet-exposed instances | 40K-135K |
| % with insecure defaults | 63% |
| Managed hosting market size | $49-$999/month per instance |
| Top managed provider (Clawctl) | $49 starter, $299 team, $999 business |
| Mac Mini demand surge | Real M4 Pro shortage attributed to OpenClaw |
| Ecosystem startups | 112+ tracked, some $40K+ MRR |

---

## Implications for Blink Claw Design

1. **One-click is table stakes** — anything requiring Docker = no sale
2. **Platform: Fly.io** — Firecracker VMs, Machines API, 59% cheaper than AWS Fargate ARM, ~500ms start time
3. **Two-stream billing** — flat container hosting + usage-based LLM credits (separate concerns)
4. **4 machine sizes** — Nano/Starter/Standard/Pro (50/100/200/400 cr/mo, ~75% gross margin at ~4× AWS EC2 reference)
5. **LLM costs usage-based at 20% markup** — same as blink-apis AI treatment, real-time credits
6. **Auto-reload must be surfaced prominently** — without it, agent goes silent when credits run out
7. **Unlimited agents** — people want multiple specialized agents, each charged independently
8. **Always-on config** — `restart: always`, never auto-stops, heartbeat works perfectly
9. **Pause = machine stop** — $0 compute, ~$0.08/mo volume storage; reactivation in ~500ms
10. **Security-first** — private Fly.io network, no public WebSocket port, curated skills only
11. **Real-time visibility** — SSE log stream from Fly.io machine to browser
12. **Cost visibility** — per-agent LLM usage in Settings > Usage
13. **Messaging** — Telegram/Discord/Slack (Phase 1), WhatsApp (Phase 2)
14. **E2B is complementary** — Fly.io = always-on runtime, E2B = code execution tool calls
15. **Scale path** — Fly.io → ECS on EC2 at 2,000+ agents (same API)
16. **Pre-launch** — email billing@fly.io for 10,000+ machine limit; default is only ~50
