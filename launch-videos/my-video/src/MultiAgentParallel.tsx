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

// ─── Layout (1920 × 1080) ─────────────────────────────────────────────────────
const CARD_W    = 560;
const CARD_H    = 660;
const CARD_GAP  = 32;
const TOTAL_W   = CARD_W * 3 + CARD_GAP * 2; // 1744
const LEFT      = (1920 - TOTAL_W) / 2;        // 88

const WRAP_PAD   = 20;  // padding inside the outer border rectangle
const HEADING_H  = 155; // 75px text + gap below
const TOP_PAD    = Math.round((1080 - (HEADING_H + CARD_H + WRAP_PAD * 2)) / 2); // vertically centered
const CARD_TOP   = TOP_PAD + HEADING_H;

// ─── Card stagger (60fps, 240 frames = 4 secs) ────────────────────────────────
const S1 = 20;
const S2 = 40;
const S3 = 60;

// ─── Palette ──────────────────────────────────────────────────────────────────
const BD = "rgba(0,0,0,0.07)";
const GC = "#22c55e";
const TX = "#111111";
const MU = "#6b7280";
const LI = "#9ca3af";

// ─── Platform themes ──────────────────────────────────────────────────────────
const TG = { headerBg: "#EBF7FF", accent: "#0088CC", border: "#BDD9EE", chatBg: "#F3F9FD", label: "Telegram", labelColor: "#0088CC" };
const SL = { headerBg: "#FAF5FF", accent: "#7C3AED", border: "#DDD0EE", chatBg: "#FAF8FF", label: "Slack",    labelColor: "#611F69" };
const GM = { headerBg: "#FFF6F5", accent: "#EA4335", border: "#FAD4D0", chatBg: "#FFF8F7", label: "Gmail",    labelColor: "#EA4335" };

// ─── Animation helpers ────────────────────────────────────────────────────────
function useCardEntrance(frame: number, fps: number, start: number): React.CSSProperties {
  const f = Math.max(0, frame - start);
  const s = spring({ fps, frame: f, config: { damping: 28, stiffness: 300, mass: 0.75 }, to: 1 });
  return {
    opacity: interpolate(f, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    transform: `translateY(${interpolate(s, [0, 1], [80, 0])}px)`,
  };
}

function fi(frame: number, s: number, e: number): React.CSSProperties {
  return {
    opacity: interpolate(frame, [s, e], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    transform: `translateY(${interpolate(frame, [s, e], [6, 0], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    })}px)`,
  };
}

function OnlineDot({ frame }: { frame: number }) {
  const PULSE = 76;
  const ph = (frame % PULSE) / PULSE;
  const ringScale = interpolate(ph, [0, 0.7], [1, 2.5], { extrapolateRight: "clamp" });
  const ringOp    = interpolate(ph, [0, 0.45, 0.7], [0.7, 0.15, 0], { extrapolateRight: "clamp" });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
      <div style={{ position: "relative", width: 10, height: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", width: 10, height: 10, borderRadius: "50%", border: `1.5px solid ${GC}`, transform: `scale(${ringScale})`, opacity: ringOp }} />
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: GC, position: "relative" }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color: GC, fontFamily: ff }}>Online</span>
    </div>
  );
}

// ─── Platform header ──────────────────────────────────────────────────────────
interface PlatformHeaderProps {
  theme: typeof TG;
  name: string;
  context: string;
  frame: number;
  avatarColor: string;
  initial: string;
  avatarImg?: string;
  logoImg: string;
}

const HEADER_H = 72;

function PlatformHeader({ theme, name, context, frame, avatarColor, initial, avatarImg, logoImg }: PlatformHeaderProps) {
  return (
    <div style={{ height: HEADER_H, background: theme.headerBg, borderBottom: `1.5px solid ${theme.border}`, display: "flex", alignItems: "center", padding: "0 20px", gap: 12, flexShrink: 0 }}>
      {/* Agent avatar */}
      {avatarImg ? (
        <div style={{ width: 42, height: 42, borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: `2px solid ${theme.accent}44` }}>
          <Img src={staticFile(avatarImg)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
        </div>
      ) : (
        <div style={{ width: 42, height: 42, borderRadius: "50%", background: avatarColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 700, color: "#fff", fontFamily: ff, flexShrink: 0 }}>
          {initial}
        </div>
      )}
      {/* Name + context */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: TX, fontFamily: ff, letterSpacing: "-0.02em", lineHeight: 1.2 }}>{name}</div>
        <div style={{ fontSize: 11, color: MU, fontFamily: ff, marginTop: 2 }}>{context}</div>
      </div>
      <OnlineDot frame={frame} />
      {/* Platform logo */}
      <div style={{ marginLeft: 8, display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
        <Img src={staticFile(logoImg)} style={{ width: 22, height: 22, objectFit: "contain" }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: theme.labelColor, fontFamily: ff, letterSpacing: "-0.01em" }}>{theme.label}</span>
      </div>
    </div>
  );
}

// ─── Chat bar ─────────────────────────────────────────────────────────────────
const CHATBAR_H = 52;

function ChatBar({ placeholder, theme, leftIcon }: { placeholder: string; theme: typeof TG; leftIcon?: React.ReactNode }) {
  return (
    <div style={{ height: CHATBAR_H, background: theme.chatBg, borderTop: `1px solid ${theme.border}`, display: "flex", alignItems: "center", padding: "0 14px", gap: 8, flexShrink: 0 }}>
      {leftIcon}
      <div style={{ flex: 1, background: "#ffffff", borderRadius: 22, border: `1px solid ${theme.border}`, padding: "7px 14px", fontSize: 12, color: LI, fontFamily: ff, lineHeight: 1 }}>
        {placeholder}
      </div>
      <div style={{ width: 30, height: 30, borderRadius: "50%", background: theme.accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width="13" height="11" viewBox="0 0 13 11" fill="none">
          <path d="M1 5.5H12M12 5.5L8 1.5M12 5.5L8 9.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
}

// ─── Card shell (fixed 560×660, flex column) ──────────────────────────────────
function CardShell({ entrance, children }: { entrance: React.CSSProperties; children: React.ReactNode }) {
  return (
    <div style={{
      width: CARD_W,
      height: CARD_H,
      display: "flex",
      flexDirection: "column",
      background: "#ffffff",
      borderRadius: 20,
      border: "1px solid #E5E7EB",
      boxShadow: "0 4px 28px rgba(0,0,0,0.07), 0 1px 6px rgba(0,0,0,0.04)",
      overflow: "hidden",
      ...entrance,
    }}>
      {children}
    </div>
  );
}

function ContentArea({ children, padding = "12px 20px 14px" }: { children: React.ReactNode; padding?: string }) {
  return (
    <div style={{ flex: 1, overflow: "hidden", padding }}>
      {children}
    </div>
  );
}

// ─── Jordan Card — Telegram (Executive Assistant · daily briefing) ─────────────
//
// 20  card springs up
// 32  greeting     42 sched header   52-68 sched items
// 80  metrics hdr  88 metrics row
// 102 att hdr      110-130 att items
// 140 actions hdr  148-164 action items
// 176 typing       188 reply bubble
//
const JordanCard: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const entrance = useCardEntrance(frame, fps, S1);

  const G0 = S1 + 12;  const G1 = G0 + 10;
  const G2 = G1 + 10;  const G3 = G2 + 8;  const G4 = G3 + 8;
  const G5 = G4 + 12;  const G6 = G5 + 8;
  const G7 = G6 + 14;  const G8 = G7 + 8;  const G9 = G8 + 10;  const G10 = G9 + 10;
  // Quick Actions section
  const G_FA  = G10 + 10; // header
  const G_FA1 = G_FA + 8; // action 1
  const G_FA2 = G_FA1 + 8; // action 2
  const G_FA3 = G_FA2 + 8; // action 3
  // Reply bubble (shifted to follow quick actions)
  const G11 = G_FA3 + 12; // "Jordan is typing..." indicator
  const G12 = G11 + 12;   // sent message appears
  const replyMaxW = interpolate(frame, [G12, G12 + 32], [0, 360], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const schedItems = [
    { time: "9:30 AM", text: "Investor call — Sequoia (Series A)" },
    { time: "2:00 PM", text: "Product review with eng team" },
    { time: "4:00 PM", text: "1:1 with Marcus (Head of Sales)" },
  ];
  const schedG = [G2, G3, G4];

  const attItems = [
    { text: "Contract renewal from Acme Corp (due in 3 days)", red: true },
    { text: "Jessica Chen from Hyperloop.ai replied to your outreach", red: false },
    { text: "Your competitor raised Series B — see press release", red: false },
  ];
  const attG = [G8, G9, G10];

  return (
    <CardShell entrance={entrance}>
      <PlatformHeader
        theme={TG}
        name="Jordan"
        context="via Telegram · sent 6:47 AM"
        frame={frame}
        avatarColor="#f97316"
        initial="J"
        avatarImg="jordan-avatar.png"
        logoImg="telegram-logo.png"
      />

      <ContentArea>
        <div style={{ background: "#F0F7FB", borderRadius: 12, padding: "12px 14px", border: "1px solid #DFF0F9" }}>

          <div style={{ fontSize: 12, fontWeight: 600, color: TX, fontFamily: ff, marginBottom: 12, ...fi(frame, G0, G0 + 12) }}>
            Good morning! Here's your daily briefing.
          </div>

          {/* Schedule */}
          <div style={{ marginBottom: 11 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6, ...fi(frame, G1, G1 + 10) }}>
              <span style={{ fontSize: 11 }}>📅</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: LI, fontFamily: ff, textTransform: "uppercase", letterSpacing: "0.07em" }}>Today's Schedule</span>
            </div>
            {schedItems.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 3, ...fi(frame, schedG[i], schedG[i] + 10) }}>
                <span style={{ fontSize: 10, color: "#0088CC", fontFamily: ff, fontWeight: 600, flexShrink: 0, width: 52 }}>{item.time}</span>
                <span style={{ fontSize: 10, color: TX, fontFamily: ff }}>{item.text}</span>
              </div>
            ))}
          </div>

          {/* Metrics */}
          <div style={{ marginBottom: 11 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6, ...fi(frame, G5, G5 + 10) }}>
              <span style={{ fontSize: 11 }}>📊</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: LI, fontFamily: ff, textTransform: "uppercase", letterSpacing: "0.07em" }}>Last 24H Metrics</span>
            </div>
            <div style={{ display: "flex", gap: 7, ...fi(frame, G6, G6 + 10) }}>
              {[
                { label: "Revenue", value: "$4,820", change: "↑ 18%", up: true  },
                { label: "Signups", value: "12",     change: "↑ 4",   up: true  },
                { label: "Churn",   value: "1",      change: "↓ 2",   up: false },
              ].map((m, i) => (
                <div key={i} style={{ flex: 1, background: "#fff", borderRadius: 8, padding: "6px 8px", border: `1px solid ${BD}` }}>
                  <div style={{ fontSize: 8, color: LI, fontFamily: ff, marginBottom: 1, textTransform: "uppercase", letterSpacing: "0.05em" }}>{m.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: TX, fontFamily: ff, letterSpacing: "-0.02em" }}>{m.value}</div>
                  <div style={{ fontSize: 9, fontWeight: 600, color: m.up ? GC : "#ef4444", fontFamily: ff }}>{m.change}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Attention */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6, ...fi(frame, G7, G7 + 10) }}>
              <span style={{ fontSize: 11 }}>⚡</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: LI, fontFamily: ff, textTransform: "uppercase", letterSpacing: "0.07em" }}>Needs Your Attention</span>
            </div>
            {attItems.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: i < 2 ? 4 : 0, ...fi(frame, attG[i], attG[i] + 10) }}>
                <div style={{ width: i === 0 ? 6 : 4, height: i === 0 ? 6 : 4, borderRadius: "50%", background: i === 0 ? "#ef4444" : LI, flexShrink: 0, marginTop: i === 0 ? 4 : 5 }} />
                <span style={{ fontSize: 10, color: i === 0 ? "#ef4444" : TX, fontFamily: ff, lineHeight: 1.4, fontWeight: i === 0 ? 600 : 400 }}>{item.text}</span>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div style={{ marginTop: 11 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6, ...fi(frame, G_FA, G_FA + 10) }}>
              <span style={{ fontSize: 11 }}>✅</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: LI, fontFamily: ff, textTransform: "uppercase", letterSpacing: "0.07em" }}>Quick Actions</span>
            </div>
            {[
              { text: "Send agenda to Sequoia before 9:30 AM call",   g: G_FA1 },
              { text: "Review Acme Corp contract — renewal due Fri",   g: G_FA2 },
              { text: "Block Thu–Fri calendar for deep work sessions", g: G_FA3 },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: i < 2 ? 4 : 0, ...fi(frame, item.g, item.g + 10) }}>
                <div style={{ width: 14, height: 14, borderRadius: 4, border: `1.5px solid #0088CC`, flexShrink: 0, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 6, height: 6, borderRadius: 2, background: "#0088CC", opacity: interpolate(frame, [item.g + 6, item.g + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }} />
                </div>
                <span style={{ fontSize: 10, color: TX, fontFamily: ff, lineHeight: 1.4 }}>{item.text}</span>
              </div>
            ))}
          </div>

        {/* Typing indicator → sent reply bubble */}
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
          {/* "typing…" dots */}
          <div style={{ display: "flex", alignItems: "center", gap: 5, ...fi(frame, G11, G11 + 10) }}>
            <span style={{ fontSize: 9, color: LI, fontFamily: ff, fontStyle: "italic" }}>Jordan is typing…</span>
            <div style={{ display: "flex", gap: 3 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: "#0088CC", opacity: interpolate((frame - G11 + 16 - i * 8) % 24, [0, 12, 24], [0.3, 1, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }} />
              ))}
            </div>
          </div>
          {/* Sent message bubble (right-aligned, Telegram blue) */}
          <div style={{ maxWidth: `${replyMaxW}px`, overflow: "hidden", background: "linear-gradient(135deg, #0088CC, #229ED9)", borderRadius: "14px 14px 2px 14px", padding: "9px 12px", ...fi(frame, G12, G12 + 10) }}>
            <span style={{ fontSize: 11, color: "#ffffff", fontFamily: ff, lineHeight: 1.4, whiteSpace: "nowrap", display: "block" }}>
              On it. Prioritizing Acme renewal for today's session.
            </span>
          </div>
        </div>

        </div>
      </ContentArea>

      <ChatBar
        placeholder="Reply to Jordan..."
        theme={TG}
        leftIcon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={LI} strokeWidth="2" strokeLinecap="round"><circle cx="15.5" cy="8.5" r="2.5"/><path d="M20 4H4C2.9 4 2 4.9 2 6v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"/></svg>}
      />
    </CardShell>
  );
};

// ─── Alex Card — Slack (Onboarding Agent · users live + tasks) ────────────────
//
// 40  card springs up
// 52 header  58 col headers
// 66 row-1   76 row-2   86 row-3   96 row-4
// 108 t1 typing  122 done  130 check
// 136 t2 typing  154 done  162 check
// 172 t3 typing  192 done  200 check
// 206 stats chips  216 next-in-queue
//
const AlexCard: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const entrance = useCardEntrance(frame, fps, S2);
  const CD  = "#4338CA";
  const CW  = 8;

  const HEADER_G = S2 + 12;
  const COLS_G   = S2 + 18;
  const ROW0_G   = COLS_G + 8;
  const ROW1_G   = ROW0_G + 10;
  const ROW2_G   = ROW1_G + 10;
  const ROW3_G   = ROW2_G + 10;
  const T1_G     = ROW3_G + 12;
  const T1_END   = T1_G   + 14;
  const T1_CHECK = T1_END + 8;
  const T2_G     = T1_CHECK + 6;
  const T2_END   = T2_G   + 18;
  const T2_CHECK = T2_END + 8;
  const T3_G     = T2_CHECK + 10;
  const T3_END   = T3_G   + 18;
  const T3_CHECK = T3_END + 8;
  // Session summary + next-in-queue (T3_CHECK ≈ 200, fits within 240 frames)
  const STATS_G    = T3_CHECK + 6;
  const NEXT_G     = STATS_G  + 10;
  const NEXT_END   = NEXT_G   + 12;
  const NEXT_CHECK = NEXT_END + 5;

  const t1MaxW  = interpolate(frame, [T1_G, T1_END],   [0, 34 * CW], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const t2MaxW  = interpolate(frame, [T2_G, T2_END],   [0, 44 * CW], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const t3MaxW  = interpolate(frame, [T3_G, T3_END],   [0, 40 * CW], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const t1Check = interpolate(frame, [T1_CHECK, T1_CHECK + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const t2Check = interpolate(frame, [T2_CHECK, T2_CHECK + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const t3Check = interpolate(frame, [T3_CHECK, T3_CHECK + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const nextMaxW  = interpolate(frame, [NEXT_G, NEXT_END],         [0, 36 * CW], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const nextCheck = interpolate(frame, [NEXT_CHECK, NEXT_CHECK + 8], [0, 1],     { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const Check = (op: number) => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={GC} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: op, flexShrink: 0 }}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );

  const planBadge = (plan: string): React.CSSProperties => {
    if (plan === "free trial") return { color: "#c2410c", background: "#fff7ed", border: "1px solid #fed7aa" };
    if (plan === "pro")        return { color: "#15803d", background: "#f0fdf4", border: "1px solid #bbf7d0" };
    return                            { color: "#1d4ed8", background: "#eff6ff", border: "1px solid #bfdbfe" };
  };

  const users = [
    { i: "J", col: "#3b82f6", name: "Jessica Chen", isNew: true,  email: "jessica@hyperloop.ai", plan: "free trial" },
    { i: "T", col: "#14b8a6", name: "Tom Harris",   isNew: false, email: "tom@buildthings.co",   plan: "pro"        },
    { i: "A", col: "#8b5cf6", name: "Anna Müller",  isNew: false, email: "anna@flowtools.de",    plan: "starter"    },
    { i: "R", col: "#f97316", name: "Ryan Park",    isNew: false, email: "ryan@launchfast.io",   plan: "pro"        },
  ];
  const rowG = [ROW0_G, ROW1_G, ROW2_G, ROW3_G];

  return (
    <CardShell entrance={entrance}>
      <PlatformHeader
        theme={SL}
        name="Alex"
        context="#onboarding · Alex's workspace"
        frame={frame}
        avatarColor="#6366f1"
        initial="A"
        avatarImg="alex-avatar.png"
        logoImg="slack-logo.png"
      />

      <ContentArea padding="12px 20px 14px">

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, ...fi(frame, HEADER_G, HEADER_G + 10) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={MU} strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="9" x2="9" y2="21"/>
            </svg>
            <span style={{ fontSize: 12, fontWeight: 600, color: MU, fontFamily: ff }}>users · live</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: GC }} />
            <span style={{ fontSize: 10, color: GC, fontFamily: ff, fontWeight: 500 }}>new signup</span>
          </div>
        </div>

        <div style={{ display: "flex", paddingBottom: 6, borderBottom: `1px solid ${BD}`, ...fi(frame, COLS_G, COLS_G + 8) }}>
          <span style={{ flex: 1.4, fontSize: 8, fontWeight: 700, color: LI, fontFamily: ff, textTransform: "uppercase", letterSpacing: "0.06em" }}>Name</span>
          <span style={{ flex: 1.6, fontSize: 8, fontWeight: 700, color: LI, fontFamily: ff, textTransform: "uppercase", letterSpacing: "0.06em" }}>Email</span>
          <span style={{ flex: 0.8, fontSize: 8, fontWeight: 700, color: LI, fontFamily: ff, textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "right" }}>Plan</span>
        </div>

        {users.map((u, idx) => (
          <div key={u.name} style={{ display: "flex", alignItems: "center", padding: "7px 0", borderBottom: idx < 3 ? `1px solid ${BD}` : "none", ...fi(frame, rowG[idx], rowG[idx] + 10) }}>
            <div style={{ flex: 1.4, display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: u.col, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff", fontFamily: ff, flexShrink: 0 }}>{u.i}</div>
              <span style={{ fontSize: 11, fontWeight: 500, color: TX, fontFamily: ff }}>{u.name}</span>
              {u.isNew && <span style={{ fontSize: 8, fontWeight: 700, color: "#3b82f6", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 3, padding: "1px 4px", fontFamily: ff, flexShrink: 0 }}>NEW</span>}
            </div>
            <span style={{ flex: 1.6, fontSize: 10, color: MU, fontFamily: ff }}>{u.email}</span>
            <div style={{ flex: 0.8, display: "flex", justifyContent: "flex-end" }}>
              <span style={{ fontSize: 9, fontWeight: 600, borderRadius: 4, padding: "2px 6px", fontFamily: ff, ...planBadge(u.plan) }}>{u.plan}</span>
            </div>
          </div>
        ))}

        <div style={{ background: "#F8F5FF", borderRadius: 9, padding: "8px 10px", marginTop: 9, marginBottom: 6, ...fi(frame, T1_G, T1_G + 10) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: GC, flexShrink: 0 }} />
            <div style={{ flex: 1, overflow: "hidden" }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: CD, fontFamily: "'Courier New', monospace", maxWidth: `${t1MaxW}px`, display: "block", overflow: "hidden", whiteSpace: "nowrap" }}>
                enrich_lead · jessica@hyperloop.ai
              </span>
            </div>
            {Check(t1Check)}
          </div>
        </div>

        <div style={{ background: "#F8F5FF", borderRadius: 9, padding: "8px 10px", marginBottom: 6, ...fi(frame, T2_G, T2_G + 10) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: GC, flexShrink: 0 }} />
            <div style={{ flex: 1, overflow: "hidden" }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: CD, fontFamily: "'Courier New', monospace", maxWidth: `${t2MaxW}px`, display: "block", overflow: "hidden", whiteSpace: "nowrap" }}>
                compose_email · personalizing for Jessica...
              </span>
            </div>
            {Check(t2Check)}
          </div>
        </div>

        {/* Task 3 */}
        <div style={{ background: "#F8F5FF", borderRadius: 9, padding: "8px 10px", ...fi(frame, T3_G, T3_G + 10) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: GC, flexShrink: 0 }} />
            <div style={{ flex: 1, overflow: "hidden" }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: CD, fontFamily: "'Courier New', monospace", maxWidth: `${t3MaxW}px`, display: "block", overflow: "hidden", whiteSpace: "nowrap" }}>
                schedule_call · booking onboarding for Jessica
              </span>
            </div>
            {Check(t3Check)}
          </div>
        </div>

        {/* Session Summary chips */}
        <div style={{ display: "flex", gap: 6, marginTop: 10, ...fi(frame, STATS_G, STATS_G + 10) }}>
          {[
            { label: "4 leads enriched", color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" },
            { label: "2 emails sent",    color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe" },
            { label: "1 call booked",    color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
          ].map((chip, i) => (
            <div key={i} style={{ fontSize: 9, fontWeight: 600, color: chip.color, background: chip.bg, border: `1px solid ${chip.border}`, borderRadius: 20, padding: "3px 8px", fontFamily: ff }}>
              {chip.label}
            </div>
          ))}
        </div>

        {/* Next in queue */}
        <div style={{ marginTop: 9, ...fi(frame, NEXT_G, NEXT_G + 10) }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: LI, fontFamily: ff, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>Next in queue</div>
          <div style={{ background: "#F8F5FF", borderRadius: 9, padding: "8px 10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#a78bfa", flexShrink: 0 }} />
              <div style={{ flex: 1, overflow: "hidden" }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: CD, fontFamily: "'Courier New', monospace", maxWidth: `${nextMaxW}px`, display: "block", overflow: "hidden", whiteSpace: "nowrap" }}>
                  send_proposal · ryan@launchfast.io
                </span>
              </div>
              {Check(nextCheck)}
            </div>
          </div>
        </div>

      </ContentArea>

      <ChatBar
        placeholder="Message Alex..."
        theme={SL}
        leftIcon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={LI} strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h10M4 17h16"/></svg>}
      />
    </CardShell>
  );
};

// ─── Maya Card — Gmail (Inbox Manager · Gmail inbox) ─────────────────────────
//
// 60  card springs up
// 76  inbox header
// 82-142 email rows (12 apart)
// 158 summary slides up
// 178 action chips
//
const MayaCard: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const entrance = useCardEntrance(frame, fps, S3);

  const INBOX_G    = S3 + 16;
  const EMAIL_BASE = S3 + 22;
  const emailG     = (i: number) => EMAIL_BASE + i * 12;
  const SUMMARY_G  = emailG(6) + 4;
  const ACTION_G   = SUMMARY_G + 20;

  const summarySlide = interpolate(frame, [SUMMARY_G, SUMMARY_G + 16], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const summaryOp    = interpolate(frame, [SUMMARY_G, SUMMARY_G + 16], [0, 1],  { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const emails = [
    { i: "M", col: "#ef4444", name: "Michael Torres",  badge: "Replied",  bC: "#15803d", bBg: "#f0fdf4", bBorder: "#bbf7d0", preview: "Q3 contract renewal — wanted to follow up..." },
    { i: "N", col: "#8b5cf6", name: "Newsletter · PH", badge: "Archived", bC: "#6b7280", bBg: "#f3f4f6", bBorder: "#e5e7eb", preview: "Today's launches — 🚀 14 new products launched..." },
    { i: "S", col: "#14b8a6", name: "Sarah Webb",      badge: "Replied",  bC: "#15803d", bBg: "#f0fdf4", bBorder: "#bbf7d0", preview: "Agency partnership — following your work..." },
    { i: "B", col: "#f97316", name: "Ben Carter",      badge: "Flagged",  bC: "#c2410c", bBg: "#fff7ed", bBorder: "#fed7aa", preview: "Urgent: server down? — our integration stopped..." },
    { i: "S", col: "#6366f1", name: "Stripe",          badge: "Archived", bC: "#6b7280", bBg: "#f3f4f6", bBorder: "#e5e7eb", preview: "Your monthly invoice — $4,200 charged..." },
    { i: "A", col: "#f59e0b", name: "AppSumo",         badge: "Archived", bC: "#6b7280", bBg: "#f3f4f6", bBorder: "#e5e7eb", preview: "Flash deal: 90% off tool — Limited time offer..." },
  ];

  return (
    <CardShell entrance={entrance}>
      <PlatformHeader
        theme={GM}
        name="Maya"
        context="Inbox · maya@blink.new"
        frame={frame}
        avatarColor="#8b5cf6"
        initial="M"
        avatarImg="maya-avatar.png"
        logoImg="gmail-logo.png"
      />

      {/* Inbox header row */}
      <div style={{ padding: "9px 20px", borderBottom: `1px solid ${BD}`, display: "flex", alignItems: "center", gap: 8, flexShrink: 0, ...fi(frame, INBOX_G, INBOX_G + 10) }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: TX, fontFamily: ff }}>Inbox</span>
        <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 20, padding: "2px 8px" }}>
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke={GC} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          <span style={{ fontSize: 9, fontWeight: 700, color: "#15803d", fontFamily: ff }}>Zero</span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 20, height: 20, borderRadius: "50%", overflow: "hidden" }}>
            <Img src={staticFile("maya-avatar.png")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
          </div>
          <span style={{ fontSize: 10, color: MU, fontFamily: ff }}>Maya working...</span>
        </div>
      </div>

      {/* Email rows */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        {emails.map((e, idx) => {
          const rg = emailG(idx);
          return (
            <div key={idx} style={{ display: "flex", alignItems: "flex-start", padding: "8px 20px", borderBottom: `1px solid ${BD}`, gap: 9, ...fi(frame, rg, rg + 10) }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: e.col, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", fontFamily: ff, flexShrink: 0 }}>{e.i}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: TX, fontFamily: ff }}>{e.name}</span>
                  <span style={{ fontSize: 8, fontWeight: 700, borderRadius: 3, padding: "1px 5px", fontFamily: ff, color: e.bC, background: e.bBg, border: `1px solid ${e.bBorder}`, flexShrink: 0 }}>{e.badge}</span>
                </div>
                <div style={{ fontSize: 9, color: LI, fontFamily: ff, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.preview}</div>
              </div>
            </div>
          );
        })}

        {/* Summary card */}
        <div style={{ margin: "8px 20px", background: "#FFF0EE", borderRadius: 10, padding: "9px 12px", opacity: summaryOp, transform: `translateY(${summarySlide}px)` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", overflow: "hidden" }}>
              <Img src={staticFile("maya-avatar.png")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: TX, fontFamily: ff }}>Maya · Inbox summary</span>
          </div>
          <div style={{ fontSize: 10, color: MU, fontFamily: ff, lineHeight: 1.6 }}>
            Cleared <strong style={{ color: TX }}>47 emails</strong>. Replied to <strong style={{ color: TX }}>2 clients</strong>, archived 8 newsletters. <strong style={{ color: "#ef4444" }}>1 urgent item</strong>: Ben Carter — integration issue. Flagged & drafted holding reply.
          </div>
          {/* Action chips */}
          <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap", ...fi(frame, ACTION_G, ACTION_G + 12) }}>
            {[
              { label: "✓ Holding reply sent", color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" },
              { label: "✓ Ben Carter flagged", color: "#c2410c", bg: "#fff7ed", border: "#fed7aa" },
            ].map((chip, i) => (
              <div key={i} style={{ fontSize: 9, fontWeight: 600, color: chip.color, background: chip.bg, border: `1px solid ${chip.border}`, borderRadius: 20, padding: "3px 9px", fontFamily: ff }}>
                {chip.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <ChatBar
        placeholder="Compose or reply..."
        theme={GM}
        leftIcon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={LI} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>}
      />
    </CardShell>
  );
};

// ─── Root composition ─────────────────────────────────────────────────────────
export const MultiAgentParallel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Heading floats in FROM TOP (negative translateY → 0)
  const headingOp = interpolate(frame, [0, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const headingY  = interpolate(frame, [0, 28], [-40, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Outer border rectangle fades in just before cards
  const wrapperOp = interpolate(frame, [S1 - 6, S1 + 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: "#ffffff", overflow: "hidden" }}>

      {/* Heading — floats in from top */}
      <div style={{
        position: "absolute",
        top: TOP_PAD,
        left: LEFT - WRAP_PAD,
        opacity: headingOp,
        transform: `translateY(${headingY}px)`,
      }}>
        <span style={{ fontSize: 75, fontWeight: 700, fontFamily: ff, letterSpacing: "-0.06em", lineHeight: 1.05, display: "block", whiteSpace: "nowrap" }}>
          <span style={{ color: TX }}>Run </span>
          <span style={{
            background: "linear-gradient(90deg, #0006BA, #A599FF)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            paddingRight: "0.08em",
          }}>multiple agents</span>
          <span style={{ color: TX }}> in parallel</span>
        </span>
      </div>

      {/* Outer border rectangle grouping all cards */}
      <div style={{
        position: "absolute",
        top: CARD_TOP - WRAP_PAD,
        left: LEFT - WRAP_PAD,
        padding: WRAP_PAD,
        borderRadius: 28,
        border: "1.5px solid rgba(0,0,0,0.09)",
        background: "linear-gradient(160deg, rgba(248,249,252,0.7) 0%, rgba(244,245,252,0.4) 100%)",
        boxShadow: "0 12px 48px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.03)",
        opacity: wrapperOp,
      }}>
        <div style={{ display: "flex", gap: CARD_GAP, alignItems: "flex-start" }}>
          <JordanCard frame={frame} fps={fps} />
          <AlexCard   frame={frame} fps={fps} />
          <MayaCard   frame={frame} fps={fps} />
        </div>
      </div>

    </AbsoluteFill>
  );
};
