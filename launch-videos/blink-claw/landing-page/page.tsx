import type { Metadata } from 'next'
import { MarketingLayout } from '@/components/layout/MarketingLayout'
import { ClawLandingContent } from '@/components/claw/ClawLandingContent'

export const metadata: Metadata = {
  title: 'OpenClaw Hosting — Deploy in 60 Seconds, No Setup | Blink Claw',
  description:
    'Run OpenClaw without Docker, a VPS, or separate AI accounts. One-click deployment, 200+ AI models included, unlimited agents, always-on. From $22/mo.',
  keywords: [
    'managed openclaw hosting',
    'openclaw cloud hosting',
    'openclaw without docker',
    'openclaw one click deploy',
    'openclaw managed',
    'openclaw hosting',
    'openclaw self host alternative',
    'openclaw agent hosting',
    'openclaw vps alternative',
    'deploy openclaw',
    'openclaw telegram bot hosting',
    'openclaw setup',
    'openclaw install',
    'openclaw cloud',
    'openclaw no docker',
    'host openclaw online',
    'openclaw managed service',
  ],
  openGraph: {
    title: 'OpenClaw Hosting — Deploy in 60 Seconds, No Setup | Blink Claw',
    description:
      'No Docker. No VPS. No AI accounts. Deploy OpenClaw agents in one click — 200+ models included, always on, fully managed. From $22/mo.',
    type: 'website',
    url: 'https://blink.new/claw',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OpenClaw Hosting — Deploy in 60 Seconds, No Setup',
    description: 'No Docker. No VPS. 200+ AI models included. Deploy OpenClaw in one click from $22/mo.',
  },
  alternates: { canonical: 'https://blink.new/claw' },
}

export default function ClawLandingPage() {
  return (
    <MarketingLayout>
      <ClawLandingContent />
    </MarketingLayout>
  )
}
