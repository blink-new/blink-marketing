'use client'

import { useState, useRef, useEffect, useCallback, memo } from 'react'
import {
  Send, Paperclip, Square, Plus, HelpCircle, AlertCircle,
  Loader2, RotateCcw, ChevronDown, ChevronRight, RefreshCw,
} from 'lucide-react'
import { Icon } from 'lucide-react'
import { crab } from '@lucide/lab'
import Image from 'next/image'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageContent } from '@/components/chat/MessageContent'
import { AgentChannelsBar } from './AgentChannelsBar'
import { AgentAvatar, getAgentColor } from './AgentAvatar'
import { ChannelSetupDialog, type Platform } from './ChannelSetupWizard'
import { useAuth } from '@/contexts/AuthContext'
import { useClawHealth } from '@/hooks/useClawHealth'
import { ClawModelSelector } from './ClawModelSelector'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  toolCalls?: ToolCall[]
  attachments?: Attachment[]
  createdAt: Date
}

interface ToolCall {
  id: string
  name: string
  input: unknown
  output?: unknown
  state: 'calling' | 'done' | 'error'
}

interface Attachment {
  name: string
  content: string
  type: string
}

interface AgentChatPanelProps {
  agentId: string
  agentName: string
  model: string
  status?: string
  flyAppName?: string | null
  avatarUrl?: string | null
  messaging?: Array<{ platform: string; status: string }>
  onMessagingUpdate?: () => void
  initialMessage?: string
}

// ─── ToolCallItem ──────────────────────────────────────────────────────────────
const ToolCallItem = memo(function ToolCallItem({ tool }: { tool: ToolCall }) {
  const [open, setOpen] = useState(false)
  const [showOutput, setShowOutput] = useState(false)

  return (
    <div className="rounded-lg border border-border/50 bg-muted/20 text-xs overflow-hidden my-1.5 first:mt-0">
      <button
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted/40 transition-colors cursor-pointer text-left"
      >
        {tool.state === 'calling'
          ? <div className="w-2 h-2 rounded-full bg-foreground intelligent-dot shrink-0" style={{ '--dot-glow-color': 'var(--foreground)' } as any} />
          : tool.state === 'error'
          ? <AlertCircle className="h-3 w-3 text-destructive shrink-0" />
          : <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
        }
        <span className="font-mono text-foreground/90">{tool.name}</span>
        <span className="ml-auto text-muted-foreground/60">
          {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </span>
      </button>
      {open && (
        <div className="border-t border-border/40">
          <div className="px-3 py-2">
            <div className="text-[10px] text-muted-foreground mb-1 font-medium uppercase tracking-widest">Input</div>
            <pre className="text-[11px] whitespace-pre-wrap break-all text-foreground/75 max-h-40 overflow-y-auto">
              {JSON.stringify(tool.input, null, 2)}
            </pre>
          </div>
          {tool.output !== undefined && (
            <div className="border-t border-border/40">
              <button
                onClick={() => setShowOutput(v => !v)}
                className="w-full flex items-center gap-1.5 px-3 py-1.5 hover:bg-muted/40 transition-colors cursor-pointer text-[10px] text-muted-foreground font-medium uppercase tracking-widest"
              >
                {showOutput ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                Output
              </button>
              {showOutput && (
                <div className="px-3 pb-2">
                  <pre className="text-[11px] whitespace-pre-wrap break-all text-foreground/75 max-h-40 overflow-y-auto">
                    {typeof tool.output === 'string' ? tool.output : JSON.stringify(tool.output, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
})

// ─── MessageBubble ─────────────────────────────────────────────────────────────
const MessageBubble = memo(function MessageBubble({
  msg, agentName, avatarUrl, model, isActiveStreaming,
}: {
  msg: Message
  agentName: string
  avatarUrl?: string | null
  model: string
  /** Only true for the single currently-streaming message */
  isActiveStreaming: boolean
}) {
  const isUser = msg.role === 'user'
  const isThinking = !isUser && !msg.content && !msg.toolCalls?.length && isActiveStreaming

  if (isUser) {
    return (
      <div className="w-full flex py-2.5 px-4 justify-end">
        <div className="max-w-[70%] flex flex-col items-end mr-4 gap-1.5">
          {msg.attachments?.map((a, i) =>
            a.content.startsWith('data:image/') ? (
              <img key={i} src={a.content} alt={a.name} className="max-w-[200px] max-h-[160px] rounded-lg object-contain bg-muted/30 shadow-sm" />
            ) : (
              <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 rounded-lg px-2.5 py-1.5">
                <Paperclip className="h-3 w-3" />
                <span className="font-medium">{a.name}</span>
              </div>
            )
          )}
          {/* max-h + overflow matches project chat ChatMessage.tsx user bubble */}
          <div className="bg-primary/10 backdrop-blur-[2px] rounded-xl shadow-sm px-4 py-2.5 text-sm leading-relaxed max-h-[400px] overflow-y-auto w-full">
            <div className="whitespace-pre-wrap break-words text-foreground">{msg.content}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full flex py-2.5 px-4 justify-start">
      <div className="max-w-[88%] flex flex-col items-start ml-4">
        <div className="flex items-center gap-2 mb-1.5 ml-0.5">
          <AgentAvatar avatarUrl={avatarUrl} agentName={agentName} className="h-5 w-5 text-[8px]" />
          <span className="text-xs font-medium text-muted-foreground/80">{agentName}</span>
          <span className="text-[10px] text-muted-foreground/50">{model.split('/').pop()}</span>
        </div>
        <div className="px-0.5 w-full">
          {msg.toolCalls?.map(tool => <ToolCallItem key={tool.id} tool={tool} />)}
          {msg.content ? (
            <div className="text-sm text-foreground/95">
              <MessageContent content={msg.content} role="assistant" projectId="" />
            </div>
          ) : isThinking ? (
            <div className="py-1.5 flex">
              <div className="w-3 h-3 rounded-full intelligent-dot bg-foreground" style={{ '--dot-glow-color': 'var(--foreground)' } as any} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
})

// ─── Command reference card ────────────────────────────────────────────────────
const COMMAND_GROUPS = [
  {
    label: 'Session',
    commands: [
      { cmd: '/new',      args: '[message]', desc: 'Start a fresh session. Optionally send a first message.' },
      { cmd: '/stop',     args: '',          desc: 'Abort the currently running task.' },
      { cmd: '/compact',  args: '[hint]',    desc: 'Compress context to save space. Optionally guide what to keep.' },
      { cmd: '/status',   args: '',          desc: 'Show model, context usage, and session info.' },
    ],
  },
  {
    label: 'Model',
    commands: [
      { cmd: '/model',    args: '[id]',      desc: 'Show active model or switch to a new one (e.g. openai/gpt-4o).' },
      { cmd: '/models',   args: '[provider]',desc: 'List available models, optionally filtered by provider.' },
      { cmd: '/think',    args: '<level>',   desc: 'Set thinking depth: off · low · medium · high · xhigh.' },
    ],
  },
  {
    label: 'Tools',
    commands: [
      { cmd: '/bash',     args: '<cmd>',     desc: 'Run a shell command directly. Shorthand: !<cmd>' },
      { cmd: '/skill',    args: '<name>',    desc: 'Run a named skill from the workspace skills directory.' },
      { cmd: '/btw',      args: '<question>',desc: 'Ask a side question that won\'t affect session context.' },
    ],
  },
  {
    label: 'Subagents',
    commands: [
      { cmd: '/subagents list', args: '',          desc: 'List all running sub-agent tasks.' },
      { cmd: '/kill',           args: '<id|all>',  desc: 'Kill a subagent by ID or all at once.' },
      { cmd: '/steer',          args: '<id> <msg>',desc: 'Send steering guidance to a running subagent.' },
    ],
  },
]

function CommandHelp() {
  return (
    <div className="mx-4 mb-2 mt-1 rounded-xl border border-border/50 bg-muted/20 overflow-hidden shrink-0">
      <div className="px-3 pt-2.5 pb-1 border-b border-border/30">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Slash Commands</span>
      </div>
      <div className="p-2 grid grid-cols-1 sm:grid-cols-2 gap-0.5">
        {COMMAND_GROUPS.map(group => (
          <div key={group.label} className="py-1.5 px-1">
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-1 px-1">{group.label}</p>
            {group.commands.map(({ cmd, args, desc }) => (
              <div key={cmd} className="flex items-start gap-2 px-1 py-0.5 rounded hover:bg-muted/40 transition-colors">
                <span className="font-mono text-[11px] text-foreground/80 shrink-0 min-w-[80px]">
                  {cmd}{args && <span className="text-muted-foreground/60"> {args}</span>}
                </span>
                <span className="text-[11px] text-muted-foreground/70 leading-snug">{desc}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="px-3 py-1.5 border-t border-border/30 bg-muted/10">
        <p className="text-[10px] text-muted-foreground/50">
          Type any command directly in the chat · <span className="font-mono">!cmd</span> is shorthand for <span className="font-mono">/bash cmd</span>
        </p>
      </div>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export function AgentChatPanel({
  agentId, agentName, model: initialModel, status = 'running', flyAppName, avatarUrl,
  messaging = [], onMessagingUpdate, initialMessage,
}: AgentChatPanelProps) {
  const { token } = useAuth()
  // Local model state — starts from DB value, updated live when user switches
  const [activeModel, setActiveModel] = useState(initialModel)
  const [messages, setMessages] = useState<Message[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [activeAssistantId, setActiveAssistantId] = useState<string | null>(null)
  const [chatError, setChatError] = useState<string | null>(null)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [showHelp, setShowHelp] = useState(false)
  const [recovering, setRecovering] = useState(false)
  const [newChatDialogOpen, setNewChatDialogOpen] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null)
  const autoSentRef = useRef(false)
  const prevInputRef = useRef('')
  const retryTextRef = useRef('') // stores last sent text for retry
  const atBottomRef = useRef(true) // tracks whether user is scrolled to bottom
  const hasLoadedHistoryRef = useRef(false) // prevent re-loading history on token refresh
  const [wizardPlatform, setWizardPlatform] = useState<Platform | null>(null)

  const { health, checking, recheck } = useClawHealth(agentId, flyAppName ?? null, status)

  // Track scroll position — only auto-scroll when already at the bottom
  useEffect(() => {
    const el = bottomRef.current?.closest('[data-radix-scroll-area-viewport]') as HTMLElement | null
    if (!el) return
    const onScroll = () => {
      atBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  // Observe bottomRef visibility instead of forced scrollIntoView
  useEffect(() => {
    if (atBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Load conversation history once on mount — guarded with hasLoadedHistoryRef
  // so Firebase token refreshes don't wipe active conversations
  useEffect(() => {
    if (hasLoadedHistoryRef.current) return // already loaded — don't overwrite active chat
    if (!token || status !== 'running') return
    hasLoadedHistoryRef.current = true
    setHistoryLoading(true)
    fetch(`/api/claw/agents/${agentId}/chat/history?sessionKey=agent%3Amain%3Amain`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then(data => {
        const history: Message[] = (data?.messages ?? []).map((m: { role: string; content: string }, i: number) => ({
          id: `hist-${i}`,
          role: m.role as 'user' | 'assistant',
          content: m.content,
          createdAt: new Date(),
        }))
        setMessages(history)
        // Scroll to bottom after loading history
        atBottomRef.current = true
      })
      .catch(() => {
        // History load failed silently — chat still usable
      })
      .finally(() => setHistoryLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId, token])

  // Keep local model in sync if parent re-fetches the agent with a new model value
  useEffect(() => { setActiveModel(initialModel) }, [initialModel])

  const handleRecover = useCallback(async () => {
    setRecovering(true)
    const res = await fetch(`/api/claw/agents/${agentId}/recover`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) { setRecovering(false); return }
    // Poll health every 5s instead of blind 30s delay
    const poll = setInterval(() => recheck(), 5000)
    setTimeout(() => { clearInterval(poll); setRecovering(false); recheck() }, 35000)
  }, [agentId, token, recheck])

  // Persist model change to DB and update local state immediately
  const handleModelChange = useCallback(async (modelId: string) => {
    setActiveModel(modelId)
    if (!token) return
    await fetch(`/api/claw/agents/${agentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ model: modelId }),
    }).catch(() => null)
  }, [agentId, token])

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const loaded = await Promise.all(files.map(async f => {
      const isText = f.type.startsWith('text/') || /\.(txt|md|csv|json|xml|html|css|js|ts|py|sh|yaml|yml|toml|env)$/i.test(f.name)
      if (isText) return { name: f.name, content: await f.text().catch(() => '[could not read file]'), type: f.type }
      const content = await new Promise<string>(resolve => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => resolve('[could not read file]')
        reader.readAsDataURL(f)
      })
      return { name: f.name, content, type: f.type }
    }))
    setAttachments(prev => [...prev, ...loaded])
    e.target.value = ''
  }, [])

  // Core send — accepts optional overrideText for retry
  const doSend = useCallback(async (text: string, currentAttachments: Attachment[]) => {
    if (!text || isStreaming) return
    setChatError(null)
    retryTextRef.current = text

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: text, attachments: currentAttachments.length ? [...currentAttachments] : undefined, createdAt: new Date() }
    const assistantId = crypto.randomUUID()
    setMessages(prev => [...prev, userMsg, { id: assistantId, role: 'assistant', content: '', createdAt: new Date() }])
    setActiveAssistantId(assistantId)
    setIsStreaming(true)
    atBottomRef.current = true

    const formatAttachment = (a: Attachment) =>
      a.content.startsWith('data:')
        ? `**${a.name}** (${a.type}):\n${a.content.slice(0, 50_000)}`
        : `**${a.name}**:\n\`\`\`\n${a.content.slice(0, 3000)}\n\`\`\``

    const messageText = userMsg.attachments?.length
      ? `${text}\n\n---Attachments---\n${userMsg.attachments.map(formatAttachment).join('\n\n')}`
      : text

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch(`/api/claw/agents/${agentId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ model: activeModel, message: messageText }),
        signal: controller.signal,
      })

      if (!res.ok || !res.body) {
        setMessages(prev => prev.filter(m => m.id !== assistantId))
        setChatError('Failed to connect to agent — it may be starting up or unavailable.')
        return
      }
      if (!res.headers.get('content-type')?.includes('text/event-stream')) {
        const errText = await res.text().catch(() => 'Unknown error')
        setMessages(prev => prev.filter(m => m.id !== assistantId))
        setChatError(errText || 'Unexpected response from agent.')
        return
      }

      const reader = res.body.getReader()
      readerRef.current = reader
      const decoder = new TextDecoder()
      let buffer = ''
      let done = false

      while (!done) {
        const chunk = await reader.read()
        done = chunk.done
        if (chunk.value) buffer += decoder.decode(chunk.value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') { done = true; break }
          try {
            const delta = (JSON.parse(data) as any)?.choices?.[0]?.delta?.content
            if (typeof delta === 'string' && delta) {
              setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: m.content + delta } : m))
            }
          } catch { /* ignore */ }
        }
      }
    } catch (err: unknown) {
      if ((err as { name?: string })?.name !== 'AbortError') {
        setMessages(prev => prev.filter(m => m.id !== assistantId))
        setChatError('Connection lost. Please try again.')
      }
    } finally {
      readerRef.current = null
      setIsStreaming(false)
      setActiveAssistantId(null)
    }
  }, [agentId, activeModel, token, isStreaming])

  const sendMessage = useCallback(() => {
    const text = input.trim()
    if (!text) return
    setInput('')
    setAttachments([])
    void doSend(text, attachments)
  }, [input, attachments, doSend])

  const handleStopStreaming = useCallback(() => {
    // Cancel the reader directly (more reliable than abort signal alone)
    readerRef.current?.cancel().catch(() => null)
    abortRef.current?.abort()
    setIsStreaming(false)
    setActiveAssistantId(null)
  }, [])

  // Auto-send initialMessage
  useEffect(() => {
    if (autoSentRef.current || !initialMessage?.trim() || status !== 'running' || messages.length > 0) return
    autoSentRef.current = true
    setInput(initialMessage.trim())
  }, [status, messages.length, initialMessage])

  useEffect(() => {
    if (!autoSentRef.current || !input.trim() || input === prevInputRef.current) return
    prevInputRef.current = input
    autoSentRef.current = false
    const text = input
    setInput('')
    void doSend(text, [])
  }, [input, doSend])

  const inputDisabled = status !== 'running'

  return (
    <>
      {wizardPlatform && (
        <ChannelSetupDialog
          open
          platform={wizardPlatform}
          agentId={agentId}
          agentName={agentName}
          agentStatus={status}
          onConnected={() => { setWizardPlatform(null); onMessagingUpdate?.() }}
          onClose={() => setWizardPlatform(null)}
        />
      )}

      {/* New Chat confirmation dialog */}
      <AlertDialog open={newChatDialogOpen} onOpenChange={setNewChatDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start a new chat?</AlertDialogTitle>
            <AlertDialogDescription>
              This clears the chat display. The agent's memory on disk is preserved — it will still remember your past conversations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setMessages([]); setAttachments([]); setInput(''); setChatError(null) }}>
              New Chat
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex flex-col h-full">
        {/* Status banners */}
        {status === 'provisioning' && (
          <div className="shrink-0 px-4 py-2.5 text-xs font-medium flex items-center gap-2 border-b border-border/50 bg-blue-500/10 text-blue-700 dark:text-blue-400">
            <Loader2 className="h-3 w-3 animate-spin" />Agent is starting up — this may take a moment
          </div>
        )}
        {status === 'paused' && (
          <div className="shrink-0 px-4 py-2.5 text-xs font-medium border-b border-border/50 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">
            Agent is paused — resume it in Settings to chat
          </div>
        )}
        {status === 'grace' && (
          <div className="shrink-0 px-4 py-2.5 text-xs font-medium border-b border-border/50 bg-red-500/10 text-red-700 dark:text-red-400">
            Agent paused due to insufficient credits — add credits to resume
          </div>
        )}
        {status === 'deleted' && (
          <div className="shrink-0 px-4 py-2.5 text-xs font-medium border-b border-border/50 bg-muted/30 text-muted-foreground">
            Agent deleted
          </div>
        )}
        {status === 'running' && health === 'unreachable' && (
          <div className="shrink-0 px-4 py-2.5 text-xs font-medium flex items-center gap-2 border-b border-border/50 bg-orange-500/10 text-orange-700 dark:text-orange-400">
            <AlertCircle className="h-3 w-3 shrink-0" />
            <span className="flex-1">Agent gateway is not responding — it may have crashed</span>
            <Button size="sm" variant="outline" className="h-6 text-[11px] px-2 shrink-0" onClick={handleRecover} disabled={recovering || checking}>
              {recovering ? <Loader2 className="h-3 w-3 animate-spin" /> : <><RotateCcw className="h-3 w-3 mr-1" />Recover</>}
            </Button>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-1 border-b border-border/30 shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => messages.length > 0 && setNewChatDialogOpen(true)}
                disabled={messages.length === 0}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Plus className="h-3 w-3" />New chat
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Start a fresh conversation (clears UI display, preserves agent memory)</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={() => setShowHelp(v => !v)} className={cn('p-1 rounded-md transition-colors cursor-pointer', showHelp ? 'text-foreground bg-muted/50' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50')}>
                <HelpCircle className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Slash commands reference</TooltipContent>
          </Tooltip>
        </div>

        {showHelp && <CommandHelp />}

        <AgentChannelsBar
          messaging={messaging as Array<{ platform: Platform; status: string }>}
          onConnect={p => setWizardPlatform(p)}
        />

        {/* Messages */}
        <ScrollArea className="flex-1">
          <div className="py-4">
            {historyLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4 text-center px-6">
                <div className={cn(
                  'w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden',
                  !avatarUrl && cn('bg-gradient-to-br text-white', getAgentColor(agentName))
                )}>
                  {avatarUrl
                    ? <Image src={avatarUrl} alt={agentName} width={64} height={64} className="w-full h-full object-cover" />
                    : <Icon iconNode={crab} className="h-9 w-9" />
                  }
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{agentName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Start a conversation with your agent</p>
                </div>
              </div>
            ) : (
              messages.map(msg => (
                <MessageBubble
                  key={msg.id}
                  msg={msg}
                  agentName={agentName}
                  avatarUrl={avatarUrl}
                  model={activeModel}
                  isActiveStreaming={isStreaming && msg.id === activeAssistantId}
                />
              ))
            )}

            {/* Error footer — matches MessageThread.tsx pattern */}
            {chatError && !isStreaming && (
              <div className="w-full flex py-2.5 px-4 justify-start">
                <div className="flex flex-col max-w-[88%] items-start ml-4">
                  <div className="flex items-center gap-2 mb-1.5 ml-0.5">
                    <AgentAvatar avatarUrl={avatarUrl} agentName={agentName} className="h-5 w-5 text-[8px]" />
                    <span className="text-xs font-medium text-muted-foreground/80">{agentName}</span>
                  </div>
                  <div className="px-0.5 flex flex-col gap-2">
                    <span className="text-sm text-muted-foreground italic">{chatError}</span>
                    <Button
                      variant="outline" size="sm"
                      onClick={() => { setChatError(null); void doSend(retryTextRef.current, []) }}
                      disabled={!retryTextRef.current}
                      className="gap-2 px-3 py-1.5 h-auto w-fit text-xs font-medium"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />Retry
                    </Button>
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        {/* Attachment preview tray */}
        {attachments.length > 0 && (
          <div className="px-4 py-2 flex flex-wrap gap-2 border-t border-border/50">
            {attachments.map((a, i) => (
              <div key={i} className="relative group">
                {a.content.startsWith('data:image/') ? (
                  <>
                    <img src={a.content} alt={a.name} className="h-14 w-14 rounded-lg object-cover bg-muted/30" />
                    <button onClick={() => setAttachments(prev => prev.filter((_, j) => j !== i))} className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-foreground text-background text-[10px] flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                  </>
                ) : (
                  <div className="flex items-center gap-1.5 bg-muted rounded-lg px-2.5 py-1 text-xs">
                    <Paperclip className="h-3 w-3 text-muted-foreground" />
                    <span className="truncate max-w-[120px]">{a.name}</span>
                    <button onClick={() => setAttachments(prev => prev.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-foreground cursor-pointer ml-0.5">×</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Input area — pb-safe handles iPhone notch/home indicator */}
        <div className="px-4 pb-4 pb-safe pt-2 border-t border-border/50">
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col bg-muted/40 rounded-2xl border border-border/60 px-3 pt-2 pb-2">
              {/* Main input row */}
              <div className="flex items-end gap-2">
                <button onClick={() => fileInputRef.current?.click()} className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0 mb-0.5">
                  <Paperclip className="h-4 w-4" />
                </button>
                <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} />
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                  placeholder="Message your agent..."
                  rows={1}
                  disabled={inputDisabled}
                  className="flex-1 bg-transparent resize-none focus:outline-none text-sm placeholder:text-muted-foreground/60 max-h-32 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ height: 'auto', minHeight: '24px' }}
                  onInput={e => {
                    const el = e.currentTarget
                    el.style.height = 'auto'
                    el.style.height = `${el.scrollHeight}px`
                  }}
                />
                {isStreaming ? (
                  <button onClick={handleStopStreaming} className="shrink-0 w-7 h-7 rounded-xl flex items-center justify-center bg-muted hover:bg-muted/80 text-foreground cursor-pointer">
                    <Square className="h-3 w-3 fill-current" />
                  </button>
                ) : (
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || inputDisabled}
                    className={cn('shrink-0 w-7 h-7 rounded-xl flex items-center justify-center transition-all cursor-pointer', input.trim() && !inputDisabled ? 'bg-foreground text-background hover:opacity-80' : 'bg-muted text-muted-foreground cursor-not-allowed')}
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Bottom toolbar — model selector (same position as project chat) */}
              <div className="flex items-center pt-1.5">
                <ClawModelSelector
                  agentId={agentId}
                  currentModel={activeModel}
                  onModelChange={handleModelChange}
                  className="text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
