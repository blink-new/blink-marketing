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

launch-videos/                 # Launch video assets and scripts
reddit/                        # Reddit marketing content and campaigns
ai-ugc/                        # AI-generated UGC content
influencer-marketing/          # Influencer briefs, contracts, campaign materials
```

Skills are automatically available in Cursor when you open this folder.

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
