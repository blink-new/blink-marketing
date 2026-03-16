# Blink Marketing — AI Skills Workspace

This repo contains AI agent skills for the Blink marketing team. Skills teach Cursor how to write content briefs, video scripts, social posts, and more — all in Blink's voice.

---

## What's in here

```
.cursor/skills/
├── blink-brand-context/       # Brand voice, product facts, messaging rules
├── blink-app-ideas/           # App ideas and demo app suggestions
├── brief-review/              # Evaluate and improve influencer briefs
├── content-briefs/            # Write creator/influencer campaign briefs
├── short-form-video-scripts/  # Write and review TikTok/Reels/Shorts scripts
└── social-launch-posts/       # Write social posts for launches

launch-videos/
└── blink-claw/                                   # Blink Claw launch materials
    ├── PRD.md                                    # Public product overview (no trade secrets)
    ├── open-claw/RESEARCH.md                     # OpenClaw deep research
    ├── open-claw/frustrations.md                 # User pain points + what they actually want
    ├── open-claw/market-landscape.md             # Competitive landscape
    ├── open-claw/security.md                     # Security issues (CVEs, exploits)
    ├── open-claw/history.md                      # Name changes + growth story
    ├── open-claw/why-viral.md                    # Why it went viral
    ├── openclaw/agent-templates-12.md            # 12 human-role agent templates
    ├── landing-page/README.md                    ← START HERE for landing page design
    ├── landing-page/components/ClawLandingContent.tsx  # Full /claw marketing page (~1,500 lines)
    └── agent-chat-page/README.md                 ← START HERE for app UI design
        agent-chat-page/components/               # All 8 panel components

reddit/                        # Reddit marketing content and campaigns
ai-ugc/                        # AI-generated UGC content
influencer-marketing/          # Influencer briefs, contracts, campaign materials
```

Skills are automatically available in Cursor when you open this folder.

---

## Blink Claw Launch Resources

All materials for the Blink Claw launch are in `launch-videos/blink-claw/`.

### For video scripts and briefs
- Read `PRD.md` for the product story, user flows, and competitive positioning
- Read `open-claw/frustrations.md` for the pain points your script should address
- Read `open-claw/why-viral.md` for the emotional hooks that made OpenClaw blow up

### For recreating the UI in video / AI coding
- **Landing page** (`/claw`) → [`landing-page/README.md`](launch-videos/blink-claw/landing-page/README.md)
  - Full design system, 4 animated demo breakdowns, section structure, copy
- **Agent chat page** (`/claw/[id]`) → [`agent-chat-page/README.md`](launch-videos/blink-claw/agent-chat-page/README.md)
  - All 8 components documented with exact CSS classes, layout specs, color tokens

---

## Setup

### 1. Open in Cursor

```bash
cd /path/to/blink-marketing
cursor .
```

Skills in `.cursor/skills/` are auto-discovered by Cursor Agent.

---

## Using the skills

Mention the skill by name in your prompt and Cursor will load it. Or just describe what you want and it will pick the right one automatically.

**Write a content brief:**

```
Use the content-briefs skill to write a TikTok campaign brief targeting freelancers who want to build portfolio sites
```

**Review an existing brief:**

```
Use the brief-review skill to score and give feedback on this brief: [paste brief]
```

**Write a video script:**

```
Use the short-form-video-scripts skill to write a 45-second YouTube Shorts script, website builder angle, casual tone
```

**Write social launch posts:**

```
Use the social-launch-posts skill to write 5 post options for the new mobile app feature launch
```

**Get demo app ideas:**

```
Use the blink-app-ideas skill to suggest 10 demo app ideas for a creator whose audience is solopreneurs
```

All skills reference `blink-brand-context` automatically — brand voice, product facts, and messaging rules are always applied.
