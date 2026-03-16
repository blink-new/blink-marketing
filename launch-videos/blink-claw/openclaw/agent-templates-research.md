# Blink Claw Agent Templates — Research & Design

## How the System Works (Implementation Reality)

### What Gets Written at Deploy Time
1. `IDENTITY.md` — agent name + base identity (our bootstrap)
2. `AGENTS.md` — rules about secrets vault + available Blink tools
3. `openclaw.json` — channel configs (Telegram/Discord/Slack)
4. The `description` field → **auto-sent as the first user chat message**

### The Description-as-First-Message Pattern
The description is NOT written to a file. It's sent as the very first message
in the chat session when the agent becomes live. This means:
- It serves as the onboarding briefing / job offer letter
- The agent CAN then be directed to write its own workspace files
- The agent has full filesystem access to create SOUL.md, HEARTBEAT.md, etc.
- **Best practice**: Tell the agent to create HEARTBEAT.md and SOUL.md in the first message

### OpenClaw Workspace Files
- `SOUL.md` — Core personality, values, communication style (loaded every session)
- `HEARTBEAT.md` — Autonomous checklist run every 30 min without prompting
- `IDENTITY.md` — Name and role (we write this)
- `AGENTS.md` — Tool rules (we write this)
- `MEMORY.md` — Optional long-term memory file

### Key Capabilities Available to Every Agent
- Shell commands (bash, python3, node, curl, git)
- File read/write at /data/agents/default/agent/
- Browser automation (Chromium)
- Web search (Blink Search built-in)
- blink_claw_secrets (encrypted vault)
- MCP integrations
- Outbound messaging via Telegram/Discord/Slack

## Template Design Principles (from research)

### Effective First-Message Format
1. Define WHO the agent is (role, name, expertise domain)
2. Define proactive behaviors (what to do WITHOUT being asked)
3. Give a HEARTBEAT.md template to write immediately
4. Set communication style (concise, specific, action-oriented)
5. Define primary tools and workflows
6. Use absolute language ("always", "never", "must")
7. Give specific time-based routines (8am briefing, Friday reports)

### The Human-Employee Mental Model
Each agent = a specialized human employee hire:
- Has a specific domain and expertise
- Works 24/7 proactively
- Has a morning routine
- Sends status updates automatically
- Escalates when needed, acts independently on routine tasks

## The 12 Human-Role Templates

### 1. Executive Personal Assistant ("Jamie")
The foundational agent everyone wants. Handles inbox, calendar, briefings.

### 2. Sales Development Rep ("Alex")  
Researches prospects, crafts personalized outreach, follows up cold leads.

### 3. Inbox Zero Manager ("Maya")
Processes email: triages urgency, drafts replies, archives noise.

### 4. Growth & Competitive Intelligence ("Reece")
Monitors competitors, industry news, finds growth opportunities.

### 5. Software Engineer ("Dev")
Monitors CI/CD, reviews PRs, writes code, debugs issues, manages deployments.

### 6. Finance & Metrics Analyst ("Jordan")
Tracks KPIs, generates financial summaries, monitors business health.

### 7. Research Analyst ("Nova")  
Deep-dives any topic, synthesizes findings, delivers structured reports.

### 8. Social Media Manager ("Sage")
Creates content, monitors engagement, drafts posts across platforms.

### 9. Customer Success Manager ("Casey")
Monitors customer health, drafts support responses, tracks satisfaction.

### 10. Recruiter ("Harper")
Manages job postings, screens applicants, schedules interviews.

### 11. Security & IT Monitor ("Rex")
Watches server logs, monitors uptime, alerts on anomalies, handles incidents.

### 12. Investment Researcher ("Archer")
Tracks market data, monitors portfolio, researches stocks, sends daily briefings.

## HEARTBEAT.md Best Practices (from research)
- Run: every 30 min during active hours (8am-10pm)
- Check: 1-3 sources max per heartbeat  
- Produce: short digest, never long reports
- Draft: never auto-send risky actions
- Reply: HEARTBEAT_OK if nothing needs attention
- Good: new leads, drafting replies, flagging urgent items
- Bad: deep research, system building, sending emails automatically
