export interface Agent {
  name: string;
  description: string;
  avatar: string;
}

export const AGENTS: Agent[] = [
  {
    name: "Executive Personal Assistant",
    description:
      "Runs your morning briefing, captures every task, and drafts emails before you ask.",
    avatar: "jamie.webp",
  },
  {
    name: "Sales Development Rep",
    description:
      "Researches real prospects, writes personalized outreach, and follows up until they reply.",
    avatar: "archer.webp",
  },
  {
    name: "Inbox Manager",
    description:
      "Triages your inbox, drafts replies in your voice, and shows you only what actually needs you.",
    avatar: "maya.webp",
  },
  {
    name: "Growth & Competitive Intelligence",
    description:
      "Monitors competitors weekly, tracks market shifts, and delivers briefings you can act on.",
    avatar: "casey.webp",
  },
  {
    name: "Software Engineer",
    description:
      "Reviews PRs, catches bugs early, and ships clean fixes without being asked.",
    avatar: "dev.webp",
  },
  {
    name: "Finance & Business Analyst",
    description:
      "Tracks key metrics daily, flags anomalies early, and delivers a clean weekly snapshot.",
    avatar: "reece.webp",
  },
  {
    name: "Research Analyst",
    description:
      "Sources rigorously, cross-references claims, and delivers clear insights with citations.",
    avatar: "nova.webp",
  },
  {
    name: "Social Media Manager",
    description:
      "Plans weekly content, writes in your voice, and tracks what's working.",
    avatar: "sage.webp",
  },
  {
    name: "Customer Support",
    description:
      "Handles tickets 24/7, learns your product deeply, and escalates only what needs a human.",
    avatar: "harper.webp",
  },
  {
    name: "Content Writer",
    description:
      "Drafts blogs, emails, and social posts in your brand voice, ready to publish.",
    avatar: "alex.webp",
  },
  {
    name: "Product Manager",
    description:
      "Tracks roadmap, writes specs, and keeps your team aligned without the meetings.",
    avatar: "jordan.webp",
  },
  {
    name: "Legal Assistant",
    description:
      "Reviews contracts, flags risks, and summarizes terms so you can decide fast.",
    avatar: "rex.webp",
  },
];
