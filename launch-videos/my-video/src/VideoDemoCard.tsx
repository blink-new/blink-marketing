import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  Video,
} from "remotion";

// ─── Shared browser chrome ────────────────────────────────────────────────────
const BROWSER_H = 52;
const DOT_SIZE  = 14;
const DOTS = [
  { color: "#FF5F57" },
  { color: "#FEBC2E" },
  { color: "#28C840" },
];

const BrowserHeader: React.FC<{ url: string }> = ({ url }) => (
  <div
    style={{
      width:        "100%",
      height:       BROWSER_H,
      background:   "#F2F2F2",
      borderBottom: "1px solid #DCDCDC",
      display:      "flex",
      alignItems:   "center",
      padding:      "0 20px",
      gap:          10,
      boxSizing:    "border-box",
      flexShrink:   0,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
      {DOTS.map((d, i) => (
        <div key={i} style={{ width: DOT_SIZE, height: DOT_SIZE, borderRadius: "50%", background: d.color }} />
      ))}
    </div>

    <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          height:         32,
          width:          480,
          background:     "#E5E5E5",
          borderRadius:   8,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          gap:            6,
          padding:        "0 14px",
        }}
      >
        <svg width="11" height="13" viewBox="0 0 11 13" fill="none">
          <rect x="1.5" y="5.5" width="8" height="7" rx="1.5" stroke="#888" strokeWidth="1.3" />
          <path d="M3.5 5.5V3.5a2 2 0 0 1 4 0v2" stroke="#888" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
        <span style={{ fontSize: 13, color: "#555", fontFamily: "system-ui, sans-serif", letterSpacing: "0.01em" }}>
          {url}
        </span>
      </div>
    </div>

    <div style={{ width: DOTS.length * (DOT_SIZE + 8) - 8, flexShrink: 0 }} />
  </div>
);

// ─── Card 1 ─────────────────────────────────────────── 298f / 5.0s ──────────
const CARD_W      = 1360;
const CARD_H      = 800;
const CARD_RADIUS = 16;
const T_IN_END    = 15;
const T_OUT_START = 283; // 238 video + 45f hold so cursor click on blue button is visible
const C1_FRAMES   = 298;

const Card1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const inSpring = spring({
    fps,
    frame,
    config: { stiffness: 180, damping: 26, mass: 1 },
    durationInFrames: T_IN_END,
  });
  const slideIn  = interpolate(inSpring, [0, 1], [2400, 0]);
  const slideOut = interpolate(frame, [T_OUT_START, C1_FRAMES], [0, -2400], {
    extrapolateLeft:  "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });
  const translateX = slideIn + slideOut;
  const entryScale = interpolate(inSpring, [0, 1], [0.94, 1]);
  const opacity    = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft:  "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* Outer border rectangle */}
      <div style={{
        padding: 10, borderRadius: CARD_RADIUS + 10,
        border: "1.5px solid rgba(0,0,0,0.09)", background: "#F5F7FA",
        boxShadow: "0 0 0 1px rgba(0,0,0,0.04), 0 16px 48px rgba(0,0,0,0.08)",
        transform: `translateX(${translateX}px) scale(${entryScale})`, opacity,
      }}>
        <div style={{
          width: CARD_W, height: CARD_H + BROWSER_H, borderRadius: CARD_RADIUS,
          overflow: "hidden", display: "flex", flexDirection: "column",
          border: "1px solid #E0E0E0",
          boxShadow: "0 2px 4px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.10), 0 24px 64px rgba(0,0,0,0.08)",
        }}>
          <BrowserHeader url="blink.new/claw" />
          <div style={{ flex: 1, background: "#000", overflow: "hidden" }}>
            <Video src={staticFile("Agent Demo 1.mp4")} playbackRate={2}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Card 2 — Agent Demo 2, native 1470×1080 ─────────────────────────────────
const C2_W       = 1470;
const C2_VID_H   = 840;
const C2_IN      = 15;
const C2_OUT     = 94; // 3.11s ÷ 2x = 1.56s = 94 frames — video fully done
const C2_FRAMES  = 109;

const Card2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // slide in from right
  const inSpring   = spring({
    fps,
    frame,
    config: { stiffness: 180, damping: 26, mass: 1 },
    durationInFrames: C2_IN,
  });
  const slideInX   = interpolate(inSpring, [0, 1], [2400, 0]);
  const entryScale = interpolate(inSpring, [0, 1], [0.94, 1]);
  const opacity    = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft:  "clamp",
    extrapolateRight: "clamp",
  });

  // exit upward
  const slideOutY  = interpolate(frame, [C2_OUT, C2_FRAMES], [0, -1300], {
    extrapolateLeft:  "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });

  return (
    <AbsoluteFill style={{ background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{
        padding: 10, borderRadius: CARD_RADIUS + 10,
        border: "1.5px solid rgba(0,0,0,0.09)", background: "#F5F7FA",
        boxShadow: "0 0 0 1px rgba(0,0,0,0.04), 0 16px 48px rgba(0,0,0,0.08)",
        transform: `translateX(${slideInX}px) translateY(${slideOutY}px) scale(${entryScale})`, opacity,
      }}>
        <div style={{
          width: C2_W, height: C2_VID_H + BROWSER_H, borderRadius: CARD_RADIUS,
          overflow: "hidden", display: "flex", flexDirection: "column",
          border: "1px solid #E0E0E0",
          boxShadow: "0 2px 4px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.10), 0 24px 64px rgba(0,0,0,0.08)",
        }}>
          <BrowserHeader url="blink.new/claw" />
          <div style={{ flex: 1, background: "#000", overflow: "hidden" }}>
            <Video src={staticFile("Agent Demo 2.mp4")} playbackRate={2}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Card 3 — Slack Demo, native 1952×1080 ───────────────────────────────────
const C3_W      = 1600;
const C3_VID_H  = 840;   // same height as Card 2 for visual balance
const C3_IN     = 15;
const C3_OUT    = 82;
const C3_FRAMES = 100;

const Card3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // slide in from below
  const inSpring   = spring({
    fps,
    frame,
    config: { stiffness: 180, damping: 26, mass: 1 },
    durationInFrames: C3_IN,
  });
  const slideInY   = interpolate(inSpring, [0, 1], [1300, 0]);
  const entryScale = interpolate(inSpring, [0, 1], [0.94, 1]);
  const opacity    = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft:  "clamp",
    extrapolateRight: "clamp",
  });

  // exit to the left
  const slideOutX  = interpolate(frame, [C3_OUT, C3_FRAMES], [0, -2600], {
    extrapolateLeft:  "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });

  return (
    <AbsoluteFill style={{ background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{
        padding: 10, borderRadius: CARD_RADIUS + 10,
        border: "1.5px solid rgba(0,0,0,0.09)", background: "#F5F7FA",
        boxShadow: "0 0 0 1px rgba(0,0,0,0.04), 0 16px 48px rgba(0,0,0,0.08)",
        transform: `translateX(${slideOutX}px) translateY(${slideInY}px) scale(${entryScale})`, opacity,
      }}>
        <div style={{
          width: C3_W, height: C3_VID_H + BROWSER_H, borderRadius: CARD_RADIUS,
          overflow: "hidden", display: "flex", flexDirection: "column",
          border: "1px solid #E0E0E0",
          boxShadow: "0 2px 4px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.10), 0 24px 64px rgba(0,0,0,0.08)",
        }}>
          <BrowserHeader url="slack.com" />
          <div style={{ flex: 1, background: "#191B1E", overflow: "hidden" }}>
            <Video src={staticFile("slack demo.mp4")}
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Card 4 — Jamie on Slack → Notion tab switch ─────────────────────────────
// Both videos: 1542×1080. Jamie = 423 frames, Notion = 334 frames.
const C4_W          = 1360;
const C4_VID_H      = Math.round(C4_W * (1080 / 1542)); // 952 — exact native ratio, no cropping
const C4_IN         = 15;
const C4_TAB        = 212; // Jamie 7.05s at 2x = 3.53s = 212 frames — full video
const C4_TAB_DUR    = 15;
const C4_OUT_START  = C4_TAB + 167; // Notion 5.57s at 2x = 2.78s = 167 frames — full video
const C4_FRAMES     = C4_OUT_START + 15; // 394 → total 856f / ~14.3s

// Notion video slides in from the right during the tab switch.
// Wrapped in a Sequence so its internal frame (and video time) starts at 0.
const NotionSlide: React.FC = () => {
  const frame = useCurrentFrame(); // relative to Sequence from={C4_TAB}
  const notionX = interpolate(frame, [0, C4_TAB_DUR], [C4_W, 0], {
    extrapolateLeft:  "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  return (
    <div style={{ position: "absolute", inset: 0, transform: `translateX(${notionX}px)` }}>
      <Video
        src={staticFile("Notion.mp4")}
        playbackRate={2}
        style={{ width: "100%", height: "100%", objectFit: "fill", display: "block" }}
      />
    </div>
  );
};

const Card4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // card slides in from the right
  const inSpring   = spring({ fps, frame, config: { stiffness: 180, damping: 26, mass: 1 }, durationInFrames: C4_IN });
  const cardInX    = interpolate(inSpring, [0, 1], [2400, 0]);
  const entryScale = interpolate(inSpring, [0, 1], [0.94, 1]);
  const opacity    = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // card exits to the left
  const cardOutX   = interpolate(frame, [C4_OUT_START, C4_FRAMES], [0, -2400], {
    extrapolateLeft:  "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });

  // Jamie slides left during tab switch
  const jamieX     = interpolate(frame, [C4_TAB, C4_TAB + C4_TAB_DUR], [0, -C4_W], {
    extrapolateLeft:  "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  // URL flips when tab switch completes
  const url = frame < C4_TAB + C4_TAB_DUR ? "slack.com" : "notion.so";

  return (
    <AbsoluteFill style={{ background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* Outer border rectangle */}
      <div style={{
        padding: 10, borderRadius: CARD_RADIUS + 10,
        border: "1.5px solid rgba(0,0,0,0.09)", background: "#F5F7FA",
        boxShadow: "0 0 0 1px rgba(0,0,0,0.04), 0 16px 48px rgba(0,0,0,0.08)",
        transform: `translateX(${cardInX + cardOutX}px) scale(${entryScale})`, opacity,
      }}>
        <div style={{
          width: C4_W, height: C4_VID_H + BROWSER_H, borderRadius: CARD_RADIUS,
          overflow: "hidden", display: "flex", flexDirection: "column",
          border: "1px solid #E0E0E0",
          boxShadow: "0 2px 4px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.10), 0 24px 64px rgba(0,0,0,0.08)",
        }}>
          <BrowserHeader url={url} />
          <div style={{ flex: 1, position: "relative", overflow: "hidden", background: "#000" }}>
            <div style={{ position: "absolute", inset: 0, transform: `translateX(${jamieX}px)` }}>
              <Video src={staticFile("Jamie on slack.mp4")} playbackRate={2}
                style={{ width: "100%", height: "100%", objectFit: "fill", display: "block" }} />
            </div>
            <Sequence from={C4_TAB} layout="none">
              <NotionSlide />
            </Sequence>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Master composition ───────────────────────────────────────────────────────
export const DEMO_CARD_FRAMES = C1_FRAMES + C2_FRAMES + C3_FRAMES + C4_FRAMES; // 901 / ~15.0s

export const VideoDemoCard: React.FC = () => (
  <AbsoluteFill style={{ background: "#FFFFFF" }}>
    <Sequence from={0} durationInFrames={C1_FRAMES}>
      <Card1 />
    </Sequence>
    <Sequence from={C1_FRAMES} durationInFrames={C2_FRAMES}>
      <Card2 />
    </Sequence>
    <Sequence from={C1_FRAMES + C2_FRAMES} durationInFrames={C3_FRAMES}>
      <Card3 />
    </Sequence>
    <Sequence from={C1_FRAMES + C2_FRAMES + C3_FRAMES} durationInFrames={C4_FRAMES}>
      <Card4 />
    </Sequence>
  </AbsoluteFill>
);
