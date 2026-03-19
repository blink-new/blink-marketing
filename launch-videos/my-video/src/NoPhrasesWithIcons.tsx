import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { brand } from "./brand";

const PHRASES = [
  { prefix: "No", highlight: "API Keys" },
  { prefix: "No", highlight: "Mac Minis" },
  { prefix: "No", highlight: "Terminal Commands" },
  { prefix: "No", highlight: "Security Concerns" },
] as const;

const PHRASE_DURATION = 45; // 4 phrases × 45 = 180 frames = 3s at 60fps
const SLIDE_IN_END = 7;
const SLIDE_OUT_START = 37;
const PULSE_START = 9;
const PULSE_PEAK = 14;
const PULSE_END = 19;

const FONT_SIZE = 115;
export const NoPhrasesWithIcons: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const activeIndex = Math.min(
    Math.floor(frame / PHRASE_DURATION),
    PHRASES.length - 1
  );
  const localFrame = frame - activeIndex * PHRASE_DURATION;

  const translateX = interpolate(
    localFrame,
    [0, SLIDE_IN_END, SLIDE_OUT_START, PHRASE_DURATION],
    [-width, 0, 0, width],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const scale = interpolate(
    localFrame,
    [PULSE_START, PULSE_PEAK, PULSE_END],
    [1, 1.08, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const { prefix, highlight } = PHRASES[activeIndex];

  return (
    <AbsoluteFill
      style={{
        background: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "baseline",
          gap: 24,
          transform: `translateX(${translateX}px) scale(${scale})`,
          whiteSpace: "nowrap",
        }}
      >
        {/* "No" in solid black */}
        <span
          style={{
            fontFamily: brand.fonts.heading,
            fontWeight: brand.fontWeight.semibold,
            fontSize: FONT_SIZE,
            color: "#111111",
            letterSpacing: "-0.06em",
          }}
        >
          {prefix}
        </span>

        {/* Highlighted phrase in gradient */}
        <span
          style={{
            fontFamily: brand.fonts.heading,
            fontWeight: brand.fontWeight.semibold,
            fontSize: FONT_SIZE,
            letterSpacing: "-0.06em",
            background: "linear-gradient(90deg, #0006BA, #A599FF)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            color: "transparent",
            display: "inline-block",
            paddingRight: "0.06em",
            paddingBottom: "0.08em",
          }}
        >
          {highlight}
        </span>
      </div>
    </AbsoluteFill>
  );
};
