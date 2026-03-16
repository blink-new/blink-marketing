# OpenClaw: Hosting & Deployment

## The Hosting Problem
OpenClaw is designed to run on **your own hardware** — but most people don't have an always-on server with their files, shell, and credentials accessible. This creates a massive gap between the "install it" promise and reality.

## Self-Hosting Methods

### Method 1: Local Machine (Most Common)
- Run on a Mac Mini, MacBook, or desktop that stays on
- **M4 Pro Mac Mini shortage** happened because OpenClaw went viral — everyone bought them
- Pros: Full access to local files, shell, browser
- Cons: Must keep machine on 24/7, no remote access by default, setup complexity

**Requirements:**
- Node.js 22+
- 2GB RAM minimum (4GB recommended)
- Any modern Linux/macOS/Windows (WSL2)

### Method 2: Docker on VPS
Most popular for always-on/headless deployment.

```bash
# Quick start
git clone https://github.com/openclaw/openclaw.git
cd openclaw
./docker-setup.sh

# Or manual Docker run
docker run -d \
  --name openclaw \
  -p 18789:18789 \
  -v ~/openclaw:/home/node/.openclaw \
  ghcr.io/openclaw/openclaw:latest
```

**Typical VPS specs:**
- 2 vCPU, 4GB RAM minimum
- Ubuntu 22.04/Debian 12
- 20-50GB SSD

**Production setup adds:**
- Nginx/Caddy reverse proxy for HTTPS
- SSL certificate (Let's Encrypt)
- systemd/Docker restart policies
- Tailscale for secure remote access (recommended over direct exposure)

### Method 3: Docker Compose
For easier lifecycle management with auto-restart.

### Method 4: Raspberry Pi / Home Server
Low-power always-on option. Works well for personal use.

## Infrastructure Costs (Self-Hosted)

| Scale | Monthly Cost |
|-------|-------------|
| Personal (1 user) | $10-30 (small VPS) |
| Small team (5-15 users) | $150-250 |
| Mid-market (50-200 users) | $700-1,200 |
| Enterprise (500+ users) | $2,000-5,000 |

**LLM API fees are typically the largest variable cost** and not included above.

## Managed Hosting Providers (Q1 2026)

The managed hosting market exploded alongside OpenClaw's growth. Key players:

| Provider | Price | Notes |
|----------|-------|-------|
| **Clawctl** | $49-$999/month | Most comprehensive, 3 tiers |
| **Kilo** | $XX/month | Backed by GitLab co-founder |
| **EveryClaw** | $XX/month | Simple one-click |
| **ClawBox** | $XX/month | Beginner-focused |
| **OpenClawd** | $XX/month | First to ship one-click |
| **DigitalOcean 1-click** | Marketplace app | Popular for DO users |
| **AgentDeploy** | $XX/month | Enterprise focus |
| **NimbusAgents** | $XX/month | Multi-agent focus |

**Clawctl Tiers (most detailed reference):**
| Plan | Price | Agents | Runs/Day | Team Members |
|------|-------|--------|---------|--------------|
| Starter | $49/mo | 1 | 100 | 1 |
| Team | $299/mo | 3 | 500 | 5 |
| Business | $999/mo | 10 | 2,000 | 25 |

All managed plans include: 60-second deployment, gateway auth, container sandbox, audit logging, egress controls.

## Remote Access Options
Since Gateway binds to localhost by default:
1. **Tailscale Serve** (recommended by OpenClaw team) — zero-config secure tunnel
2. **SSH tunnel** — manual but works
3. **Cloudflare Tunnel** — free option
4. **Direct exposure** — possible but strongly discouraged (see security issues)

## Key Deployment Pain Points
1. **Complex initial setup** — Docker, port configs, nginx/caddy, SSL, tokens
2. **Security hardening** — 63% of exposed instances have default (insecure) configs
3. **Always-on requirement** — needs a machine that never sleeps
4. **LLM key management** — storing API keys securely in the container
5. **Updates** — manually pull/rebuild Docker image for updates
6. **Backup** — `~/.openclaw/` directory contains all state, memories, sessions
7. **No built-in web UI for non-technical users** — requires CLI knowledge

## The Blink Claw Opportunity
The gap between "I want to run OpenClaw" and "I successfully have OpenClaw running 24/7" is enormous. Most people:
- Give up at Docker setup
- Expose their instance insecurely
- Can't do remote access properly
- Don't know how to update/maintain it

**One-click managed OpenClaw deployment with Blink's infrastructure = zero friction to the working product.**
