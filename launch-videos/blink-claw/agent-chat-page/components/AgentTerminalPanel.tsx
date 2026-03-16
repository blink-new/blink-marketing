'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Loader2, RotateCcw } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface HistoryEntry {
  cmd: string
  stdout: string
  stderr: string
  exit_code: number
}

interface AgentTerminalPanelProps {
  agentId: string
  agentStatus?: string
}

/** Strip ANSI escape sequences so they don't render as garbage. */
function stripAnsi(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1B\[[0-9;]*[mGKHFJABCDsu]|\x1B\[[0-9;]*[A-Za-z]/g, '')
}

export function AgentTerminalPanel({ agentId, agentStatus }: AgentTerminalPanelProps) {
  const { token } = useAuth()
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [input, setInput] = useState('')
  const [running, setRunning] = useState(false)
  const [runningCmd, setRunningCmd] = useState('')   // cmd shown immediately on Enter
  const [focused, setFocused] = useState(false)

  // Command history navigation (separate from output history)
  const cmdHistoryRef = useRef<string[]>([])
  const historyIdxRef = useRef(-1)
  const savedInputRef = useRef('')  // save current input when navigating up

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const isRunning = agentStatus === 'running'

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [history, running, scrollToBottom])

  const runCmd = useCallback(async () => {
    const cmd = input.trim()
    if (!cmd || running || !isRunning) return

    // Handle 'clear' / Ctrl+L client-side
    if (cmd === 'clear') {
      setHistory([])
      setInput('')
      historyIdxRef.current = -1
      return
    }

    setInput('')
    setRunningCmd(cmd)              // show command line immediately in output
    historyIdxRef.current = -1
    savedInputRef.current = ''

    // Add to command history (dedupe consecutive duplicates)
    if (cmdHistoryRef.current[0] !== cmd) {
      cmdHistoryRef.current = [cmd, ...cmdHistoryRef.current.slice(0, 99)]
    }

    setRunning(true)

    const res = await fetch(`/api/claw/agents/${agentId}/exec`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ cmd, timeout: 60 }),
    }).catch(() => null)

    const data = res
      ? await res.json().catch(() => ({ stdout: '', stderr: 'Failed to parse response', exit_code: 1 }))
      : { stdout: '', stderr: 'Network error — agent unreachable', exit_code: 1 }

    setRunningCmd('')
    setHistory(prev => [
      ...prev.slice(-499),
      {
        cmd,
        stdout: stripAnsi(data.stdout ?? ''),
        stderr: stripAnsi(data.stderr ?? data.error ?? ''),
        exit_code: data.exit_code ?? 1,
      },
    ])
    setRunning(false)
    inputRef.current?.focus()
  }, [input, running, isRunning, agentId, token])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      runCmd()
      return
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const hist = cmdHistoryRef.current
      if (!hist.length) return
      if (historyIdxRef.current === -1) {
        savedInputRef.current = input
      }
      const newIdx = Math.min(historyIdxRef.current + 1, hist.length - 1)
      historyIdxRef.current = newIdx
      setInput(hist[newIdx])
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIdxRef.current === -1) return
      const newIdx = historyIdxRef.current - 1
      historyIdxRef.current = newIdx
      setInput(newIdx === -1 ? savedInputRef.current : cmdHistoryRef.current[newIdx])
      return
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
      e.preventDefault()
      setHistory([])
      return
    }

    if (e.ctrlKey && e.key === 'c') {
      e.preventDefault()
      if (!running) {
        setInput('')
        historyIdxRef.current = -1
        // Show ^C in output to mimic real terminal
        setHistory(prev => [
          ...prev.slice(-499),
          { cmd: input, stdout: '', stderr: '^C', exit_code: 130 },
        ])
      }
      return
    }
  }, [input, running, runCmd])

  if (!isRunning) {
    return (
      <div className="flex flex-col h-full bg-[#0d0d0d] items-center justify-center">
        <p className="text-white/30 text-xs font-mono">Agent must be running to use terminal</p>
      </div>
    )
  }

  return (
    <div
      className="flex flex-col h-full bg-[#0d0d0d] font-mono"
      onClick={() => inputRef.current?.focus()}
    >
      {/* ── Toolbar ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.06] shrink-0">
        <span className="text-[11px] text-white/30 select-none tracking-wide">
          /data/workspace
        </span>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={e => { e.stopPropagation(); setHistory([]) }}
                className="p-1 rounded hover:bg-white/[0.06] text-white/25 hover:text-white/60 transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Clear terminal</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* ── Output ──────────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 py-2 text-[12px] leading-[1.6] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
      >
        {history.length === 0 && !running && (
          <p className="text-white/20 text-[11px] select-none pt-1">
            Connected · type a command below
          </p>
        )}

        {history.map((entry, i) => (
          <div key={i} className="mb-1.5">
            {/* Command line */}
            <div className="flex items-start gap-1.5">
              <span className="text-[#4CAF50] shrink-0 select-none">$</span>
              <span className="text-white/80">{entry.cmd}</span>
            </div>
            {/* stdout */}
            {entry.stdout && (
              <pre className="text-white/75 whitespace-pre-wrap break-words pl-0 m-0 font-mono">
                {entry.stdout}
              </pre>
            )}
            {/* stderr */}
            {entry.stderr && (
              <pre className={cn(
                'whitespace-pre-wrap break-words pl-0 m-0 font-mono',
                entry.exit_code === 130 ? 'text-white/40' : 'text-[#ff6b6b]'
              )}>
                {entry.stderr}
              </pre>
            )}
            {/* Non-zero exit code badge */}
            {entry.exit_code !== 0 && entry.exit_code !== 130 && (
              <div className="text-[10px] text-[#ff6b6b]/50 mt-0.5">
                exit {entry.exit_code}
              </div>
            )}
          </div>
        ))}

        {/* In-flight command — shown immediately on Enter, before response returns */}
        {running && runningCmd && (
          <div className="mb-1.5">
            <div className="flex items-start gap-1.5">
              <span className="text-[#4CAF50] shrink-0 select-none">$</span>
              <span className="text-white/80">{runningCmd}</span>
            </div>
            <div className="flex items-center gap-2 text-white/25 mt-0.5">
              <Loader2 className="h-3 w-3 animate-spin shrink-0" />
              <span className="text-[11px]">running…</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Input row ───────────────────────────────────────────── */}
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2.5 border-t transition-colors shrink-0',
          focused ? 'border-white/[0.12] bg-white/[0.025]' : 'border-white/[0.06]',
          running && 'opacity-50'
        )}
        onClick={e => { e.stopPropagation(); inputRef.current?.focus() }}
      >
        <span className={cn(
          'text-[12px] select-none shrink-0 transition-colors',
          focused ? 'text-[#4CAF50]' : 'text-white/30'
        )}>$</span>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={running}
          placeholder={running ? '' : 'enter command…'}
          className="flex-1 bg-transparent text-[12px] text-white/85 outline-none placeholder:text-white/15 caret-[#4CAF50] font-mono"
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
        />
      </div>
    </div>
  )
}
