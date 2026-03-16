'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Loader2, MessageSquare, Wrench } from 'lucide-react'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import { AgentChatPanel } from '@/components/claw/AgentChatPanel'
import { AgentRightPanel } from '@/components/claw/AgentRightPanel'
import { AgentAvatar } from '@/components/claw/AgentAvatar'
import { DeleteAgentModal } from '@/components/claw/DeleteAgentModal'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { ChannelSetupWizard, type Platform } from '@/components/claw/ChannelSetupWizard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useClawAgentStatus } from '@/hooks/useClawAgentStatus'
import { useMobile } from '@/hooks/useMobile'

interface AgentData {
  id: string
  name: string
  model: string
  machine_size: string
  status: string
  fly_app_name: string | null
  avatar_url: string | null
  messaging: Array<{ platform: string; status: string }>
}

const STATUS_DOT: Record<string, string> = {
  running: 'bg-green-500',
  paused: 'bg-yellow-500',
  grace: 'bg-red-500',
  provisioning: 'bg-blue-500 animate-pulse',
  deleted: 'bg-muted',
}

// ─── Mobile tab button — same pattern as ChatLayout ───────────────────────────
function MobileTabButton({ active, onClick, icon, label }: {
  active: boolean; onClick: () => void; icon: React.ReactNode; label: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center gap-0.5 min-w-[64px] min-h-[44px] py-1.5 px-3 rounded-lg transition-all duration-200 cursor-pointer',
        active ? 'text-foreground' : 'text-muted-foreground active:text-foreground/80',
      )}
    >
      <div className="relative">
        {icon}
        {active && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-foreground" />
        )}
      </div>
      <span className={cn('text-[10px] leading-tight mt-0.5', active ? 'font-semibold' : 'font-medium')}>
        {label}
      </span>
    </button>
  )
}

function AgentDetailContent() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { token, isLoading: authLoading } = useAuth()
  const { isMobile } = useMobile()
  const agentId = params.agentId as string
  const workspace = params.workspace as string
  const connectPlatform = searchParams.get('connect') as Platform | null
  const initialMessage = searchParams.get('init') ?? undefined

  const [agent, setAgent] = useState<AgentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteOpen, setDeleteOpen] = useState(false)
  // Mobile: 'chat' shows the chat panel, 'manage' shows Files/Secrets/Settings
  const [mobileView, setMobileView] = useState<'chat' | 'manage'>('chat')

  const fetchAgent = useCallback(async () => {
    if (authLoading) return
    if (!token) { setLoading(false); return }
    const res = await fetch(`/api/claw/agents/${agentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) { setAgent(null); setLoading(false); return }
    setAgent(await res.json())
    setLoading(false)
  }, [agentId, token, authLoading])

  useEffect(() => { fetchAgent() }, [fetchAgent])

  // Auto-collapse sidebar when entering the agent chat — same mechanism as chat
  // input focus on the home page (blnk:sidebar-collapse → AppLayout collapses).
  // Not locked: user can re-open the sidebar manually.
  useEffect(() => {
    window.dispatchEvent(new Event('blnk:sidebar-collapse'))
  }, [])

  const { status: liveStatus } = useClawAgentStatus(agent ? agentId : null)
  useEffect(() => {
    if (!liveStatus || !agent) return
    if (liveStatus !== agent.status) fetchAgent()
  }, [liveStatus, agent, fetchAgent])

  const handleDelete = useCallback(() => setDeleteOpen(true), [])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <p className="text-muted-foreground">Agent not found.</p>
        <Button asChild variant="outline" size="sm">
          <Link href={`/${workspace}/claw`}><ArrowLeft className="h-4 w-4 mr-1.5" />Back to Agents</Link>
        </Button>
      </div>
    )
  }

  const dot = STATUS_DOT[agent.status] ?? 'bg-muted'

  // ─── Shared header ───────────────────────────────────────────────────────────
  const header = (
    <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border/50 shrink-0">
      <Link href={`/${workspace}/claw`} className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
        <ArrowLeft className="h-4 w-4" />
      </Link>
      <AgentAvatar avatarUrl={agent.avatar_url} agentName={agent.name} className="h-6 w-6 text-[9px]" />
      <h1 className="font-medium text-sm truncate min-w-0">{agent.name}</h1>
      <div className="flex items-center gap-1.5 shrink-0">
        <div className={cn('w-1.5 h-1.5 rounded-full shrink-0', dot)} />
        <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 font-normal capitalize">
          {agent.status}
        </Badge>
      </div>
      <span className="text-xs text-muted-foreground hidden sm:block shrink-0">
        {agent.model.split('/').pop()}
      </span>
    </div>
  )

  // ─── Shared modals ───────────────────────────────────────────────────────────
  const modals = (
    <>
      <DeleteAgentModal
        open={deleteOpen}
        agent={agent}
        onClose={() => setDeleteOpen(false)}
        onDeleted={() => router.push(`/${workspace}/claw`)}
      />
      {connectPlatform && ['telegram', 'discord', 'slack', 'whatsapp'].includes(connectPlatform) && (
        <Dialog open onOpenChange={v => { if (!v) router.replace(`/${workspace}/claw/${agentId}`) }}>
          <DialogContent className="sm:max-w-md p-0 overflow-hidden max-h-[88vh]" hideCloseButton>
            <ChannelSetupWizard
              platform={connectPlatform}
              agentId={agentId}
              agentName={agent.name}
              agentStatus={agent.status}
              onConnected={() => { fetchAgent(); router.replace(`/${workspace}/claw/${agentId}`) }}
              onClose={() => router.replace(`/${workspace}/claw/${agentId}`)}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  )

  // ─── Mobile layout — stacked views + bottom tab bar (mirrors ChatLayout) ─────
  if (isMobile) {
    return (
      <div className="flex flex-col h-screen supports-[height:100dvh]:h-dvh">
        {header}
        {modals}

        {/* Swappable content area */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {mobileView === 'chat' && (
            <AgentChatPanel
              agentId={agentId}
              agentName={agent.name}
              messaging={agent.messaging}
              onMessagingUpdate={fetchAgent}
              model={agent.model}
              status={agent.status}
              flyAppName={agent.fly_app_name}
              avatarUrl={agent.avatar_url}
              initialMessage={initialMessage}
            />
          )}
          {mobileView === 'manage' && (
            <AgentRightPanel
              agentId={agentId}
              agent={agent}
              onAgentUpdate={fetchAgent}
              onAgentDelete={handleDelete}
            />
          )}
        </div>

        {/* Bottom tab bar — iOS translucent style, same as ChatLayout */}
        <div className="flex-shrink-0 bg-background/95 backdrop-blur-md border-t border-border/20 px-safe pb-safe h-mobile-bottom-nav">
          <div className="flex items-center justify-around max-w-md mx-auto h-full">
            <MobileTabButton
              active={mobileView === 'chat'}
              onClick={() => setMobileView('chat')}
              icon={<MessageSquare className="h-[18px] w-[18px]" />}
              label="Chat"
            />
            <MobileTabButton
              active={mobileView === 'manage'}
              onClick={() => setMobileView('manage')}
              icon={<Wrench className="h-[18px] w-[18px]" />}
              label="Manage"
            />
          </div>
        </div>
      </div>
    )
  }

  // ─── Desktop layout — side-by-side resizable panels ──────────────────────────
  return (
    <div className="flex flex-col h-full">
      {header}
      {modals}

      <div className="flex-1 min-h-0">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={55} minSize={35}>
            <AgentChatPanel
              agentId={agentId}
              agentName={agent.name}
              messaging={agent.messaging}
              onMessagingUpdate={fetchAgent}
              model={agent.model}
              status={agent.status}
              flyAppName={agent.fly_app_name}
              avatarUrl={agent.avatar_url}
              initialMessage={initialMessage}
            />
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={45} minSize={30}>
            <AgentRightPanel
              agentId={agentId}
              agent={agent}
              onAgentUpdate={fetchAgent}
              onAgentDelete={handleDelete}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}

export default function AgentDetailPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>}>
      <AgentDetailContent />
    </Suspense>
  )
}
