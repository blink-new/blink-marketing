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
const DOT_SIZE = 14;
const DOTS = [
  { color: "#FF5F57" },
  { color: "#FEBC2E" },
  { color: "#28C840" },
];

const BrowserHeader: React.FC<{ url: string }> = ({ url }) => (
  <div
    style={{
      width: "100%",
      height: BROWSER_H,
      background: "#F2F2F2",
      borderBottom: "1px solid #DCDCDC",
      display: "flex",
      alignItems: "center",
      padding: "0 20px",
      gap: 10,
      boxSizing: "border-box",
      flexShrink: 0,
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
          height: 32,
          width: 480,
          background: "#E5E5E5",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          padding: "0 14px",
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

// ─── Card dimensions & animation ──────────────────────────────────────────────
const CARD_W = 1360;
const CARD_H = 800;
const CARD_RADIUS = 16;
const T_IN = 15;
const T_OUT = 8;      // short exit
const T_OUT_OVERLAP = 5;  // start exit this many frames before video ends — no pause

// ─── Card 1: Agent Demo 1 — 9.11s at 1.5x = 364f ─────────────────────────────
const C1_VIDEO_FRAMES = Math.round(546 / 1.5);
const C1_FRAMES = T_IN + C1_VIDEO_FRAMES - T_OUT_OVERLAP + T_OUT;

const Card1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inSpring = spring({ fps, frame, config: { stiffness: 180, damping: 26, mass: 1 }, durationInFrames: T_IN });
  const slideIn = interpolate(inSpring, [0, 1], [2400, 0]);
  const slideOut = interpolate(frame, [T_IN + C1_VIDEO_FRAMES - T_OUT_OVERLAP, C1_FRAMES], [0, -2400], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic),
  });
  const entryScale = interpolate(inSpring, [0, 1], [0.94, 1]);
  const opacity = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{
        padding: 10, borderRadius: CARD_RADIUS + 10,
        border: "1.5px solid rgba(0,0,0,0.09)", background: "#F5F7FA",
        boxShadow: "0 0 0 1px rgba(0,0,0,0.04), 0 16px 48px rgba(0,0,0,0.08)",
        transform: `translateX(${slideIn + slideOut}px) scale(${entryScale})`, opacity,
      }}>
        <div style={{
          width: CARD_W, height: CARD_H + BROWSER_H, borderRadius: CARD_RADIUS,
          overflow: "hidden", display: "flex", flexDirection: "column",
          border: "1px solid #E0E0E0",
          boxShadow: "0 2px 4px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.10), 0 24px 64px rgba(0,0,0,0.08)",
        }}>
          <BrowserHeader url="blink.new/claw" />
          <div style={{ flex: 1, background: "#000", overflow: "hidden" }}>
            <Video src={staticFile("Agent Demo 1.mp4")} playbackRate={1.5}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Card 2: Agent Demo 2 New — 5.74s at 1.5x = 229f ──────────────────────────
const C2_W = 1470;
const C2_VID_H = 840;
const C2_VIDEO_FRAMES = Math.round(344 / 1.5);
const C2_FRAMES = T_IN + C2_VIDEO_FRAMES - T_OUT_OVERLAP + T_OUT;

const Card2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inSpring = spring({ fps, frame, config: { stiffness: 180, damping: 26, mass: 1 }, durationInFrames: T_IN });
  const slideInX = interpolate(inSpring, [0, 1], [2400, 0]);
  const slideOutY = interpolate(frame, [T_IN + C2_VIDEO_FRAMES - T_OUT_OVERLAP, C2_FRAMES], [0, -1300], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic),
  });
  const entryScale = interpolate(inSpring, [0, 1], [0.94, 1]);
  const opacity = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

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
            <Video src={staticFile("Agent Demo 2 New.mp4")} playbackRate={1.5}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Card 3: Agent Demo 3 New — 8.17s at 1.5x = 327f ──────────────────────────
const C3_W = 1600;
const C3_VID_H = 840;
const C3_VIDEO_FRAMES = Math.round(490 / 1.5);
const C3_FRAMES = T_IN + C3_VIDEO_FRAMES - T_OUT_OVERLAP + T_OUT;

const Card3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inSpring = spring({ fps, frame, config: { stiffness: 180, damping: 26, mass: 1 }, durationInFrames: T_IN });
  const slideInY = interpolate(inSpring, [0, 1], [1300, 0]);
  const slideOutX = interpolate(frame, [T_IN + C3_VIDEO_FRAMES - T_OUT_OVERLAP, C3_FRAMES], [0, -2600], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic),
  });
  const entryScale = interpolate(inSpring, [0, 1], [0.94, 1]);
  const opacity = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

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
          <BrowserHeader url="blink.new/claw" />
          <div style={{ flex: 1, background: "#191B1E", overflow: "hidden" }}>
            <Video src={staticFile("Agent Demo 3 New.mp4")} playbackRate={1.5}
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Card 4: Jamie (333f) + Notion (861f) at 1.5x ──────────────────────────────
const C4_W = 1360;
const C4_VID_H = Math.round(C4_W * (1080 / 1542)); // 952
const C4_JAMIE_FRAMES = Math.round(333 / 1.5);
const C4_TAB_DUR = 15;
const C4_NOTION_FRAMES = Math.round(861 / 1.5);
const C4_FRAMES = T_IN + C4_JAMIE_FRAMES + C4_TAB_DUR + C4_NOTION_FRAMES - T_OUT_OVERLAP + T_OUT;

const NotionSlide: React.FC = () => {
  const frame = useCurrentFrame();
  const notionX = interpolate(frame, [0, C4_TAB_DUR], [C4_W, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic),
  });
  return (
    <div style={{ position: "absolute", inset: 0, transform: `translateX(${notionX}px)` }}>
      <Video src={staticFile("Notion.mp4")} playbackRate={1.5}
        style={{ width: "100%", height: "100%", objectFit: "fill", display: "block" }} />
    </div>
  );
};

const Card4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inSpring = spring({ fps, frame, config: { stiffness: 180, damping: 26, mass: 1 }, durationInFrames: T_IN });
  const cardInX = interpolate(inSpring, [0, 1], [2400, 0]);
  const entryScale = interpolate(inSpring, [0, 1], [0.94, 1]);
  const opacity = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const C4_TAB = T_IN + C4_JAMIE_FRAMES;
  const C4_OUT_START = C4_TAB + C4_TAB_DUR + C4_NOTION_FRAMES - T_OUT_OVERLAP;
  const cardOutX = interpolate(frame, [C4_OUT_START, C4_FRAMES], [0, -2400], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic),
  });
  const jamieX = interpolate(frame, [C4_TAB, C4_TAB + C4_TAB_DUR], [0, -C4_W], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic),
  });
  const url = frame < C4_TAB + C4_TAB_DUR ? "slack.com" : "notion.so";

  return (
    <AbsoluteFill style={{ background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
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
              <Video src={staticFile("Jamie Slack Video New.mp4")} playbackRate={1.5}
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

// ─── Master ────────────────────────────────────────────────────────────────────
export const VIDEO_DEMO_CARD_NEW_FRAMES = C1_FRAMES + C2_FRAMES + C3_FRAMES + C4_FRAMES; // ~1836 / ~30.6s

export const VideoDemoCardNew: React.FC = () => (
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
