import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { brand } from "./brand";

const PHRASES = [
  "API Keys Required",
  "Security Hassle",
  "Config Anxiety",
  "Terminal Commands",
] as const;

const FPS = 30;
const HOLD_FRAMES = 80;
const TRANSITION_FRAMES = 25;
const PHRASE_DURATION = HOLD_FRAMES + TRANSITION_FRAMES; // 105
const LOOP_FRAMES = PHRASE_DURATION * PHRASES.length;

export const AboutTicker: React.FC = () => {
  const frame = useCurrentFrame() % LOOP_FRAMES;
  const { width } = useVideoConfig();

  const t = frame / PHRASE_DURATION; // fractional index (which phrase is centered)
  const rowHeight = 90;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#ffffff",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          marginLeft: width * 0.14,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 24,
        }}
      >
        <span
          style={{
            fontFamily: brand.fonts.heading,
            fontWeight: brand.fontWeight.semibold,
            fontSize: 86,
            color: "#000000",
            letterSpacing: "-0.04em",
          }}
        >
          No
        </span>

        <div
          style={{
            position: "relative",
            height: rowHeight * 3,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            minWidth: 800,
          }}
        >
          {PHRASES.map((phrase, i) => {
            let offset = i - t;
            if (offset > PHRASES.length / 2) offset -= PHRASES.length;
            if (offset < -PHRASES.length / 2) offset += PHRASES.length;

            const absOffset = Math.abs(offset);
            const isCenter = absOffset < 0.25;

            // Pop in/out for center phrase: scale and opacity peak at offset 0
            const centerProgress = Math.max(0, 1 - absOffset / 0.25); // 1 at 0, 0 at 0.25
            const popScale = isCenter
              ? interpolate(centerProgress, [0, 1], [0.9, 1.06], {
                  easing: Easing.out(Easing.cubic),
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                })
              : 1;

            const opacity = isCenter
              ? interpolate(centerProgress, [0, 1], [0, 1], {
                  easing: Easing.out(Easing.cubic),
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                })
              : 0.3;

            const fontSize = isCenter ? 84 : 72;
            const fontWeight = isCenter
              ? brand.fontWeight.semibold
              : brand.fontWeight.regular;
            const fontFamily = isCenter ? brand.fonts.heading : brand.fonts.body;

            return (
              <div
                key={phrase}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: "50%",
                  transform: `translateY(${
                    offset * rowHeight - rowHeight / 2
                  }px) scale(${popScale})`,
                  height: rowHeight,
                  display: "flex",
                  alignItems: "center",
                  opacity,
                  fontFamily,
                  fontWeight,
                  fontSize,
                  whiteSpace: "nowrap",
                }}
              >
                {isCenter ? (
                  <span
                    style={{
                      background: "linear-gradient(90deg, #0006BA, #A599FF)",
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "transparent",
                    }}
                  >
                    {phrase}
                  </span>
                ) : (
                  <span style={{ color: "#9CA3AF" }}>{phrase}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

