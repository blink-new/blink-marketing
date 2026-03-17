import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { brand } from "./brand";

// ─── Design tokens (matching Blink Claw landing page dark theme) ─────────────
const C = {
  bg: "#09090b",
  card: "#18181b",
  sidebar: "#111113",
  border: "rgba(255,255,255,0.07)",
  borderBright: "rgba(255,255,255,0.13)",
  text: "#f4f4f5",
  textMuted: "#71717a",
  textDim: "#3f3f46",
  primary: "#6366f1",
  primaryLight: "#a5b4fc",
  green: "#22c55e",
  greenBg: "rgba(34,197,94,0.12)",
  blue: "#3b82f6",
  blueBg: "rgba(59,130,246,0.12)",
};

const ff = brand.fonts.heading;

// ─── Layout constants (1920 × 1080) ─────────────────────────────────────────
const SIDEBAR_W = 260;
const TOPBAR_H = 60;
const PAD = 40;

const CARD_W = 340;
const CARD_H = 188;
const CARD_GAP = 20;

// Grid origin — new card will land here
const GRID_X = SIDEBAR_W + PAD;
const GRID_Y = TOPBAR_H + 158;

// Existing agents occupy slots 1,2 (row 0) and 0 (row 1)
const ALEX_X = GRID_X + CARD_W + CARD_GAP;
const ALEX_Y = GRID_Y;
const MAYA_X = GRID_X + (CARD_W + CARD_GAP) * 2;
const MAYA_Y = GRID_Y;
const JORDAN_X = GRID_X;
const JORDAN_Y = GRID_Y + CARD_H + CARD_GAP;

// Deploy button — centred in main content
const MAIN_CX = SIDEBAR_W + (1920 - SIDEBAR_W) / 2; // ≈ 1090
const BTN_W = 288;
const BTN_H = 52;
const BTN_CX = MAIN_CX;
const BTN_CY = 840;
const BTN_X = BTN_CX - BTN_W / 2;
const BTN_Y = BTN_CY - BTN_H / 2;

// Cursor
const CURSOR_R = 18;
const CURSOR_SX = 560;
const CURSOR_SY = 650;

// Toast
const TOAST_W = 364;
const TOAST_H = 76;
const TOAST_X = 1920 - TOAST_W - 32;
const TOAST_Y = 32;

// ─── Timeline ────────────────────────────────────────────────────────────────
const T = {
  fadeEnd: 10,
  cursorStart: 15,
  cursorEnd: 35,
  click: 35,
  rippleStart: 35,
  cardStart: 42,
  zoomStart: 60,
  toastStart: 62,
  fadeOutStart: 86,
};

// ─── Sidebar ─────────────────────────────────────────────────────────────────
const Sidebar: React.FC = () => (
  <div
    style={{
      position: "absolute",
      left: 0,
      top: 0,
      width: SIDEBAR_W,
      height: 1080,
      background: C.sidebar,
      borderRight: `1px solid ${C.border}`,
      display: "flex",
      flexDirection: "column",
      paddingBottom: 24,
      boxSizing: "border-box",
    }}
  >
    {/* Logo */}
    <div
      style={{
        height: TOPBAR_H,
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        borderBottom: `1px solid ${C.border}`,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontSize: 16,
          fontWeight: 700,
          fontFamily: ff,
          letterSpacing: "-0.03em",
          background: "linear-gradient(90deg, #6366f1, #a855f7)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        Blink Claw
      </span>
    </div>

    {/* Nav */}
    <div style={{ flex: 1, padding: "12px 12px 0" }}>
      {(
        [
          { label: "Dashboard", icon: "◈", active: false },
          { label: "Agents", icon: "⬡", active: true },
          { label: "Integrations", icon: "⌘", active: false },
          { label: "Memory", icon: "◉", active: false },
          { label: "Settings", icon: "⚙", active: false },
        ] as const
      ).map(({ label, icon, active }) => (
        <div
          key={label}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 12px",
            borderRadius: 10,
            marginBottom: 2,
            background: active ? `${C.primary}18` : "transparent",
          }}
        >
          <span
            style={{
              fontSize: 13,
              color: active ? C.primary : C.textMuted,
              width: 16,
              textAlign: "center",
              fontFamily: ff,
            }}
          >
            {icon}
          </span>
          <span
            style={{
              fontSize: 13,
              fontWeight: active ? 600 : 400,
              color: active ? C.text : C.textMuted,
              fontFamily: ff,
              flex: 1,
            }}
          >
            {label}
          </span>
          {active && (
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: C.primary,
              }}
            />
          )}
        </div>
      ))}
    </div>

    {/* Stats widget */}
    <div style={{ padding: "0 16px" }}>
      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: "14px 16px",
        }}
      >
        <div
          style={{
            fontSize: 9,
            fontWeight: 700,
            color: C.textMuted,
            fontFamily: ff,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          Today
        </div>
        {(
          [
            { label: "Tasks completed", value: "47" },
            { label: "Emails sent", value: "23" },
            { label: "Active agents", value: "3" },
          ] as const
        ).map(({ label, value }) => (
          <div
            key={label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 6,
            }}
          >
            <span style={{ fontSize: 11, color: C.textMuted, fontFamily: ff }}>
              {label}
            </span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: C.text,
                fontFamily: ff,
              }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── Top bar ─────────────────────────────────────────────────────────────────
const TopBar: React.FC = () => (
  <div
    style={{
      position: "absolute",
      left: SIDEBAR_W,
      top: 0,
      width: 1920 - SIDEBAR_W,
      height: TOPBAR_H,
      background: C.bg,
      borderBottom: `1px solid ${C.border}`,
      display: "flex",
      alignItems: "center",
      padding: `0 ${PAD}px`,
      gap: 16,
      boxSizing: "border-box",
    }}
  >
    <div style={{ flex: 1 }}>
      <span
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: C.text,
          fontFamily: ff,
          letterSpacing: "-0.02em",
        }}
      >
        Your Agents
      </span>
      <span
        style={{
          fontSize: 11,
          color: C.textMuted,
          fontFamily: ff,
          marginLeft: 14,
        }}
      >
        3 running · 47 tasks today
      </span>
    </div>
    {/* Avatar */}
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #6366f1, #a855f7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,
        fontWeight: 700,
        color: "#fff",
        fontFamily: ff,
      }}
    >
      A
    </div>
  </div>
);

// ─── Section header ───────────────────────────────────────────────────────────
const SectionHeader: React.FC = () => (
  <div
    style={{
      position: "absolute",
      left: GRID_X,
      top: TOPBAR_H + 28,
      width: 1920 - GRID_X - PAD,
    }}
  >
    <div
      style={{
        fontSize: 9,
        fontWeight: 700,
        color: C.primary,
        fontFamily: ff,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        marginBottom: 6,
      }}
    >
      Active Agents
    </div>
    <div
      style={{
        fontSize: 26,
        fontWeight: 700,
        color: C.text,
        fontFamily: ff,
        letterSpacing: "-0.03em",
        lineHeight: 1.2,
      }}
    >
      Deploy &amp; manage your agents
    </div>
    <div
      style={{
        fontSize: 12,
        color: C.textMuted,
        fontFamily: ff,
        marginTop: 4,
      }}
    >
      Each agent runs 24/7 and connects to your tools automatically.
    </div>
  </div>
);

// ─── Agent card (existing agents) ────────────────────────────────────────────
interface AgentCardProps {
  name: string;
  role: string;
  tasks: number;
  status: "running" | "paused";
  avatarColor: string;
  initial: string;
  x: number;
  y: number;
}

const AgentCard: React.FC<AgentCardProps> = ({
  name,
  role,
  tasks,
  status,
  avatarColor,
  initial,
  x,
  y,
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: CARD_W,
      height: CARD_H,
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 16,
      padding: 22,
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      gap: 10,
    }}
  >
    {/* Header */}
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: avatarColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          fontWeight: 700,
          color: "#fff",
          fontFamily: ff,
          flexShrink: 0,
        }}
      >
        {initial}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: C.text,
            fontFamily: ff,
            lineHeight: 1.3,
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontSize: 10,
            color: C.textMuted,
            fontFamily: ff,
            lineHeight: 1.3,
          }}
        >
          {role}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          background:
            status === "running" ? C.greenBg : "rgba(113,113,122,0.13)",
          borderRadius: 20,
          padding: "3px 9px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: status === "running" ? C.green : C.textMuted,
          }}
        />
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: status === "running" ? C.green : C.textMuted,
            fontFamily: ff,
          }}
        >
          {status === "running" ? "Running" : "Paused"}
        </span>
      </div>
    </div>

    <div style={{ height: 1, background: C.border }} />

    {/* Stats */}
    <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
      <div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: C.text,
            fontFamily: ff,
            lineHeight: 1.2,
          }}
        >
          {tasks}
        </div>
        <div style={{ fontSize: 10, color: C.textMuted, fontFamily: ff }}>
          tasks today
        </div>
      </div>
      <div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: C.green,
            fontFamily: ff,
            lineHeight: 1.2,
          }}
        >
          24/7
        </div>
        <div style={{ fontSize: 10, color: C.textMuted, fontFamily: ff }}>
          uptime
        </div>
      </div>
    </div>

    {/* Status bar */}
    <div
      style={{
        height: 3,
        background: C.border,
        borderRadius: 2,
        marginTop: "auto",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: status === "running" ? "100%" : "45%",
          background: status === "running" ? C.green : C.textMuted,
          borderRadius: 2,
        }}
      />
    </div>
  </div>
);

// ─── New agent card (slides in with spring + pulsing green dot) ───────────────
const NewAgentCard: React.FC<{ slideProgress: number }> = ({
  slideProgress,
}) => {
  const frame = useCurrentFrame();
  const cardAge = Math.max(0, frame - T.cardStart);

  // Pulsing ring — cycles every 36 frames
  const PULSE_CYCLE = 36;
  const pulsePhase = (cardAge % PULSE_CYCLE) / PULSE_CYCLE;
  const ringScale = interpolate(pulsePhase, [0, 0.75], [1, 2.6], {
    extrapolateRight: "clamp",
  });
  const ringOpacity = interpolate(pulsePhase, [0, 0.5, 0.75], [0.8, 0.2, 0], {
    extrapolateRight: "clamp",
  });

  // dot fades in over 10 frames
  const dotAlpha = interpolate(cardAge, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // progress bar fills as the card settles
  const barWidth = interpolate(slideProgress, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // slide from above
  const slideY = GRID_Y - 240 + 240 * slideProgress;

  return (
    <div
      style={{
        position: "absolute",
        left: GRID_X,
        top: slideY,
        width: CARD_W,
        height: CARD_H,
        background: C.card,
        border: `1px solid ${C.primary}`,
        borderRadius: 16,
        padding: 22,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        boxShadow: `0 0 0 1px ${C.primary}30, 0 8px 40px ${C.primary}18`,
        opacity: Math.min(1, slideProgress * 2),
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: 700,
            color: "#fff",
            fontFamily: ff,
            flexShrink: 0,
          }}
        >
          S
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: C.text,
              fontFamily: ff,
              lineHeight: 1.3,
            }}
          >
            Scout
          </div>
          <div
            style={{
              fontSize: 10,
              color: C.textMuted,
              fontFamily: ff,
              lineHeight: 1.3,
            }}
          >
            Lead Qualifier
          </div>
        </div>

        {/* Pulsing green status */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: C.greenBg,
            borderRadius: 20,
            padding: "3px 9px",
            flexShrink: 0,
            opacity: dotAlpha,
          }}
        >
          {/* Dot + ring */}
          <div
            style={{
              position: "relative",
              width: 10,
              height: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* expanding ring */}
            <div
              style={{
                position: "absolute",
                width: 10,
                height: 10,
                borderRadius: "50%",
                border: `1.5px solid ${C.green}`,
                transform: `scale(${ringScale})`,
                opacity: ringOpacity,
              }}
            />
            {/* solid dot */}
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: C.green,
                position: "relative",
              }}
            />
          </div>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: C.green,
              fontFamily: ff,
            }}
          >
            Running
          </span>
        </div>
      </div>

      <div style={{ height: 1, background: `${C.primary}25` }} />

      {/* Stats */}
      <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
        <div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: C.text,
              fontFamily: ff,
              lineHeight: 1.2,
            }}
          >
            0
          </div>
          <div style={{ fontSize: 10, color: C.textMuted, fontFamily: ff }}>
            tasks today
          </div>
        </div>
        <div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: C.green,
              fontFamily: ff,
              lineHeight: 1.2,
            }}
          >
            24/7
          </div>
          <div style={{ fontSize: 10, color: C.textMuted, fontFamily: ff }}>
            uptime
          </div>
        </div>
        {/* NEW badge */}
        <div
          style={{
            marginLeft: "auto",
            background: `${C.primary}1a`,
            border: `1px solid ${C.primary}45`,
            borderRadius: 6,
            padding: "2px 8px",
            fontSize: 9,
            fontWeight: 700,
            color: C.primaryLight,
            fontFamily: ff,
            letterSpacing: "0.07em",
          }}
        >
          NEW
        </div>
      </div>

      {/* Progress bar — fills as card settles */}
      <div
        style={{
          height: 3,
          background: C.border,
          borderRadius: 2,
          marginTop: "auto",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${barWidth * 100}%`,
            background: `linear-gradient(90deg, ${C.primary}, ${C.green})`,
            borderRadius: 2,
          }}
        />
      </div>
    </div>
  );
};

// ─── Deploy button ────────────────────────────────────────────────────────────
const DeployButton: React.FC<{ btnScale: number }> = ({ btnScale }) => (
  <div
    style={{
      position: "absolute",
      left: BTN_X,
      top: BTN_Y,
      width: BTN_W,
      height: BTN_H,
      background: "#f4f4f5",
      borderRadius: 14,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      transform: `scale(${btnScale})`,
      transformOrigin: "center center",
      boxShadow: "0 4px 28px rgba(0,0,0,0.5)",
    }}
  >
    <span
      style={{
        fontSize: 18,
        lineHeight: 1,
        color: "#09090b",
        fontFamily: ff,
        fontWeight: 300,
      }}
    >
      +
    </span>
    <span
      style={{
        fontSize: 14,
        fontWeight: 700,
        color: "#09090b",
        fontFamily: ff,
        letterSpacing: "-0.02em",
      }}
    >
      Deploy your first agent
    </span>
  </div>
);

// ─── Blue ripple effect ───────────────────────────────────────────────────────
const Ripple: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (frame < T.rippleStart) return null;

  const s = spring({
    fps,
    frame: frame - T.rippleStart,
    config: { damping: 16, stiffness: 50 },
    to: 1,
  });
  const r = interpolate(s, [0, 1], [0, 240]);
  const op = interpolate(s, [0, 0.25, 1], [0.55, 0.22, 0]);

  return (
    <div
      style={{
        position: "absolute",
        left: BTN_CX - r,
        top: BTN_CY - r,
        width: r * 2,
        height: r * 2,
        borderRadius: "50%",
        background: C.blue,
        opacity: op,
        pointerEvents: "none",
      }}
    />
  );
};

// ─── Custom circular cursor ───────────────────────────────────────────────────
const CustomCursor: React.FC<{ x: number; y: number; clicking: boolean }> = ({
  x,
  y,
  clicking,
}) => (
  <div
    style={{
      position: "absolute",
      left: x - CURSOR_R,
      top: y - CURSOR_R,
      width: CURSOR_R * 2,
      height: CURSOR_R * 2,
      borderRadius: "50%",
      background: "rgba(255,255,255,0.96)",
      boxShadow: "0 2px 18px rgba(0,0,0,0.45), 0 0 0 2px rgba(255,255,255,0.25)",
      transform: `scale(${clicking ? 0.72 : 1})`,
      pointerEvents: "none",
    }}
  />
);

// ─── Toast notification ───────────────────────────────────────────────────────
const Toast: React.FC<{ toastProgress: number }> = ({ toastProgress }) => {
  // slides down from above the top edge
  const slideY = interpolate(toastProgress, [0, 1], [-(TOAST_H + 20), 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: TOAST_X,
        top: TOAST_Y + slideY,
        width: TOAST_W,
        height: TOAST_H,
        background: C.card,
        border: `1px solid ${C.borderBright}`,
        borderRadius: 14,
        padding: "0 20px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        boxSizing: "border-box",
        boxShadow: "0 8px 40px rgba(0,0,0,0.55)",
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: C.greenBg,
          border: `1px solid ${C.green}28`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          style={{ display: "block" }}
        >
          <path
            d="M3 8l3.5 3.5 6.5-7"
            stroke={C.green}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: C.text,
            fontFamily: ff,
            lineHeight: 1.4,
          }}
        >
          Agent deployed.
        </div>
        <div
          style={{
            fontSize: 11,
            color: C.textMuted,
            fontFamily: ff,
            lineHeight: 1.4,
          }}
        >
          Now running 24/7.
        </div>
      </div>
      <div
        style={{
          fontSize: 10,
          color: C.textDim,
          fontFamily: ff,
          flexShrink: 0,
        }}
      >
        just now
      </div>
    </div>
  );
};

// ─── Main composition ─────────────────────────────────────────────────────────
export const BlinkClawDeploy: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Fade in (0 → 10) ──────────────────────────────────────────────────────
  const fadeIn = interpolate(frame, [0, T.fadeEnd], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const scaleIn = interpolate(frame, [0, T.fadeEnd], [0.92, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // ── Fade out (86 → 90) ────────────────────────────────────────────────────
  const fadeOut = interpolate(frame, [T.fadeOutStart, 90], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const globalOpacity = Math.min(fadeIn, fadeOut);

  // ── Cursor movement spring (15 → settles at ~35) ──────────────────────────
  const cursorSpring = spring({
    fps,
    frame: Math.max(0, frame - T.cursorStart),
    config: { damping: 52, stiffness: 88, mass: 1.1 },
    to: 1,
  });
  const cursorX = CURSOR_SX + (BTN_CX - CURSOR_SX) * cursorSpring;
  const cursorY = CURSOR_SY + (BTN_CY - CURSOR_SY) * cursorSpring;

  const showCursor = frame >= T.cursorStart;
  const isClicking = frame >= T.click && frame < T.click + 9;

  // cursor fades out after card appears
  const cursorAlpha = interpolate(
    frame,
    [T.cardStart, T.cardStart + 12],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // ── Button click scale (35 → 44) ──────────────────────────────────────────
  const btnScale = interpolate(
    frame,
    [T.click, T.click + 3, T.click + 6, T.click + 11],
    [1, 0.95, 1.05, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // ── New card spring bounce (42+) ──────────────────────────────────────────
  const cardSpring = spring({
    fps,
    frame: Math.max(0, frame - T.cardStart),
    config: { damping: 16, stiffness: 190, mass: 0.75 },
    to: 1,
  });

  // ── Toast spring (62+) ────────────────────────────────────────────────────
  const toastSpring = spring({
    fps,
    frame: Math.max(0, frame - T.toastStart),
    config: { damping: 22, stiffness: 210, mass: 0.8 },
    to: 1,
  });

  // ── Ken Burns zoom push toward new card (60 → 90) ─────────────────────────
  const kbP = interpolate(frame, [T.zoomStart, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const kbScale = 1 + kbP * 0.065;
  // translate origin toward new card centre
  const targetX = GRID_X + CARD_W / 2;
  const targetY = GRID_Y + CARD_H / 2;
  const kbTX = kbP * -(targetX - 960) * 0.055;
  const kbTY = kbP * -(targetY - 540) * 0.055;

  return (
    <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>
      {/* ── Scene (fade-in scale + Ken Burns applied together) ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: globalOpacity,
          transform: `scale(${scaleIn * kbScale}) translate(${kbTX}px, ${kbTY}px)`,
          transformOrigin: "center center",
        }}
      >
        <Sidebar />
        <TopBar />
        <SectionHeader />

        {/* Existing agents */}
        <AgentCard
          name="Alex"
          role="Sales Agent"
          tasks={23}
          status="running"
          avatarColor="#f59e0b"
          initial="A"
          x={ALEX_X}
          y={ALEX_Y}
        />
        <AgentCard
          name="Maya"
          role="Inbox Manager"
          tasks={14}
          status="running"
          avatarColor="#ec4899"
          initial="M"
          x={MAYA_X}
          y={MAYA_Y}
        />
        <AgentCard
          name="Jordan"
          role="Report Builder"
          tasks={10}
          status="paused"
          avatarColor="#10b981"
          initial="J"
          x={JORDAN_X}
          y={JORDAN_Y}
        />

        {/* New card slides in */}
        <NewAgentCard slideProgress={cardSpring} />

        {/* Deploy button */}
        <DeployButton btnScale={btnScale} />

        {/* Blue ripple from button click */}
        <Ripple />

        {/* Toast notification */}
        {frame >= T.toastStart && <Toast toastProgress={toastSpring} />}
      </div>

      {/* ── Cursor — rendered outside KB transform, shares global opacity ── */}
      {showCursor && (
        <div style={{ opacity: globalOpacity * cursorAlpha }}>
          <CustomCursor x={cursorX} y={cursorY} clicking={isClicking} />
        </div>
      )}
    </AbsoluteFill>
  );
};
