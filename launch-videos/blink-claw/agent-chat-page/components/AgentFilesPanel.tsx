'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useTheme } from 'next-themes'
import {
  File, Folder, FolderOpen, Search, RefreshCw, Download, Trash2,
  Save, X, Loader2, ArrowUpDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin mr-2" />Loading editor…
    </div>
  ),
})

interface FileEntry {
  name: string
  path: string
  type: 'file' | 'directory'
  size: number
  modified: string
}

interface OpenTab {
  path: string
  name: string
  content: string
  isDirty: boolean
}

const LANG_MAP: Record<string, string> = {
  ts: 'typescript', tsx: 'typescript', js: 'javascript', jsx: 'javascript',
  mjs: 'javascript', cjs: 'javascript',
  py: 'python', sh: 'shell', bash: 'shell', zsh: 'shell',
  json: 'json', jsonc: 'json', md: 'markdown', markdown: 'markdown',
  yaml: 'yaml', yml: 'yaml', toml: 'toml',
  env: 'plaintext', txt: 'plaintext',
  html: 'html', css: 'css', scss: 'scss',
  rs: 'rust', go: 'go', rb: 'ruby', java: 'java', c: 'c', cpp: 'cpp',
}

function getLanguage(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  return LANG_MAP[ext] ?? 'plaintext'
}

function formatSize(bytes: number): string {
  if (bytes === 0) return ''
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

interface AgentFilesPanelProps {
  agentId: string
}

export function AgentFilesPanel({ agentId }: AgentFilesPanelProps) {
  const { token } = useAuth()
  const { resolvedTheme } = useTheme()
  const [files, setFiles] = useState<FileEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [basePath] = useState('/data/workspace')
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set())
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([])
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [openingFile, setOpeningFile] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; entry: FileEntry } | null>(null)
  const editorRef = useRef<unknown>(null)

  const fetchFiles = useCallback(async () => {
    if (!token) return
    setLoading(true)
    const res = await fetch(`/api/claw/agents/${agentId}/files?path=${encodeURIComponent(basePath)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      toast.error('Cannot load files — agent may be paused or unreachable')
      setLoading(false)
      return
    }
    const data = await res.json()
    setFiles(data.files ?? [])
    setLoading(false)
  }, [agentId, token, basePath])

  useEffect(() => { fetchFiles() }, [fetchFiles])

  // Cmd+S / Ctrl+S to save
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        if (activeTab) saveFile(activeTab)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [activeTab]) // eslint-disable-line react-hooks/exhaustive-deps

  const openFile = useCallback(async (entry: FileEntry) => {
    if (entry.type === 'directory') {
      setExpandedDirs(prev => {
        const next = new Set(prev)
        next.has(entry.path) ? next.delete(entry.path) : next.add(entry.path)
        return next
      })
      return
    }

    const existing = openTabs.find(t => t.path === entry.path)
    if (existing) { setActiveTab(entry.path); return }

    if (entry.size > 1_000_000) {
      toast.error(`File too large to edit (${formatSize(entry.size)}). Max 1MB.`)
      return
    }

    setOpeningFile(entry.path)
    const res = await fetch(`/api/claw/agents/${agentId}/files/content?path=${encodeURIComponent(entry.path)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    setOpeningFile(null)
    if (!res.ok) { toast.error('Cannot read file'); return }
    const data = await res.json()

    setOpenTabs(prev => [...prev, { path: entry.path, name: entry.name, content: data.content ?? '', isDirty: false }])
    setActiveTab(entry.path)
  }, [agentId, token, openTabs])

  const saveFile = useCallback(async (path: string) => {
    const tab = openTabs.find(t => t.path === path)
    if (!tab || !tab.isDirty) return
    setSaving(true)
    const res = await fetch(`/api/claw/agents/${agentId}/files/content`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ path, content: tab.content }),
    })
    setSaving(false)
    if (!res.ok) { toast.error('Save failed'); return }
    setOpenTabs(prev => prev.map(t => t.path === path ? { ...t, isDirty: false } : t))
    toast.success('Saved', { duration: 1500, position: 'bottom-right' })
  }, [agentId, token, openTabs])

  const closeTab = useCallback((path: string, confirmed = false) => {
    const tab = openTabs.find(t => t.path === path)
    if (tab?.isDirty && !confirmed && !confirm('You have unsaved changes. Discard?')) return
    const remaining = openTabs.filter(t => t.path !== path)
    setOpenTabs(remaining)
    if (activeTab === path) setActiveTab(remaining[0]?.path ?? null)
  }, [openTabs, activeTab])

  const deleteFile = useCallback(async (entry: FileEntry) => {
    if (!confirm(`Delete ${entry.name}?`)) return
    const res = await fetch(`/api/claw/agents/${agentId}/files?path=${encodeURIComponent(entry.path)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) { toast.error('Delete failed'); return }
    closeTab(entry.path, true)
    await fetchFiles()
    toast.success('Deleted')
  }, [agentId, token, closeTab, fetchFiles])

  const downloadFile = useCallback(async (entry: FileEntry) => {
    const res = await fetch(`/api/claw/agents/${agentId}/files/content?path=${encodeURIComponent(entry.path)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) { toast.error('Cannot download'); return }
    const data = await res.json()
    const blob = new Blob([data.content ?? ''], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = entry.name; a.click()
    URL.revokeObjectURL(url)
  }, [agentId, token])

  const filteredFiles = search
    ? files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
    : files

  const rootFiles = filteredFiles.filter(f => f.path.split('/').length === basePath.split('/').length + 1)
  const childrenOf = (parentPath: string) =>
    filteredFiles.filter(f => {
      const parts = f.path.split('/')
      const parentParts = parentPath.split('/')
      return parts.length === parentParts.length + 1 && f.path.startsWith(parentPath + '/')
    })

  const renderTree = (entries: FileEntry[], depth = 0): React.ReactNode =>
    entries.map(entry => (
      <div key={entry.path}>
        <div
          className={cn(
            'group flex items-center gap-1.5 py-[3px] rounded-md cursor-pointer text-xs transition-colors select-none',
            selectedPath === entry.path
              ? 'bg-accent text-accent-foreground'
              : 'text-foreground/80 hover:bg-muted/60 hover:text-foreground',
          )}
          style={{ paddingLeft: `${10 + depth * 14}px`, paddingRight: '6px' }}
          onClick={() => { setSelectedPath(entry.path); openFile(entry) }}
          onContextMenu={e => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, entry }) }}
        >
          <span className="shrink-0">
            {entry.type === 'directory' ? (
              expandedDirs.has(entry.path)
                ? <FolderOpen className="h-3.5 w-3.5 text-amber-500" />
                : <Folder className="h-3.5 w-3.5 text-amber-500" />
            ) : openingFile === entry.path ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
            ) : (
              <File className="h-3.5 w-3.5 text-muted-foreground/70" />
            )}
          </span>
          <span className="truncate flex-1 font-medium">{entry.name}</span>
          <button
            onClick={e => { e.stopPropagation(); downloadFile(entry) }}
            className="opacity-0 group-hover:opacity-100 p-0.5 rounded transition-opacity cursor-pointer text-muted-foreground hover:text-foreground shrink-0"
          >
            <Download className="h-3 w-3" />
          </button>
        </div>
        {entry.type === 'directory' && expandedDirs.has(entry.path) && renderTree(childrenOf(entry.path), depth + 1)}
      </div>
    ))

  const activeTabData = openTabs.find(t => t.path === activeTab)
  const fileCount = files.filter(f => f.type === 'file').length
  const dirCount = files.filter(f => f.type === 'directory').length

  return (
    <div className="flex h-full min-h-0">
      {/* ── Left: file tree ─────────────────────────────────────── */}
      <div className="w-52 border-r border-border/50 flex flex-col shrink-0">
        {/* Tree toolbar */}
        <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border/50">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search files…"
              className="pl-6 h-6 text-xs border-0 bg-muted/40 focus-visible:ring-1 rounded-md"
            />
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={fetchFiles} className="p-1 rounded hover:bg-muted/60 transition-colors cursor-pointer text-muted-foreground hover:text-foreground">
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Refresh</TooltipContent>
          </Tooltip>
        </div>

        {/* Tree */}
        <ScrollArea className="flex-1 py-1 px-1">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : rootFiles.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8 px-3">
              {search ? 'No files match your search.' : 'No files yet.'}
            </p>
          ) : (
            renderTree(rootFiles)
          )}
        </ScrollArea>

        {/* Footer: file count */}
        {!loading && files.length > 0 && (
          <div className="px-3 py-1.5 border-t border-border/50 text-[10px] text-muted-foreground">
            {fileCount > 0 && `${fileCount} file${fileCount !== 1 ? 's' : ''}`}
            {fileCount > 0 && dirCount > 0 && ' · '}
            {dirCount > 0 && `${dirCount} folder${dirCount !== 1 ? 's' : ''}`}
          </div>
        )}
      </div>

      {/* ── Right: editor ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {activeTabData ? (
          <>
            {/* File header bar — matches reference screenshot exactly */}
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/50 shrink-0 bg-background">
              {/* Left: tab strip (if multiple files) or just filename */}
              <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide min-w-0 flex-1">
                {openTabs.length === 1 ? (
                  /* Single file: just show name */
                  <div className="flex items-center gap-1.5 text-xs font-medium text-foreground min-w-0">
                    <File className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate">{activeTabData.name}</span>
                    {activeTabData.isDirty && <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />}
                  </div>
                ) : (
                  /* Multiple files: tab strip */
                  openTabs.map(tab => (
                    <button
                      key={tab.path}
                      onClick={() => setActiveTab(tab.path)}
                      className={cn(
                        'flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer shrink-0 max-w-[130px] mr-0.5',
                        activeTab === tab.path
                          ? 'bg-muted text-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                      )}
                    >
                      <File className="h-3 w-3 shrink-0" />
                      <span className="truncate">{tab.name}</span>
                      {tab.isDirty && <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />}
                      <span
                        role="button"
                        onClick={e => { e.stopPropagation(); closeTab(tab.path) }}
                        className="ml-0.5 shrink-0 text-muted-foreground/50 hover:text-muted-foreground cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </span>
                    </button>
                  ))
                )}
              </div>

              {/* Right: Save + Close — always visible like the reference */}
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => saveFile(activeTab!)}
                      disabled={!activeTabData.isDirty || saving}
                      className={cn(
                        'flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer',
                        activeTabData.isDirty
                          ? 'bg-foreground text-background hover:opacity-90'
                          : 'text-muted-foreground/40 cursor-default'
                      )}
                    >
                      {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                      Save
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Save (⌘S)</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => closeTab(activeTab!)}
                      className="p-1 rounded hover:bg-muted/60 transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Close tab</TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Monaco editor */}
            <div className="flex-1 min-h-0">
              <MonacoEditor
                height="100%"
                language={getLanguage(activeTabData.name)}
                value={activeTabData.content}
                theme={resolvedTheme === 'dark' ? 'vs-dark' : 'vs'}
                onMount={(editor) => { editorRef.current = editor }}
                onChange={val => setOpenTabs(prev =>
                  prev.map(t => t.path === activeTabData.path ? { ...t, content: val ?? '', isDirty: true } : t)
                )}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  wordWrap: 'on',
                  padding: { top: 12, bottom: 12 },
                  overviewRulerBorder: false,
                  scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
                  renderLineHighlight: 'gutter',
                }}
              />
            </div>
          </>
        ) : (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-muted-foreground select-none">
            <File className="h-8 w-8 opacity-20" />
            <p className="text-sm">Select a file to edit</p>
            <p className="text-xs opacity-60">Right-click a file for more options</p>
          </div>
        )}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setContextMenu(null)} />
          <div
            className="fixed z-50 bg-popover border border-border rounded-xl shadow-lg py-1 min-w-[160px] text-sm"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <button
              onClick={() => { downloadFile(contextMenu.entry); setContextMenu(null) }}
              className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-muted/60 cursor-pointer transition-colors"
            >
              <Download className="h-3.5 w-3.5 text-muted-foreground" />
              Download
            </button>
            <div className="mx-2 my-1 border-t border-border/50" />
            <button
              onClick={() => { deleteFile(contextMenu.entry); setContextMenu(null) }}
              className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-muted/60 cursor-pointer text-destructive transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  )
}
