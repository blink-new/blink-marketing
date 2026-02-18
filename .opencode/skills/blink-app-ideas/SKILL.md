---
name: blink-app-ideas
description: Use this skill to generate, evaluate, or improve app ideas for Blink.new demos, influencer content, social posts, or marketing. Every idea must pass the 3-word YC pitch test — instantly understandable, obviously useful, impressive at a glance. Always read blink-brand-context first.
---

# Blink App Ideas

**Before doing anything, read:**
1. `/mnt/skills/public/blink-brand-context/SKILL.md` — brand voice, what Blink is, what to emphasize
2. `/mnt/skills/public/blink-app-ideas/references/blink-capabilities.md` — full capability reference

---

## The Only Rule That Matters

Every Blink app idea must pass the **3-word YC pitch test**:

> Can someone understand what it does, who wants it, and why it's impressive — in a single glance?

If the answer is no, the idea is not ready. Do not refine the description. Fix the idea.

### The Test in Practice

| ❌ Fails | ✅ Passes |
|---------|----------|
| Ecommerce app | Shopify clone with AI recommendations |
| Productivity tool | Notion clone that saves your notes |
| AI app | AI SEO article writer |
| Social app | Twitter / X clone |
| Business tool | CRM to replace HubSpot |
| Design tool | 3D model generator studio |
| Utility app | ChatGPT Chrome extension |
| Creative tool | AI hairstyle changer from photo |

The failing ideas have two problems: they're vague AND they don't communicate value. The passing ideas name a specific thing you can picture immediately.

**The fastest fix:** Name a known product/category you're replacing or cloning, OR make the AI modifier + specific job-to-be-done explicit.

---

## What Makes an Idea Great for Blink Marketing

A great Blink demo idea must satisfy ALL of these:

### 1. Instantly Understandable
Someone scrolling at 1.5x speed on TikTok can grasp it in under 2 seconds. No explanation needed. If you have to say "it's basically like..." the idea needs work.

### 2. Obviously Commercially Valuable
The viewer can immediately imagine someone paying for this, using this at work, or building a business on this. "I would pay for that" or "I could charge my clients for that."

### 3. Visually Impressive When Built
The finished app should look like something that took weeks to build. It should have a moment where someone thinks "wait, that's real?" — polished UI, real features, not a to-do list.

### 4. Relevant to the Creator's Audience
A fitness creator showing an AI workout planner lands better than them showing an AI legal document tool. The app should feel like it was made for the people watching.

### 5. Plays to Blink's Strengths
The best demos expose what's hard without Blink and trivial with it. Full-stack features (auth + database + backend), native AI features (no API keys), or visual output from minimal input.

---

## The Three Winning Archetypes

### Archetype 1: Named Competitor Replacement
"We built [famous product] from scratch."

The named product does all the explaining. The impressive part is that Blink did it in minutes.

**Examples:**
- CRM to replace HubSpot
- Notion clone that saves your notes
- Linear clone for project tracking
- Perplexity clone — AI search engine
- Cursor clone — AI coding assistant
- Stripe dashboard clone
- Slack clone with channels and DMs
- Duolingo clone for language learning
- Spotify clone with playlists
- Twitter/X clone with timeline

**Why it works:** Everyone knows the reference product. The gap between "that took years to build" and "Blink did it in 30 minutes" is the viral moment.

---

### Archetype 2: AI + Specific Job-to-Be-Done
"AI [verb] + [specific thing]"

The AI modifier signals this is exciting. The specific job signals who it's for and why they'd pay.

**Examples:**
- AI SEO article writer
- AI hairstyle changer from photo
- AI headshot generator
- AI voice notes → formatted text
- AI résumé builder from LinkedIn
- AI legal contract reviewer
- AI cold email personalizer
- AI product description generator
- AI interior design visualizer
- AI nutrition label analyzer
- AI invoice generator
- AI YouTube script writer
- AI thumbnail generator
- AI brand name generator
- AI pricing page generator
- AI outfit recommender from wardrobe photo

**Why it works:** "AI + specific thing" is immediately understandable. Viewers can picture the interface, picture using it, picture charging for it.

---

### Archetype 3: Visually Impressive Output
"This shouldn't be this easy to build."

Apps where the finished product is so visually polished or technically complex that the reaction is disbelief. The demo IS the wow moment.

**Examples:**
- 3D model generator studio
- Real-time code execution sandbox (like CodePen)
- Interactive globe showing live data
- Video background landing page builder
- Animated portfolio site generator
- Real-time multiplayer game
- Live stock / crypto dashboard
- Figma-like design tool
- 3D product configurator
- AR try-on demo (upload photo → see yourself with product)
- Motion graphics generator from text

**Why it works:** The visual output makes people stop. The reveal that it was built with Blink creates maximum cognitive dissonance.

---

## Idea Generation Process

When asked to generate app ideas, follow this process:

### Step 1: Identify the Context
- Who is the creator / what is their audience?
- What Blink capability is being highlighted (AI features, full-stack, website builder, mobile, agents)?
- What platform is the content for (TikTok, LinkedIn, YouTube)?
- Is this for a specific campaign brief, or open ideation?

### Step 2: Generate a Long List (Quantity First)
Generate 20+ ideas without filtering. Pull from all three archetypes. Use the capabilities reference to make sure every idea is actually buildable in Blink. Don't evaluate yet.

### Step 3: Apply the 3-Word YC Pitch Test
For each idea, ask: can a stranger understand what this is and why it's valuable in one glance?

Cut anything that:
- Is vague enough to describe multiple products ("productivity app")
- Requires more than one sentence to explain why it's cool
- Doesn't communicate who would pay for it
- Has been overused as a demo (basic to-do app, basic weather app)

### Step 4: Apply the Blink Showcase Test
From the survivors, prioritize ideas that:
- Expose full-stack capabilities (auth + database + real features — not just a static page)
- Use native AI features if AI is the campaign angle (no API keys needed is a selling point)
- Have a visually impressive finished product
- Can be built fast enough to show in a short-form video (under 90 seconds of screen time)

### Step 5: Tailor to Audience
Re-rank the shortlist by how well each idea fits the specific creator's audience. A good idea for a developer audience is different from a good idea for a freelancer audience.

### Step 6: Write the Blink Prompt
For each final idea, write the exact prompt a creator would paste into Blink to build it. This is what goes in the brief.

---

## Writing the Blink Build Prompt

The build prompt is as important as the idea. A great idea with a weak prompt produces a weak demo.

**Prompt structure:**
```
Build [specific app name].

[2-3 sentences describing the core experience from the user's perspective.]

Key features:
- [Feature 1 — be specific]
- [Feature 2 — be specific]
- [Feature 3 — be specific, include AI feature if relevant]
- [Auth / database / hosting details if impressive]

Design: [visual tone — "premium dark theme", "clean minimal white", "vibrant colorful"]
```

**What makes a build prompt good:**
- Specific about the output, not the technology
- Mentions at least one feature that sounds hard to build
- Includes a design direction (vague prompts produce generic UIs)
- For AI apps: names the specific AI capability (image generation, voice transcription, etc.)

**Example — AI SEO Article Writer:**
```
Build an AI SEO article writer.

User enters a keyword or topic. The app researches top-ranking content for that keyword, generates a fully optimized 1,500-word article with H1/H2 headers, meta description, and internal link suggestions — ready to publish.

Key features:
- Keyword research panel showing search volume and competition
- AI article generation with SEO scoring (0–100)
- One-click export to Markdown or HTML
- Article history saved to user account
- User authentication so each user has their own article library

Design: Clean professional white with subtle blue accents. Minimal and focused.
```

---

## Idea Quality Scoring

When evaluating a submitted idea, score it on these dimensions:

| Dimension | 1 | 3 | 5 |
|-----------|---|---|---|
| **3-Word Test** | Could describe 10 different products | Understood with a sentence of context | Instantly clear from the name alone |
| **Commercial Value** | No obvious customer | Niche but real | Broad market, obvious monetization |
| **Visual Impressiveness** | Looks like a student project | Polished but expected | Jaw-dropping or "this can't be real" |
| **Audience Fit** | Irrelevant to creator's audience | Tangentially relevant | Made for exactly these people |
| **Blink Strength Showcase** | Could be a static website | Uses database or auth | Showcases AI, agents, or full-stack depth |

**Total: X/25**
- 20–25: Ship it. Strong demo idea.
- 14–19: Good foundation, improve the weakest dimension.
- 8–13: Needs a rethink on clarity or value.
- <8: Start over with a different idea.

---

## Idea Bank by Audience Type

### For developers / technical creators
- Cursor clone — AI coding assistant
- GitHub Copilot-style code reviewer
- Real-time code execution sandbox
- AI code documentation generator
- Regex tester with AI explanation
- SQL query builder with natural language
- API testing tool (Postman clone)
- CI/CD pipeline status dashboard

### For content creators / influencers
- AI YouTube script writer
- AI thumbnail A/B tester
- AI video hook generator
- AI caption writer from video transcript
- AI content calendar planner
- Brand deal tracker with analytics
- Audience analytics dashboard

### For freelancers / agency owners
- CRM to replace HubSpot
- AI proposal generator
- Client portal with project tracking
- Automated invoice generator
- Time tracker with client billing
- AI cold email personalizer
- Freelancer portfolio with case studies
- Contract generator with e-signatures

### For entrepreneurs / solopreneurs
- AI business name generator
- Landing page builder from description
- Stripe dashboard clone
- Product waitlist with referral system
- AI pricing page generator
- Competitor monitor / price tracker
- Newsletter platform (Beehiiv clone)

### For general / broad audiences
- AI hairstyle changer from photo
- AI headshot generator
- AI meal planner from fridge photo
- AI interior design visualizer
- AI outfit recommender
- AI résumé builder from LinkedIn
- Voice notes → formatted text app
- AI nutrition label analyzer
- Language learning app (Duolingo clone)
- Habit tracker with AI insights

### For website builder campaign (design-focused)
- Pixel-perfect clone of any website from screenshot
- Portfolio site from Figma file
- Landing page from napkin sketch photo
- Agency-quality site built in 30 seconds
- $5,000 design recreated for $20

---

## Ideas That Are Overused (Avoid Unless You Have a Fresh Angle)

- Generic to-do list app
- Basic weather app
- Simple calculator
- Basic note-taking app (unless it's a specific clone like Notion)
- "Social media app" without specifics
- Generic "AI chatbot" without a specific use case
- Basic blog

These are fine for learning but don't create the "wow" moment needed for marketing content.

---

## Quick Reference: Blink's Most Impressive Capabilities to Showcase

These are the capabilities that most impress non-technical audiences and should anchor demo ideas:

1. **AI image/video generation** — visible, wow-worthy output
2. **Website from screenshot** — instant design recreation
3. **Named competitor clone** — "we built Notion / HubSpot / Cursor in minutes"
4. **AI voice → structured output** — speaks → app processes → formats
5. **Real-time features** — live updates, multiplayer, presence
6. **Full auth + database** — "this is a real app, not a demo"
7. **Mobile app → App Store** — "I have an app in the App Store, no code written"
8. **AI agent with web search** — autonomous multi-step research
9. **Stripe payments in 30 seconds** — "this SaaS can accept payments right now"
10. **Video generation** — text → video is still jaw-dropping

Lead with whichever of these fits the campaign angle. Build the app idea around showcasing that capability.
