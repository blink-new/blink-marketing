'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight, Check, Plus, Minus, X,
  Zap, MessageSquare, Globe, Lock,
  Users, BarChart3, Mail, Calendar,
  Send, TrendingUp, Database, Bot,
  CheckCircle, Activity, Clock,
  MousePointerClick, Brain, ShieldCheck,
  KeyRound, Infinity, RefreshCw,
  Paperclip, User,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PlatformIcon } from './PlatformIcon'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">{children}</p>
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

const DEMO_SEQ: [number, number][] = [
  [1, 900],   // history fades in
  [2, 1100],  // user message
  [3, 1000],  // tool1 calling
  [4, 1500],  // tool1 done + lead list
  [5, 1200],  // tool2 calling
  [6, 1700],  // tool2 done + email draft
  [7, 800],   // tool3 calling
  [8, 1000],  // tool3 done
  [9, 800],   // agent typing
  [10, 5800], // agent response
  [0, 700],
]

// Named agents with souls
const TEAM_AGENTS = [
  {
    id: 'alex',
    name: 'Alex',
    role: 'Sales · follows up so you don\'t have to',
    avatar: '/images/agents/alex.webp',
    channel: 'telegram' as const,
    note: 'active now',
    active: true,
  },
  {
    id: 'maya',
    name: 'Maya',
    role: 'Inbox · drafts replies, flags urgent',
    avatar: '/images/agents/maya.webp',
    channel: 'slack' as const,
    note: '3 drafts ready',
  },
  {
    id: 'jordan',
    name: 'Jordan',
    role: 'Reports · numbers every Friday 5pm',
    avatar: '/images/agents/jordan.webp',
    channel: 'discord' as const,
    note: 'runs in 2h',
  },
]

function AgentAvatar({ src, name, size = 28, online = false }: { src: string; name: string; size?: number; online?: boolean }) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <Image src={src} alt={name} width={size} height={size} className="rounded-full object-cover" />
      {online && <div className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-green-500 border-2 border-background" />}
    </div>
  )
}

function ToolCallCard({ name, state, preview }: { name: string; state: 'calling' | 'done'; preview?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/20 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2">
        {state === 'calling'
          ? <div className="w-2 h-2 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />
          : <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />}
        <span className="font-mono text-[10px] font-semibold text-foreground/70">{name}</span>
        {state === 'calling' && <span className="ml-auto text-[10px] text-muted-foreground/40 animate-pulse">working…</span>}
        {state === 'done' && <span className="ml-auto"><Check className="h-3 w-3 text-green-500" /></span>}
      </div>
      {state === 'done' && preview && (
        <div className="border-t border-border/40 px-3 py-2.5 bg-background/40">{preview}</div>
      )}
    </div>
  )
}

function AgentDemo() {
  const [phase, setPhase] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const idxRef = useRef(0)

  useEffect(() => {
    const run = () => {
      const [p, delay] = DEMO_SEQ[idxRef.current % DEMO_SEQ.length]
      setPhase(p)
      idxRef.current++
      timerRef.current = setTimeout(run, delay)
    }
    timerRef.current = setTimeout(run, 800)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  const alex = TEAM_AGENTS[0]
  const showHistory = phase >= 1
  const showUser    = phase >= 2
  const t1State     = phase === 3 ? 'calling' : phase >= 4 ? 'done' : null
  const t2State     = phase === 5 ? 'calling' : phase >= 6 ? 'done' : null
  const t3State     = phase === 7 ? 'calling' : phase >= 8 ? 'done' : null
  const agentTyping = phase === 9
  const agentDone   = phase === 10

  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl border border-border/40 bg-card shadow-2xl shadow-black/10 overflow-hidden text-left select-none">
      <div className="flex" style={{ height: '500px' }}>

        {/* Sidebar — team roster */}
        <div className="w-52 shrink-0 border-r border-border/40 bg-muted/10 flex flex-col">
          <div className="px-4 pt-4 pb-3 border-b border-border/30">
            <p className="text-[11px] font-bold text-foreground/80 mb-0.5">Your Agent Team</p>
            <div className="flex items-center gap-1.5 text-[10px] text-green-600 dark:text-green-400">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              3 agents online
            </div>
          </div>
          <div className="flex-1 py-2 px-2 space-y-1 overflow-hidden">
            {TEAM_AGENTS.map(a => (
              <div key={a.id} className={cn(
                'flex items-center gap-3 px-2.5 py-3 rounded-xl cursor-default transition-colors',
                a.active ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/30'
              )}>
                <AgentAvatar src={a.avatar} name={a.name} size={32} online />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <p className={cn('text-[12px] font-bold truncate', a.active ? 'text-primary' : 'text-foreground')}>{a.name}</p>
                    <PlatformIcon platform={a.channel} size={11} className="shrink-0 opacity-60" />
                  </div>
                  <p className="text-[10px] text-muted-foreground/60 truncate leading-tight">{a.note}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-border/30 space-y-1">
            {[['Tasks done today', '47'], ['Emails sent', '23'], ['Replies incoming', '3']].map(([k, v]) => (
              <div key={k} className="flex justify-between text-[10px]">
                <span className="text-muted-foreground/50">{k}</span>
                <span className="font-semibold text-foreground/70">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chat */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Agent identity header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-border/30 bg-card shrink-0">
            <div className="flex items-center gap-3">
              <AgentAvatar src={alex.avatar} name={alex.name} size={36} online />
              <div>
                <p className="text-[13px] font-bold leading-none">{alex.name}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-1">Sales specialist · running 24/7</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-muted/50 border border-border/40">
                <PlatformIcon platform="telegram" size={13} />
                <span className="text-[10px] font-medium text-muted-foreground/70">Telegram</span>
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              </div>
              <div className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-muted/30 border border-border/30">
                <Image src="/images/providers/anthropic.avif" alt="" width={11} height={11} className="rounded-full" />
                <span className="text-[10px] text-muted-foreground/50">claude-opus-4.6</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-hidden px-5 py-4 space-y-4">

            {/* Previous conversation — context */}
            {showHistory && (
              <div className="space-y-3 opacity-45">
                <div className="flex gap-3 flex-row-reverse">
                  <div className="w-6 h-6 rounded-full bg-foreground/80 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="h-3 w-3 text-background" />
                  </div>
                  <div className="bg-foreground/80 text-background text-[11px] rounded-2xl rounded-tr-sm px-3.5 py-2.5 max-w-[72%] leading-relaxed">
                    Morning. What does my pipeline look like today?
                  </div>
                </div>
                <div className="flex gap-3">
                  <AgentAvatar src={alex.avatar} name={alex.name} size={24} />
                  <div className="bg-muted/50 text-foreground/70 text-[11px] rounded-2xl rounded-tl-sm px-3.5 py-2.5 max-w-[80%] leading-relaxed">
                    Morning! Pipeline is solid — <strong>34 active deals</strong>. One thing: <strong>14 leads from last week</strong> haven&apos;t replied yet. I can follow up for you if you want.
                  </div>
                </div>
              </div>
            )}

            {/* Current user message */}
            {showUser && (
              <div className="flex gap-3 flex-row-reverse">
                <div className="w-6 h-6 rounded-full bg-foreground flex items-center justify-center shrink-0 mt-0.5">
                  <User className="h-3 w-3 text-background" />
                </div>
                <div className="bg-foreground text-background text-[11px] rounded-2xl rounded-tr-sm px-3.5 py-2.5 max-w-[70%] leading-relaxed font-medium">
                  Yes, follow up with all 14 right now.
                </div>
              </div>
            )}

            {/* Alex working */}
            {t1State && (
              <div className="flex gap-3">
                <AgentAvatar src={alex.avatar} name={alex.name} size={24} />
                <div className="flex-1 space-y-2 max-w-[86%]">
                  <ToolCallCard
                    name="search_crm · no_reply, 5+ days"
                    state={t1State as 'calling' | 'done'}
                    preview={
                      <div className="space-y-1.5">
                        <p className="text-[10px] text-muted-foreground/60 font-semibold">14 leads · sorted by deal value</p>
                        {[
                          { name: 'Marcus Chen', co: 'Stripe', role: 'VP Growth', val: '$28k' },
                          { name: 'Priya Patel', co: 'Notion', role: 'Head of Mktg', val: '$14k' },
                          { name: 'David Kim',   co: 'Linear', role: 'CEO',         val: '$9k' },
                        ].map(l => (
                          <div key={l.name} className="flex items-center gap-2 text-[10px]">
                            <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center text-[9px] font-bold text-primary shrink-0">{l.name[0]}</div>
                            <span className="font-semibold text-foreground/80">{l.name}</span>
                            <span className="text-muted-foreground/50">{l.co}</span>
                            <span className="ml-auto font-semibold text-foreground/60">{l.val}</span>
                          </div>
                        ))}
                        <p className="text-[10px] text-muted-foreground/40">+11 more</p>
                      </div>
                    }
                  />
                  {t2State && (
                    <ToolCallCard
                      name="compose_email · personalizing each one…"
                      state={t2State as 'calling' | 'done'}
                      preview={
                        <div className="space-y-2">
                          <p className="text-[10px] text-muted-foreground/60 font-semibold">Preview — Marcus Chen @ Stripe</p>
                          <div className="rounded-lg border border-border/50 bg-card px-3 py-2.5 space-y-1.5 text-[10px]">
                            <p className="text-muted-foreground/70"><span className="font-semibold text-foreground/80">To:</span> marcus@stripe.com</p>
                            <p className="text-muted-foreground/70"><span className="font-semibold text-foreground/80">Subject:</span> Following up on your Q4 growth goals</p>
                            <p className="text-muted-foreground/60 pt-1.5 border-t border-border/30 leading-relaxed">Hi Marcus, circling back on my note from last week. Given Stripe&apos;s push into APAC this quarter, I think our automation layer could save your team significant time on...</p>
                          </div>
                          <p className="text-[10px] text-muted-foreground/40">14 personalized drafts complete</p>
                        </div>
                      }
                    />
                  )}
                  {t3State && (
                    <ToolCallCard
                      name="send_bulk_email · dispatching all 14…"
                      state={t3State as 'calling' | 'done'}
                      preview={
                        <div className="space-y-2 text-[10px]">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                              <div className="h-full bg-green-500 rounded-full w-full transition-all duration-700" />
                            </div>
                            <span className="font-bold text-green-600 dark:text-green-400 shrink-0">14 / 14 delivered</span>
                          </div>
                          <p className="text-muted-foreground/50">All sent with unique tracking · avg send time 0.3s each</p>
                        </div>
                      }
                    />
                  )}
                  {agentTyping && (
                    <div className="bg-muted/40 rounded-2xl rounded-tl-sm px-3.5 py-2.5 w-fit">
                      <div className="flex items-center gap-1.5">
                        {[0, 150, 300].map(d => (
                          <div key={d} className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                        ))}
                      </div>
                    </div>
                  )}
                  {agentDone && (
                    <div className="bg-muted/50 text-foreground text-[11px] rounded-2xl rounded-tl-sm px-4 py-3 leading-relaxed space-y-2.5">
                      <p>Done — all <strong>14 follow-ups sent</strong>, each personalized to the person and their company.</p>
                      <div className="space-y-1 border-l-2 border-primary/40 pl-3">
                        <p className="text-[10px] text-muted-foreground/80"><strong className="text-foreground/90">Marcus Chen</strong> (Stripe) — I referenced their APAC expansion this quarter</p>
                        <p className="text-[10px] text-muted-foreground/80"><strong className="text-foreground/90">Priya Patel</strong> (Notion) — mentioned their recent team growth announcement</p>
                        <p className="text-[10px] text-muted-foreground/60">+12 more, all tailored to role and recent news</p>
                      </div>
                      <p className="text-[10px] text-muted-foreground/60">I&apos;ll ping you on Telegram the moment anyone replies. Want a 3-day nudge for anyone who doesn&apos;t open?</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="px-5 pb-4 pt-3 border-t border-border/40 shrink-0">
            <div className="flex items-center gap-2.5 bg-muted/30 rounded-2xl border border-border/50 px-4 py-2.5">
              <Paperclip className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0" />
              <span className="flex-1 text-[11px] text-muted-foreground/30">Message Alex…</span>
              <div className="w-7 h-7 rounded-xl bg-muted/50 flex items-center justify-center">
                <Send className="h-3.5 w-3.5 text-muted-foreground/25" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden pt-20 pb-16 md:pt-28 md:pb-24">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/50 bg-background text-xs font-medium text-muted-foreground mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Introducing Blink Claw 🦞
          </div>

          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-normal leading-[1.1] tracking-tight mb-6">
            A team of AI agents<br />
            <span className="italic">working for you, 24/7.</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
            The easiest way to run OpenClaw agents. Message your agent from bed — wake up to emails answered, leads followed up, reports sent.
            No Mac Mini, no API keys, no setup. Ready in 60 seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
            <Link
              href="/account"
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Get my first agent
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              See pricing →
            </a>
          </div>
        </div>

        <AgentDemo />
      </div>
    </section>
  )
}

// ─── Pain → Solution callout ──────────────────────────────────────────────────

// ─── Comparison table ─────────────────────────────────────────────────────────

type CellValue = 'yes' | 'no' | 'partial'

interface ComparisonRow {
  feature: string
  hint: string
  blink: CellValue
  vps: CellValue
  local: CellValue
}

const COMPARISON_ROWS: ComparisonRow[] = [
  {
    feature: 'Ready in 60 seconds',
    hint: 'No terminal, no Docker, no config files. Click deploy and go.',
    blink: 'yes', vps: 'no', local: 'no',
  },
  {
    feature: '200+ AI models included',
    hint: 'Claude, GPT, Gemini and more — no separate accounts or subscriptions.',
    blink: 'yes', vps: 'no', local: 'no',
  },
  {
    feature: 'No API key management',
    hint: 'Your own keys stay in a secure vault. No juggling accounts or billing.',
    blink: 'yes', vps: 'no', local: 'no',
  },
  {
    feature: 'Always on, 24/7',
    hint: 'No machine to keep awake, no restarts, no missed overnight tasks.',
    blink: 'yes', vps: 'partial', local: 'no',
  },
  {
    feature: 'Automatic updates',
    hint: 'Always on the latest version. No broken Docker images on updates.',
    blink: 'yes', vps: 'no', local: 'no',
  },
  {
    feature: 'Secure out of the box',
    hint: '63% of self-hosted instances run with insecure default configs.',
    blink: 'yes', vps: 'partial', local: 'no',
  },
  {
    feature: 'Unlimited agents',
    hint: 'Spin up as many as you need. Each one runs independently.',
    blink: 'yes', vps: 'partial', local: 'no',
  },
  {
    feature: 'Accessible from your phone',
    hint: 'Message from Telegram, Discord, or Slack — wherever you are.',
    blink: 'yes', vps: 'partial', local: 'partial',
  },
  {
    feature: 'No DevOps knowledge needed',
    hint: 'No Nginx, no SSL certs, no firewalls. Nothing to configure.',
    blink: 'yes', vps: 'no', local: 'partial',
  },
  {
    feature: 'Persistent memory',
    hint: 'Your agent remembers preferences, goals and context across sessions.',
    blink: 'yes', vps: 'partial', local: 'partial',
  },
]

function Cell({ value }: { value: CellValue }) {
  if (value === 'yes') return (
    <div className="flex justify-center">
      <div className="w-6 h-6 rounded-full border-2 border-green-500/40 bg-green-500/10 flex items-center justify-center">
        <Check className="h-3.5 w-3.5 text-green-500" />
      </div>
    </div>
  )
  if (value === 'partial') return (
    <div className="flex justify-center">
      <div className="w-6 h-6 rounded-full border-2 border-amber-500/40 bg-amber-500/10 flex items-center justify-center">
        <Minus className="h-3.5 w-3.5 text-amber-500" />
      </div>
    </div>
  )
  return (
    <div className="flex justify-center">
      <div className="w-6 h-6 rounded-full border-2 border-red-500/30 bg-red-500/10 flex items-center justify-center">
        <X className="h-3 w-3 text-red-500" />
      </div>
    </div>
  )
}

function ComparisonSection() {
  const [hinted, setHinted] = useState<number | null>(null)

  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <SectionLabel>Blink Claw vs. self-hosting</SectionLabel>
          <h2 className="font-serif text-3xl md:text-5xl font-normal leading-tight">
            Why people stop self-hosting<br />
            <span className="italic">and switch to Blink Claw.</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto text-sm">
            Running OpenClaw yourself works — until it doesn't. Here's what that looks like.
          </p>
        </div>

        <div className="rounded-2xl border border-border/60 overflow-hidden bg-card">
          {/* Header */}
          <div className="grid grid-cols-[1fr_120px_100px_120px] border-b border-border/60 bg-muted/30">
            <div className="px-5 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-widest">Feature</div>
            <div className="px-3 py-4 text-center">
              <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">Blink Claw</span>
            </div>
            <div className="px-3 py-4 text-center text-xs font-medium text-muted-foreground">VPS</div>
            <div className="px-3 py-4 text-center text-xs font-medium text-muted-foreground">Local Machine</div>
          </div>

          {/* Rows */}
          {COMPARISON_ROWS.map((row, i) => (
            <div
              key={row.feature}
              className={cn(
                'grid grid-cols-[1fr_120px_100px_120px] border-b border-border/40 last:border-b-0 transition-colors cursor-default',
                hinted === i ? 'bg-muted/40' : 'hover:bg-muted/20',
              )}
              onMouseEnter={() => setHinted(i)}
              onMouseLeave={() => setHinted(null)}
            >
              <div className="px-5 py-4">
                <p className="text-sm font-medium leading-none mb-1">{row.feature}</p>
                {hinted === i && (
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1.5">{row.hint}</p>
                )}
              </div>
              <div className="px-3 py-4 flex items-center justify-center bg-primary/[0.03]">
                <Cell value={row.blink} />
              </div>
              <div className="px-3 py-4 flex items-center justify-center">
                <Cell value={row.vps} />
              </div>
              <div className="px-3 py-4 flex items-center justify-center">
                <Cell value={row.local} />
              </div>
            </div>
          ))}

          {/* Footer CTA */}
          <div className="px-5 py-4 bg-primary/5 border-t border-primary/10 flex items-center justify-between gap-4 flex-wrap">
            <p className="text-sm text-muted-foreground">
              <span className="text-foreground font-medium">Blink Claw</span> — the only option that just works.
            </p>
            <Link
              href="/account"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-foreground text-background text-xs font-medium hover:opacity-90 transition-opacity shrink-0"
            >
              Deploy free <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-5 justify-center mt-5 text-xs text-muted-foreground/60">
          {[
            { icon: Check, color: 'text-green-500', label: 'Fully supported' },
            { icon: Minus, color: 'text-amber-500', label: 'Partial / requires work' },
            { icon: X, color: 'text-red-400', label: 'Not available' },
          ].map(l => (
            <span key={l.label} className="flex items-center gap-1.5">
              <l.icon className={cn('h-3 w-3', l.color)} />
              {l.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── How it works ─────────────────────────────────────────────────────────────

const STEPS = [
  {
    n: '1',
    title: 'Name your agent',
    desc: 'Give it a name and describe its job in one sentence. "Follow up with leads", "Send weekly reports", "Monitor my inbox." That\'s all it needs.',
    icon: MousePointerClick,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    n: '2',
    title: 'Connect your tools',
    desc: 'Link Slack, Gmail, Google Calendar, or any app your agent should work with. Connect once — all your agents share the same connections.',
    icon: Zap,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
  {
    n: '3',
    title: 'Done. It runs forever.',
    desc: 'Your agent is live, working around the clock. Message it from Telegram, Discord, or Slack — or let it run quietly in the background on its own schedule.',
    icon: CheckCircle,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
  },
]

function HowItWorks() {
  return (
    <section className="py-20 px-6 bg-muted/20">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <SectionLabel>How it works</SectionLabel>
          <h2 className="font-serif text-3xl md:text-5xl font-normal leading-tight">
            From zero to your agent<br />
            <span className="italic">handling work in 60 seconds.</span>
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.n} className="relative">
              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-8 left-full w-6 -translate-x-3 border-t border-dashed border-border/50 z-10" />
              )}
              <div className="rounded-2xl border border-border/50 bg-card p-6 h-full">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-4', s.bg)}>
                  <s.icon className={cn('h-5 w-5', s.color)} />
                </div>
                <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-1">Step {s.n}</p>
                <h3 className="font-semibold text-base mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Why section ──────────────────────────────────────────────────────────────

const WHY_ITEMS = [
  {
    icon: Infinity,
    title: 'Unlimited agents',
    desc: 'One for emails. One for leads. One for research. One for reports. Each one specialized, each one always on. No cap on how many you run.',
    badge: 'As many as you need',
    badgeColor: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  },
  {
    icon: Clock,
    title: 'Works 24/7 while you sleep',
    desc: "It monitors your inbox at 3am, follows up on leads the moment they come in, and sends your weekly report every Friday — whether you're there or not.",
    badge: 'Always running',
    badgeColor: 'bg-green-500/10 text-green-600 dark:text-green-400',
  },
  {
    icon: MessageSquare,
    title: 'Lives where you are',
    desc: 'Telegram, Discord, Slack — apps already on your phone. Message your agent like a person. It responds. It acts. No new app to learn.',
    badge: 'Telegram · Discord · Slack',
    badgeColor: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
  },
  {
    icon: Brain,
    title: 'Remembers everything',
    desc: "Every conversation, every preference, every goal — carried across sessions. Your agent gets smarter and more useful the longer you work with it.",
    badge: 'Persistent memory',
    badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  },
  {
    icon: RefreshCw,
    title: 'Takes real action',
    desc: "This isn't a chatbot that gives suggestions. It sends messages, follows up with leads, pulls reports, and reacts to events on its own. It executes.",
    badge: 'Not just chat',
    badgeColor: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  },
  {
    icon: Lock,
    title: 'Secure by default',
    desc: 'Your agent has its own private space. Your data, conversations, and connected accounts are never visible to anyone else. Always protected.',
    badge: 'Private & protected',
    badgeColor: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
  },
]

function WhySection() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <SectionLabel>What makes it different</SectionLabel>
          <h2 className="font-serif text-3xl md:text-5xl font-normal leading-tight">
            Most platforms give you one agent<br />
            <span className="italic">to do everything. We don't.</span>
          </h2>
        </div>

        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))' }}>
          {WHY_ITEMS.map(f => (
            <div key={f.title} className="group rounded-2xl border border-border/50 bg-card p-6 hover:border-border transition-all hover:shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-4">
                <f.icon className="h-5 w-5 text-foreground/70" />
              </div>
              <h3 className="font-medium text-base mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{f.desc}</p>
              <span className={cn('inline-block text-[10px] font-medium px-2.5 py-1 rounded-full', f.badgeColor)}>
                {f.badge}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── 200+ Models / No API Keys ────────────────────────────────────────────────

const MODELS = [
  { name: 'Claude Opus 4.6', note: 'Anthropic', src: '/images/providers/anthropic.avif' },
  { name: 'GPT-5.4', note: 'OpenAI', src: '/images/providers/openai.avif' },
  { name: 'Gemini 3.1 Pro', note: 'Google', src: '/images/providers/google.avif' },
  { name: 'Grok 4.1', note: 'xAI', src: '/images/providers/xai.avif' },
  { name: 'Llama 4 Maverick', note: 'Meta', src: '/images/providers/meta.avif' },
  { name: 'Mistral Large 2', note: 'Mistral AI', src: '/images/providers/mistral.avif' },
  { name: 'DeepSeek V3.2', note: 'DeepSeek', src: '/images/providers/deepseek.avif' },
  { name: '+ 193 more', note: 'all included', src: null },
]

function ModelsSection() {
  return (
    <section className="py-20 px-6 bg-muted/20">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <SectionLabel>AI models</SectionLabel>
            <h2 className="font-serif text-3xl md:text-4xl font-normal leading-tight mb-5">
              200+ AI models.<br />
              <em>Zero accounts needed.</em>
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-8">
              Claude, GPT, Gemini and 200+ more are already included the moment you deploy.
              No separate subscriptions. No API key setup. No surprise bills.
              Switch between models any time with one click.
            </p>
            <div className="space-y-3">
              {[
                { icon: KeyRound, label: 'No API accounts to create or manage' },
                { icon: Zap, label: 'Switch models any time, instantly' },
                { icon: ShieldCheck, label: 'Store your own keys in the secure vault' },
              ].map(f => (
                <div key={f.label} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <f.icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  {f.label}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {MODELS.map(m => (
              <div key={m.name} className="rounded-xl px-4 py-3 flex items-center gap-3 border border-border/50 bg-card hover:bg-muted/30 transition-colors">
                {m.src ? (
                  <Image src={m.src} alt={m.note} width={28} height={28} className="rounded-full shrink-0" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0 text-[11px] font-bold text-muted-foreground">+</div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{m.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{m.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Use cases ────────────────────────────────────────────────────────────────

const USE_CASES = [
  {
    icon: Mail,
    title: 'Your inbox, handled',
    prompt: '"Scan my inbox at 6am. Flag anything urgent, draft replies for the routine ones, and send me a summary on Telegram. Handle what you can yourself."',
    accent: 'text-blue-500',
    border: 'border-blue-500/20 hover:border-blue-500/40',
    who: 'Founders & executives',
  },
  {
    icon: BarChart3,
    title: 'Weekly business reports',
    prompt: '"Every Friday at 5pm, pull this week\'s sales, tickets, and key metrics. Write a clear summary and send it to Slack before I finish work."',
    accent: 'text-green-500',
    border: 'border-green-500/20 hover:border-green-500/40',
    who: 'Business owners',
  },
  {
    icon: Users,
    title: 'Leads that never go cold',
    prompt: '"When a new lead signs up, research them, write a personalized follow-up, and send it within 10 minutes. If no reply in 3 days, send another from a different angle."',
    accent: 'text-orange-500',
    border: 'border-orange-500/20 hover:border-orange-500/40',
    who: 'Sales & marketing',
  },
  {
    icon: Calendar,
    title: 'Calendar optimizer',
    prompt: '"Every morning, review my schedule. If I have no breaks between meetings, block 30 minutes. Spot conflicts and flag them. Send me the updated plan on Telegram."',
    accent: 'text-sky-500',
    border: 'border-sky-500/20 hover:border-sky-500/40',
    who: 'Consultants & managers',
  },
  {
    icon: Globe,
    title: 'Market intelligence',
    prompt: '"Monitor my industry daily — news, competitor moves, trending topics. Send me a crisp digest every morning with the 5 things I actually need to know."',
    accent: 'text-violet-500',
    border: 'border-violet-500/20 hover:border-violet-500/40',
    who: 'Marketers & strategists',
  },
  {
    icon: TrendingUp,
    title: 'Social & content agent',
    prompt: '"Monitor engagement on my posts. Reply to comments. When I get 10+ likes, share the post in my Slack community. Track what performs best and report weekly."',
    accent: 'text-rose-500',
    border: 'border-rose-500/20 hover:border-rose-500/40',
    who: 'Content creators',
  },
]

function UseCases() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <SectionLabel>Use cases</SectionLabel>
          <h2 className="font-serif text-3xl md:text-5xl font-normal leading-tight">
            Here's what a team of agents<br />
            <span className="italic">actually looks like.</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-sm">
            Each agent is specialized. Each one focused on what it does best, running 24/7, without you lifting a finger.
          </p>
        </div>

        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))' }}>
          {USE_CASES.map(uc => (
            <div key={uc.title} className={cn('rounded-2xl border bg-card p-5 transition-all', uc.border)}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <uc.icon className={cn('h-4 w-4', uc.accent)} />
                </div>
                <span className="text-[10px] text-muted-foreground/60 font-medium">{uc.who}</span>
              </div>
              <h3 className="font-medium text-sm mb-2">{uc.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed italic">{uc.prompt}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Pricing ─────────────────────────────────────────────────────────────────

const TIERS = [
  {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 45,
    annualPrice: 22,
    tag: 'For most people',
    desc: 'Full-featured agent. Handles everything — browsing the web, reading documents, sending messages, running tasks in the background.',
    features: [
      'One always-on agent, 24/7',
      'Telegram, Discord, Slack',
      'Browses the web, reads files',
      '200+ AI models included',
      'Private & protected',
    ],
    recommended: true,
  },
  {
    id: 'standard',
    name: 'Standard',
    monthlyPrice: 90,
    annualPrice: 45,
    tag: 'For heavy workloads',
    desc: 'For agents with heavier jobs — processing large amounts of information, running all day without slowing down, or handling several things at once.',
    features: [
      'Everything in Starter',
      'Twice as powerful',
      'Handles bigger workloads',
      'Does several things at once',
      'Stays fast under pressure',
    ],
    recommended: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 180,
    annualPrice: 90,
    tag: 'For mission-critical agents',
    desc: "Your agent gets its own dedicated power — nothing shared, nothing slowing it down. For when you need the fastest, most reliable performance, every single time.",
    features: [
      'Everything in Standard',
      'Exclusive resources, nothing shared',
      'Fastest response times',
      'Built for business-critical tasks',
      'Always reliable, always fast',
    ],
    recommended: false,
  },
]

function Pricing() {
  return (
    <section id="pricing" className="py-20 px-6 bg-muted/20">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <SectionLabel>Simple pricing</SectionLabel>
          <h2 className="font-serif text-3xl md:text-5xl font-normal leading-tight">
            One agent or a hundred.<br />
            <span className="italic">You decide.</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-md mx-auto text-sm">
            Deploy one to start. Add more whenever you're ready. Annual billing shown.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {TIERS.map(t => (
            <div
              key={t.id}
              className={cn(
                'relative rounded-2xl border p-6 flex flex-col',
                t.recommended ? 'border-primary/40 bg-primary/5 shadow-xl shadow-primary/10' : 'border-border/60 bg-card',
              )}
            >
              {t.recommended && (
                <div className="absolute -top-3.5 left-0 right-0 flex justify-center">
                  <span className="px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold tracking-wide uppercase">Most popular</span>
                </div>
              )}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t.name}</p>
                  <span className="text-[10px] text-muted-foreground/60">{t.tag}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl text-muted-foreground line-through">${t.monthlyPrice}</span>
                  <span className="text-4xl font-bold">${t.annualPrice}</span>
                  <span className="text-sm text-muted-foreground">/mo</span>
                </div>
                <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">
                  Save ${(t.monthlyPrice - t.annualPrice) * 12}/year
                </p>
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{t.desc}</p>
              <ul className="space-y-2 flex-1 mb-6">
                {t.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/account"
                className={cn(
                  'flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all',
                  t.recommended ? 'bg-foreground text-background hover:opacity-90' : 'border border-border/60 hover:border-border hover:bg-muted/30',
                )}
              >
                Deploy this agent <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground/50 mt-6">
          Agents that are paused cost almost nothing. Unlimited agents — each one priced independently.
        </p>
      </div>
    </section>
  )
}

// ─── Integrations ─────────────────────────────────────────────────────────────

const INTEGRATIONS = [
  { name: 'Slack',        src: '/icons/slack.webp' },
  { name: 'Gmail',        src: '/icons/gmail.svg' },
  { name: 'Telegram',     src: '/icons/telegram.webp' },
  { name: 'Discord',      src: '/discord/Discord-Symbol-Blurple.svg' },
  { name: 'Notion',       src: '/icons/notion.svg' },
  { name: 'Google Drive', src: '/icons/google-drive.svg' },
  { name: 'Calendar',     src: '/icons/google-calendar.svg' },
  { name: 'HubSpot',      src: '/icons/hubspot.svg' },
  { name: 'GitHub',       src: '/github/github-logo-icon--light.svg' },
  { name: 'Salesforce',   src: '/icons/salesforce.svg' },
  { name: 'LinkedIn',     src: '/icons/linkedin.svg' },
  { name: 'Web + more',   src: null },
]

function Integrations() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <SectionLabel>Integrations</SectionLabel>
          <h2 className="font-serif text-3xl md:text-5xl font-normal leading-tight">
            Connects to everything<br />
            <span className="italic">you already use</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-sm">
            Connect your tools once at the workspace level. Every agent you deploy can use them — no re-authorizing, no extra setup.
          </p>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
          {INTEGRATIONS.map(i => (
            <div key={i.name} className="flex flex-col items-center gap-2.5 p-4 rounded-xl border border-border/40 bg-card hover:border-border hover:bg-muted/30 transition-all">
              <div className="w-7 h-7 flex items-center justify-center">
                {i.src ? (
                  <Image src={i.src} alt={i.name} width={28} height={28} className="object-contain" />
                ) : (
                  <Globe className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <span className="text-[10px] text-muted-foreground text-center leading-tight font-medium">{i.name}</span>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground/50 mt-5">And thousands more tools your agent can reach.</p>
      </div>
    </section>
  )
}

// ─── Story Use Cases ──────────────────────────────────────────────────────────

function useAnimLoop(seq: [number, number][]): number {
  const [phase, setPhase] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const idxRef = useRef(0)
  useEffect(() => {
    const run = () => {
      const [p, delay] = seq[idxRef.current % seq.length]
      setPhase(p)
      idxRef.current++
      timerRef.current = setTimeout(run, delay)
    }
    timerRef.current = setTimeout(run, 800)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [seq])
  return phase
}

// ── Story 1: Morning Briefing ─────────────────────────────────────────────────
const MB_SEQ: [number, number][] = [[1,900],[2,1300],[3,1400],[4,1300],[5,5000],[0,700]]

function MorningBriefingViz() {
  const p = useAnimLoop(MB_SEQ)
  return (
    <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden select-none">
      {/* Telegram-style header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#2AABEE]/10 border-b border-[#2AABEE]/20">
        <AgentAvatar src="/images/agents/jordan.webp" name="Jordan" size={32} online />
        <div>
          <p className="text-[12px] font-bold">Jordan</p>
          <p className="text-[10px] text-muted-foreground/60">via Telegram · sent 6:47 AM</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <PlatformIcon platform="telegram" size={14} />
          <span className="text-[10px] text-[#2AABEE] font-medium">Telegram</span>
        </div>
      </div>
      {/* Message bubbles build up */}
      <div className="p-4 space-y-2 min-h-[260px]">
        {p >= 1 && (
          <div className="bg-[#2AABEE]/10 rounded-2xl rounded-tl-sm px-4 py-3 text-[11px] space-y-3 max-w-[95%]">
            <p className="font-semibold text-foreground">Good morning! Here&apos;s your daily briefing.</p>
            {p >= 2 && (
              <div className="space-y-1 border-t border-border/30 pt-2.5">
                <p className="font-bold text-[10px] text-foreground/70 uppercase tracking-wide mb-1.5">📅 Today&apos;s schedule</p>
                {[
                  { time: '9:30 AM', event: 'Investor call — Sequoia (Series A)' },
                  { time: '2:00 PM', event: 'Product review with eng team' },
                  { time: '4:00 PM', event: '1:1 with Marcus (Head of Sales)' },
                ].map(e => (
                  <div key={e.time} className="flex items-start gap-2 text-[10px]">
                    <span className="text-muted-foreground/60 font-mono shrink-0 w-14">{e.time}</span>
                    <span className="text-foreground/80">{e.event}</span>
                  </div>
                ))}
              </div>
            )}
            {p >= 3 && (
              <div className="space-y-1 border-t border-border/30 pt-2.5">
                <p className="font-bold text-[10px] text-foreground/70 uppercase tracking-wide mb-1.5">📊 Last 24h metrics</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Revenue', val: '$4,820', delta: '↑ 18%', up: true },
                    { label: 'Signups', val: '12', delta: '↑ 4', up: true },
                    { label: 'Churn', val: '1', delta: '↓ 2', up: false },
                  ].map(m => (
                    <div key={m.label} className="rounded-lg bg-background/60 px-2 py-1.5 text-center">
                      <p className="text-[9px] text-muted-foreground/60">{m.label}</p>
                      <p className="text-[12px] font-bold">{m.val}</p>
                      <p className={cn('text-[9px] font-medium', m.up ? 'text-green-500' : 'text-red-400')}>{m.delta}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {p >= 4 && (
              <div className="border-t border-border/30 pt-2.5">
                <p className="font-bold text-[10px] text-foreground/70 uppercase tracking-wide mb-1.5">⚡ Needs your attention</p>
                {[
                  { label: 'Contract renewal from Acme Corp (due in 3 days)', urgent: true },
                  { label: 'Jessica Chen from Hyperloop.ai replied to your outreach' },
                  { label: 'Your competitor raised Series B — see press release' },
                ].map((n, i) => (
                  <div key={i} className={cn('flex items-start gap-2 text-[10px] mb-1', n.urgent ? 'text-amber-600 dark:text-amber-400' : 'text-foreground/70')}>
                    <span className="shrink-0 mt-px">{n.urgent ? '🔴' : '·'}</span>
                    {n.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {p < 1 && <div className="flex items-center justify-center h-32 text-[11px] text-muted-foreground/40">Jordan starts at 6:45 AM…</div>}
      </div>
      <div className="px-4 pb-3">
        <div className="flex items-center gap-2 bg-muted/40 rounded-2xl border border-border/50 px-3 py-2">
          <span className="flex-1 text-[11px] text-muted-foreground/30">Reply to Jordan…</span>
          <div className="w-6 h-6 rounded-xl bg-[#2AABEE]/20 flex items-center justify-center">
            <Send className="h-3 w-3 text-[#2AABEE]/60" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Story 2: SaaS Trial Activation ────────────────────────────────────────────
const SA_SEQ: [number, number][] = [[1,1000],[2,1100],[3,1500],[4,1200],[5,1600],[6,1000],[7,4500],[0,700]]

const TRIAL_USERS = [
  { name: 'Jessica Chen', email: 'jessica@hyperloop.ai', plan: 'free trial', ago: 'just now', highlight: true },
  { name: 'Tom Harris',   email: 'tom@buildthings.co',   plan: 'pro',        ago: '2h ago',  highlight: false },
  { name: 'Anna Müller',  email: 'anna@flowtools.de',    plan: 'starter',    ago: '1d ago',  highlight: false },
  { name: 'Ryan Park',    email: 'ryan@launchfast.io',   plan: 'pro',        ago: '3d ago',  highlight: false },
]

function SaaSActivationViz() {
  const p = useAnimLoop(SA_SEQ)
  const showRow    = p >= 1
  const t1State    = p === 2 ? 'calling' : p >= 3 ? 'done' : null
  const t2State    = p === 4 ? 'calling' : p >= 5 ? 'done' : null
  const showEmail  = p >= 5
  const showResult = p >= 7

  return (
    <div className="space-y-3 select-none">
      {/* Users table */}
      <div className="rounded-xl border border-border/60 bg-background overflow-hidden shadow-sm">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border/40 bg-muted/30">
          <Database className="h-3 w-3 text-muted-foreground" />
          <span className="text-[11px] font-semibold text-muted-foreground/80">users · live</span>
          <span className="ml-auto flex items-center gap-1 text-[10px] text-green-500 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />new signup
          </span>
        </div>
        <table className="w-full text-[10px]">
          <thead><tr className="bg-muted/20 border-b border-border/30">
            <th className="text-left px-3 py-1.5 font-semibold text-muted-foreground/60">Name</th>
            <th className="text-left px-2 py-1.5 font-semibold text-muted-foreground/60">Email</th>
            <th className="text-right px-3 py-1.5 font-semibold text-muted-foreground/60">Plan</th>
          </tr></thead>
          <tbody>
            {TRIAL_USERS.map((u, i) => (
              <tr key={i} className={cn('border-b border-border/20 last:border-b-0 transition-all duration-500',
                u.highlight && showRow ? 'bg-blue-500/5' : '',
                !showRow && i === 0 ? 'opacity-0' : ''
              )}>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <div className={cn('w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0', u.highlight ? 'bg-blue-500/20 text-blue-600' : 'bg-primary/10 text-primary')}>
                      {u.name[0]}
                    </div>
                    <span className="font-medium text-foreground/80">{u.name}</span>
                    {u.highlight && showRow && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold">NEW</span>}
                  </div>
                </td>
                <td className="px-2 py-2 text-muted-foreground/60">{u.email}</td>
                <td className="px-3 py-2 text-right">
                  <span className={cn('text-[9px] font-semibold px-1.5 py-0.5 rounded-full',
                    u.plan === 'free trial' ? 'bg-amber-500/10 text-amber-600' : 'bg-green-500/10 text-green-600'
                  )}>{u.plan}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Alex working */}
      {t1State && (
        <div className="rounded-xl border border-border/60 bg-background overflow-hidden shadow-sm">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border/40 bg-muted/30">
            <AgentAvatar src="/images/agents/alex.webp" name="Alex" size={18} online />
            <span className="text-[11px] font-semibold">Alex · Onboarding Agent</span>
            <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-600 dark:text-green-400 font-bold">running</span>
          </div>
          <div className="p-3 space-y-1.5">
            <ToolCallCard
              name="enrich_lead · jessica@hyperloop.ai"
              state={t1State as 'calling' | 'done'}
              preview={
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  {[
                    { k: 'Name', v: 'Jessica Chen' }, { k: 'Title', v: 'Head of Engineering' },
                    { k: 'Company', v: 'Hyperloop.ai' }, { k: 'Team size', v: '40–60 engineers' },
                    { k: 'Stack', v: 'TypeScript, React' }, { k: 'Signal', v: 'Hiring 3 devs now' },
                  ].map(r => (
                    <div key={r.k}><span className="text-muted-foreground/50">{r.k}: </span><span className="font-medium text-foreground/80">{r.v}</span></div>
                  ))}
                </div>
              }
            />
            {t2State && (
              <ToolCallCard
                name="compose_email · personalizing for Jessica…"
                state={t2State as 'calling' | 'done'}
                preview={showEmail ? (
                  <div className="text-[10px] space-y-1.5">
                    <p><span className="font-medium text-foreground/80">To:</span> jessica@hyperloop.ai</p>
                    <p><span className="font-medium text-foreground/80">Subject:</span> Welcome, Jessica — built for engineering teams like yours</p>
                    <p className="text-muted-foreground/60 border-t border-border/30 pt-1.5 leading-relaxed">Hi Jessica, welcome to Blink! I noticed Hyperloop.ai is scaling your engineering team fast — our internal tools builder is used by teams exactly your size. Would a 20-min demo this week work?</p>
                  </div>
                ) : undefined}
              />
            )}
            {showResult && (
              <div className="px-3 py-2.5 rounded-xl border border-green-500/30 bg-green-500/5">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold text-green-700 dark:text-green-400">Demo booked — 11 minutes after signup</p>
                    <p className="text-[10px] text-green-600/70 dark:text-green-500/70">Jessica replied: "Yes! Friday 3pm works."</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Story 3: Inbox Zero ────────────────────────────────────────────────────────
const IZ_SEQ: [number, number][] = [[1,1200],[2,1300],[3,1400],[4,1200],[5,1300],[6,4500],[0,700]]

const INBOX_EMAILS = [
  { from: 'Michael Torres', subj: 'Q3 contract renewal', preview: 'Hi, wanted to follow up on the...', tag: 'Replied', tagColor: 'bg-green-500/15 text-green-600 dark:text-green-400', phase: 2 },
  { from: 'Newsletter · ProductHunt', subj: "Today's top launches", preview: '🚀 14 new products launched...', tag: 'Archived', tagColor: 'bg-muted text-muted-foreground', phase: 2 },
  { from: 'Sarah Webb', subj: 'Agency partnership proposal', preview: 'We\'ve been following your work and...', tag: 'Replied', tagColor: 'bg-green-500/15 text-green-600 dark:text-green-400', phase: 3 },
  { from: 'LinkedIn', subj: '7 people viewed your profile', preview: 'See who\'s interested in you...', tag: 'Archived', tagColor: 'bg-muted text-muted-foreground', phase: 3 },
  { from: 'Ben Carter', subj: 'Urgent: server down?', preview: 'Hey, our integration stopped...', tag: 'Flagged', tagColor: 'bg-red-500/15 text-red-600 dark:text-red-400', phase: 4 },
  { from: 'Stripe', subj: 'Your monthly invoice', preview: '$4,200 charged to your card...', tag: 'Archived', tagColor: 'bg-muted text-muted-foreground', phase: 4 },
  { from: 'AppSumo', subj: 'Flash deal: 90% off tool', preview: 'Limited time offer ends...', tag: 'Archived', tagColor: 'bg-muted text-muted-foreground', phase: 5 },
]

function InboxZeroViz() {
  const p = useAnimLoop(IZ_SEQ)
  const unread = p === 0 ? 47 : p === 1 ? 47 : p === 2 ? 31 : p === 3 ? 18 : p === 4 ? 7 : p === 5 ? 2 : 0

  return (
    <div className="rounded-2xl border border-border/50 bg-background overflow-hidden shadow-sm select-none">
      {/* Gmail-style header */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border/40 bg-muted/20">
        <Image src="/icons/gmail.svg" alt="Gmail" width={18} height={18} className="shrink-0" />
        <span className="text-[11px] font-bold text-foreground/80">Inbox</span>
        <span className={cn('ml-1 text-[10px] font-bold px-2 py-0.5 rounded-full transition-all duration-500',
          unread === 0 ? 'bg-green-500/15 text-green-600 dark:text-green-400' : 'bg-primary/15 text-primary'
        )}>{unread === 0 ? '✓ Zero' : `${unread} unread`}</span>
        <div className="ml-auto flex items-center gap-2">
          <AgentAvatar src="/images/agents/maya.webp" name="Maya" size={20} online />
          <span className="text-[10px] text-muted-foreground/60">Maya working…</span>
        </div>
      </div>

      {/* Progress bar */}
      {p >= 2 && p < 6 && (
        <div className="h-0.5 bg-muted overflow-hidden">
          <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${((47 - unread) / 47) * 100}%` }} />
        </div>
      )}

      {/* Email rows */}
      <div className="divide-y divide-border/30">
        {INBOX_EMAILS.map((e, i) => (
          <div key={i} className={cn(
            'flex items-center gap-3 px-4 py-2.5 transition-all duration-500 text-[11px]',
            p >= e.phase ? 'opacity-60' : 'hover:bg-muted/20'
          )}>
            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-bold text-primary shrink-0">{e.from[0]}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className={cn('font-semibold truncate', p >= e.phase ? 'text-muted-foreground/60' : 'text-foreground/90')}>{e.from}</p>
                {p >= e.phase && <span className={cn('text-[9px] px-1.5 py-0.5 rounded-full font-semibold shrink-0', e.tagColor)}>{e.tag}</span>}
              </div>
              <p className="text-muted-foreground/50 truncate text-[10px]">{e.subj} — <span className="text-muted-foreground/30">{e.preview}</span></p>
            </div>
          </div>
        ))}
      </div>

      {/* Maya's summary */}
      {p >= 6 && (
        <div className="m-3 rounded-xl border border-border/50 bg-muted/20 p-3">
          <div className="flex items-center gap-2 mb-2">
            <AgentAvatar src="/images/agents/maya.webp" name="Maya" size={22} online />
            <p className="text-[11px] font-bold">Maya · Inbox summary</p>
          </div>
          <p className="text-[10px] text-muted-foreground/80 leading-relaxed">
            Cleared 47 emails. Replied to <strong>2 client messages</strong>, archived 8 newsletters. <strong>1 urgent</strong> item needs you: Ben Carter reports an integration issue. I&apos;ve flagged it and drafted a holding reply.
          </p>
        </div>
      )}
    </div>
  )
}

function BlinkAdvantage() {
  const stories = [
    {
      label: 'Morning Briefing',
      agent: { name: 'Jordan', src: '/images/agents/jordan.webp' },
      who: 'SaaS founders · Agency owners',
      headline: 'Wakes up at 6:45 AM. Prepares your day.',
      body: 'Before your alarm goes off, Jordan has already checked your calendar, pulled your overnight metrics, scanned industry news, and flagged what needs your attention. Delivered as a Telegram message before you open your laptop.',
      metric: '45 min saved every morning',
      viz: <MorningBriefingViz />,
    },
    {
      label: 'Trial Activation',
      agent: { name: 'Alex', src: '/images/agents/alex.webp' },
      who: 'SaaS founders · Prosumer developers',
      headline: 'New signup → demo booked in 11 minutes.',
      body: 'The moment someone signs up for a trial, Alex looks them up — LinkedIn, company size, tech stack, recent signals. Then writes a personalized email that references their actual situation. Not a template. A message that feels like you wrote it yourself.',
      metric: '3× trial-to-demo conversion',
      viz: <SaaSActivationViz />,
    },
    {
      label: 'Inbox Zero',
      agent: { name: 'Maya', src: '/images/agents/maya.webp' },
      who: 'Agency owners · Founders · Consultants',
      headline: 'Opens your laptop to zero unread.',
      body: 'Every morning, Maya processes your inbox before you get to it. Client emails get drafted replies. Newsletters get archived. Urgent items get flagged with a note. You open to a clean inbox and a brief summary of the 2 things that need you.',
      metric: '47 emails → 0 in one session',
      viz: <InboxZeroViz />,
    },
  ]

  return (
    <section className="py-20 px-6 bg-muted/20">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <SectionLabel>Real scenarios, running 24/7</SectionLabel>
          <h2 className="font-serif text-3xl md:text-5xl font-normal leading-tight">
            Your agents run<br />
            <span className="italic">your entire business.</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto text-sm">
            Each agent has one job. It knows it inside out. It never misses, never sleeps, never asks to be managed.
          </p>
        </div>

        <div className="space-y-8">
          {stories.map((s, i) => (
            <div key={s.label} className="rounded-2xl border border-border/50 bg-card overflow-hidden">
              <div className={cn('grid md:grid-cols-2 gap-0', i % 2 === 1 && 'md:[&>*:first-child]:order-2')}>
                {/* Copy */}
                <div className="p-8 flex flex-col justify-center border-b md:border-b-0 md:border-r border-border/40">
                  <div className="flex items-center gap-3 mb-5">
                    <AgentAvatar src={s.agent.src} name={s.agent.name} size={40} online />
                    <div>
                      <p className="font-bold text-sm">{s.agent.name}</p>
                      <p className="text-[10px] text-muted-foreground/60">{s.who}</p>
                    </div>
                  </div>
                  <h3 className="font-serif text-2xl md:text-3xl font-normal leading-snug mb-3">
                    {s.headline}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">{s.body}</p>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                      <TrendingUp className="h-3.5 w-3.5 text-green-500 shrink-0" />
                      <span className="text-xs font-semibold text-green-700 dark:text-green-400">{s.metric}</span>
                    </div>
                  </div>
                  <Link href="/account" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity w-fit">
                    Get {s.agent.name} <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                {/* Visualization */}
                <div className="p-5 bg-muted/10 overflow-hidden flex flex-col justify-center">
                  {s.viz}
                </div>
              </div>
            </div>
          ))}
        </div>

      
      </div>
    </section>
  )
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: 'Do I need to know anything technical to use this?',
    a: "Not at all. If you can write a text message, you can deploy an agent. Just describe what you want it to do — Blink sets everything up for you. No servers, no coding, no technical knowledge required.",
  },
  {
    q: 'What is an AI agent and how is it different from ChatGPT?',
    a: 'ChatGPT waits for you to ask something and then answers. An agent works for you proactively — without you being there. It monitors your inbox, follows up on leads, sends reports, reacts to things as they happen, and keeps going 24 hours a day. Think of it as a tireless team member who never needs a break.',
  },
  {
    q: 'What does "200+ AI models included" actually mean?',
    a: "It means your agent has access to the world's best AI — Claude, GPT, Gemini, Grok, Llama, and 200+ more — already included, no extra accounts needed. You don't pay separately for each model. Switch between them anytime.",
  },
  {
    q: 'I already have AI API keys. Can I use them?',
    a: "Yes. Your agent has a secure vault where you can store any API keys or credentials you already have. They're kept private and your agent can access them securely. You stay in full control.",
  },
  {
    q: 'How does "one click" work?',
    a: "Name your agent, describe its job in plain English, and click deploy. That's it. It's running within 60 seconds. Then you connect it to Telegram, Discord, or Slack — and it's ready to go.",
  },
  {
    q: 'Can I really run as many agents as I want?',
    a: "Yes — unlimited. Deploy one for emails, one for sales follow-ups, one for weekly reports, one for research. Each one works independently. There's no cap.",
  },
  {
    q: 'How do I talk to my agent?',
    a: "Through Telegram, Discord, or Slack — apps already on your phone. Message it like you'd message a person. It responds, takes action, and can reach out to you first when something important happens.",
  },
  {
    q: 'Is my information safe?',
    a: "Yes. Your agent has its own completely private space — none of your data, conversations, or connected accounts are ever visible to anyone else. Everything is protected and you're in full control of what your agent can access.",
  },
  {
    q: 'What if I want to stop an agent?',
    a: "One click to pause. Your agent stops, your data is saved. Resume it anytime and it picks up exactly where it left off. Delete it completely whenever you want.",
  },
]

function FAQ() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <section className="py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-5xl font-normal">Questions &<br /><span className="italic">answers</span></h2>
        </div>
        <div className="divide-y divide-border/50">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i}>
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-start justify-between py-5 text-left gap-4 cursor-pointer group">
                <span className="text-sm font-medium group-hover:text-foreground transition-colors leading-snug">{item.q}</span>
                <span className="shrink-0 text-muted-foreground mt-0.5">
                  {open === i ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </span>
              </button>
              {open === i && <p className="text-sm text-muted-foreground leading-relaxed pb-5">{item.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Final CTA ────────────────────────────────────────────────────────────────

function FinalCTA() {
  return (
    <section className="py-20 px-6 bg-muted/20">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="font-serif text-4xl md:text-6xl font-normal leading-tight mb-4">
          Your agents are waiting.<br />
          <span className="italic">Tell them what to do.</span>
        </h2>
        <p className="text-muted-foreground mb-10 text-lg max-w-xl mx-auto">
          No Mac Mini. No API keys. No config files. Describe what you need, and your agent handles it — day and night.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/account" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-foreground text-background text-base font-medium hover:opacity-90 transition-opacity">
            Get my first agent
            <ArrowRight className="h-5 w-5" />
          </Link>
          <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            See pricing →
          </a>
        </div>
        <p className="text-xs text-muted-foreground/50 mt-6">No credit card for free accounts · Cancel anytime</p>
      </div>
    </section>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function ClawLandingContent() {
  return (
    <main className="min-h-screen">
      <Hero />
      <HowItWorks />
      <WhySection />
      <ModelsSection />
      <UseCases />
      <ComparisonSection />
      <Integrations />
      <Pricing />
      <BlinkAdvantage />
      <FAQ />
      <FinalCTA />
    </main>
  )
}
