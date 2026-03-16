'use client'

import { cn } from '@/lib/utils'

export function getAgentInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function getAgentColor(name: string): string {
  const colors = [
    'from-violet-500 to-indigo-600',
    'from-blue-500 to-cyan-400',
    'from-emerald-500 to-green-600',
    'from-rose-500 to-pink-600',
    'from-amber-400 to-orange-500',
    'from-fuchsia-500 to-purple-600',
    'from-cyan-400 to-sky-500',
    'from-indigo-500 to-purple-500',
  ]
  const hash = name.split('').reduce((acc, c) => c.charCodeAt(0) + ((acc << 5) - acc), 0)
  return colors[Math.abs(hash) % colors.length]
}

interface AgentAvatarProps {
  avatarUrl?: string | null
  agentName: string
  className?: string
}

export function AgentAvatar({ avatarUrl, agentName, className }: AgentAvatarProps) {
  const initials = getAgentInitials(agentName)
  const color = getAgentColor(agentName)
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={agentName}
        className={cn('object-cover rounded-sm shrink-0', className)}
      />
    )
  }
  return (
    <div
      className={cn(
        'rounded-sm flex items-center justify-center shrink-0 bg-gradient-to-br text-white font-semibold',
        color,
        className,
      )}
    >
      <span>{initials}</span>
    </div>
  )
}
