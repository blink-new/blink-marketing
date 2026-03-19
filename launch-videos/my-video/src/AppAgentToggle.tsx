import React from "react";
import {
  AbsoluteFill,
  interpolate,
  interpolateColors,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/DMSans";

// Load both regular and semibold so text-weight transitions render correctly
const { fontFamily: ff } = loadFont("normal", {
  weights: ["400", "600"],
  subsets: ["latin"],
});

// ─── Toggle geometry ──────────────────────────────────────────────────────────
const TOGGLE_W   = 280;
const TOGGLE_H   = 56;
const TOGGLE_PAD = 6;
const PILL_W     = (TOGGLE_W - TOGGLE_PAD * 2) / 2; // 134px per option
const PILL_H     = TOGGLE_H - TOGGLE_PAD * 2;        // 44px

// ─── Animation frames (at 60 fps) ────────────────────────────────────────────
const SLIDE_START = 30;
const SLIDE_END   = 80;

export const AppAgentToggle: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps }  = useVideoConfig();

  // ── Indicator slide: spring from App (x=0) to Agent (x=PILL_W) ──────────
  const s = spring({
    fps,
    frame: Math.max(0, frame - SLIDE_START),
    config: { stiffness: 200, damping: 28 },
    durationInFrames: SLIDE_END - SLIDE_START,
  });
  const indicatorX = interpolate(s, [0, 1], [0, PILL_W]);

  // ── Text colours ─────────────────────────────────────────────────────────
  const appColor   = interpolateColors(frame, [SLIDE_START, SLIDE_END], ["#111111", "#9CA3AF"]);
  const agentColor = interpolateColors(frame, [SLIDE_START, SLIDE_END], ["#9CA3AF", "#111111"]);

  // ── Font weight (400 inactive → 600 active, variable-font smoothing) ─────
  const appWeight   = Math.round(interpolate(frame, [SLIDE_START, SLIDE_END], [600, 400], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const agentWeight = Math.round(interpolate(frame, [SLIDE_START, SLIDE_END], [400, 600], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#F0F2F5",
        // Two offset dot grids create a diamond/rotated-grid pattern matching the screenshot
        backgroundImage: [
          "radial-gradient(circle, #C0C5CF 1.5px, transparent 1.5px)",
          "radial-gradient(circle, #C0C5CF 1.5px, transparent 1.5px)",
        ].join(", "),
        backgroundSize: "24px 24px",
        backgroundPosition: "0 0, 12px 12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* ── Toggle container ─────────────────────────────────────────────── */}
      <div
        style={{
          width:        TOGGLE_W,
          height:       TOGGLE_H,
          background:   "white",
          borderRadius: TOGGLE_H / 2,
          boxShadow:    "0 2px 8px rgba(0,0,0,0.08)",
          padding:      TOGGLE_PAD,
          position:     "relative",
          display:      "flex",
          alignItems:   "center",
          boxSizing:    "border-box",
        }}
      >
        {/* ── Sliding indicator pill ──────────────────────────────────────── */}
        <div
          style={{
            position:     "absolute",
            top:          TOGGLE_PAD,
            left:         TOGGLE_PAD + indicatorX,
            width:        PILL_W,
            height:       PILL_H,
            background:   "#F3F4F6",
            borderRadius: PILL_H / 2,
            pointerEvents: "none",
          }}
        />

        {/* ── "App" option ────────────────────────────────────────────────── */}
        <div
          style={{
            width:          PILL_W,
            height:         PILL_H,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            position:       "relative",
            zIndex:         1,
          }}
        >
          <span
            style={{
              fontSize:   16,
              fontWeight: appWeight,
              color:      appColor,
              fontFamily: ff,
            }}
          >
            App
          </span>
        </div>

        {/* ── "Agent" option ──────────────────────────────────────────────── */}
        <div
          style={{
            width:          PILL_W,
            height:         PILL_H,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            gap:            6,
            position:       "relative",
            zIndex:         1,
          }}
        >
          <span
            style={{
              fontSize:   16,
              fontWeight: agentWeight,
              color:      agentColor,
              fontFamily: ff,
            }}
          >
            Agent
          </span>

          {/* "New" badge — always visible */}
          <span
            style={{
              background:    "#3B82F6",
              color:         "white",
              fontSize:      11,
              fontWeight:    600,
              fontFamily:    ff,
              lineHeight:    1.4,
              padding:       "2px 8px",
              borderRadius:  100,
              letterSpacing: "0.01em",
              flexShrink:    0,
            }}
          >
            New
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
