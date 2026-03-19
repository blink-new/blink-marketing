import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { brand } from "./brand";

const ff = brand.fonts.heading;

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg: "#ffffff",
  text: "#111111",
  textMuted: "#6b7280",
  textLight: "#9ca3af",
  btnBg: "#4F6EF7",
  btnText: "#ffffff",
  green: "#22c55e",
  ripple: "rgba(79,110,247,0.20)",
  cardShadow:
    "0 12px 48px rgba(0,0,0,0.09), 0 2px 12px rgba(0,0,0,0.05)",
};

// ─── Layout (1920 × 1080) ─────────────────────────────────────────────────────
const W = 1920;
const H = 1080;
const CX = W / 2; // 960
const CY = H / 2; // 540

const BTN_W = 420;
const BTN_H = 96;

// macOS cursor tip lands just left-of-center (accounts for svg viewBox offset)
const CURSOR_END_X = CX - 8;
const CURSOR_END_Y = CY - 10;
const CURSOR_START_X = 1980;
const CURSOR_START_Y = 430;

// ─── TextSlide ─────────────────────────────────────────────────────────────────
// Local frames 0-27  (global 0-27)
// 0-12  : snappy spring in from right
// 12-27 : sharp eased exit to left
const TextSlide: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const inSpring = spring({
    fps,
    frame,
    config: { damping: 32, stiffness: 360, mass: 0.65 },
    to: 1,
  });
  const inX = interpolate(inSpring, [0, 1], [700, 0]);

  const HOLD_END = 64;   // hold text centered for ~0.8s before exit
  const EXIT_END = 84;
  const outX = interpolate(frame, [HOLD_END, EXIT_END], [0, -700], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });

  const translateX = frame < 16 ? inX : frame < HOLD_END ? 0 : outX;

  return (
    <AbsoluteFill
      style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <div
        style={{
          fontSize: 120,
          fontWeight: 700,
          fontFamily: ff,
          letterSpacing: "-0.06em",
          lineHeight: 1.1,
          whiteSpace: "nowrap",
          transform: `translateX(${translateX}px)`,
          display: "flex",
          alignItems: "baseline",
          gap: "0.18em",
        }}
      >
        <span style={{ color: "#111111" }}>Deploy your agent in</span>
        <span style={{
          background: "linear-gradient(90deg, #0006BA, #A599FF)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}>one click</span>
      </div>
    </AbsoluteFill>
  );
};

// ─── DeployButton ──────────────────────────────────────────────────────────────
// Local frames 0-125  (global 56-181)
// 0-36  : springs in from right
// local 94 (global 150): click — spring scale 0.93 → 1.0
// local 96 (global 152): exits fully off-screen upward
const DeployButton: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const LOCAL_CLICK = 64;
  const LOCAL_EXIT = 66;

  // Slide in from right: spring translateX 900 → 0
  const slideSpring = spring({
    fps,
    frame,
    config: { damping: 26, stiffness: 260, mass: 0.85 },
    to: 1,
  });
  const slideInX = interpolate(slideSpring, [0, 1], [900, 0]);

  // Click bounce: spring from 0.93 → 1.0
  const clickScale =
    frame >= LOCAL_CLICK
      ? spring({
          fps,
          frame: frame - LOCAL_CLICK,
          config: { damping: 13, stiffness: 320, mass: 0.6 },
          from: 0.93,
          to: 1.0,
        })
      : 1.0;

  // Exit fully off-screen upward — need > (CY + BTN_H/2) to clear top edge
  // Button center is at y=540; top edge at ~499; need translateY < -560 to exit
  const exitY =
    frame >= LOCAL_EXIT
      ? spring({
          fps,
          frame: frame - LOCAL_EXIT,
          config: { damping: 80, stiffness: 380, mass: 1 },
          from: 0,
          to: -680,
        })
      : 0;

  return (
    <AbsoluteFill
      style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <div
        style={{
          width: BTN_W,
          height: BTN_H,
          background: C.btnBg,
          // Rounded rectangle — not pill
          borderRadius: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          transform: `translateX(${slideInX}px) scale(${clickScale}) translateY(${exitY}px)`,
          transformOrigin: "center center",
          boxShadow: "0 8px 36px rgba(79,110,247,0.45)",
        }}
      >
        {/* Robot icon */}
        <svg
          width="34"
          height="34"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ display: "block", flexShrink: 0 }}
        >
          {/* Head */}
          <rect x="3" y="7" width="18" height="13" rx="2" />
          {/* Antenna stem */}
          <line x1="12" y1="7" x2="12" y2="4" />
          {/* Antenna tip */}
          <circle cx="12" cy="3" r="1" fill="white" stroke="none" />
          {/* Eyes */}
          <circle cx="8.5" cy="13" r="1.5" fill="white" stroke="none" />
          <circle cx="15.5" cy="13" r="1.5" fill="white" stroke="none" />
          {/* Mouth */}
          <path d="M9 17h6" />
        </svg>
        <span
          style={{
            fontSize: 28,
            fontWeight: 600,
            color: C.btnText,
            fontFamily: ff,
            letterSpacing: "-0.02em",
          }}
        >
          Deploy Agent →
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ─── Click ripple ──────────────────────────────────────────────────────────────
// Local frames 0-29  (global 105-134)
// Spring-driven light-blue circle expanding from button center
const ClickRipple: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s = spring({
    fps,
    frame,
    config: { damping: 20, stiffness: 48 },
    to: 1,
  });

  const r = interpolate(s, [0, 1], [0, 300]);
  const op = interpolate(s, [0, 0.22, 1], [0.55, 0.22, 0]);

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: CX - r,
          top: CY - r,
          width: r * 2,
          height: r * 2,
          borderRadius: "50%",
          background: C.ripple,
          opacity: op,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

// ─── macOS arrow cursor ────────────────────────────────────────────────────────
// Local frames 0-125  (global 56-181)
// 0-94 : glides quickly from far right to button center
// 94   : click — scale 1.0 → 0.70 → 1.0
// 104-118: fade out
const CursorScene: React.FC = () => {
  const frame = useCurrentFrame();

  const LOCAL_ARRIVE = 64;

  // Glide (interpolate, inOut easing)
  const cx = interpolate(
    frame,
    [0, LOCAL_ARRIVE],
    [CURSOR_START_X, CURSOR_END_X],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    }
  );
  const cy = interpolate(
    frame,
    [0, LOCAL_ARRIVE],
    [CURSOR_START_Y, CURSOR_END_Y],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    }
  );

  // Click compress-and-release
  const cursorScale = interpolate(
    frame,
    [LOCAL_ARRIVE, LOCAL_ARRIVE + 4, LOCAL_ARRIVE + 10],
    [1.0, 0.68, 1.0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Fade out after button exits
  const alpha = interpolate(frame, [72, 80], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: cx,
          top: cy,
          transform: `scale(${cursorScale})`,
          transformOrigin: "3px 3px", // pivot at cursor tip
          filter: "drop-shadow(2px 3px 8px rgba(0,0,0,0.28))",
          opacity: alpha,
          pointerEvents: "none",
        }}
      >
        {/*
         * macOS default arrow cursor SVG.
         * Tip is at approximately (3, 3) in viewBox coords.
         * The path is: tip → down shaft → notch right → tail-right → back up → close.
         */}
        <svg width="32" height="40" viewBox="0 0 32 40" fill="none">
          <path
            d="M3 3 L3 32 L11 24 L18 37 L22 35 L15 22 L26 22 Z"
            fill="white"
            stroke="#1a1a1a"
            strokeWidth="1.3"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </AbsoluteFill>
  );
};

// ─── Agent card ────────────────────────────────────────────────────────────────
// Local frames 0-99  (global 80-179)
// Full reference UI: header, users·live table, Alex onboarding agent section
// with sequential task reveal via text-width animation (no CSS keyframes).
const AgentCardScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Card spring entrance ────────────────────────────────────────────────────
  const cardSpring = spring({
    fps,
    frame,
    config: { damping: 22, stiffness: 220, mass: 0.78 },
    to: 1,
  });
  const slideOffset = interpolate(cardSpring, [0, 1], [700, 0]);

  // ── Fade + slide-up helper (returns React.CSSProperties) ───────────────────
  const fs = (s: number, e: number): React.CSSProperties => ({
    opacity: interpolate(frame, [s, e], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    transform: `translateY(${interpolate(frame, [s, e], [8, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    })}px)`,
  });

  // ── Pulsing green online dot (header) ───────────────────────────────────────
  const PULSE = 88;
  const ph = (frame % PULSE) / PULSE;
  const ringScale = interpolate(ph, [0, 0.7], [1, 2.8], { extrapolateRight: "clamp" });
  const ringOpacity = interpolate(ph, [0, 0.45, 0.7], [0.72, 0.15, 0], { extrapolateRight: "clamp" });
  const dotAlpha = Math.min(1, frame / 16);

  // ── Task label text-reveal: grows maxWidth from 0 → full text width ─────────
  // Simulates typing; each char ~9.5px in 13px monospace
  const CW = 9.5;
  const t1MaxW = interpolate(frame, [70, 94], [0, 34 * CW], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const t2MaxW = interpolate(frame, [98, 125], [0, 45 * CW], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // ── Checkmarks ──────────────────────────────────────────────────────────────
  const t1Check = interpolate(frame, [94, 103], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const t2Check = interpolate(frame, [125, 133], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // ── Palette ─────────────────────────────────────────────────────────────────
  const GC = "#22c55e";
  const BD = "rgba(0,0,0,0.07)";
  const TX = "#111111";
  const MU = "#6b7280";
  const LI = "#9ca3af";
  const CD = "#1d4ed8"; // monospace code blue

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

  // Robot icon (reused in agent section header)
  const RobotIcon = (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <line x1="12" y1="7" x2="12" y2="4" />
      <circle cx="12" cy="3" r="1" fill="white" stroke="none" />
      <circle cx="8.5" cy="13" r="1.5" fill="white" stroke="none" />
      <circle cx="15.5" cy="13" r="1.5" fill="white" stroke="none" />
      <path d="M9 17h6" />
    </svg>
  );

  // Checkmark SVG
  const Check = (op: number) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GC}
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ opacity: op, flexShrink: 0, display: "block" }}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );

  return (
    <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* Outer decorative border frame */}
      <div style={{
        padding: 12,
        borderRadius: 32,
        border: "1.5px solid rgba(99,102,241,0.18)",
        background: "linear-gradient(145deg, rgba(99,102,241,0.06) 0%, rgba(139,92,246,0.04) 100%)",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.8) inset, 0 32px 80px rgba(0,0,0,0.08)",
        transform: `translateY(${slideOffset}px)`,
      }}>
      <div style={{
        width: 1160,
        background: "#ffffff",
        borderRadius: 20,
        boxShadow: "0 24px 72px rgba(0,0,0,0.11), 0 6px 20px rgba(0,0,0,0.06)",
        border: `1px solid ${BD}`,
        overflow: "hidden",
      }}>

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div style={{ padding: "24px 30px 20px", display: "flex", alignItems: "center", gap: 16, borderBottom: `1px solid ${BD}` }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: "2.5px solid rgba(99,102,241,0.28)" }}>
            <Img src={staticFile("alex-avatar.png")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: TX, fontFamily: ff, letterSpacing: "-0.02em" }}>Alex</div>
            <div style={{ fontSize: 14, color: MU, fontFamily: ff, marginTop: 2 }}>SaaS founders · Prosumer developers</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, opacity: dotAlpha, flexShrink: 0 }}>
            <div style={{ position: "relative", width: 13, height: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ position: "absolute", width: 13, height: 13, borderRadius: "50%", border: `1.5px solid ${GC}`, transform: `scale(${ringScale})`, opacity: ringOpacity }} />
              <div style={{ width: 9, height: 9, borderRadius: "50%", background: GC, position: "relative" }} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: GC, fontFamily: ff }}>Online</span>
          </div>
        </div>

        {/* ── users · live table ───────────────────────────────────────────── */}
        <div style={{ padding: "18px 30px 16px", borderBottom: `1px solid ${BD}` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, ...fs(24, 44) }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={MU} strokeWidth="2" style={{ display: "block" }}>
                <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="9" x2="9" y2="21" />
              </svg>
              <span style={{ fontSize: 14, fontWeight: 600, color: MU, fontFamily: ff }}>users · live</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: GC }} />
              <span style={{ fontSize: 13, color: GC, fontFamily: ff, fontWeight: 500 }}>new signup</span>
            </div>
          </div>
          {/* col headers */}
          <div style={{ display: "flex", paddingBottom: 10, borderBottom: `1px solid ${BD}`, ...fs(28, 44) }}>
            <span style={{ flex: 1.4, fontSize: 11, fontWeight: 700, color: LI, fontFamily: ff, textTransform: "uppercase", letterSpacing: "0.07em" }}>Name</span>
            <span style={{ flex: 1.8, fontSize: 11, fontWeight: 700, color: LI, fontFamily: ff, textTransform: "uppercase", letterSpacing: "0.07em" }}>Email</span>
            <span style={{ flex: 0.8, fontSize: 11, fontWeight: 700, color: LI, fontFamily: ff, textTransform: "uppercase", letterSpacing: "0.07em", textAlign: "right" }}>Plan</span>
          </div>
          {/* rows */}
          {users.map((u, idx) => {
            const rs = 36 + idx * 8;
            const rowOp = interpolate(frame, [rs, rs + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const rowY  = interpolate(frame, [rs, rs + 20], [8, 0],  { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
            return (
              <div key={u.name} style={{ display: "flex", alignItems: "center", padding: "11px 0", borderBottom: idx < 3 ? `1px solid ${BD}` : "none", opacity: rowOp, transform: `translateY(${rowY}px)` }}>
                <div style={{ flex: 1.4, display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: u.col, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", fontFamily: ff, flexShrink: 0 }}>{u.i}</div>
                  <span style={{ fontSize: 14, fontWeight: 500, color: TX, fontFamily: ff, whiteSpace: "nowrap" }}>{u.name}</span>
                  {u.isNew && <span style={{ fontSize: 10, fontWeight: 700, color: "#3b82f6", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 4, padding: "2px 7px", letterSpacing: "0.04em", fontFamily: ff, flexShrink: 0 }}>NEW</span>}
                </div>
                <span style={{ flex: 1.8, fontSize: 13, color: MU, fontFamily: ff }}>{u.email}</span>
                <div style={{ flex: 0.8, display: "flex", justifyContent: "flex-end" }}>
                  <span style={{ fontSize: 11, fontWeight: 600, borderRadius: 6, padding: "3px 10px", fontFamily: ff, ...planBadge(u.plan) }}>{u.plan}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Alex · Onboarding Agent ──────────────────────────────────────── */}
        <div style={{ padding: "16px 30px 24px", background: "#f9fafb" }}>
          {/* section header */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, ...fs(76, 100) }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {RobotIcon}
            </div>
            <span style={{ flex: 1, fontSize: 15, fontWeight: 700, color: TX, fontFamily: ff }}>
              Alex · <span style={{ fontWeight: 400, color: MU }}>Onboarding Agent</span>
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#15803d", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 20, padding: "4px 14px", fontFamily: ff }}>running</span>
          </div>

          {/* Task 1: enrich_lead */}
          <div style={{ background: "#fff", border: `1px solid ${BD}`, borderRadius: 12, padding: "15px 17px", marginBottom: 10, ...fs(88, 108) }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
              <div style={{ width: 9, height: 9, borderRadius: "50%", background: GC, flexShrink: 0 }} />
              <div style={{ flex: 1, overflow: "hidden" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: CD, fontFamily: "'Courier New', monospace", maxWidth: `${t1MaxW}px`, display: "block", overflow: "hidden", whiteSpace: "nowrap" }}>
                  enrich_lead · jessica@hyperloop.ai
                </span>
              </div>
              {Check(t1Check)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 24px", ...fs(120, 144) }}>
              {([["Name","Jessica Chen"],["Title","Head of Engineering"],["Company","Hyperloop.ai"],["Team size","40–60 engineers"],["Stack","TypeScript, React"],["Signal","Hiring 3 devs now"]] as [string,string][]).map(([k,v]) => (
                <div key={k} style={{ fontSize: 12, fontFamily: ff }}>
                  <span style={{ color: LI }}>{k}: </span>
                  <span style={{ color: TX, fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Task 2: compose_email */}
          <div style={{ background: "#fff", border: `1px solid ${BD}`, borderRadius: 12, padding: "15px 17px", ...fs(128, 148) }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
              <div style={{ width: 9, height: 9, borderRadius: "50%", background: GC, flexShrink: 0 }} />
              <div style={{ flex: 1, overflow: "hidden" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: CD, fontFamily: "'Courier New', monospace", maxWidth: `${t2MaxW}px`, display: "block", overflow: "hidden", whiteSpace: "nowrap" }}>
                  compose_email · personalizing for Jessica...
                </span>
              </div>
              {Check(t2Check)}
            </div>
            <div style={{ ...fs(160, 180) }}>
              <div style={{ fontSize: 12, fontFamily: ff, marginBottom: 3 }}>
                <span style={{ color: LI, fontWeight: 600 }}>To: </span>
                <span style={{ color: MU }}>jessica@hyperloop.ai</span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: TX, fontFamily: ff, marginBottom: 6, lineHeight: 1.4 }}>
                Subject: Welcome, Jessica — built for engineering teams like yours
              </div>
              <div style={{ fontSize: 11.5, color: MU, fontFamily: ff, lineHeight: 1.6 }}>
                Hi Jessica, welcome to Blink! I noticed Hyperloop.ai is scaling your engineering team fast — our internal tools builder is used by teams exactly your size. Would a 20-min demo this week work?
              </div>
            </div>
          </div>
        </div>

      </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Root composition ─────────────────────────────────────────────────────────
export const DeployClickScene: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>
      {/* Text: global 0-83 — snappy in (0-16), hold (16-64), exit (64-84) */}
      <Sequence from={0} durationInFrames={84}>
        <TextSlide />
      </Sequence>

      {/* Button: global 84-172 — appears only after text has fully cleared */}
      <Sequence from={84} durationInFrames={88} premountFor={5}>
        <DeployButton />
      </Sequence>

      {/* Ripple: global 146-188 — click lands at global 84+64=148 */}
      <Sequence from={146} durationInFrames={42}>
        <ClickRipple />
      </Sequence>

      {/* Cursor: global 84-172 */}
      <Sequence from={84} durationInFrames={88}>
        <CursorScene />
      </Sequence>

      {/* Agent card: global 172-397 — full reference UI, then ~3.5s hold at end */}
      <Sequence from={172} durationInFrames={225} premountFor={5}>
        <AgentCardScene />
      </Sequence>
    </AbsoluteFill>
  );
};
