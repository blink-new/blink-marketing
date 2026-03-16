'use client'

import { useState } from 'react'
import { SlidingTabs } from '@/components/ui/sliding-tabs'
import { AgentFilesPanel } from './AgentFilesPanel'
import { AgentSecretsPanel } from './AgentSecretsPanel'
import { AgentSettingsPanel } from './AgentSettingsPanel'
import { AgentIntegrationsPanel } from './AgentIntegrationsPanel'
import { AgentTerminalPanel } from './AgentTerminalPanel'
import { cn } from '@/lib/utils'

type PanelTab = 'files' | 'secrets' | 'connectors' | 'terminal' | 'settings'

const TABS = [
  { id: 'files',      label: 'Files',       mobileLabel: 'Files' },
  { id: 'secrets',    label: 'Secrets',     mobileLabel: 'Keys' },
  { id: 'connectors', label: 'Connectors',  mobileLabel: 'Apps' },
  { id: 'terminal',   label: 'Terminal',    mobileLabel: 'Term' },
  { id: 'settings',   label: 'Settings',    mobileLabel: 'Config' },
] as const

interface AgentRightPanelProps {
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
  onAgentUpdate: () => void
  onAgentDelete: () => void
}

export function AgentRightPanel({ agentId, agent, onAgentUpdate, onAgentDelete }: AgentRightPanelProps) {
  const [activeTab, setActiveTab] = useState<PanelTab>('files')
  const [pendingSecretKey, setPendingSecretKey] = useState<string | undefined>()

  return (
    <div className="flex flex-col h-full border-l border-border/50">
      {/* Tab bar — matches project chat right panel style */}
      <div className="flex items-center border-b border-border/50 shrink-0 px-3 py-1.5 bg-muted/20">
        <SlidingTabs
          tabs={TABS as unknown as Array<{ id: string; label: string; mobileLabel?: string }>}
          activeTab={activeTab}
          onTabChange={id => setActiveTab(id as PanelTab)}
          variant="muted"
          className="w-full"
        />
      </div>

      {/* Panel content */}
      <div className={cn('flex-1 min-h-0', activeTab === 'terminal' ? 'overflow-hidden' : 'overflow-y-auto')}>
        {activeTab === 'files'      && <AgentFilesPanel agentId={agentId} />}
        {activeTab === 'secrets'    && (
          <AgentSecretsPanel
            agentId={agentId}
            pendingAddKey={pendingSecretKey}
            onPendingConsumed={() => setPendingSecretKey(undefined)}
            agentStatus={agent.status}
          />
        )}
        {activeTab === 'connectors' && (
          <AgentIntegrationsPanel
            agentId={agentId}
            onAddSecret={key => { setPendingSecretKey(key); setActiveTab('secrets') }}
          />
        )}
        {activeTab === 'terminal'   && <AgentTerminalPanel agentId={agentId} agentStatus={agent.status} />}
        {activeTab === 'settings'   && (
          <AgentSettingsPanel
            agentId={agentId}
            agent={agent}
            onUpdate={onAgentUpdate}
            onDelete={onAgentDelete}
          />
        )}
      </div>
    </div>
  )
}
