'use client'

import { useState } from 'react'
import { RefreshCw, Pause, Play, Trash2, Save, Loader2, Plus, X, Zap, ExternalLink, Copy, Check, RotateCcw } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { SettingsTabHeader, SettingsSection } from '@/components/project/settings/SettingsTabLayout'
import { AvatarUpload } from '@/components/ui/avatar-upload'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { ChannelSetupWizard, type Platform } from './ChannelSetupWizard'
import { uploadAgentAvatar } from '@/lib/firebase/storageService'
import { CLAW_MACHINE_SIZES } from '@/lib/claw/constants'

const PROVIDERS: Record<string, string> = {
  'anthropic/claude-sonnet-4.6': '/images/providers/anthropic.avif',
  'openai/gpt-5-1': '/images/providers/openai.avif',
  'google/gemini-3-flash': '/images/providers/google.avif',
}

interface AgentSettingsPanelProps {
  agentId: string
  agent: {
    name: string
    model: string
    machine_size: string
    status: string
    fly_app_name: string | null
    avatar_url?: string | null
    messaging: Array<{ platform: string; status: string }>
  }
  onUpdate: () => void
  onDelete: () => void
}

export function AgentSettingsPanel({ agentId, agent, onUpdate, onDelete }: AgentSettingsPanelProps) {
  const { token } = useAuth()
  const [name, setName] = useState(agent.name)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [restartingProcess, setRestartingProcess] = useState(false)
  const [restartingMachine, setRestartingMachine] = useState(false)
  const [recovering, setRecovering] = useState(false)
  const [pausing, setPausing] = useState(false)
  const [connectPlatform, setConnectPlatform] = useState<Platform | null>(null)
  const [selectedSize, setSelectedSize] = useState(agent.machine_size)
  const [resizing, setResizing] = useState(false)
  const [openingControlUi, setOpeningControlUi] = useState(false)

  const saveName = async () => {
    if (!name.trim() || name === agent.name) return
    setSaving(true)
    const res = await fetch(`/api/claw/agents/${agentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: name.trim() }),
    })
    setSaving(false)
    if (!res.ok) { toast.error('Failed to update name'); return }
    toast.success('Name updated')
    onUpdate()
  }

  const handleAvatarUpload = async (file: File) => {
    setUploadingAvatar(true)
    try {
      const url = await uploadAgentAvatar(agentId, file)
      const res = await fetch(`/api/claw/agents/${agentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ avatar_url: url }),
      })
      if (!res.ok) { toast.error('Failed to save avatar'); return }
      toast.success('Avatar updated')
      onUpdate()
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to upload avatar')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleAvatarRemove = async () => {
    const res = await fetch(`/api/claw/agents/${agentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ avatar_url: null }),
    })
    if (!res.ok) { toast.error('Failed to remove avatar'); return }
    toast.success('Avatar removed')
    onUpdate()
  }

  /** Restart only the OpenClaw Node.js process via SIGUSR1 (~5s, sessions preserved) */
  const restartProcess = async () => {
    setRestartingProcess(true)
    const res = await fetch(`/api/claw/agents/${agentId}/restart-process`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    setRestartingProcess(false)
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      toast.error(d.error || 'Process restart failed')
      return
    }
    toast.success('OpenClaw restarting… back in ~5 seconds', { duration: 5000 })
  }

  /** Restart the entire Fly.io VM — stop + start (~30s) */
  const restartMachine = async () => {
    setRestartingMachine(true)
    const res = await fetch(`/api/claw/agents/${agentId}/restart`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    setRestartingMachine(false)
    if (!res.ok) { toast.error('Machine restart failed'); return }
    toast.success('Machine restarting… back in ~30 seconds', { duration: 10000 })
    onUpdate()
  }

  const togglePause = async () => {
    setPausing(true)
    const endpoint = agent.status === 'running' ? 'pause' : 'resume'
    const res = await fetch(`/api/claw/agents/${agentId}/${endpoint}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    setPausing(false)
    if (!res.ok) { toast.error('Failed'); return }
    toast.success(agent.status === 'running' ? 'Agent paused' : 'Agent resumed')
    onUpdate()
  }

  const resizeMachine = async () => {
    if (!selectedSize || selectedSize === agent.machine_size) return
    setResizing(true)
    const res = await fetch(`/api/claw/agents/${agentId}/resize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ machine_size: selectedSize }),
    })
    setResizing(false)
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      if (res.status === 402) {
        toast.error(`Insufficient credits. Need ${d.credits_needed} credits for ${CLAW_MACHINE_SIZES[selectedSize as keyof typeof CLAW_MACHINE_SIZES]?.label}.`)
      } else {
        toast.error(d.error || 'Resize failed')
      }
      return
    }
    const data = await res.json()
    const label = CLAW_MACHINE_SIZES[selectedSize as keyof typeof CLAW_MACHINE_SIZES]?.label
    if (data.immediate) {
      toast.success(`Upgraded to ${label}! ${data.credits_charged} credits charged (pro-rated)`)
    } else {
      toast.success(data.message || `Downgrade to ${label} scheduled for end of billing cycle`)
    }
    onUpdate()
  }

  const recoverAgent = async () => {
    setRecovering(true)
    const res = await fetch(`/api/claw/agents/${agentId}/recover`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    setRecovering(false)
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      toast.error(d.error || 'Recovery failed')
      return
    }
    toast.success('Agent recovering — gateway ready in ~30 seconds', { duration: 10000 })
    onUpdate()
  }

  const [gatewayToken, setGatewayToken] = useState<string | null>(null)

  const openControlUi = async () => {
    setOpeningControlUi(true)
    const res = await fetch(`/api/claw/agents/${agentId}/control-ui-access`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    setOpeningControlUi(false)
    if (!res.ok) { toast.error('Failed to get Control UI access'); return }
    const { url, token: gToken } = await res.json()
    await navigator.clipboard.writeText(gToken)
    setGatewayToken(gToken)
    window.open(url, '_blank')
    toast.success('Gateway token copied — paste it in the login prompt', { duration: 5000 })
  }

  const size = CLAW_MACHINE_SIZES[agent.machine_size as keyof typeof CLAW_MACHINE_SIZES]
  const logoSrc = PROVIDERS[agent.model]

  const statusColor = { running: 'bg-green-500', paused: 'bg-yellow-500', grace: 'bg-red-500', provisioning: 'bg-blue-500', deleted: 'bg-muted' }
  const dot = statusColor[agent.status as keyof typeof statusColor] ?? 'bg-muted'

  return (
    <div className="p-4 space-y-4 overflow-y-auto">
      <SettingsTabHeader title="Settings" description="Agent configuration and controls" />

      {/* Status */}
      <SettingsSection title="Status">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn('w-2 h-2 rounded-full', dot)} />
              <span className="text-sm capitalize">{agent.status}</span>
              {agent.fly_app_name && (
                <span className="text-xs text-muted-foreground font-mono">{agent.fly_app_name}</span>
              )}
            </div>
            <Button size="sm" variant="outline" onClick={togglePause} disabled={pausing || !['running', 'paused', 'grace'].includes(agent.status)}>
              {pausing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : agent.status === 'running' ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              <span className="ml-1.5">{agent.status === 'running' ? 'Pause' : 'Resume'}</span>
            </Button>
          </div>

          {/* Two distinct restart options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {/* Restart OpenClaw process — lightweight, ~5s */}
            <div className="rounded-lg border border-border/50 p-3 space-y-2">
              <div className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span className="text-xs font-medium">Restart Process</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Restarts OpenClaw via SIGUSR1. Sessions preserved. Use after config or skill changes.
              </p>
              <p className="text-[10px] text-muted-foreground/50">~5 seconds</p>
              <Button
                size="sm" variant="outline"
                className="w-full h-7 text-xs"
                onClick={restartProcess}
                disabled={restartingProcess || agent.status !== 'running'}
              >
                {restartingProcess ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : <Zap className="h-3 w-3 mr-1.5" />}
                {restartingProcess ? 'Restarting…' : 'Restart Process'}
              </Button>
            </div>

            {/* Restart Fly VM — nuclear, ~30s */}
            <div className="rounded-lg border border-border/50 p-3 space-y-2">
              <div className="flex items-center gap-1.5">
                <RefreshCw className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-xs font-medium">Restart Machine</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Full VM restart. Use when the process is unresponsive, or to apply new secrets.
              </p>
              <p className="text-[10px] text-muted-foreground/50">~30 seconds</p>
              <Button
                size="sm" variant="outline"
                className="w-full h-7 text-xs"
                onClick={restartMachine}
                disabled={restartingMachine || agent.status !== 'running'}
              >
                {restartingMachine ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : <RefreshCw className="h-3 w-3 mr-1.5" />}
                {restartingMachine ? 'Restarting… (20–30s)' : 'Restart Machine'}
              </Button>
            </div>
          </div>

          {/* Recover — for crashed/stuck agents */}
          <div className="rounded-lg border border-border/50 p-3 space-y-2">
            <div className="flex items-center gap-1.5">
              <RotateCcw className="h-3.5 w-3.5 text-orange-500 shrink-0" />
              <span className="text-xs font-medium">Recover Agent</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Force-stops and restarts the Fly machine. Use when the agent is unresponsive or stuck.
            </p>
            <Button
              size="sm" variant="outline"
              className="w-full h-7 text-xs"
              onClick={recoverAgent}
              disabled={recovering || ['deleted', 'paused', 'grace'].includes(agent.status)}
            >
              {recovering ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : <RotateCcw className="h-3 w-3 mr-1.5" />}
              {recovering ? 'Recovering…' : 'Recover Agent'}
            </Button>
          </div>
        </div>
      </SettingsSection>

      {/* Avatar */}
      <SettingsSection title="Avatar">
        <div className="flex items-center gap-4">
          <AvatarUpload
            src={agent.avatar_url}
            fallback={agent.name.slice(0, 2).toUpperCase()}
            onUpload={handleAvatarUpload}
            onRemove={agent.avatar_url ? handleAvatarRemove : undefined}
            isUploading={uploadingAvatar}
            size="md"
          />
          <div className="text-xs text-muted-foreground leading-relaxed">
            <p className="font-medium text-foreground/80 mb-0.5">Agent photo</p>
            <p>Upload a JPEG, PNG, or WebP up to 5 MB.</p>
            <p className="mt-0.5">Shown in cards and chat across your workspace.</p>
          </div>
        </div>
      </SettingsSection>

      {/* Name */}
      <SettingsSection title="Name">
        <div className="flex gap-2">
          <Input value={name} onChange={e => setName(e.target.value)} className="flex-1" onKeyDown={e => e.key === 'Enter' && saveName()} />
          <Button size="sm" onClick={saveName} disabled={saving || name === agent.name || !name.trim()}>
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            <span className="ml-1.5">Save</span>
          </Button>
        </div>
      </SettingsSection>

      {/* Model */}
      <SettingsSection title="Configuration">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Model</span>
          <div className="flex items-center gap-1.5">
            {logoSrc && <Image src={logoSrc} alt="provider" width={14} height={14} className="rounded-full" />}
            <span className="text-sm font-mono">{agent.model}</span>
          </div>
        </div>
      </SettingsSection>

      {/* Machine resize */}
      <SettingsSection title="Machine">
        <div className="space-y-3">
          <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 140px), 1fr))' }}>
            {(Object.entries(CLAW_MACHINE_SIZES) as [string, typeof CLAW_MACHINE_SIZES[keyof typeof CLAW_MACHINE_SIZES]][]).map(([key, s]) => (
              <button
                key={key}
                onClick={() => setSelectedSize(key)}
                className={cn(
                  'rounded-lg border p-3 text-left transition-colors cursor-pointer',
                  selectedSize === key
                    ? 'border-primary bg-primary/5'
                    : 'border-border/50 hover:border-border',
                )}
              >
                <div className="text-xs font-medium">{s.label}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{s.spec}</div>
                <div className="text-[10px] text-muted-foreground">{s.creditsPerMonth} cr/mo</div>
              </button>
            ))}
          </div>
          {selectedSize && selectedSize !== agent.machine_size && (
            <p className="text-[11px] text-muted-foreground rounded-lg bg-muted/30 px-3 py-2">
              {(CLAW_MACHINE_SIZES[selectedSize as keyof typeof CLAW_MACHINE_SIZES]?.creditsPerMonth ?? 0) > (CLAW_MACHINE_SIZES[agent.machine_size as keyof typeof CLAW_MACHINE_SIZES]?.creditsPerMonth ?? 0)
                ? 'Upgrade takes effect immediately. Pro-rated charge for remaining days in this cycle.'
                : 'Downgrade takes effect at the end of your billing cycle. No charge until then.'}
            </p>
          )}
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Upgrades immediate (pro-rated). Downgrades apply at end of billing cycle.
            </p>
            <Button
              size="sm"
              onClick={resizeMachine}
              disabled={resizing || selectedSize === agent.machine_size || !['running', 'paused'].includes(agent.status)}
              className="shrink-0"
            >
              {resizing ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
              {resizing ? 'Resizing…' : 'Resize'}
            </Button>
          </div>
        </div>
      </SettingsSection>

      {/* Messaging channels */}
      <SettingsSection
        title="Connected Channels"
        right={
          <div className="flex gap-1">
            {(['telegram', 'whatsapp', 'discord', 'slack'] as const).filter(p => !agent.messaging.find(m => m.platform === p)).map(p => (
              <Button key={p} size="sm" variant="outline" className="h-7 text-xs capitalize" onClick={() => setConnectPlatform(p)}>
                <Plus className="h-3 w-3 mr-1" />{p}
              </Button>
            ))}
          </div>
        }
      >
        {agent.messaging.length === 0 ? (
          <p className="text-sm text-muted-foreground">No messaging channels connected yet.</p>
        ) : (
          <div className="space-y-2">
            {agent.messaging.map(m => (
              <div key={m.platform} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm capitalize">{m.platform}</span>
                </div>
                <button
                  onClick={async () => {
                    if (!confirm(`Disconnect ${m.platform}?`)) return
                    const res = await fetch(`/api/claw/agents/${agentId}/messaging/${m.platform}`, {
                      method: 'DELETE',
                      headers: { Authorization: `Bearer ${token}` },
                    })
                    if (!res.ok) { toast.error('Disconnect failed'); return }
                    toast.success(`${m.platform} disconnected`)
                    onUpdate()
                  }}
                  className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </SettingsSection>

      {/* Control UI — power user access to the full OpenClaw interface */}
      <SettingsSection title="Control UI" right={<Badge variant="outline" className="text-[10px] px-1.5 py-0.5 shrink-0">Advanced</Badge>}>
        <div className="space-y-2.5">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Open the full OpenClaw Control UI in a new tab. Includes chat, skills, cron jobs, logs, config editor, and more.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={openControlUi}
            disabled={openingControlUi || agent.status !== 'running'}
            className="w-full cursor-pointer"
          >
            {openingControlUi ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
            ) : (
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
            )}
            Open Control UI
          </Button>
          <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
            Opens the OpenClaw dashboard. Paste the gateway token when prompted to log in.
          </p>
          {gatewayToken && (
            <div className="mt-2 space-y-1">
              <p className="text-[10px] font-medium text-muted-foreground">Gateway Token (copied to clipboard)</p>
              <button
                onClick={() => { navigator.clipboard.writeText(gatewayToken); toast.success('Token copied') }}
                className="w-full text-left font-mono text-[10px] bg-muted/50 rounded-lg px-2.5 py-1.5 text-muted-foreground break-all hover:bg-muted/80 transition-colors cursor-pointer"
              >
                {gatewayToken}
              </button>
            </div>
          )}
        </div>
      </SettingsSection>

      {/* Danger zone */}
      <SettingsSection title="Danger Zone" className="border-destructive/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-destructive">Delete Agent</p>
            <p className="text-xs text-muted-foreground">Permanently deletes the machine, volume, and all data.</p>
          </div>
          <Button variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />Delete
          </Button>
        </div>
      </SettingsSection>

      <Dialog open={connectPlatform !== null} onOpenChange={v => { if (!v) setConnectPlatform(null) }}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden max-h-[85vh]" hideCloseButton>
          {connectPlatform && (
            <ChannelSetupWizard
              platform={connectPlatform}
              agentId={agentId}
              agentName={agent.name}
              agentStatus={agent.status}
              onConnected={() => { setConnectPlatform(null); onUpdate() }}
              onClose={() => setConnectPlatform(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
