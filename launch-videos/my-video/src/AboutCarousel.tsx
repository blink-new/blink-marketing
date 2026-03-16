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

const LINE_HEIGHT = 110;
const HOLD_FRAMES = 40;
const TRANSITION_FRAMES = 20;
const CYCLE_FRAMES = HOLD_FRAMES + TRANSITION_FRAMES; // 60

export const AboutCarousel: React.FC = () => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();

  const cycleIndex = Math.floor(frame / CYCLE_FRAMES);
  const localFrame = frame % CYCLE_FRAMES;

  const activeIndex = cycleIndex % PHRASES.length;

  const progress =
    localFrame <= HOLD_FRAMES
      ? 0
      : interpolate(
          localFrame,
          [HOLD_FRAMES, CYCLE_FRAMES],
          [0, 1],
          {
            easing: Easing.inOut(Easing.cubic),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }
        );

  const columnOffsetY = -progress * LINE_HEIGHT;

  const getWrappedIndex = (offset: number) => {
    const len = PHRASES.length;
    return (activeIndex + offset + len) % len;
  };

  const slots = [-2, -1, 0, 1, 2] as const;

  const getOpacityForDistance = (distance: number) => {
    if (distance === 0) return 1;
    if (Math.abs(distance) === 1) return 0.25;
    if (Math.abs(distance) === 2) return 0.08;
    return 0;
  };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#ffffff",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 24,
          margin: "0 auto",
          transform: "translateX(120px)",
        }}
      >
        <span
          style={{
            fontFamily: brand.fonts.heading,
            fontWeight: brand.fontWeight.semibold,
            fontSize: 120,
            color: "#000000",
            letterSpacing: "-0.04em",
          }}
        >
          No
        </span>

        <div
          style={{
            position: "relative",
            height: LINE_HEIGHT * 3,
            overflowY: "hidden",
            overflowX: "visible",
            display: "flex",
            alignItems: "center",
            minWidth: 1400,
          }}
        >
          {slots.map((offset) => {
            const phraseIndex = getWrappedIndex(offset);
            const distance = offset;
            const opacity = getOpacityForDistance(distance);
            if (opacity === 0) return null;

            const baseY = (offset + 1) * LINE_HEIGHT + columnOffsetY;
            const absOffset = Math.abs(offset);
            const isCenter = absOffset < 0.5; // center slot

            const fontSize = 115;
            const fontWeight = isCenter
              ? brand.fontWeight.semibold
              : brand.fontWeight.regular;
            const fontFamily = brand.fonts.heading;

            return (
              <div
                key={`slot-${offset}`}
                style={{
                  position: "absolute",
                  top: baseY,
                  left: 0,
                  height: LINE_HEIGHT,
                  display: "flex",
                  alignItems: "center",
                  opacity,
                  fontFamily,
                  fontWeight,
                  fontSize,
                  letterSpacing: "-0.06em",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}
              >
                {isCenter ? (
                  <span
                    style={{
                      background:
                        "linear-gradient(90deg, #0006BA 0%, #A599FF 100%)",
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "transparent",
                    }}
                  >
                    {PHRASES[phraseIndex]}
                  </span>
                ) : (
                  <span style={{ color: "#AAAAAA" }}>
                    {PHRASES[phraseIndex]}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

