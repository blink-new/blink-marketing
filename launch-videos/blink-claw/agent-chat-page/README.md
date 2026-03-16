# Blink Claw — Agent Chat Page Frontend Reference

Live URL: **https://blink.new/[workspace]/claw/[agentId]**

This folder contains the complete source for the agent management interface —
the page users see after deploying an agent. Use for launch video screen
recording reference, AI-coded demo reproduction, and design documentation.

---

## Files

```
agent-chat-page/
├── README.md                           ← this file
├── pages/
│   ├── agent-detail-page.tsx           ← /[workspace]/claw/[agentId] — full page shell
│   └── agents-list-page.tsx            ← /[workspace]/claw — agent cards + empty state
└── components/
    ├── AgentChatPanel.tsx              ← LEFT panel: chat, streaming, tool calls, input
    ├── AgentRightPanel.tsx             ← RIGHT panel: tab bar + panel switcher
    ├── AgentFilesPanel.tsx             ← Files tab: file tree + Monaco editor
    ├── AgentSettingsPanel.tsx          ← Settings tab: name, avatar, size, channels
    ├── AgentTerminalPanel.tsx          ← Terminal tab: dark REPL, command history
    ├── AgentChannelsBar.tsx            ← Messaging bar above chat (Telegram/Discord/Slack)
    ├── AgentAvatar.tsx                 ← Avatar component + gradient fallback colors
    └── PlatformIcon.tsx                ← Telegram/Discord/Slack/WhatsApp icons
```

---

## Page Layout

### Desktop (`/[workspace]/claw/[agentId]`)

```
┌──────────────────────────────────────────────────────────────────────┐
│ ← [Avatar] Agent Name  ● running  claude-sonnet-4.6          [Header]│
├────────────────────────────┬─────────────────────────────────────────┤
│                            │  Files │ Secrets │ Connectors │ Terminal │ Settings │
│    AgentChatPanel          │──────────────────────────────────────────│
│    (55% default)           │         AgentRightPanel                  │
│                            │         (45% default)                    │
│    ← ResizableHandle →     │                                          │
│                            │  Active tab content renders here         │
└────────────────────────────┴─────────────────────────────────────────┘
```

- **ResizablePanelGroup** — horizontal split, drag the handle to resize
- Default: 55% chat / 45% right panel. Min: 35% / 30%
- Mobile: stacked with bottom tab bar (Chat | Manage)

### Shared Header
```tsx
// Border-bottom, compact (py-2.5), always visible
<div className="flex items-center gap-3 px-4 py-2.5 border-b border-border/50">
  <ArrowLeft />                          // back to /claw
  <AgentAvatar h-6 w-6 />
  <h1 className="font-medium text-sm truncate" />
  <div className="w-1.5 h-1.5 rounded-full" />   // status dot
  <Badge variant="outline" text-[10px] />         // status text
  <span className="text-xs text-muted-foreground hidden sm:block" />  // model name
</div>
```

**Status dot colors:**
```
running      → bg-green-500
paused       → bg-yellow-500
grace        → bg-red-500
provisioning → bg-blue-500 animate-pulse
deleted      → bg-muted
```

---

## AgentChatPanel

**The most visually complex component** — full streaming chat UI.

### Structure (top → bottom)
```
Status banner (conditional — blue/yellow/red/orange depending on agent status)
Toolbar bar (New chat button + Help toggle)
CommandHelp (slash commands reference — hidden by default)
AgentChannelsBar (messaging pills)
ScrollArea → messages list
Attachment tray (shown when files attached)
Input area (textarea + paperclip + model selector + send/stop)
```

### Status Banners (full-width, colored)
```tsx
// provisioning — blue
<div className="bg-blue-500/10 text-blue-700 dark:text-blue-400">
  <Loader2 animate-spin /> Agent is starting up…
</div>

// paused — amber
<div className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">
  Agent is paused — resume it in Settings to chat
</div>

// grace — red
<div className="bg-red-500/10 text-red-700 dark:text-red-400">
  Agent paused due to insufficient credits
</div>

// unreachable — orange (with Recover button)
<div className="bg-orange-500/10 text-orange-700 dark:text-orange-400">
  <AlertCircle /> Agent gateway not responding
  <Button>Recover</Button>
</div>
```

### Toolbar Bar
```tsx
<div className="flex items-center justify-between px-4 py-1 border-b border-border/30">
  // New chat button (disabled when no messages)
  <button className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] text-muted-foreground hover:bg-muted/50">
    <Plus h-3 w-3 />New chat
  </button>
  // Help toggle
  <button className="p-1 rounded-md text-muted-foreground hover:bg-muted/50">
    <HelpCircle h-3.5 w-3.5 />
  </button>
</div>
```

### Message Bubbles

**User message (right-aligned):**
```tsx
<div className="w-full flex py-2.5 px-4 justify-end">
  <div className="max-w-[70%] flex flex-col items-end mr-4 gap-1.5">
    // optional image/file attachments above bubble
    <div className="bg-primary/10 backdrop-blur-[2px] rounded-xl shadow-sm px-4 py-2.5 text-sm">
      {message content}
    </div>
  </div>
</div>
```

**Assistant message (left-aligned):**
```tsx
<div className="w-full flex py-2.5 px-4 justify-start">
  <div className="max-w-[88%] flex flex-col items-start ml-4">
    // name header row
    <div className="flex items-center gap-2 mb-1.5 ml-0.5">
      <AgentAvatar h-5 w-5 />
      <span className="text-xs font-medium text-muted-foreground/80">{agentName}</span>
      <span className="text-[10px] text-muted-foreground/50">{modelShortName}</span>
    </div>
    // tool calls (ToolCallItem components)
    // markdown content (MessageContent)
    // OR thinking dot when streaming with no content yet
  </div>
</div>
```

**Thinking indicator (streaming, no content yet):**
```tsx
<div className="py-1.5 flex">
  <div className="w-3 h-3 rounded-full intelligent-dot bg-foreground" />
</div>
// CSS class "intelligent-dot" = custom pulsing glow animation
```

### ToolCallItem (expandable)
```tsx
<div className="rounded-lg border border-border/50 bg-muted/20 text-xs overflow-hidden my-1.5">
  // Header row — always visible, click to expand
  <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted/40">
    // state indicator:
    // calling → spinning dot (w-2 h-2 rounded-full bg-foreground intelligent-dot)
    // error   → <AlertCircle text-destructive />
    // done    → solid green dot (bg-emerald-500)
    <span className="font-mono text-foreground/90">{tool.name}</span>
    <ChevronDown / ChevronRight />
  </button>
  // Expanded: Input JSON + optional Output section
  <div className="border-t border-border/40 px-3 py-2">
    <pre className="text-[11px] whitespace-pre-wrap break-all text-foreground/75 max-h-40 overflow-y-auto">
      {JSON.stringify(input, null, 2)}
    </pre>
  </div>
</div>
```

### Chat Input Area
```tsx
<div className="px-4 pb-4 pb-safe pt-2 border-t border-border/50">
  <div className="max-w-3xl mx-auto">
    <div className="flex flex-col bg-muted/40 rounded-2xl border border-border/60 px-3 pt-2 pb-2">
      <div className="flex items-end gap-2">
        <Paperclip h-4 w-4 text-muted-foreground />    // file attach
        <textarea                                        // auto-grow, max-h-32
          placeholder="Message your agent..."
          className="flex-1 bg-transparent resize-none text-sm placeholder:text-muted-foreground/60"
        />
        // Send button (when not streaming):
        <button className="w-7 h-7 rounded-xl bg-foreground text-background">
          <Send h-3.5 w-3.5 />
        </button>
        // Stop button (while streaming):
        <button className="w-7 h-7 rounded-xl bg-muted">
          <Square h-3 w-3 fill-current />
        </button>
      </div>
      // Bottom row: model selector
      <div className="flex items-center pt-1.5">
        <ClawModelSelector />
      </div>
    </div>
  </div>
</div>
```

### Slash Commands Reference (CommandHelp)
```tsx
// Shown when Help icon toggled — 4 groups: Session / Model / Tools / Subagents
<div className="mx-4 mb-2 mt-1 rounded-xl border border-border/50 bg-muted/20">
  <div className="px-3 pt-2.5 pb-1 border-b border-border/30 text-[10px] font-semibold uppercase tracking-widest">
    Slash Commands
  </div>
  <div className="p-2 grid grid-cols-1 sm:grid-cols-2 gap-0.5">
    // Each command: font-mono name + muted description
  </div>
</div>
```

---

## AgentChannelsBar

The persistent bar above the chat for messaging integrations.

### States

**No channels connected — grid of 4 buttons:**
```tsx
<div className="px-3 py-2.5">
  <div className="rounded-2xl border border-border/50 bg-muted/30 p-2.5">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs text-muted-foreground font-medium">Chat from an app you already use</span>
      <X />  // dismiss
    </div>
    // 2×2 grid mobile → 1×4 row desktop
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
      // Each: rounded-xl border py-2.5 px-3 with platform color + icon + label
      // Telegram: text-blue-600/400  bg-blue-500/8  border-blue-500/20
      // WhatsApp: text-emerald-600/400  bg-emerald-500/8
      // Discord:  text-indigo-600/400  bg-indigo-500/8
      // Slack:    text-green-700/400   bg-green-500/8
    </div>
  </div>
</div>
```

**Channels connected — compact pill row:**
```tsx
<div className="px-3 py-2 flex items-center gap-1.5 flex-wrap justify-center">
  <span className="text-xs text-muted-foreground">Continue on</span>
  // Connected: filled pill with icon + label
  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium
                   bg-blue-500/10 border-blue-500/25 text-blue-600">
    <PlatformIcon /> Telegram
  </span>
  // Unconnected: dashed-border icon-only add buttons
  <button className="border-dashed hover:border-solid px-2 py-1 rounded-full">
    <Plus h-2.5 /> <PlatformIcon />
  </button>
  <X />  // dismiss to collapsed
</div>
```

**Dismissed — ghost link:**
```tsx
<div className="px-4 py-1.5 flex justify-center">
  <button className="flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-muted-foreground">
    <MessageCircle h-3 w-3 /> Connect messaging channels
  </button>
</div>
```

---

## AgentRightPanel (Tab Container)

```tsx
<div className="flex flex-col h-full border-l border-border/50">
  // Tab bar
  <div className="flex items-center border-b border-border/50 px-3 py-1.5 bg-muted/20">
    <SlidingTabs
      tabs={['files', 'secrets', 'connectors', 'terminal', 'settings']}
      variant="muted"   // pill tabs with sliding indicator
    />
  </div>
  // Content area — overflow-y-auto for all except Terminal (overflow-hidden)
  <div className="flex-1 min-h-0 overflow-y-auto">
    {activeTab content}
  </div>
</div>
```

---

## AgentFilesPanel

Two-column layout: file tree (left, 208px fixed) + Monaco editor (right, flex-1).

### File Tree Column
```tsx
<div className="w-52 border-r border-border/50 flex flex-col">
  // Toolbar: search input + refresh
  <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border/50">
    <Input className="pl-6 h-6 text-xs border-0 bg-muted/40 rounded-md" />
    <RefreshCw h-3.5 w-3.5 />
  </div>
  // Tree (ScrollArea)
  // Each file row:
  <div className="group flex items-center gap-1.5 py-[3px] rounded-md cursor-pointer text-xs
                  selected: bg-accent text-accent-foreground
                  default:  text-foreground/80 hover:bg-muted/60">
    <FolderOpen/Folder h-3.5 w-3.5 text-amber-500 />  // or File h-3.5 text-muted-foreground/70
    <span className="truncate flex-1 font-medium">{name}</span>
    <Download h-3 w-3 opacity-0 group-hover:opacity-100 />
  </div>
  // Footer: "3 files · 2 folders"
</div>
```

### Editor Column
```tsx
// File header bar
<div className="flex items-center justify-between px-3 py-1.5 border-b border-border/50 bg-background">
  // Single file: name + dirty dot (w-1.5 h-1.5 rounded-full bg-orange-400)
  // Multiple files: tab strip (rounded-md px-2.5 py-1 active:bg-muted)
  // Right: Save button + Close X
  <button className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium
                     dirty:   bg-foreground text-background
                     clean:   text-muted-foreground/40 cursor-default">
    <Save /> Save
  </button>
</div>
// Monaco Editor (100% height)
// theme: vs-dark (dark mode) / vs (light mode)
// minimap: disabled, fontSize: 13, wordWrap: on, padding: 12
```

---

## AgentTerminalPanel

Dark terminal with green prompt character.

```
Background:  #0d0d0d
Font:        font-mono, 12px, leading-[1.6]
Prompt ($):  text-[#4CAF50]  (Material Green 500)
stdout:      text-white/75
stderr:      text-[#ff6b6b]  (soft red)
^C:          text-white/40
exit code:   text-[#ff6b6b]/50  "exit N"
Cursor:      caret-[#4CAF50]
```

**Toolbar:**
```tsx
<div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.06]">
  <span className="text-[11px] text-white/30">/data/workspace</span>
  <RotateCcw h-3 w-3 text-white/25 />  // clear output
</div>
```

**Input row (focused state):**
```tsx
// Unfocused: border-white/[0.06]
// Focused:   border-white/[0.12] + bg-white/[0.025]
<div className="flex items-center gap-2 px-3 py-2.5 border-t transition-colors">
  <span className="text-[12px] select-none
                   focused: text-[#4CAF50]
                   blur:    text-white/30">$</span>
  <input className="flex-1 bg-transparent text-[12px] text-white/85 outline-none
                    placeholder:text-white/15 caret-[#4CAF50] font-mono" />
</div>
```

**Command history navigation:** ArrowUp/Down + Ctrl+C (^C in output) + Ctrl+L (clear)

---

## AgentSettingsPanel

Uses the shared `SettingsSection` / `SettingsTabHeader` layout pattern.

### Sections

**Status section:**
- Status dot + capitalized status text + Fly app name (`font-mono text-xs`)
- Pause/Resume button (outline, sm)
- Two restart cards side-by-side (`grid-cols-1 sm:grid-cols-2 gap-2`):
  - "Restart Process" — amber Zap icon — `~5 seconds`
  - "Restart Machine" — RefreshCw icon — `~30 seconds`
- Recover Agent card — orange RotateCcw icon

**Machine resize:**
```tsx
// Fluid grid of size buttons
<div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 140px), 1fr))' }}>
  // Each: rounded-lg border p-3 text-left
  // selected: border-primary bg-primary/5
  // default:  border-border/50 hover:border-border
  <div className="text-xs font-medium">{size.label}</div>
  <div className="text-[10px] text-muted-foreground">{size.spec}</div>
  <div className="text-[10px] text-muted-foreground">{size.creditsPerMonth} cr/mo</div>
</div>
// Upgrade notice: "Upgrade takes effect immediately. Pro-rated charge..."
// Downgrade notice: "Downgrade takes effect at end of billing cycle..."
```

**Danger Zone:**
```tsx
<SettingsSection title="Danger Zone" className="border-destructive/30">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-destructive">Delete Agent</p>
      <p className="text-xs text-muted-foreground">Permanently deletes machine, volume, and all data.</p>
    </div>
    <Button variant="destructive" size="sm">
      <Trash2 /> Delete
    </Button>
  </div>
</SettingsSection>
```

---

## AgentAvatar

Used everywhere to show the agent's identity.

```tsx
// With custom photo:
<img src={avatarUrl} className="object-cover rounded-sm shrink-0 {className}" />

// Without photo — gradient + initials:
<div className="rounded-sm flex items-center justify-center bg-gradient-to-br text-white font-semibold {color} {className}">
  {initials}  // 2 chars: first + last word initial, or first 2 chars
</div>
```

**Gradient colors (hash-based, deterministic per agent name):**
```
violet → from-violet-500 to-indigo-600
blue   → from-blue-500 to-cyan-400
green  → from-emerald-500 to-green-600
rose   → from-rose-500 to-pink-600
amber  → from-amber-400 to-orange-500
purple → from-fuchsia-500 to-purple-600
cyan   → from-cyan-400 to-sky-500
indigo → from-indigo-500 to-purple-500
```

Common sizes used in the UI:
```
Header:     className="h-6 w-6 text-[9px]"
Chat name:  className="h-5 w-5 text-[8px]"
Empty state: 64×64 px, rounded-2xl, crab icon if no avatar
Card:       w-10 h-10 rounded-xl (image) or rounded-xl gradient
```

---

## Agents List Page (`/[workspace]/claw`)

### AgentCard
```tsx
<div className="group rounded-xl border border-border/60 bg-card hover:border-border hover:shadow-md transition-all">
  // Grace banner (red, full-width top bar if status === 'grace')
  <div className="px-4 pt-3">
    <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-600 flex items-center gap-2">
      <AlertTriangle h-3 w-3 /> Insufficient credits — data deleted in 30 days…
    </div>
  </div>

  <Link href="/{workspace}/claw/{id}" className="block p-4">
    // Avatar w/ live status dot in bottom-right corner
    <div className="relative shrink-0">
      <img className="rounded-xl object-cover w-10 h-10" />
      // OR: initials div
      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background {statusDot}" />
    </div>

    // Name + model
    <p className="font-semibold text-sm truncate">{name}</p>
    <p className="text-xs text-muted-foreground/70">{model short name}</p>

    // Footer row
    <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-border/40">
      <p className="text-[11px] text-muted-foreground/60 tabular-nums">
        {credits} cr/mo · {machine_size}
      </p>
      <div className="flex items-center gap-2">
        // Platform icons (14px, opacity-70)
        // Status pill: rounded-full text-[10px] px-2 py-0.5 font-medium capitalize
        // running  → bg-green-500/10 text-green-600 dark:text-green-400
        // paused   → bg-yellow-500/10 text-yellow-600 dark:text-yellow-400
        // grace    → bg-red-500/10 text-red-500
      </div>
    </div>
  </Link>
</div>
```

### Overflow Menu
```tsx
// Appears on hover (opacity-0 group-hover:opacity-100)
<button className="p-1 rounded-md text-muted-foreground/70 hover:bg-muted/60">
  <MoreHorizontal h-4 w-4 />
</button>
// Dropdown: absolute right-4 mt-1.5 z-50 w-52 bg-popover border rounded-xl shadow-lg py-1
// Items: Open agent / Rename / --- / Pause / Resume / Restart / --- / Delete (destructive)
```

### Empty State (`ClawEmptyState`)
```tsx
<div className="flex flex-col items-center text-center px-6 py-16 gap-10 max-w-3xl mx-auto">
  // Live badge
  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/50 bg-muted/40 text-xs text-muted-foreground">
    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
    Blink Claw 🦞
  </div>

  // Hero copy
  <h2 className="text-4xl font-semibold tracking-tight">Your agents are waiting.</h2>
  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
    Deploy AI agents that work for you 24/7 — no setup. No servers.
  </p>

  // CTA button
  <Button size="lg" gap-2><Plus /> Deploy your first agent</Button>

  // Template grid — fluid auto-fill, 260px min
  <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))' }}>
    // Each template: rounded-xl border px-3.5 py-3 flex items-center gap-3
    // Avatar (36×36 rounded-full) + name + title + tagline + ArrowRight
    <button className="group flex items-center gap-3 px-3.5 py-3 rounded-xl border border-border/60
                       bg-card hover:border-border hover:bg-muted/20 transition-all cursor-pointer">
      <Image rounded-full 36×36 />
      <div>
        <p className="text-sm font-medium truncate">{name}</p>
        <p className="text-xs text-muted-foreground/70 line-clamp-1">{tagline}</p>
      </div>
      <ArrowRight h-3.5 text-muted-foreground/20 group-hover:text-muted-foreground/50 />
    </button>
  </div>

  // Feature pills
  <div className="flex flex-wrap gap-2">
    // Each: px-3 py-1.5 rounded-full border border-border/50 text-xs text-muted-foreground/60
    // "200+ AI models included" / "Always on, 24/7" / "No setup required"
  </div>
</div>
```

### Skeleton Loaders
```tsx
// AgentCardSkeleton
<div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
  <div className="flex items-start gap-3">
    <Skeleton className="w-10 h-10 rounded-xl" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-2/5" />
      <Skeleton className="h-3 w-1/3" />
    </div>
    <Skeleton className="h-6 w-6 rounded-md" />
  </div>
  <div className="flex items-center justify-between pt-3 border-t border-border/40">
    <Skeleton className="h-3 w-24" />
    <Skeleton className="h-5 w-16 rounded-full" />
  </div>
</div>
```

---

## Mobile Layout

Bottom tab bar — iOS translucent style:
```tsx
<div className="bg-background/95 backdrop-blur-md border-t border-border/20 px-safe pb-safe h-mobile-bottom-nav">
  <div className="flex items-center justify-around max-w-md mx-auto h-full">
    <MobileTabButton active={mobileView === 'chat'} icon={<MessageSquare />} label="Chat" />
    <MobileTabButton active={mobileView === 'manage'} icon={<Wrench />} label="Manage" />
  </div>
</div>

// Tab button — matches ChatLayout pattern
<button className="flex flex-col items-center gap-0.5 min-w-[64px] min-h-[44px] py-1.5 px-3 rounded-lg">
  <div className="relative">
    {icon}
    {active && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-foreground" />}
  </div>
  <span className="text-[10px] active:font-semibold">{label}</span>
</button>
```

---

## Key Design Tokens

| Token | Value | Used for |
|-------|-------|---------|
| `border-border/50` | border at 50% opacity | All panel dividers |
| `bg-muted/20` | light muted background | Right panel header, card hover zones |
| `bg-muted/40` | medium muted | Chat input bg, tag pills |
| `text-muted-foreground/60` | dimmed text | Secondary labels, credits/spec text |
| `rounded-xl` | 12px radius | Cards, dropdowns, agent cards |
| `rounded-2xl` | 16px radius | Input area, channels bar container |
| `text-[10px]` | 10px | Smallest labels — credits, badges, hints |
| `text-[11px]` | 11px | Tool call names, secondary UI text |
| `font-mono` | monospace | Tool call names, terminal, model IDs |

---

## For AI Coding (Video Recreation Tips)

1. **Start with the two-panel shell** (`ResizablePanelGroup`) — the iconic split layout is the first thing to establish
2. **The `ToolCallItem` expand/collapse pattern** is reusable standalone — great for showing "agent working" visually
3. **The channels bar** (`AgentChannelsBar`) makes an excellent standalone visual — shows the multi-platform angle
4. **Terminal dark theme** (`bg-[#0d0d0d]`, green `$` prompt) is visually distinct from the light/dark app — use for "power user" shots
5. **Status banners** (colored stripes at top of chat) convey the agent lifecycle cleanly — worth recreating for lifecycle demo
6. **The empty state template grid** is very "Notion/Linear" in feel — good for "getting started" video shots
7. **The overflow menu** on agent cards (opacity-0 → group-hover:opacity-100) is a subtle polish detail worth capturing
8. **File tree amber folder icons** (`text-amber-500`) + Monaco editor with dark vs-dark theme = strong visual for "your agent has a workspace" messaging
