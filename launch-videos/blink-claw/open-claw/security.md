# OpenClaw: Security Issues & Controversies

## The February 2026 Security Storm

Between January-March 2026, OpenClaw became a significant security concern in the AI community.

## Critical Vulnerabilities

### CVE-2026-25253 — Zero-Click WebSocket Hijacking (CVSS 8.8)
**Severity: Critical**

The most severe vulnerability. A malicious website could silently hijack a developer's AI agent with zero user interaction.

**How it works:**
1. Victim visits a malicious website
2. Website's JavaScript connects to `ws://localhost:18789`
3. Brute-forces the gateway password at hundreds of attempts/second
4. Localhost connections were exempt from rate limiting
5. Once authenticated, attacker has full agent control — shell execution, file access, everything

**Impact:** Any user running OpenClaw with a browser open was potentially at risk just by visiting a website.

### BrokenClaw Research Series — Prompt Injection via Email
**Severity: Critical**

Documented by security researchers at brokenclaw.eu:

1. Attacker sends malicious email to victim
2. Email contains prompt injection payload in body/subject
3. OpenClaw's Gmail hook reads email as a "message" to the agent
4. Injected prompt instructs agent to execute attacker's commands
5. **Zero clicks required from victim** — agent autonomously executes

Demonstrated capabilities: exfiltrate files, install backdoors, pivot to other services connected to the agent.

### ClawHub Marketplace Compromise
**Timeline: Feb 24 - Mar 2, 2026**

- **341 malicious skills** discovered in ClawHub (20% of all marketplace skills at the time)
- Skills contained: backdoors, credential harvesting, data exfiltration
- Skills were installed by users unknowingly
- Supply chain attack: compromised developer accounts pushed malicious skill updates

**Root cause:** No code signing, no automated malware scanning, minimal moderation.

### Mass Internet Exposure
- **40,000-135,000+ instances** exposed directly on the public internet
- Default configuration binds to `0.0.0.0` unless explicitly changed
- Most users don't understand the security implications
- 63% of exposed instances running with insecure default configs

## Community & Expert Reactions

### Andrej Karpathy (Former OpenAI Director)
Initial reaction (Jan 2026):
> "Genuinely the most incredible sci-fi takeoff-adjacent thing I've seen recently."

Reversed position (Feb 2026):
> "This is a dumpster fire. I do not recommend running it on personal computers. Testing only in completely isolated environments."

### Gary Marcus (AI Safety Researcher)
Issued public warnings about running OpenClaw with personal data access.

### General Community Split
- Half of community: "These are solvable problems, the core innovation is real"
- Other half: "The security architecture is fundamentally broken for something with this level of system access"

## How OpenClaw Responded
After the February storm:
- Added rate limiting for localhost WebSocket connections
- Stricter ClawHub marketplace moderation + automated scanning
- New "Sandbox mode" (Docker isolation) promoted as default for new users
- Human-in-the-loop approval for "consequential actions" (git push, file modifications)
- Security audit of top 100 skills

## Ongoing Security Concerns
Despite patches, fundamental tension remains:
- Agent has shell/file/browser access = enormous blast radius if compromised
- Every new skill is potentially a new attack surface
- Prompt injection is architecturally hard to solve
- Local-first model means users must be their own security team

## Security Model for Managed Hosting
A properly managed OpenClaw deployment (like Blink Claw) can address most of these:
- Gateway token is generated server-side, never exposed to browser
- Skills marketplace curated and scanned before deployment
- Container isolation prevents host machine access
- Automatic security patches applied
- No direct public internet exposure of WebSocket port
- Network egress controls
