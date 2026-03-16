import {
  AbsoluteFill,
  Video,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
} from "remotion";
import { brand } from "./brand";

const PHRASES = [
  { prefix: "No", highlight: "API Keys" },
  { prefix: "No", highlight: "Mac Minis" },
  { prefix: "No", highlight: "Terminal Commands" },
  { prefix: "No", highlight: "Security Concerns" },
] as const;

const PHRASE_DURATION = 72; // 12 in + 48 hold + 12 out at 60fps (~1.2s each)
const SLIDE_IN_END = 12;
const SLIDE_OUT_START = 60;
const PULSE_START = 14;
const PULSE_PEAK = 22;
const PULSE_END = 30;

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
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Video
        src={staticFile("animated.mp4")}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
        muted
        loop
      />
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 32,
          transform: `translateX(${translateX}px) scale(${scale})`,
        }}
      >
        <span
          style={{
            fontFamily: brand.fonts.heading,
            fontWeight: brand.fontWeight.semibold,
            fontSize: FONT_SIZE,
            color: "#FFFFFF",
            whiteSpace: "nowrap",
            letterSpacing: "-0.06em",
          }}
        >
          <span>{prefix} </span>
          <span>{highlight}</span>
        </span>
      </div>
    </AbsoluteFill>
  );
};
