'use client'

import { useState } from 'react'
import { Plus, X, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PlatformIcon, type Platform } from './PlatformIcon'

interface ConnectedChannel { platform: Platform; status: string }

const PLATFORM_META: Record<Platform, { label: string; color: string; bg: string; activeBg: string }> = {
  telegram:  { label: 'Telegram',  color: 'text-blue-600 dark:text-blue-400',      bg: 'bg-blue-500/8 border-blue-500/20  hover:bg-blue-500/15',  activeBg: 'bg-blue-500/10 border-blue-500/25' },
  whatsapp:  { label: 'WhatsApp',  color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/8 border-emerald-500/20 hover:bg-emerald-500/15', activeBg: 'bg-emerald-500/10 border-emerald-500/25' },
  discord:   { label: 'Discord',   color: 'text-indigo-600 dark:text-indigo-400',  bg: 'bg-indigo-500/8 border-indigo-500/20 hover:bg-indigo-500/15',  activeBg: 'bg-indigo-500/10 border-indigo-500/25' },
  slack:     { label: 'Slack',     color: 'text-green-700 dark:text-green-400',    bg: 'bg-green-500/8 border-green-500/20 hover:bg-green-500/15',   activeBg: 'bg-green-500/10 border-green-500/25' },
}

const ALL_PLATFORMS: Platform[] = ['telegram', 'whatsapp', 'discord', 'slack']

interface AgentChannelsBarProps {
  messaging: ConnectedChannel[]
  onConnect: (platform: Platform) => void
}

export function AgentChannelsBar({ messaging, onConnect }: AgentChannelsBarProps) {
  const [dismissed, setDismissed] = useState(false)
  const connected = messaging.filter(m => m.status === 'active')
  const unconnected = ALL_PLATFORMS.filter(p => !connected.find(c => c.platform === p))

  if (dismissed) {
    return (
      <div className="px-4 py-1.5 flex justify-center">
        <button
          onClick={() => setDismissed(false)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors cursor-pointer"
        >
          <MessageCircle className="h-3 w-3" />
          Connect messaging channels
        </button>
      </div>
    )
  }

  // ── Has connected channels ──────────────────────────────────────────────────
  if (connected.length > 0) {
    return (
      <div className="px-3 py-2 flex items-center gap-1.5 flex-wrap justify-center">
        <span className="text-xs text-muted-foreground shrink-0">Continue on</span>

        {/* Connected — labelled pills */}
        {connected.map(c => {
          const m = PLATFORM_META[c.platform]
          if (!m) return null
          return (
            <span key={c.platform} className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium',
              m.activeBg, m.color,
            )}>
              <PlatformIcon platform={c.platform} size={13} />
              {m.label}
            </span>
          )
        })}

        {/* Unconnected — icon-only add buttons */}
        {unconnected.map(p => {
          const m = PLATFORM_META[p]
          if (!m) return null
          return (
            <button
              key={p}
              onClick={() => onConnect(p)}
              title={`Connect ${m.label}`}
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-full border border-dashed text-muted-foreground transition-all cursor-pointer',
                'hover:border-solid hover:text-foreground',
              )}
            >
              <Plus className="h-2.5 w-2.5 shrink-0" />
              <PlatformIcon platform={p} size={13} />
            </button>
          )
        })}

        <button
          onClick={() => setDismissed(true)}
          className="ml-0.5 text-muted-foreground/40 hover:text-muted-foreground transition-colors cursor-pointer shrink-0"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  // ── None connected — mobile-first grid layout ───────────────────────────────
  return (
    <div className="px-3 py-2.5">
      <div className="rounded-2xl border border-border/50 bg-muted/30 p-2.5">
        {/* Header row */}
        <div className="flex items-center justify-between mb-2 px-0.5">
          <span className="text-xs text-muted-foreground font-medium">
            Chat from an app you already use
          </span>
          <button
            onClick={() => setDismissed(true)}
            className="text-muted-foreground/40 hover:text-muted-foreground transition-colors cursor-pointer shrink-0 ml-2 -mr-0.5"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* 2×2 grid on mobile → 1×4 row on sm+ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {ALL_PLATFORMS.map(p => {
            const m = PLATFORM_META[p]
            return (
              <button
                key={p}
                onClick={() => onConnect(p)}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-xl border py-2.5 px-3',
                  'text-xs font-medium transition-all cursor-pointer active:scale-[0.97]',
                  m.color, m.bg,
                )}
              >
                <PlatformIcon platform={p} size={15} />
                <span>{m.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
