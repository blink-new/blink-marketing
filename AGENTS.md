# Blink Marketing Workspace

Marketing and growth team workspace for Blink.new. Uses Cursor AI with skills in `.cursor/skills/`.

## Structure

```
.cursor/skills/
├── blink-brand-context/       # Brand voice, product facts, messaging rules
├── blink-app-ideas/           # Demo app suggestions for creators
├── brief-review/              # Evaluate and improve influencer briefs
├── content-briefs/            # Write creator/influencer campaign briefs
├── remotion-compositions/     # Create Remotion video scenes/compositions
├── short-form-video-scripts/  # TikTok/Reels/Shorts scripts
└── social-launch-posts/       # Social posts for launches

launch-videos/
└── blink-claw/                # Blink Claw launch materials
    ├── PRD.md                 # Public-facing product overview (no trade secrets)
    ├── open-claw/             # Raw research: RESEARCH.md, frustrations, market, security, history
    ├── openclaw/              # Agent templates research (12 role templates)
    ├── landing-page/          # /claw marketing page source + design reference README
    ├── agent-chat-page/       # /claw/[id] full UI source + design reference README
    └── assets/                # All image assets: agent avatars, provider logos, connector icons

reddit/                        # Reddit marketing content
ai-ugc/                        # AI-generated UGC content
influencer-marketing/          # Influencer campaign materials
content-briefs/                # Exported content briefs
export/                        # General exports
```

## Key References

- **Blink Claw product overview** → `launch-videos/blink-claw/PRD.md`
- **Raw OpenClaw research + pain points** → `launch-videos/blink-claw/open-claw/`
- **Landing page frontend code + design system** → `launch-videos/blink-claw/landing-page/README.md`
- **Agent chat page frontend code + all components** → `launch-videos/blink-claw/agent-chat-page/README.md`
- **All image assets (avatars, logos, icons)** → `launch-videos/blink-claw/assets/README.md`

## Important

When the user says "remember this" or when you encounter important new info, update this file compactly (always loaded in every AI chat session — keep it concise).
