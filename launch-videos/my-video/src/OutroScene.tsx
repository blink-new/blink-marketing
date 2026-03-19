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

// ─── Words ────────────────────────────────────────────────────────────────────
const LINE1 = ["Your", "first", "agent", "is", "on", "us"];
const LINE2 = ["Start", "automating", "on", "blink.new"];
const ALL_WORDS = [...LINE1, ...LINE2]; // 10 words total

const WORD_DELAY   = 4;  // frames between each word pop
const FONT_SIZE    = 110;
const ff = brand.fonts.heading;

// ─── Single word with spring pop ──────────────────────────────────────────────
const Word: React.FC<{ text: string; idx: number; gradient?: boolean }> = ({
  text, idx, gradient = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const startFrame = idx * WORD_DELAY;

  const s = spring({
    fps,
    frame: Math.max(0, frame - startFrame),
    config: { stiffness: 420, damping: 18, mass: 0.7 },
    durationInFrames: 20,
  });

  const scale   = interpolate(s, [0, 1], [0.25, 1]);
  const opacity = frame < startFrame ? 0 : Math.min(1, s * 3);

  const baseStyle: React.CSSProperties = {
    display:         "inline-block",
    transform:       `scale(${scale})`,
    opacity,
    transformOrigin: "center bottom",
    fontFamily:      ff,
    fontWeight:      700,
    fontSize:        FONT_SIZE,
    letterSpacing:   "-0.06em",
    lineHeight:      1.1,
    whiteSpace:      "pre",
  };

  if (gradient) {
    return (
      <span style={{
        ...baseStyle,
        background:            "linear-gradient(90deg, #0006BA, #A599FF)",
        WebkitBackgroundClip:  "text",
        backgroundClip:        "text",
        WebkitTextFillColor:   "transparent",
        color:                 "transparent",
        paddingRight:          "0.06em",
      }}>
        {text}
      </span>
    );
  }

  return (
    <span style={{ ...baseStyle, color: "#111111" }}>
      {text}
    </span>
  );
};

// ─── Main composition ─────────────────────────────────────────────────────────
export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { height } = useVideoConfig();

  // Ellipse rises from bottom — same mechanic as BlinkClawIntro
  const ellipseY = interpolate(frame, [0, 30], [height * 0.6, height * 0.15], {
    easing:          Easing.out(Easing.cubic),
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  let wordIdx = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "#ffffff" }}>

      {/* Background image */}
      <Img
        src={staticFile("Introducing Blink Claw - BG.png")}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />

      {/* Ellipse rising from the bottom */}
      <div style={{
        position:  "absolute",
        left: 0, right: 0, bottom: 0,
        height:    height * 0.7,
        display:   "flex",
        justifyContent: "center",
        alignItems:     "flex-end",
        transform: `translateY(${ellipseY}px)`,
      }}>
        <Img
          src={staticFile("Ellipse 1.png")}
          style={{ height: "100%", width: "auto", objectFit: "contain", objectPosition: "bottom center" }}
        />
      </div>

      {/* Text block — left aligned */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: "8%",
        transform: "translateY(-50%)",
        display:       "flex",
        flexDirection: "column",
        alignItems:    "flex-start",
        gap:           8,
      }}>
        {/* Line 1: "Your first agent is on us" */}
        <div style={{ display: "flex", gap: 20, alignItems: "baseline", flexWrap: "nowrap" }}>
          {LINE1.map((word) => (
            <Word key={wordIdx} text={word} idx={wordIdx++} />
          ))}
        </div>

        {/* Line 2: "Start automating on blink.new" */}
        <div style={{ display: "flex", gap: 20, alignItems: "baseline", flexWrap: "nowrap" }}>
          {LINE2.map((word, i) => {
            const isLast = i === LINE2.length - 1;
            const node = <Word key={wordIdx} text={word + (isLast ? "" : "")} idx={wordIdx} gradient={isLast} />;
            wordIdx++;
            return node;
          })}
        </div>
      </div>

    </AbsoluteFill>
  );
};
