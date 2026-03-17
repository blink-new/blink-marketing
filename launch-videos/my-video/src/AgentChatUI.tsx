import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { brand } from "./brand";

const ff = brand.fonts.heading;
const serif = "Georgia, 'Times New Roman', serif";

// ─── Fade + slide helper ──────────────────────────────────────────────────────
function fi(frame: number, s: number, e: number, yFrom = 18): React.CSSProperties {
  const ease = Easing.out(Easing.cubic);
  return {
    opacity: interpolate(frame, [s, e], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease,
    }),
    transform: `translateY(${interpolate(frame, [s, e], [yFrom, 0], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease,
    })}px)`,
  };
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const AgentIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="3.5" />
    <path d="M20 20c0-3.866-3.582-7-8-7s-8 3.134-8 7" />
  </svg>
);

const ChipIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="3" />
    <rect x="9" y="9" width="6" height="6" />
    <path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3" />
  </svg>
);

const ClipIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
);

const ChevronDown = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

const ArrowUp = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </svg>
);

// ─── Composition ──────────────────────────────────────────────────────────────
export const AgentChatUI: React.FC = () => {
  const frame = useCurrentFrame();

  const rectOp = interpolate(frame, [0, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{
      background: "#ffffff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>

      {/* ── Outer rectangle ──────────────────────────────────────────────── */}
      <div style={{
        width: 1500,
        height: 880,
        borderRadius: 32,
        border: "1.5px solid #DDE3EE",
        boxShadow: "0 12px 80px rgba(0,0,0,0.06), 0 2px 20px rgba(0,0,0,0.03)",
        overflow: "hidden",
        opacity: rectOp,
        backgroundColor: "#EEF3FA",
        backgroundImage: "radial-gradient(circle, rgba(148,163,184,0.42) 1.5px, transparent 1.5px)",
        backgroundSize: "26px 26px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}>

        {/* ── Segmented control ────────────────────────────────────────── */}
        <div style={{ ...fi(frame, 10, 28), marginBottom: 44 }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            background: "rgba(255,255,255,0.85)",
            border: "1.5px solid #E2E8F0",
            borderRadius: 12,
            padding: 4,
            gap: 2,
          }}>
            {/* App — unselected */}
            <div style={{ padding: "7px 26px" }}>
              <span style={{ fontSize: 16, fontWeight: 500, color: "#6B7280", fontFamily: ff }}>App</span>
            </div>
            {/* Agent — selected */}
            <div style={{
              display: "flex", alignItems: "center", gap: 9,
              padding: "7px 20px",
              background: "white",
              border: "1.5px solid #E2E8F0",
              borderRadius: 9,
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: "#111827", fontFamily: ff }}>Agent</span>
              <div style={{
                background: "#EEF2FF",
                border: "1px solid #C7D2FE",
                borderRadius: 6,
                padding: "2px 9px",
              }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#4F46E5", fontFamily: ff }}>New</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Heading ──────────────────────────────────────────────────── */}
        <div style={{ ...fi(frame, 20, 40), textAlign: "center", marginBottom: 14 }}>
          <h1 style={{
            fontSize: 58,
            fontWeight: 700,
            color: "#111827",
            fontFamily: serif,
            letterSpacing: "-0.025em",
            lineHeight: 1.15,
            margin: 0,
          }}>
            Assign it. Forget it. Done, Kai
          </h1>
        </div>

        {/* ── Subtitle ─────────────────────────────────────────────────── */}
        <div style={{ ...fi(frame, 26, 44), textAlign: "center", marginBottom: 50 }}>
          <p style={{
            fontSize: 17,
            color: "#94A3B8",
            fontFamily: ff,
            margin: 0,
            fontWeight: 400,
          }}>
            Message Jamie — or switch agents above.
          </p>
        </div>

        {/* ── Chat card ────────────────────────────────────────────────── */}
        <div style={{ ...fi(frame, 36, 58), marginBottom: 22 }}>
          <div style={{
            width: 710,
            background: "white",
            borderRadius: 20,
            border: "1.5px solid #E5E7EB",
            boxShadow: "0 4px 28px rgba(0,0,0,0.07), 0 1px 6px rgba(0,0,0,0.04)",
            overflow: "visible",
          }}>

            {/* Tab bar */}
            <div style={{
              display: "flex",
              alignItems: "flex-end",
              padding: "14px 16px 0",
              gap: 0,
            }}>
              {/* Jamie tab — selected */}
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "8px 18px",
                background: "white",
                border: "1.5px solid #E5E7EB",
                borderBottom: "1.5px solid white",
                borderRadius: "11px 11px 0 0",
                position: "relative",
                zIndex: 1,
              }}>
                {/* Avatar */}
                <div style={{
                  width: 20, height: 20, borderRadius: "50%",
                  background: "linear-gradient(135deg, #FB923C, #F97316)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-3.5 3.6-6.5 8-6.5s8 3 8 6.5" />
                  </svg>
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#111827", fontFamily: ff }}>Jamie</span>
              </div>

              {/* + New Agent tab — unselected */}
              <div style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "8px 16px",
              }}>
                <span style={{ fontSize: 18, color: "#9CA3AF", lineHeight: 1, fontWeight: 300 }}>+</span>
                <span style={{ fontSize: 14, color: "#6B7280", fontFamily: ff }}>New Agent</span>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: "1.5px", background: "#E5E7EB" }} />

            {/* Input area */}
            <div style={{ padding: "20px 22px 16px", minHeight: 130 }}>
              <span style={{ fontSize: 17, color: "#D1D5DB", fontFamily: ff, fontWeight: 400 }}>
                Send me alerts when…
              </span>
            </div>

            {/* Bottom toolbar */}
            <div style={{
              display: "flex",
              alignItems: "center",
              padding: "12px 18px",
              borderTop: "1px solid #F3F4F6",
              gap: 10,
            }}>
              <ClipIcon />
              {/* Model selector */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <ChipIcon />
                <span style={{ fontSize: 14, color: "#6B7280", fontFamily: ff }}>claude-sonnet-4.6</span>
                <ChevronDown />
              </div>
              <div style={{ flex: 1 }} />
              {/* Send button */}
              <div style={{
                width: 40, height: 40,
                borderRadius: "50%",
                background: "#60A5FA",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <ArrowUp />
              </div>
            </div>

          </div>
        </div>

        {/* ── Suggestion chips ─────────────────────────────────────────── */}
        <div style={{
          ...fi(frame, 52, 70, 10),
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}>
          {[
            "Run my morning briefing",
            "Summarize my inbox",
            "Draft outreach emails",
          ].map((label, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 9,
              background: "rgba(255,255,255,0.92)",
              border: "1.5px solid #E5E7EB",
              borderRadius: 28,
              padding: "10px 22px",
              boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
            }}>
              <AgentIcon />
              <span style={{
                fontSize: 14,
                color: "#374151",
                fontFamily: ff,
                fontWeight: 500,
                whiteSpace: "nowrap",
              }}>
                {label}
              </span>
            </div>
          ))}

          {/* Refresh circle */}
          <div style={{
            width: 44, height: 44,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(255,255,255,0.92)",
            border: "1.5px solid #E5E7EB",
            borderRadius: "50%",
            boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
          }}>
            <RefreshIcon />
          </div>
        </div>

      </div>
    </AbsoluteFill>
  );
};
