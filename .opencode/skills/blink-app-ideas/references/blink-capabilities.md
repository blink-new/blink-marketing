# Blink Capabilities Reference

> This file is a reference for what Blink.new can build. Use it when generating or evaluating app ideas to confirm what's buildable and which capabilities to highlight.
> Source: blink.new/docs/llms.txt and all linked capability pages.

---

## What Blink Is

Blink is a full-stack AI app builder. One prompt → complete, deployed, production-ready application. Not a prototype tool. Not a frontend generator. The entire stack — frontend, backend, database, auth, hosting — is included and set up automatically.

**Tech stack (auto-selected, no config needed):**
- Frontend: React + Vite + TypeScript + Tailwind CSS + shadcn/ui
- Mobile: React Native + Expo + TypeScript
- Backend: Deno Edge Functions (TypeScript, runs at the edge)
- Database: Turso (LibSQL/SQLite — edge-native, globally replicated)
- Storage: Cloudflare R2 (S3-compatible, global CDN)
- Hosting: Cloudflare Workers (global edge, <50ms latency worldwide)
- Auth: Blink Auth (built-in, zero config)
- AI: 180+ models via Blink AI Gateway

---

## App Types Blink Can Build

### Web Apps & SaaS
- Dashboards, admin panels, productivity tools
- SaaS products with subscription billing
- CRMs, project managers, analytics platforms
- Community platforms, social networks, forums
- Help desks, ticketing systems
- Booking and scheduling systems
- Invoicing and billing tools
- Form builders and survey tools
- Blogs and content platforms
- E-commerce stores

### Websites & Landing Pages
- From a plain text prompt
- From a screenshot (uploads and recreates)
- From a URL (clones the design)
- From a sketch or napkin drawing
- From a Figma screenshot (pixel-perfect recreation)
- Portfolio sites, personal brand sites
- Business / marketing sites

### Mobile Apps (iOS + Android)
- Single codebase → both platforms
- Published to App Store and Google Play
- Native features: camera, location, haptics, push notifications
- Bottom tab navigation, stack navigation, drawer navigation
- In-app purchases via RevenueCat
- All Blink backend features available on mobile

### AI-Powered Applications
- Chatbots and AI assistants
- AI writing tools
- Image generation and editing studios
- Voice apps (record → transcribe → process)
- Research agents
- Data analysis agents
- Support bots with knowledge bases
- AI agents with multi-step reasoning and tool use

### Chrome Extensions
- Browser-integrated tools
- Any functionality accessible from the browser

### Agentic Apps (AI Agents)
- AI that takes autonomous action (not just generates text)
- Multi-step reasoning and tool use
- Full Cursor-like coding agents
- Perplexity-like research agents
- Custom agent builders

---

## Full-Stack Infrastructure (Always Included)

### Frontend
- React components, React hooks, React Router
- Tailwind CSS, dark mode, responsive design
- Animations (built-in + GSAP)
- Video backgrounds, smooth scroll
- shadcn/ui component library
- Mobile-responsive by default

### Backend
- RESTful APIs (auto-generated)
- Deno Edge Functions (serverless, runs at the edge)
- Webhook actions (call any external API)
- Real-time features via WebSocket (live updates, presence tracking)

### Database
- Turso (LibSQL/SQLite) — fully managed
- Automatic schema migrations and backups
- Full CRUD operations
- Row-level security
- Supabase (PostgreSQL) available as alternative

### Authentication
- Email/password
- Google login
- Magic links
- Social login
- SSO/SAML (enterprise)
- Two-factor authentication
- Session management
- Role-based permissions (granular)
- Team hierarchies: organization → departments → teams

### Hosting & Infrastructure
- Deployed on Cloudflare Workers (global edge)
- SSL included automatically
- Global CDN
- Autoscaling (handles any traffic spike — 1 billion users)
- Custom domains with automatic SSL
- Zero server management

### Storage
- File upload and retrieval
- Image, video, document handling
- Built-in CDN + image optimization
- Progress tracking on uploads

### Email
- Transactional email (built-in)
- Attachments, custom branding, delivery tracking

### Analytics
- Privacy-first analytics (built-in)
- Automatic pageview tracking
- Custom events
- UTM attribution
- Session tracking

---

## AI Capabilities (No External API Keys Needed)

### Text & Language Models (180+)
- GPT-5.2, GPT-5.1, GPT-4.1, o3, o4 (OpenAI)
- Claude Opus 4.5, Claude Sonnet 4.5, Claude Haiku 4.5 (Anthropic)
- Gemini 3 Pro, Gemini 3 Flash, Gemini 2.5 series (Google)
- Grok 4, Grok 3 (xAI)
- Qwen 3 series, Qwen 3 Coder (Alibaba)
- GLM 4.7, GLM 4.6 (Z.ai)
- Billed at cost per token, no markup

### Image
- AI image generation (text → image)
- AI image editing (upload photo → describe changes)
- Style transfer (apply one image's style to another)
- Background removal, upscaling
- Google Nano Banana model for generation/editing

### Video
- Text → video generation (Veo 3.1, Sora 2, Kling)
- Image → animated video
- 30–60 second generation time

### Voice & Audio
- Text-to-speech (multiple voices)
- Speech-to-text transcription (Whisper)
- Voice recording and processing

### Vision (Image Analysis)
- Describe/analyze uploaded images
- Extract data from images (receipts, screenshots, docs)
- OCR, UI element identification

### AI Agent Tools
- Web search (real-time internet search)
- URL fetching (read any web page)
- Code execution (Python and JavaScript)
- Knowledge base search (RAG — query your own documents)
- Database tools (read/write/query/delete)
- Storage tools (upload, download, list files)
- Sandbox tools (read file, write file, run command, search code)
- Webhook tools (call any custom API endpoint)
- Human-in-the-loop confirmations
- Multi-agent orchestration
- Context engineering (keeps agent sharp over long conversations)
- Streaming responses (word-by-word, like ChatGPT)

### Knowledge Base / RAG
- Upload documents → AI answers questions from them
- Vector embeddings (Qwen 3 Embedding)
- Citations with every answer
- Semantic search across uploaded content

---

## Payments & Monetization

- **Stripe** — full OAuth integration
  - One-time payments
  - Subscriptions and recurring billing
  - Pricing pages and checkout flows
  - Webhooks, customer portal
- **RevenueCat** — mobile in-app purchases
  - iOS and Android subscriptions
  - Paywall integration

---

## External Integrations

- Any external REST or GraphQL API via edge functions
- GitHub export (full source code, no lock-in)
- Supabase (alternative PostgreSQL backend)
- Any third-party API via webhook actions in agents

---

## Build & Launch Features

- **Publish**: One-click deploy to production
- **Versions**: Auto-saved versions, rollback
- **Custom domains**: Connect any domain, automatic SSL
- **SEO & GEO**: Sitemaps, meta tags, structured data, AI visibility
- **Collaboration**: Invite team members, role-based access
- **Secrets management**: Secure API key storage
- **Monitoring**: Uptime, errors, performance tracking
- **Export**: Full source code export to GitHub anytime

---

## What Blink Cannot Do

- Does not support Vue, Angular, Svelte, Next.js, Python backends, PHP, Ruby, or Java
- Does not build native iOS/Android (uses React Native instead)
- Cannot use custom databases (uses Turso by default, Supabase as alternative)
- Mobile projects must specify "mobile app" or "React Native" in the first prompt — cannot switch after creation

---

## Official Tutorials (Proven App Types)

These are apps Blink has documented step-by-step tutorials for — guaranteed buildable:

| App | Description |
|-----|-------------|
| AI CRM | Deal scoring, follow-up suggestions, email drafts |
| AI Image Studio | Background removal, upscaling, style transfer |
| AI Support Chatbot | Knowledge base Q&A + human handoff |
| AI To-Do App | Smart task manager with priority prediction |
| AI Writing Assistant | Content generation, tone adjustment, grammar fixing |
| Analytics Dashboard | Real-time events, funnels, team collab (mini Mixpanel) |
| Course Platform | Video lessons, progress tracking, certificates, billing |
| E-commerce Store | AI recommendations, Stripe checkout, inventory |
| Project Manager | Linear-style issue tracker, sprints, GitHub integration |
| Social Scheduler | AI captions, scheduling, analytics |

---

## App Categories on blink.new/explore

Active community-built app categories that confirm what's being built today:

CRM, Dashboard, Landing Page, Portfolio, E-commerce, SaaS, Productivity, Analytics, Forms, Blog, Social, Community, Game, AI Tool, Database, Help Desk, Scheduling, Invoicing, Email

**50,000+ production apps built. Average build time: 5 minutes.**
