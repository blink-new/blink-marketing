# Blink Claw — Landing Page Frontend Reference

Live URL: **https://blink.new/claw**

This folder contains the complete source code for the Blink Claw marketing page.
Use it as reference for creating launch videos, screen recordings, or AI-coded demo reproductions.

---

## Files

```
landing-page/
├── page.tsx                          ← Next.js route + SEO metadata
└── components/
    ├── ClawLandingContent.tsx        ← Full page UI (all sections in one file, ~1,500 lines)
    └── PlatformIcon.tsx              ← Telegram / Discord / Slack / WhatsApp icons
```

---

## Page Structure (top → bottom)

| Section | Component | What it shows |
|---------|-----------|--------------|
| **Hero** | `Hero()` | Headline + animated agent chat demo (`AgentDemo`) |
| **How It Works** | `HowItWorks()` | 3-step deploy flow |
| **Why Different** | `WhySection()` | 6 feature cards (unlimited agents, 24/7, messaging, memory, action, security) |
| **200+ Models** | `ModelsSection()` | Claude/GPT/Gemini grid + no API key pitch |
| **Use Cases** | `UseCases()` | 6 use case cards with prompts |
| **Comparison** | `ComparisonSection()` | Blink Claw vs VPS vs Local Machine table |
| **Integrations** | `Integrations()` | Slack, Gmail, Telegram, Discord, Notion, Drive, etc. |
| **Pricing** | `Pricing()` | 3 tiers: Starter $22/mo · Standard $45/mo · Pro $90/mo (annual) |
| **Stories** | `BlinkAdvantage()` | 3 animated demos: Morning Briefing, Trial Activation, Inbox Zero |
| **FAQ** | `FAQ()` | 9 Q&A accordion items |
| **Final CTA** | `FinalCTA()` | "Your agents are waiting. Tell them what to do." |

---

## Design System

### Typography
- **Headlines:** `font-serif` (Georgia/Times), `font-normal`, large sizes (5xl–7xl). Italic `<span>` for the second line.
- **Section labels:** `text-xs font-semibold uppercase tracking-widest text-primary`
- **Body:** `text-sm text-muted-foreground leading-relaxed`

### Colors
- Uses Tailwind CSS variables (`bg-card`, `bg-muted`, `text-foreground`, `text-primary`, etc.)
- Supports dark mode automatically
- Accents: green-500 for "yes/live", amber-500 for warnings, red-400 for negatives, primary for brand

### Cards
```tsx
<div className="rounded-2xl border border-border/50 bg-card p-6 hover:border-border transition-all hover:shadow-sm">
```

### Buttons
```tsx
// Primary CTA
<Link className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity">
  Get my first agent <ArrowRight className="h-4 w-4" />
</Link>

// Secondary
<a className="text-sm text-muted-foreground hover:text-foreground transition-colors">
  See pricing →
</a>
```

### Section wrapper pattern
```tsx
<section className="py-20 px-6">           // standard
<section className="py-20 px-6 bg-muted/20">  // alternate background
  <div className="max-w-5xl mx-auto">
    ...
  </div>
</section>
```

### Grid (fluid, not fixed breakpoints)
```tsx
<div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))' }}>
```

---

## Animated Demo Components

There are **4 live animated demos** in the page. All use the same pattern:

```tsx
// Sequence: [phase_number, duration_ms][]
const SEQ: [number, number][] = [[1, 900], [2, 1100], ...]

function useAnimLoop(seq) {
  // cycles through phases with setPhase + setTimeout
  // auto-loops forever
}
```

### Demo 1 — `AgentDemo` (Hero)
Full agent chat UI showing Alex the Sales Agent:
- Phase 0: blank
- Phase 1: previous conversation history fades in (dimmed)
- Phase 2: user says "Yes, follow up with all 14 right now"
- Phase 3–4: `search_crm` tool call → 14 leads list
- Phase 5–6: `compose_email` tool call → personalized email preview
- Phase 7–8: `send_bulk_email` → progress bar → 14/14 delivered
- Phase 9: typing indicator
- Phase 10: agent final response with summary

### Demo 2 — `MorningBriefingViz` (Stories section)
Telegram-style message from Jordan building up:
- Phase 1: greeting
- Phase 2: today's calendar schedule
- Phase 3: 24h metrics dashboard (revenue, signups, churn)
- Phase 4: "needs your attention" alert items

### Demo 3 — `SaaSActivationViz` (Stories section)
Shows users table + Alex the Onboarding Agent activating:
- Phase 1: new signup row appears (Jessica Chen, free trial)
- Phase 2–3: `enrich_lead` tool → enrichment data grid
- Phase 4–5: `compose_email` → personalized email preview
- Phase 7: "Demo booked — 11 minutes after signup" success banner

### Demo 4 — `InboxZeroViz` (Stories section)
Gmail inbox going from 47 unread → 0:
- Phases 2–5: emails get tagged (Replied/Archived/Flagged) progressively
- Progress bar fills as unread count drops
- Phase 6: Maya's summary card appears

---

## Key Copy & Messaging

**Hero headline:** "A team of AI agents *working for you, 24/7.*"

**Hero sub:** "The easiest way to run OpenClaw agents. Message your agent from bed — wake up to emails answered, leads followed up, reports sent. No Mac Mini, no API keys, no setup. Ready in 60 seconds."

**Final CTA:** "Your agents are waiting. *Tell them what to do.*"

**Core value props (in order used):**
1. Ready in 60 seconds (no Docker, no VPS)
2. 200+ AI models included (no separate accounts)
3. Always on 24/7
4. Accessible from Telegram/Discord/Slack
5. Unlimited agents, each specialized
6. Secure by default (vs 63% of self-hosted being insecure)

**Pricing angles:**
- Annual pricing shown first (crossed out monthly → annual price)
- "$22/mo" is the headline number (Starter, annual)
- "Unlimited agents — each one priced independently"
- "Agents that are paused cost almost nothing"

---

## Agent Characters Used

| Agent | Avatar | Personality | Channel |
|-------|--------|-------------|---------|
| **Alex** | `/images/agents/alex.webp` | Sales specialist, follows up leads | Telegram |
| **Maya** | `/images/agents/maya.webp` | Inbox manager, drafts replies | Slack |
| **Jordan** | `/images/agents/jordan.webp` | Reports, metrics every Friday 5pm | Discord |

---

## Integrations Shown

Slack, Gmail, Telegram, Discord, Notion, Google Drive, Google Calendar, HubSpot, GitHub, Salesforce, LinkedIn

Icon assets are in `/public/icons/` and `/public/discord/` in the main repo.

---

## Dependencies

```tsx
// All from standard project deps — no special installs needed
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Check, ... } from 'lucide-react'
import { cn } from '@/lib/utils'   // standard clsx/tailwind-merge utility
```

---

## For AI Coding (Video Recreation Tips)

When using AI to recreate any of these UIs for video:

1. **Copy the exact `ToolCallCard` component** — it's used in all 3 demo scenarios and carries the "agent working" visual language
2. **The animation loop pattern** (`useAnimLoop` + `DEMO_SEQ`) is reusable — just change the sequence and what renders at each phase
3. **Font pairing:** `font-serif` for headlines with `italic` on the second line = Blink Claw's signature typographic style
4. **Color system:** Everything uses CSS variables so it auto dark-modes — use `bg-card`, `bg-muted/20`, `text-muted-foreground`, `border-border/50`
5. **The sidebar agent roster** in `AgentDemo` can be extracted standalone for a "team of agents" visual
6. **Stats in sidebar** (Tasks done today: 47, Emails sent: 23) make great "social proof" micro-copy
