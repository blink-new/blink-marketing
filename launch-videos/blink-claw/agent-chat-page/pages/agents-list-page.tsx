'use client'

import { useEffect, useState, useCallback, useRef, useMemo, Suspense } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import {
  Bot, Plus, Loader2, MessageCircle, Pause, Play, Trash2, MoreHorizontal,
  RefreshCw, Pencil, Check, X, AlertTriangle, Zap, ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import { DeployAgentModal } from '@/components/claw/DeployAgentModal'
import { DeleteAgentModal } from '@/components/claw/DeleteAgentModal'
import { PlatformIcon } from '@/components/claw/PlatformIcon'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import toast from 'react-hot-toast'
import { AGENT_TEMPLATES } from '@/lib/claw/templates'
import { useAuth } from '@/contexts/AuthContext'
import { useElectricShape } from '@/lib/electric/use-electric-shape'

interface Agent {
  id: string
  name: string
  model: string
  machine_size: string
  status: string
  avatar_url: string | null
  messaging: Array<{ platform: string; status: string }>
}

interface ClawAgentLiveRow {
  id: string
  status: string
  updated_at: string
}

const STATUS_DOT: Record<string, string> = {
  running: 'bg-green-500',
  paused: 'bg-yellow-400',
  grace: 'bg-red-400',
  provisioning: 'bg-blue-400 animate-pulse',
  deleted: 'bg-muted-foreground/30',
}

const STATUS_PILL: Record<string, string> = {
  running: 'bg-green-500/10 text-green-600 dark:text-green-400',
  paused: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  grace: 'bg-red-500/10 text-red-500',
  provisioning: 'bg-blue-500/10 text-blue-500',
}

const CREDITS: Record<string, number> = {
  starter: 180, standard: 360, pro: 720,
}

// ── Skeletons ─────────────────────────────────────────────────────────────────

function AgentCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
      <div className="flex items-start gap-3">
        <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2 min-w-0 pt-0.5">
          <Skeleton className="h-4 w-2/5" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="h-6 w-6 rounded-md shrink-0" />
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-border/40">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    </div>
  )
}

function ClawPageSkeleton() {
  return (
    <div className="flex-1 flex flex-col min-h-0 p-6 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-8 w-36 rounded-lg" />
      </div>
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))' }}>
        {Array.from({ length: 3 }).map((_, i) => <AgentCardSkeleton key={i} />)}
      </div>
    </div>
  )
}

// ── Overflow menu item ────────────────────────────────────────────────────────
function MenuItem({
  icon: Icon, label, onClick, destructive = false, disabled = false,
}: {
  icon: React.ElementType; label: string; onClick: () => void
  destructive?: boolean; disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors cursor-pointer text-left',
        destructive
          ? 'text-destructive hover:bg-destructive/10'
          : 'text-foreground hover:bg-muted/60',
        disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {label}
    </button>
  )
}

function MenuDivider() {
  return <div className="mx-2 my-0.5 border-t border-border/50" />
}

// ── Agent card ────────────────────────────────────────────────────────────────
function AgentCard({ agent, workspace, onRefresh, token }: {
  agent: Agent; workspace: string; onRefresh: () => void; token: string | null
}) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [actioning, setActioning] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(agent.name)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const renameRef = useRef<HTMLInputElement>(null)
  const dot = STATUS_DOT[agent.status] ?? 'bg-muted-foreground/40'
  const pill = STATUS_PILL[agent.status] ?? 'bg-muted/60 text-muted-foreground'

  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  useEffect(() => {
    if (renaming) renameRef.current?.select()
  }, [renaming])

  const doAction = async (action: 'pause' | 'resume' | 'restart') => {
    setMenuOpen(false)
    setActioning(true)
    const res = await fetch(`/api/claw/agents/${agent.id}/${action}`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}` },
    })
    setActioning(false)
    if (!res.ok) { toast.error(`Failed to ${action} agent`); return }
    toast.success({ pause: 'Agent paused', resume: 'Agent resumed', restart: 'Agent restarting…' }[action])
    onRefresh()
  }

  const doRename = async () => {
    const trimmed = renameValue.trim()
    if (!trimmed || trimmed === agent.name) { setRenaming(false); return }
    const res = await fetch(`/api/claw/agents/${agent.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: trimmed }),
    })
    if (!res.ok) { toast.error('Rename failed'); return }
    toast.success('Renamed')
    setRenaming(false)
    onRefresh()
  }

  const canPause = agent.status === 'running'
  const canResume = ['paused', 'grace'].includes(agent.status)
  const canRestart = agent.status === 'running'

  return (
    <div className="group rounded-xl border border-border/60 bg-card hover:border-border hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Grace banner */}
      {agent.status === 'grace' && (
        <div className="px-4 pt-3">
          <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertTriangle className="h-3 w-3 shrink-0" />
            Insufficient credits — data deleted in 30 days if not resumed.
          </div>
        </div>
      )}

      {/* Main card body */}
      <Link href={`/${workspace}/claw/${agent.id}`} className="block p-4">
        <div className="flex items-start gap-3">
          {/* Avatar + live status dot */}
          <div className="relative shrink-0">
            {agent.avatar_url ? (
              <Image
                src={agent.avatar_url}
                alt={agent.name}
                width={40}
                height={40}
                className="rounded-xl object-cover w-10 h-10"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-muted/80 to-muted flex items-center justify-center text-sm font-semibold text-muted-foreground select-none">
                {agent.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className={cn('absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background', dot)} />
          </div>

          {/* Name + model */}
          <div className="flex-1 min-w-0 pt-0.5">
            {renaming ? (
              <div onClick={e => e.preventDefault()} className="flex items-center gap-1">
                <input
                  ref={renameRef}
                  value={renameValue}
                  onChange={e => setRenameValue(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') doRename()
                    if (e.key === 'Escape') { setRenaming(false); setRenameValue(agent.name) }
                  }}
                  className="flex-1 text-sm font-semibold bg-transparent border-b border-foreground/40 focus:outline-none focus:border-foreground px-0 min-w-0"
                />
                <button onClick={doRename} className="p-0.5 text-green-500 hover:text-green-600 cursor-pointer shrink-0">
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => { setRenaming(false); setRenameValue(agent.name) }} className="p-0.5 text-muted-foreground hover:text-foreground cursor-pointer shrink-0">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <p className="font-semibold text-sm truncate leading-tight">{agent.name}</p>
            )}
            <p className="text-xs text-muted-foreground/70 mt-1 truncate">
              {agent.model.split('/').pop()}
            </p>
          </div>

          {/* Overflow menu — only visible on hover */}
          <div
            className={cn('shrink-0 transition-opacity duration-150', menuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100')}
            onClick={e => e.preventDefault()}
            ref={menuRef}
          >
            <button
              onClick={e => { e.preventDefault(); setMenuOpen(v => !v) }}
              className={cn(
                'p-1 rounded-md transition-colors cursor-pointer',
                menuOpen ? 'bg-muted text-foreground' : 'text-muted-foreground/70 hover:text-foreground hover:bg-muted/60',
              )}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-4 mt-1.5 z-50 w-52 bg-popover border border-border rounded-xl shadow-lg py-1 overflow-hidden">
                <MenuItem icon={MessageCircle} label="Open agent" onClick={() => { setMenuOpen(false); router.push(`/${workspace}/claw/${agent.id}`) }} />
                <MenuDivider />
                <MenuItem icon={Pencil} label="Rename" onClick={() => { setMenuOpen(false); setRenaming(true) }} />
                <MenuDivider />
                {canPause && <MenuItem icon={Pause} label="Pause agent" onClick={() => doAction('pause')} />}
                {canResume && <MenuItem icon={Play} label="Resume agent" onClick={() => doAction('resume')} />}
                {canRestart && <MenuItem icon={RefreshCw} label="Restart agent" onClick={() => doAction('restart')} />}
                <MenuDivider />
                <MenuItem icon={Trash2} label="Delete agent" onClick={() => { setMenuOpen(false); setDeleteOpen(true) }} destructive />
              </div>
            )}
          </div>
        </div>

        {/* Footer row: credits + platform icons + status pill */}
        <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-border/40">
          <p className="text-[11px] text-muted-foreground/60 tabular-nums">
            {CREDITS[agent.machine_size] ?? '?'} cr/mo · {agent.machine_size}
          </p>

          <div className="flex items-center gap-2">
            {/* Platform icons */}
            {agent.messaging.length > 0 && (
              <div className="flex items-center gap-1.5">
                {agent.messaging.slice(0, 3).map(m =>
                  ['telegram', 'discord', 'slack', 'whatsapp'].includes(m.platform) ? (
                    <Tooltip key={m.platform}>
                      <TooltipTrigger asChild>
                        <span className="flex items-center justify-center w-4 h-4 opacity-70">
                          <PlatformIcon platform={m.platform as 'telegram' | 'discord' | 'slack'} size={14} />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="capitalize">{m.platform}</TooltipContent>
                    </Tooltip>
                  ) : null
                )}
              </div>
            )}

            {/* Status pill */}
            <span className={cn('inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium capitalize', pill)}>
              {actioning ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : agent.status}
            </span>
          </div>
        </div>
      </Link>

      <DeleteAgentModal
        open={deleteOpen}
        agent={agent}
        onClose={() => setDeleteOpen(false)}
        onDeleted={onRefresh}
      />
    </div>
  )
}


function ClawEmptyState({ onDeploy, disabled }: { onDeploy: (name: string, desc: string, avatar?: string) => void; disabled: boolean }) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex flex-col items-center text-center px-6 py-16 gap-10 max-w-3xl mx-auto w-full">

        {/* Live badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/50 bg-muted/40 text-xs font-medium text-muted-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shrink-0" />
          Blink Claw 🦞
        </div>

        {/* Hero copy */}
        <div className="space-y-4">
          <h2 className="text-4xl font-semibold tracking-tight">Your agents are waiting.</h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
            Deploy AI agents that work for you 24/7 — answering emails, following up on leads, sending reports. No setup. No servers.
          </p>
        </div>

        {/* Primary CTA */}
        <Button
          disabled={disabled}
          onClick={() => onDeploy('', '', undefined)}
          size="lg"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Deploy your first agent
        </Button>

        {/* Template grid */}
        <div className="w-full space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
            Start from a template
          </p>
          <div className="grid gap-2 text-left" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))' }}>
            {AGENT_TEMPLATES.map(t => (
              <button
                key={t.id}
                onClick={() => onDeploy(t.name, t.description, t.avatar)}
                disabled={disabled}
                className="group flex items-center gap-3 px-3.5 py-3 rounded-xl border border-border/60 bg-card hover:border-border hover:bg-muted/20 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 bg-muted">
                  <Image src={t.avatar} alt={t.name} width={36} height={36} className="object-cover w-full h-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-1.5">
                    <p className="text-sm font-medium leading-none truncate">{t.name}</p>
                    <span className="text-[10px] text-muted-foreground/50 shrink-0">{t.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground/70 mt-1 leading-snug line-clamp-1">{t.tagline}</p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/20 group-hover:text-muted-foreground/50 shrink-0 transition-colors" />
              </button>
            ))}
          </div>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pb-4">
          {[
            { icon: Zap,   label: '200+ AI models included' },
            { icon: Clock, label: 'Always on, 24/7' },
            { icon: Bot,   label: 'No setup required' },
          ].map(f => (
            <div key={f.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/50 text-xs text-muted-foreground/60">
              <f.icon className="h-3 w-3 shrink-0" />
              {f.label}
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

function ClawAgentsContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const workspace = params.workspace as string
  const { token } = useAuth()

  const { workspace: workspaceData } = useWorkspace()
  const workspaceId = workspaceData?.id ?? ''
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [deployOpen, setDeployOpen] = useState(false)
  const [prefillName, setPrefillName] = useState<string | undefined>()
  const [prefillDesc, setPrefillDesc] = useState<string | undefined>()
  const [prefillAvatar, setPrefillAvatar] = useState<string | undefined>()
  // Only show the skeleton on the very first load — token refreshes should be silent
  const loadedOnceRef = useRef(false)
  const safeWorkspaceId = workspaceId && /^wsp_[a-z0-9]+$/.test(workspaceId) ? workspaceId : null
  const { data: liveRows } = useElectricShape({
    table: 'claw_agents',
    where: safeWorkspaceId ? `"workspace_id" = '${safeWorkspaceId}' AND "status" != 'deleted'` : undefined,
    enabled: !!safeWorkspaceId,
  })
  const liveSignature = useMemo(
    () => JSON.stringify(
      [...liveRows]
        .map(row => row as unknown as ClawAgentLiveRow)
        .sort((a, b) => a.id.localeCompare(b.id))
        .map(row => ({ id: row.id, status: row.status, updated_at: row.updated_at })),
    ),
    [liveRows],
  )

  const fetchAgents = useCallback(async () => {
    if (!token || !workspaceId) {
      if (!loadedOnceRef.current) setLoading(false)
      return
    }
    if (!loadedOnceRef.current) setLoading(true)
    const res = await fetch(`/api/claw/agents?workspaceId=${workspaceId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) { const d = await res.json(); setAgents(d) } else { setFetchError(true) }
    loadedOnceRef.current = true
    setLoading(false)
  }, [token, workspaceId])

  useEffect(() => { fetchAgents() }, [fetchAgents])

  useEffect(() => {
    if (!loadedOnceRef.current) return
    fetchAgents()
  }, [liveSignature, fetchAgents])

  useEffect(() => {
    if (searchParams.get('deploy') === '1') setDeployOpen(true)
  }, [searchParams])

  const running = agents.filter(a => a.status === 'running').length
  const totalCredits = agents.reduce((sum, a) => sum + (a.status === 'running' ? (CREDITS[a.machine_size] ?? 0) : 0), 0)

  return (
    <div className="flex-1 flex flex-col min-h-0 p-4 sm:p-6 w-full">
      <div className="flex items-center justify-between mb-4 sm:mb-6 gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Blink Claw 🦞</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">
            {running > 0 ? `${running} running · ${totalCredits} credits/mo` : 'Always-on AI agents, working 24/7.'}
          </p>
        </div>
        <Button onClick={() => { setPrefillName(undefined); setPrefillDesc(undefined); setPrefillAvatar(undefined); setDeployOpen(true) }} size="sm" disabled={!workspaceId} className="shrink-0">
          <Plus className="h-4 w-4 mr-1.5" />
          <span className="hidden sm:inline">Deploy New Agent</span>
          <span className="sm:hidden">Deploy</span>
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))' }}>
          {Array.from({ length: 3 }).map((_, i) => <AgentCardSkeleton key={i} />)}
        </div>
      ) : fetchError ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <p className="text-sm text-muted-foreground">Failed to load agents.</p>
          <Button size="sm" variant="outline" onClick={() => { setFetchError(false); fetchAgents() }}>
            Try again
          </Button>
        </div>
      ) : agents.length === 0 ? (
        <ClawEmptyState onDeploy={(name, desc, avatar) => {
          setPrefillName(name)
          setPrefillDesc(desc)
          setPrefillAvatar(avatar)
          setDeployOpen(true)
        }} disabled={!workspaceId} />
      ) : (
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))' }}>
          {agents.map(agent => (
            <AgentCard key={agent.id} agent={agent} workspace={workspace} onRefresh={fetchAgents} token={token} />
          ))}
        </div>
      )}

      {workspaceId && (
        <DeployAgentModal
          open={deployOpen}
          onClose={() => { setDeployOpen(false); setPrefillName(undefined); setPrefillDesc(undefined); setPrefillAvatar(undefined); fetchAgents() }}
          workspaceId={workspaceId}
          tier={workspaceData?.tier}
          prefillName={prefillName ?? (searchParams.get('name') ?? undefined)}
          prefillDescription={prefillDesc ?? (searchParams.get('description') ?? undefined)}
          prefillAvatarUrl={prefillAvatar}
          prefillModel={searchParams.get('model') ?? undefined}
        />
      )}
    </div>
  )
}

export default function ClawAgentsPage() {
  return (
    <Suspense fallback={<ClawPageSkeleton />}>
      <ClawAgentsContent />
    </Suspense>
  )
}
