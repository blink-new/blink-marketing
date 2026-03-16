# OpenClaw: Skills System & ClawHub Ecosystem

## What Are Skills?
Skills are self-contained extensions that give OpenClaw new capabilities. Each skill is a directory with a `SKILL.md` file containing:
- YAML frontmatter (name, version, description, permissions)
- Natural language instructions the agent follows
- Optional executable tool scripts
- Optional configuration files

Skills follow the **AgentSkills specification** — the same spec we use at Blink for our own skill system (interesting parallel).

## Skill File Structure
```
my-skill/
  SKILL.md        ← core: instructions + frontmatter
  tools/          ← optional executable scripts
    my-tool.sh
  config/         ← optional defaults
    settings.json
```

## Skill Loading Priority
1. **Workspace skills** (`/skills/`) — per-project, highest priority
2. **Managed/local skills** (`~/.openclaw/skills/`) — user-installed
3. **Bundled skills** — ships with OpenClaw

## ClawHub — The Skill Marketplace

### Overview
- **URL**: https://github.com/openclaw/clawhub
- **Skills count**: 5,700+ (as of March 2026)
- **Community**: 116,000+ Discord members
- Free, open registry

### Technical Stack
- Frontend: TanStack Start (React/Vite)
- Backend: Convex (DB, storage, real-time)
- Auth: GitHub OAuth
- Search: OpenAI embeddings (vector search, not just keywords)

### Key Features
- Versioned bundles with semver, changelogs, tags
- Vector similarity search for skill discovery
- Stars, comments, community reviews
- Moderation tools (post-security-storm addition)
- CLI-friendly API: `clawhub install <skill>`, `clawhub search`, `clawhub update --all`

## Popular Skill Categories
1. **Communication** — Gmail, Slack, Notion, Linear integration skills
2. **Development** — GitHub, code review, deployment helpers
3. **Research** — web search wrappers, Perplexity, summarization
4. **Productivity** — calendar, task management, meeting notes
5. **Media** — YouTube transcript, podcast summarizer
6. **Finance** — expense tracking, market data
7. **Home Automation** — Homelab, smart home hooks
8. **System** — log monitoring, backup, health checks

## Built-in Core Skills (Bundled)
- File system operations (read, write, edit, exec)
- Browser automation (Semantic Snapshots)
- Web search
- Memory read/write
- Messaging (per channel)
- System shell

## Skill Security (Post-Compromise Improvements)
After the Feb 2026 incident:
- Automated malware scanning on all new submissions
- Required GitHub OAuth for publishers
- Capability declarations in YAML frontmatter (explicit permission request)
- Community flagging system
- OpenClaw team manual review for top-ranked skills

## The ClawHub Economy
- 112+ startups tracked with verified revenue in the ecosystem
- Some skill developers generating $40K+ MRR through premium skills
- Enterprise skill bundles sold by specialized vendors
- Skill development has become a micro-economy

## Blink Relevance
Blink already has a skills system (`.agents/skills/`, `.cursor/skills/`). Blink Claw could:
1. Use OpenClaw's existing 5,700+ skills directly
2. Allow users to install from ClawHub
3. Create a Blink-curated skill marketplace (subset, vetted)
4. Let users build/publish skills via Blink
