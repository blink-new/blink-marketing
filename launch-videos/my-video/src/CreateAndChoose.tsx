import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { brand } from "./brand";

const ff = brand.fonts.heading;

// ─── Gallery card constants (mirrors TemplateGallery) ─────────────────────────
const CARD_W   = 272;
const CARD_H   = 206;
const CARD_GAP = 18;
const ROW_GAP  = 22;
const SET_SIZE = 6;
const SET_W    = SET_SIZE * (CARD_W + CARD_GAP); // 1740px

// ─── Phase timings (60 fps) ───────────────────────────────────────────────────
const TYPING_TEXT = "Build me a Personal Assistant that replies to my emails for me";

const T_HEAD_IN    = 0;
const T_CHAT_IN    = 28;
const T_TYPE_START = 58;
const T_TYPE_END   = T_TYPE_START + 90;  // 148 — ~1.5s
const T_CUR_IN     = T_TYPE_END + 4;     // 152 — cursor appears
const T_CUR_ARRIVE = T_CUR_IN + 32;      // 184 — cursor reaches button
const T_CLICK      = T_CUR_ARRIVE + 2;   // 186 — click
const P1_FADE_END  = T_CLICK + 26;       // 212 — phase-1 fully gone

const T_TRANS_IN   = T_CLICK + 34;       // 220 — transition text pops in
const T_TRANS_OUT  = T_TRANS_IN + 72;    // 292 — transition text starts exiting
const T_TRANS_GONE = T_TRANS_OUT + 18;   // 310

const T_GAL_IN     = T_TRANS_OUT + 6;    // 298 — gallery fades in
const TOTAL_FRAMES = T_GAL_IN + 90; // 1.5 s of gallery (90 frames at 60fps)

// ─── Canvas coordinates of the send button (1920×1080) ───────────────────────
// Chat box: 720px wide, centered at x=960 → left=600
// Heading block ≈ 160px, gap 36px → chatbox top ≈ 312+160+36 = 508
// Tab 48px + divider 2px + input 132px + half-bottom-bar 26px → BTN_Y ≈ 716
const CHAT_W  = 900;
const BTN_X   = (1920 - CHAT_W) / 2 + CHAT_W - 18 - 20; // 1372
const BTN_Y   = 716;
const CUR_SX  = 1840;  // cursor start X (off-screen right edge)
const CUR_SY  = 920;   // cursor start Y

// Camera zoom: zooms in on chat box during typewriter, stays zoomed through click
const CAM_OX    = 960;   // pivot X: horizontal center
const CAM_OY    = 604;   // pivot Y: approx chat box center in 1080 canvas
const CAM_S     = 1.42;  // zoom factor
// Visual screen coordinates of the button at full zoom (where cursor must arrive)
const BTN_VIS_X = Math.round(CAM_OX + (BTN_X - CAM_OX) * CAM_S);
const BTN_VIS_Y = Math.round(CAM_OY + (BTN_Y - CAM_OY) * CAM_S);

// ─── Agent data (same as TemplateGallery) ────────────────────────────────────
interface Agent {
  name: string; role: string; for: string; desc: string; metric: string;
  avatar: string; accentColor: string; accentBg: string;
}
const AGENTS: Agent[] = [
  { name:"Jamie",  role:"Executive Assistant", for:"Founders · Operators",       desc:"Sends your daily briefing before your first coffee. Captures tasks, flags urgent items.",                        metric:"3 priorities sent by 7:30 AM",      avatar:"jamie.webp",  accentColor:"#ea580c", accentBg:"#fff7ed" },
  { name:"Alex",   role:"Sales Dev Rep",        for:"SaaS founders · Sales teams",  desc:"Researches leads, writes personalised outreach, and follows up so you never miss a deal.",                       metric:"8 leads researched daily",           avatar:"alex.webp",   accentColor:"#2563eb", accentBg:"#eff6ff" },
  { name:"Maya",   role:"Inbox Manager",        for:"Agency owners · Founders",      desc:"Triages email every morning. Drafts replies. Archives noise. You open to zero unread.",                         metric:"47 emails → 0 in one session",      avatar:"maya.webp",   accentColor:"#0d9488", accentBg:"#f0fdfa" },
  { name:"Reece",  role:"Growth Analyst",       for:"Startups · Marketing teams",    desc:"Tracks competitors, spots market shifts, and delivers a Monday intelligence brief.",                           metric:"Weekly intel brief, Mon 8 AM",      avatar:"reece.webp",  accentColor:"#7c3aed", accentBg:"#f5f3ff" },
  { name:"Dev",    role:"Software Engineer",    for:"Indie hackers · Startups",      desc:"Implements features, debugs issues, and runs a Sunday security scan autonomously.",                             metric:"Sunday repo audit, every week",     avatar:"dev.webp",    accentColor:"#4f46e5", accentBg:"#eef2ff" },
  { name:"Jordan", role:"Finance Analyst",      for:"Operators · CFOs",              desc:"Monitors KPIs, flags threshold breaches, and sends a Friday business health report.",                          metric:"Business report every Friday",      avatar:"jordan.webp", accentColor:"#d97706", accentBg:"#fffbeb" },
  { name:"Nova",   role:"Research Analyst",     for:"Executives · Strategists",      desc:"Delivers structured research reports with cross-referenced sources and clear insights.",                       metric:"Full research brief < 30 min",      avatar:"nova.webp",   accentColor:"#059669", accentBg:"#ecfdf5" },
  { name:"Sage",   role:"Social Media Manager", for:"Creators · Solopreneurs",       desc:"Plans your weekly content, drafts posts in your voice, and reports on what works.",                           metric:"7 post ideas every Monday",         avatar:"sage.webp",   accentColor:"#db2777", accentBg:"#fdf2f8" },
  { name:"Casey",  role:"Customer Success",     for:"SaaS teams · Founders",         desc:"Monitors customer health, drafts empathetic replies, and catches churn risk early.",                          metric:"Health check every Monday",         avatar:"casey.webp",  accentColor:"#0284c7", accentBg:"#f0f9ff" },
  { name:"Harper", role:"Head of Recruiting",   for:"Hiring managers · Founders",    desc:"Writes job descriptions, screens candidates, and keeps your pipeline moving forward.",                       metric:"Pipeline update every Friday",      avatar:"harper.webp", accentColor:"#7c3aed", accentBg:"#f5f3ff" },
  { name:"Rex",    role:"Infra & Security",     for:"Engineers · CTOs",              desc:"Monitors uptime, scans error logs, and sends an incident alert the moment things break.",                    metric:"Downtime alert in under 60s",       avatar:"rex.webp",    accentColor:"#dc2626", accentBg:"#fef2f2" },
  { name:"Archer", role:"Investment Researcher",for:"Investors · Traders",           desc:"Sends a pre-market brief every morning and researches any stock or sector on demand.",                       metric:"Market brief at 7 AM daily",        avatar:"archer.webp", accentColor:"#b45309", accentBg:"#fefce8" },
];
const ROW1 = [AGENTS[0], AGENTS[3], AGENTS[6], AGENTS[9],  AGENTS[1], AGENTS[4]];
const ROW2 = [AGENTS[7], AGENTS[10],AGENTS[2], AGENTS[5],  AGENTS[8], AGENTS[11]];
const ROW3 = [AGENTS[4], AGENTS[1], AGENTS[8], AGENTS[11], AGENTS[3], AGENTS[6]];

// ─── Sub-components ───────────────────────────────────────────────────────────
function TrendIcon({ color }: { color: string }) {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function OnlineDot({ frame }: { frame: number }) {
  const ph = (frame % 76) / 76;
  const rs = interpolate(ph, [0, 0.7], [1, 2.2], { extrapolateRight: "clamp" });
  const ro = interpolate(ph, [0, 0.45, 0.7], [0.7, 0.1, 0], { extrapolateRight: "clamp" });
  return (
    <div style={{ position: "relative", width: 9, height: 9, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", width: 9, height: 9, borderRadius: "50%", border: "1.5px solid #22c55e", transform: `scale(${rs})`, opacity: ro }} />
      <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", border: "1.5px solid white" }} />
    </div>
  );
}

function AgentCard({ agent, frame }: { agent: Agent; frame: number }) {
  return (
    <div style={{ width: CARD_W, height: CARD_H, flexShrink: 0, background: "#ffffff", borderRadius: 16, border: "1.5px solid #E5E7EB", boxShadow: "0 2px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)", padding: "16px 18px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 11 }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div style={{ width: 46, height: 46, borderRadius: "50%", overflow: "hidden", border: `2px solid ${agent.accentColor}33` }}>
            <Img src={staticFile(agent.avatar)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
          </div>
          <div style={{ position: "absolute", bottom: 1, right: 1 }}><OnlineDot frame={frame} /></div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", fontFamily: ff, letterSpacing: "-0.02em", lineHeight: 1.2 }}>{agent.name}</div>
          <div style={{ fontSize: 10.5, color: "#6B7280", fontFamily: ff, marginTop: 2, lineHeight: 1.3 }}>{agent.role}</div>
          <div style={{ fontSize: 9.5, color: "#9CA3AF", fontFamily: ff, marginTop: 1, lineHeight: 1.3 }}>{agent.for}</div>
        </div>
      </div>
      <div style={{ fontSize: 11, color: "#4B5563", fontFamily: ff, lineHeight: 1.5, flex: 1, overflow: "hidden" }}>{agent.desc}</div>
      <div style={{ marginTop: 11, display: "inline-flex", alignItems: "center", gap: 5, background: agent.accentBg, border: `1px solid ${agent.accentColor}33`, borderRadius: 20, padding: "4px 10px", alignSelf: "flex-start" }}>
        <TrendIcon color={agent.accentColor} />
        <span style={{ fontSize: 10, fontWeight: 600, color: agent.accentColor, fontFamily: ff, whiteSpace: "nowrap" }}>{agent.metric}</span>
      </div>
    </div>
  );
}

function ScrollRow({ agents, gFrame, speed, dir }: { agents: Agent[]; gFrame: number; speed: number; dir: 1 | -1 }) {
  const doubled = [...agents, ...agents];
  const offset = dir === -1
    ? -((gFrame * speed) % SET_W)
    : -SET_W + ((gFrame * speed) % SET_W);
  return (
    <div style={{ overflow: "hidden", width: "100%", position: "relative" }}>
      <div style={{ display: "flex", gap: CARD_GAP, transform: `translateX(${offset}px)` }}>
        {doubled.map((a, i) => <AgentCard key={`${a.name}-${i}`} agent={a} frame={gFrame} />)}
      </div>
    </div>
  );
}

// ─── Chat box ─────────────────────────────────────────────────────────────────
function ChatBox({ typedText, btnScale }: { typedText: string; btnScale: number }) {
  const hasText = typedText.length > 0;
  return (
    <div style={{ width: CHAT_W, background: "white", borderRadius: 20, border: "1.5px solid #E5E7EB", boxShadow: "0 4px 28px rgba(0,0,0,0.07), 0 1px 6px rgba(0,0,0,0.04)", overflow: "hidden" }}>

      {/* Tab bar */}
      <div style={{ display: "flex", alignItems: "flex-end", padding: "14px 16px 0", gap: 0 }}>
        {/* Jamie tab — inactive */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 18px" }}>
          <div style={{ width: 20, height: 20, borderRadius: "50%", overflow: "hidden", border: "2px solid #E5E7EB", flexShrink: 0 }}>
            <Img src={staticFile("jamie.webp")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 400, color: "#9CA3AF", fontFamily: ff }}>Jamie</span>
        </div>
        {/* New Agent tab — active */}
        <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 16px", background: "white", border: "1.5px solid #E5E7EB", borderBottom: "1.5px solid white", borderRadius: "11px 11px 0 0", position: "relative", zIndex: 1 }}>
          <span style={{ fontSize: 18, color: "#6366F1", lineHeight: 1, fontWeight: 500 }}>+</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#111827", fontFamily: ff }}>New Agent</span>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: "1.5px", background: "#E5E7EB" }} />

      {/* Input area */}
      <div style={{ padding: "20px 22px 16px", minHeight: 132 }}>
        {hasText ? (
          <span style={{ fontSize: 17, color: "#111827", fontFamily: ff, fontWeight: 400 }}>{typedText}</span>
        ) : (
          <span style={{ fontSize: 17, color: "#D1D5DB", fontFamily: ff, fontWeight: 400 }}>Send me alerts when…</span>
        )}
      </div>

      {/* Bottom toolbar */}
      <div style={{ display: "flex", alignItems: "center", padding: "12px 18px", borderTop: "1px solid #F3F4F6", gap: 10 }}>
        {/* Clip */}
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
        </svg>
        {/* Model selector */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="4" width="16" height="16" rx="3" /><rect x="9" y="9" width="6" height="6" />
            <path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3" />
          </svg>
          <span style={{ fontSize: 14, color: "#6B7280", fontFamily: ff }}>claude-sonnet-4.6</span>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
        <div style={{ flex: 1 }} />
        {/* Send button */}
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#60A5FA", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transform: `scale(${btnScale})` }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
          </svg>
        </div>
      </div>
    </div>
  );
}

// ─── macOS cursor SVG ─────────────────────────────────────────────────────────
function MacCursor({ scale }: { scale: number }) {
  return (
    <svg width="32" height="38" viewBox="0 0 32 38" fill="none" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.35))", transform: `scale(${scale})`, transformOrigin: "0 0" }}>
      <path d="M3 2 L3 27 L10 20 L14.5 33 L18 31.5 L13.5 18.5 L23 18.5 Z" fill="white" stroke="#1a1a1a" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Main composition ─────────────────────────────────────────────────────────
export const CreateAndChoose: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ease = Easing.out(Easing.cubic);

  // ── Camera zoom: zooms in at typewriter start, holds through click ────────────
  const camScale = interpolate(frame, [T_TYPE_START, T_TYPE_START + 28], [1.0, CAM_S], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // ── Chat box exit: flies up off-screen on click ──────────────────────────────
  const chatExitY = interpolate(frame, [T_CLICK, T_CLICK + 24], [0, -760], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });

  // ── Heading: slides in, then fades out as zoom starts ──────────────────────
  const headX = interpolate(frame, [T_HEAD_IN, T_HEAD_IN + 24], [320, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease,
  });
  const headInOp = interpolate(frame, [T_HEAD_IN, T_HEAD_IN + 20], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const headOutOp = interpolate(frame, [T_TYPE_START - 6, T_TYPE_START + 10], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.in(Easing.quad),
  });
  const headOp = headInOp * headOutOp;

  // ── Chat box: springs up with 3D perspective tilt ──────────────────────────
  const chatSpring = spring({ fps, frame: Math.max(0, frame - T_CHAT_IN), config: { damping: 22, stiffness: 220, mass: 1.0 }, to: 1 });
  const chatY    = interpolate(chatSpring, [0, 1], [480, 0]);
  const chatRotX = interpolate(chatSpring, [0, 1], [22, 0]);
  // When camera zooms in: chatbox rocks right (+) then left (−) then settles
  const fSinceZoom = Math.max(0, frame - T_TYPE_START);
  const chatRotY   = interpolate(fSinceZoom, [0, 38, 86, 130, 175], [0, 5, -3, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  const chatOp   = interpolate(frame, [T_CHAT_IN, T_CHAT_IN + 14], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // ── Typewriter ──────────────────────────────────────────────────────────────
  const typeProgress = Math.min(1, Math.max(0, (frame - T_TYPE_START) / 90));
  const typedChars   = Math.floor(typeProgress * TYPING_TEXT.length);
  const typedText    = TYPING_TEXT.slice(0, typedChars);

  // ── Button scale on click ───────────────────────────────────────────────────
  const btnScale = frame < T_CLICK ? 1
    : interpolate(frame, [T_CLICK, T_CLICK + 4, T_CLICK + 9, T_CLICK + 16], [1, 0.87, 1.07, 1.0], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
      });

  // ── Cursor position ─────────────────────────────────────────────────────────
  const curEase = Easing.inOut(Easing.quad);
  const curX = interpolate(frame, [T_CUR_IN, T_CUR_ARRIVE], [CUR_SX, BTN_VIS_X], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: curEase,
  });
  const curY = interpolate(frame, [T_CUR_IN, T_CUR_ARRIVE], [CUR_SY, BTN_VIS_Y - 4], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: curEase,
  });
  const curFadeIn  = interpolate(frame, [T_CUR_IN, T_CUR_IN + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const curFadeOut = interpolate(frame, [T_CLICK + 6, T_CLICK + 16], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const curOp = Math.min(curFadeIn, curFadeOut);
  const curClickScale = frame >= T_CLICK
    ? interpolate(frame, [T_CLICK, T_CLICK + 4, T_CLICK + 10], [1, 0.78, 1], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
      })
    : 1;

  // ── Ripple rings — 3 compact rings from the button, independent of p1Op ──────
  const makeRipple = (delay: number) => {
    const f = frame - (T_CLICK + delay);
    if (f < 0) return { radius: 0, op: 0 };
    const dur = 28;
    const radius = interpolate(f, [0, dur], [22, 260], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });
    const op = interpolate(f, [0, 3, Math.round(dur * 0.45), dur], [0, 0.65, 0.25, 0], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });
    return { radius, op };
  };
  const rip1 = makeRipple(0);
  const rip2 = makeRipple(10);
  const rip3 = makeRipple(20);

  // ── Transition text ─────────────────────────────────────────────────────────
  const transSpring = spring({ fps, frame: Math.max(0, frame - T_TRANS_IN), config: { damping: 26, stiffness: 220, mass: 1.0 }, to: 1 });
  const transY  = interpolate(transSpring, [0, 1], [680, 0]);
  const transOp = interpolate(frame, [T_TRANS_IN, T_TRANS_IN + 16], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  // Exit: rockets off the top of the screen
  const transExitY = interpolate(frame, [T_TRANS_OUT, T_TRANS_GONE], [0, -900], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic),
  });

  // ── Gallery ─────────────────────────────────────────────────────────────────
  const galSpring = spring({ fps, frame: Math.max(0, frame - T_GAL_IN), config: { damping: 30, stiffness: 240, mass: 0.9 }, to: 1 });
  const galY  = interpolate(galSpring, [0, 1], [56, 0]);
  const galOp = interpolate(frame, [T_GAL_IN, T_GAL_IN + 22], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const gFrame = Math.max(0, frame - T_GAL_IN);
  const ROWS_H = 3 * CARD_H + 2 * ROW_GAP; // 662
  const galTopPad = Math.round((1080 - ROWS_H) / 2);

  return (
    <AbsoluteFill style={{ background: "#ffffff", overflow: "hidden" }}>

      {/* ── Phase 1: heading + chat box ──────────────────────────────────────── */}
      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0, transform: `scale(${camScale})`, transformOrigin: `${CAM_OX}px ${CAM_OY}px` }}>

        {/* Heading — one line via flex row so each gradient element is isolated */}
        <div style={{ transform: `translateX(${headX}px)`, opacity: headOp, marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", flexWrap: "nowrap" }}>
            <div style={{ fontSize: 88, fontWeight: 700, color: "#111827", fontFamily: ff, letterSpacing: "-0.06em", lineHeight: 1.05, whiteSpace: "nowrap" }}>Create your own&nbsp;</div>
            <div style={{ fontSize: 88, fontWeight: 700, fontFamily: ff, letterSpacing: "-0.06em", lineHeight: 1.05, background: "linear-gradient(90deg, #0006BA, #A599FF)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", paddingRight: "0.06em", paddingBottom: "0.12em", whiteSpace: "nowrap" }}>agent.</div>
          </div>
        </div>

        {/* Chat box — 3D perspective entrance */}
        <div style={{
          opacity: chatOp,
          transform: `perspective(1200px) translateY(${chatY + chatExitY}px) rotateX(${chatRotX}deg) rotateY(${chatRotY}deg)`,
          transformStyle: "preserve-3d",
        }}>
          <ChatBox typedText={typedText} btnScale={btnScale} />
        </div>

      </AbsoluteFill>

      {/* ── Ripple rings spreading from button (decorative, content fades via p1Op) */}
      {([rip1, rip2, rip3] as typeof rip1[]).map(({ radius, op }, i) =>
        radius > 0 && op > 0 ? (
          <div key={i} style={{
            position: "absolute",
            left: BTN_VIS_X - radius,
            top:  BTN_VIS_Y - radius,
            width:  radius * 2,
            height: radius * 2,
            borderRadius: "50%",
            border: "1.5px solid rgba(96, 165, 250, 0.7)",
            opacity: op,
            zIndex: 10,
            pointerEvents: "none",
          }} />
        ) : null
      )}

      {/* ── macOS cursor (hidden once ripple covers screen) ──────────────────── */}
      <div style={{ position: "absolute", left: curX, top: curY, opacity: curOp, zIndex: 9, pointerEvents: "none" }}>
        <MacCursor scale={curClickScale} />
      </div>

      {/* ── Phase 2: transition text ─────────────────────────────────────────── */}
      <AbsoluteFill style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        opacity: transOp,
        transform: `translateY(${transY + transExitY}px)`,
        pointerEvents: "none",
      }}>
        <div style={{ textAlign: "center" }}>
          <span style={{ fontSize: 84, fontWeight: 700, fontFamily: ff, letterSpacing: "-0.06em", lineHeight: 1.05, color: "#111827" }}>
            Or choose from our{" "}
          </span>
          <span style={{ fontSize: 84, fontWeight: 700, fontFamily: ff, letterSpacing: "-0.06em", lineHeight: 1.05, background: "linear-gradient(90deg, #0006BA, #A599FF)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", color: "transparent", display: "inline-block", paddingRight: "0.04em" }}>
            pre-made agents.
          </span>
        </div>
      </AbsoluteFill>

      {/* ── Phase 3: full-width gallery ──────────────────────────────────────── */}
      <AbsoluteFill style={{
        opacity: galOp,
        transform: `translateY(${galY}px)`,
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        paddingTop: galTopPad,
        paddingBottom: galTopPad,
        gap: ROW_GAP,
        maskImage: "linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)",
        overflow: "hidden",
      }}>
        <ScrollRow agents={ROW1} gFrame={gFrame} speed={12} dir={-1} />
        <ScrollRow agents={ROW2} gFrame={gFrame} speed={9}  dir={1}  />
        <ScrollRow agents={ROW3} gFrame={gFrame} speed={7}  dir={-1} />
      </AbsoluteFill>

    </AbsoluteFill>
  );
};
