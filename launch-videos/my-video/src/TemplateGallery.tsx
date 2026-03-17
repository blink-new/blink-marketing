import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { brand } from "./brand";

const ff = brand.fonts.heading;

// ─── Layout constants ─────────────────────────────────────────────────────────
const LEFT_W   = 680;   // left text panel width
const CARD_W   = 272;   // agent card width
const CARD_H   = 206;   // agent card height
const CARD_GAP = 18;    // gap between cards in a row
const ROW_GAP  = 22;    // gap between rows
const SET_SIZE = 6;     // cards per set (before duplication)
const SET_W    = SET_SIZE * (CARD_W + CARD_GAP); // 1740px one set width

// ─── Agent data ───────────────────────────────────────────────────────────────
interface Agent {
  name:   string;
  role:   string;
  for:    string;
  desc:   string;
  metric: string;
  avatar: string;
  accentColor: string;
  accentBg:    string;
}

const AGENTS: Agent[] = [
  {
    name: "Jamie",  role: "Executive Assistant", for: "Founders · Operators",
    desc: "Sends your daily briefing before your first coffee. Captures tasks, flags urgent items.",
    metric: "3 priorities sent by 7:30 AM",
    avatar: "jamie.webp", accentColor: "#ea580c", accentBg: "#fff7ed",
  },
  {
    name: "Alex",   role: "Sales Dev Rep",        for: "SaaS founders · Sales teams",
    desc: "Researches leads, writes personalised outreach, and follows up so you never miss a deal.",
    metric: "8 leads researched daily",
    avatar: "alex.webp",  accentColor: "#2563eb", accentBg: "#eff6ff",
  },
  {
    name: "Maya",   role: "Inbox Manager",        for: "Agency owners · Founders",
    desc: "Triages email every morning. Drafts replies. Archives noise. You open to zero unread.",
    metric: "47 emails → 0 in one session",
    avatar: "maya.webp",  accentColor: "#0d9488", accentBg: "#f0fdfa",
  },
  {
    name: "Reece",  role: "Growth Analyst",       for: "Startups · Marketing teams",
    desc: "Tracks competitors, spots market shifts, and delivers a Monday intelligence brief.",
    metric: "Weekly intel brief, Mon 8 AM",
    avatar: "reece.webp", accentColor: "#7c3aed", accentBg: "#f5f3ff",
  },
  {
    name: "Dev",    role: "Software Engineer",    for: "Indie hackers · Startups",
    desc: "Implements features, debugs issues, and runs a Sunday security scan autonomously.",
    metric: "Sunday repo audit, every week",
    avatar: "dev.webp",   accentColor: "#4f46e5", accentBg: "#eef2ff",
  },
  {
    name: "Jordan", role: "Finance Analyst",      for: "Operators · CFOs",
    desc: "Monitors KPIs, flags threshold breaches, and sends a Friday business health report.",
    metric: "Business report every Friday",
    avatar: "jordan.webp",accentColor: "#d97706", accentBg: "#fffbeb",
  },
  {
    name: "Nova",   role: "Research Analyst",     for: "Executives · Strategists",
    desc: "Delivers structured research reports with cross-referenced sources and clear insights.",
    metric: "Full research brief < 30 min",
    avatar: "nova.webp",  accentColor: "#059669", accentBg: "#ecfdf5",
  },
  {
    name: "Sage",   role: "Social Media Manager", for: "Creators · Solopreneurs",
    desc: "Plans your weekly content, drafts posts in your voice, and reports on what works.",
    metric: "7 post ideas every Monday",
    avatar: "sage.webp",  accentColor: "#db2777", accentBg: "#fdf2f8",
  },
  {
    name: "Casey",  role: "Customer Success",     for: "SaaS teams · Founders",
    desc: "Monitors customer health, drafts empathetic replies, and catches churn risk early.",
    metric: "Health check every Monday",
    avatar: "casey.webp", accentColor: "#0284c7", accentBg: "#f0f9ff",
  },
  {
    name: "Harper", role: "Head of Recruiting",   for: "Hiring managers · Founders",
    desc: "Writes job descriptions, screens candidates, and keeps your pipeline moving forward.",
    metric: "Pipeline update every Friday",
    avatar: "harper.webp",accentColor: "#7c3aed", accentBg: "#f5f3ff",
  },
  {
    name: "Rex",    role: "Infra & Security",     for: "Engineers · CTOs",
    desc: "Monitors uptime, scans error logs, and sends an incident alert the moment things break.",
    metric: "Downtime alert in under 60s",
    avatar: "rex.webp",   accentColor: "#dc2626", accentBg: "#fef2f2",
  },
  {
    name: "Archer", role: "Investment Researcher", for: "Investors · Traders",
    desc: "Sends a pre-market brief every morning and researches any stock or sector on demand.",
    metric: "Market brief at 7 AM daily",
    avatar: "archer.webp",accentColor: "#b45309", accentBg: "#fefce8",
  },
];

// Row assignments (6 agents each, reordered for visual variety)
const ROW1 = [AGENTS[0],  AGENTS[3],  AGENTS[6],  AGENTS[9],  AGENTS[1],  AGENTS[4]]; // scrolls left fast
const ROW2 = [AGENTS[7],  AGENTS[10], AGENTS[2],  AGENTS[5],  AGENTS[8],  AGENTS[11]]; // scrolls right medium
const ROW3 = [AGENTS[4],  AGENTS[1],  AGENTS[8],  AGENTS[11], AGENTS[3],  AGENTS[6]]; // scrolls left slow

// ─── Trend-up icon ────────────────────────────────────────────────────────────
function TrendIcon({ color }: { color: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

// ─── Online dot ───────────────────────────────────────────────────────────────
function OnlineDot({ frame }: { frame: number }) {
  const PULSE = 76;
  const ph = (frame % PULSE) / PULSE;
  const ringScale = interpolate(ph, [0, 0.7], [1, 2.2], { extrapolateRight: "clamp" });
  const ringOp    = interpolate(ph, [0, 0.45, 0.7], [0.7, 0.1, 0], { extrapolateRight: "clamp" });
  const GC = "#22c55e";
  return (
    <div style={{ position: "relative", width: 9, height: 9, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", width: 9, height: 9, borderRadius: "50%", border: `1.5px solid ${GC}`, transform: `scale(${ringScale})`, opacity: ringOp }} />
      <div style={{ width: 7, height: 7, borderRadius: "50%", background: GC, border: "1.5px solid white" }} />
    </div>
  );
}

// ─── Agent card ───────────────────────────────────────────────────────────────
function AgentCard({ agent, frame }: { agent: Agent; frame: number }) {
  return (
    <div style={{
      width: CARD_W,
      height: CARD_H,
      flexShrink: 0,
      background: "#ffffff",
      borderRadius: 16,
      border: "1.5px solid #E5E7EB",
      boxShadow: "0 2px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
      padding: "16px 18px",
      display: "flex",
      flexDirection: "column",
      gap: 0,
      overflow: "hidden",
    }}>

      {/* Header: avatar + name + role */}
      <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 11 }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div style={{ width: 46, height: 46, borderRadius: "50%", overflow: "hidden", border: `2px solid ${agent.accentColor}33` }}>
            <Img
              src={staticFile(agent.avatar)}
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
            />
          </div>
          {/* Online dot pinned to bottom-right of avatar */}
          <div style={{ position: "absolute", bottom: 1, right: 1 }}>
            <OnlineDot frame={frame} />
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", fontFamily: ff, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
            {agent.name}
          </div>
          <div style={{ fontSize: 10.5, color: "#6B7280", fontFamily: ff, marginTop: 2, lineHeight: 1.3 }}>
            {agent.role}
          </div>
          <div style={{ fontSize: 9.5, color: "#9CA3AF", fontFamily: ff, marginTop: 1, lineHeight: 1.3 }}>
            {agent.for}
          </div>
        </div>
      </div>

      {/* Description */}
      <div style={{
        fontSize: 11,
        color: "#4B5563",
        fontFamily: ff,
        lineHeight: 1.5,
        flex: 1,
        overflow: "hidden",
        display: "-webkit-box",
        WebkitLineClamp: 3,
        WebkitBoxOrient: "vertical" as const,
      }}>
        {agent.desc}
      </div>

      {/* Metric badge */}
      <div style={{
        marginTop: 11,
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        background: agent.accentBg,
        border: `1px solid ${agent.accentColor}33`,
        borderRadius: 20,
        padding: "4px 10px",
        alignSelf: "flex-start",
      }}>
        <TrendIcon color={agent.accentColor} />
        <span style={{ fontSize: 10, fontWeight: 600, color: agent.accentColor, fontFamily: ff, whiteSpace: "nowrap" }}>
          {agent.metric}
        </span>
      </div>

    </div>
  );
}

// ─── Scrolling row ────────────────────────────────────────────────────────────
// direction: -1 = left, +1 = right
function ScrollRow({ agents, frame, speed, direction }: {
  agents: Agent[];
  frame:  number;
  speed:  number;
  direction: 1 | -1;
}) {
  // Duplicate for seamless loop
  const doubled = [...agents, ...agents];
  // translateX: moves opposite to direction for visual scroll
  // direction -1 (scroll left): translateX decreases (negative)
  // direction +1 (scroll right): translateX increases (positive), starting offset = -SET_W
  const offset = direction === -1
    ? -((frame * speed) % SET_W)
    : -SET_W + ((frame * speed) % SET_W);

  return (
    <div style={{ overflow: "hidden", width: "100%", position: "relative" }}>
      <div style={{
        display: "flex",
        gap: CARD_GAP,
        transform: `translateX(${offset}px)`,
        willChange: "transform",
      }}>
        {doubled.map((agent, i) => (
          <AgentCard key={`${agent.name}-${i}`} agent={agent} frame={frame} />
        ))}
      </div>
    </div>
  );
}

// ─── Left text panel ──────────────────────────────────────────────────────────
function LeftPanel({ frame }: { frame: number }) {
  const ease = Easing.out(Easing.cubic);

  const badge = {
    opacity:   interpolate(frame, [8, 22],  [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease }),
    transform: `translateY(${interpolate(frame, [8, 22], [14, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease })}px)`,
  };
  const line1 = {
    opacity:   interpolate(frame, [20, 38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease }),
    transform: `translateY(${interpolate(frame, [20, 38], [18, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease })}px)`,
  };
  const line2 = {
    opacity:   interpolate(frame, [30, 48], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease }),
    transform: `translateY(${interpolate(frame, [30, 48], [18, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease })}px)`,
  };
  const desc = {
    opacity:   interpolate(frame, [42, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease }),
    transform: `translateY(${interpolate(frame, [42, 60], [12, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease })}px)`,
  };

  return (
    <div style={{
      width: LEFT_W,
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      paddingLeft: 88,
      paddingRight: 52,
      flexShrink: 0,
    }}>

      {/* Eyebrow badge */}
      <div style={{ ...badge, marginBottom: 24 }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: "#F0FDF4",
          border: "1px solid #BBF7D0",
          borderRadius: 20,
          padding: "5px 14px",
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#15803D", fontFamily: ff }}>
            12 agent templates · ready to deploy
          </span>
        </div>
      </div>

      {/* Heading line 1 */}
      <div style={line1}>
        <span style={{
          fontSize: 56,
          fontWeight: 700,
          color: "#111827",
          fontFamily: ff,
          letterSpacing: "-0.06em",
          lineHeight: 1.1,
          display: "block",
        }}>
          Create your own
        </span>
      </div>

      {/* Heading line 2 */}
      <div style={{ ...line2, marginBottom: 24 }}>
        <span style={{
          fontSize: 56,
          fontWeight: 700,
          fontFamily: ff,
          letterSpacing: "-0.06em",
          lineHeight: 1.1,
          display: "block",
          background: "linear-gradient(90deg, #0006BA, #6366F1)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          paddingRight: "0.04em",
        }}>
          or use a template.
        </span>
      </div>

      {/* Description */}
      <div style={desc}>
        <p style={{
          fontSize: 16,
          color: "#6B7280",
          fontFamily: ff,
          lineHeight: 1.65,
          margin: 0,
          maxWidth: 440,
        }}>
          12 specialist agents built for the tasks that matter most — or describe your own in plain English. Deploy in seconds.
        </p>
      </div>

    </div>
  );
}

// ─── Root composition ─────────────────────────────────────────────────────────
export const TemplateGallery: React.FC = () => {
  const frame = useCurrentFrame();
  const { } = useVideoConfig();

  // Right panel fade-in
  const rightOp = interpolate(frame, [14, 34], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Rows total height for vertical centering
  const ROWS_H = 3 * CARD_H + 2 * ROW_GAP; // 3×206 + 2×22 = 662
  const rightTopPad = Math.round((1080 - ROWS_H) / 2);

  return (
    <AbsoluteFill style={{ background: "#ffffff", display: "flex", flexDirection: "row" }}>

      {/* ── Left panel ───────────────────────────────────────────────── */}
      <LeftPanel frame={frame} />


      {/* ── Right panel: 3 scrolling rows ────────────────────────────── */}
      <div style={{
        flex: 1,
        opacity: rightOp,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        paddingTop: rightTopPad,
        paddingBottom: rightTopPad,
        overflow: "hidden",
        gap: ROW_GAP,
        // Fade cards out on both horizontal edges
        maskImage: "linear-gradient(to right, transparent 0%, black 7%, black 93%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 7%, black 93%, transparent 100%)",
      }}>
        {/* Row 1: scrolls LEFT, fast */}
        <ScrollRow agents={ROW1} frame={frame} speed={12} direction={-1} />

        {/* Row 2: scrolls RIGHT, medium */}
        <ScrollRow agents={ROW2} frame={frame} speed={9}  direction={1}  />

        {/* Row 3: scrolls LEFT, slow */}
        <ScrollRow agents={ROW3} frame={frame} speed={7}  direction={-1} />
      </div>

    </AbsoluteFill>
  );
};
