import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { brand } from "./brand";

const ff = brand.fonts.heading;

const CHARS = "And...You can even".split("");
const CHAR_DELAY  = 2;   // 2 frames between chars at 60fps ≈ same speed as 1f@30fps
const EXIT_START  = 44;  // hold 10 frames after last char (≈ 0.17s), then swipe
const EXIT_END    = 60;  // 16 frames to slide fully off-screen left (≈ 0.27s)

export const AndDots: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entire-text swipe-left exit
  const exitX = interpolate(frame, [EXIT_START, EXIT_END], [0, -2200], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });

  return (
    <AbsoluteFill
      style={{
        background: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Outer wrapper receives the exit transform */}
      <div style={{ transform: `translateX(${exitX}px)` }}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "baseline",
            justifyContent: "center",
          }}
        >
          {CHARS.map((char, i) => {
            const startFrame = i * CHAR_DELAY;
            const charFrame  = Math.max(0, frame - startFrame);

            const s = spring({
              fps,
              frame: charFrame,
              config: { stiffness: 400, damping: 18 },
            });

            // Scale overshoots naturally — magnify-then-settle
            const scale   = interpolate(s, [0, 1], [0.3, 1]);
            // Opacity clamps at 1 so it doesn't flash above fully visible
            const opacity = frame < startFrame ? 0 : Math.min(1, s);

            return (
              <span
                key={i}
                style={{
                  fontSize: 120,
                  fontWeight: 600,
                  color: "#111111",
                  fontFamily: ff,
                  letterSpacing: "-0.06em",
                  display: "inline-block",
                  transform: `scale(${scale})`,
                  opacity,
                  transformOrigin: "center bottom",
                  // Preserve space characters
                  whiteSpace: "pre",
                }}
              >
                {char}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
