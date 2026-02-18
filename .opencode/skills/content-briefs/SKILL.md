---
name: content-briefs
description: Use this skill when creating a creator brief or influencer brief for Blink.new. A content brief instructs creators and influencers on what to make — it must be structured enough to maintain standards, yet inspiring enough to produce authentic, high-performing content. Always read blink-brand-context first.
---

# Content Brief Writing

A great brief does two things in tension: it gives creators enough direction to hit your standards, and enough freedom to make it feel like their own. Briefs that over-specify produce stiff, ad-feeling content. Briefs that under-specify produce off-brand content. Your job is to thread that needle.

**Before writing any brief, read:** `/mnt/skills/public/blink-brand-context/SKILL.md`

---

## The Brief Anatomy

Every Blink content brief contains these sections in this order:

### 1. About Blink (1 short paragraph)
Always include a fresh, accurate product description. Don't assume the creator knows what Blink does. Use the canonical description from `blink-brand-context`. Tailor emphasis based on the campaign angle (e.g., for a website builder campaign, emphasize design quality and cost; for a full-stack campaign, emphasize production-readiness and AI features).

### 2. Campaign Overview / Core Story
The strategic heart of the brief. Use a callout block to make it visually distinct. Must contain:
- **The Core Story** — the narrative arc in one sentence
- **Target Audience** — specific, named personas with their actual pain points (not demographics)
- **Their Pain Point** — quoted in their voice. What does the target user literally say to themselves?
- **The One Thing Blink Does** — the single most important value to communicate in this campaign

This section is for the creator's strategic understanding. They need to *feel* the problem before they can sell the solution.

### 3. Demo Apps (if applicable)
Link to a database of approved demo apps to use in the video. If no database exists, provide 3–5 specific app suggestions with brief descriptions. Demo apps should be impressive, believable, and relevant to the creator's audience.

### 4. Key Talking Points
Underlined headers, each with a name and 2–4 sentence explanation. Talking points are not features — they're value frames. Each one answers: "Why should my audience care about this?"

Standard talking points pool (select 3–5 based on campaign angle):
- **Lead with Value, Not Features** — show the end result first, then reveal it was AI
- **The Design You Want, Instantly** — turn inspiration (screenshot, sketch, URL) into a real site
- **The Perception Game** — people will assume you hired an agency; let them
- **Production Quality** — it's not a prototype; auth, database, hosting, scales to 1B users
- **Native AI Integrations** — build AI features without any API keys
- **The Cost Comparison** — agency charges $5,000–$10,000; Blink costs under $20
- **Auto-Debugging** — 95% fewer errors than alternatives; it just works

### 5. Hook Options (10–15 options)
Give creators multiple hooks to choose from, each representing a different angle or tone. Good hooks:
- Start with POV, a provocative statement, or a direct challenge
- Reference a specific dollar amount or time comparison
- Speak in the creator's voice, not Blink's voice
- Create a gap between expectation (expensive/hard) and reality (cheap/fast)

Write hooks appropriate for short-form video (TikTok, Reels, YouTube Shorts). They should work as both spoken openers and text overlays.

### 6. Sample Reel Flow (Timestamped)
A timestamped script structure showing one strong execution path. This is *suggestive*, not prescriptive — always include a note that creators should adapt it to their own style.

Standard flow for product-demo content:
- **0–10s: Opening** — show the finished result first; let it look expensive and professional
- **10–20s: The Reveal** — choose a hook; add text overlay showing cost/time
- **20–50s: The Build Process** — show HOW it was built (choose one clear method)
- **50–70s: Premium Features** — quick cuts of the impressive details
- **70–85s: Cost Comparison** — hard numbers, text overlay, let the gap land
- **85–90s: CTA** — link in bio, try it free

### 7. Alternative Structures (2–3 variants)
Shorter alternative flows for creators who want different formats:
- Client Reveal version (works for freelancers, agency types)
- Side-by-Side Comparison version (A vs B)
- The Compliment Story version (social proof narrative)

### 8. Creator Notes (Psychology & Strategy)
A direct, honest section explaining WHY the brief is structured this way. Speak to the creator as a partner, not a contractor. Explain the psychology behind the hook, the reveal, the cost comparison. Tell them what creates the viral moment and why it works.

### 9. Dos and Don'ts
Two-column layout. Keep it short — max 4 items per column.

**Do (always include):**
- Touch on at least 3 talking points
- Verbal + on-screen CTA to visit Blink.new
- Show the result before revealing how you built it
- Make it personal to your audience

**Do Not (always include):**
- Do not make it feel like an ad
- Do not limit comments or likes
- Do not refer to the brand as BLINK, blink, or blinkdotnew — use Blink.new or Blink

Add campaign-specific dos/don'ts based on the angle.

### 10. LLM Script Generation Prompt (optional but recommended)
A ready-to-use prompt that creators can paste into Claude or ChatGPT to generate a custom script. Structure it as a fill-in-the-blank template with:
- Product description (pre-filled)
- Video structure (pre-filled)
- Creator fills in: their chosen hook, their demo app, their audience, their style

### 11. Getting Started
Short operational section:
1. Sign up free at Blink.new
2. Email support@blink.new with subject "[Creator] Free Credits Request"
3. Once credits confirmed, start building

### 12. Useful Assets
Reference section with logo options and usage rules (always included, standardized).

---

## Quality Standards

A brief is good when:
- [ ] A creator with zero Blink knowledge can read it and know exactly what to make
- [ ] The brief has a clear *narrative* — not just a list of features, but a story arc
- [ ] Hooks are specific enough to use immediately, not generic placeholders
- [ ] The reel flow feels like a real video, not a corporate storyboard
- [ ] The creator notes section makes them genuinely excited about the campaign angle
- [ ] Dos/Don'ts are actionable — no vague guidance like "be authentic"
- [ ] The brief doesn't over-specify execution (no telling creators how to film, what to wear, etc.)

A brief is bad when:
- It reads like a legal document or an ad agency deck
- The talking points are just feature bullets with no "so what"
- The hook options are interchangeable with any other SaaS product
- There's no emotional hook in the core story
- The creator has no room to make it their own

---

## Brief Types & Adjustments

**General / Full-Stack Builder Brief** (like Brief 1 / Full Stack Builder)
- Simpler structure
- Objective-focused: what do you want them to build and show?
- Useful for broad distribution across diverse creator types
- Talking points cover the full product surface area

**Campaign-Specific Brief** (like Brief 2 / AI Website Builder)
- Richer structure with more hook options and reel flow detail
- Audience is precisely defined (e.g., "freelancers who need portfolios")
- Demo apps are curated for the campaign angle
- Core story is tighter and more specific
- Use when targeting a specific use case or product surface

**Review / Feedback Brief**
- Used to evaluate creator-submitted scripts
- Includes a scoring rubric against these standards
- See: `short-form-video-scripts` skill for the review workflow

---

## Writing Process

1. **Start with the Core Story.** What's the single emotional/narrative hook for this campaign? Get that right first — everything else flows from it.

2. **Define the audience precisely.** Not "entrepreneurs" — "freelancers who've tried Webflow and given up." The more specific, the better the hooks will be.

3. **Write the hooks before the talking points.** Hooks force you to think like the creator. If you can't write 10 hooks, your core story isn't tight enough yet.

4. **Build the reel flow from one specific hook.** Pick your best hook and write the reel around it. Then write alternative structures.

5. **Write Creator Notes last.** By then you'll understand the psychology well enough to explain it to someone else.

6. **Review against the quality checklist above** before finalizing.
