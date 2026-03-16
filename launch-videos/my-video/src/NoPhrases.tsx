import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { brand } from "./brand";

const PHRASES = [
  "No API Keys",
  "No Mac Minis",
  "No Terminal Commands",
  "No Security Concerns",
] as const;

const PHRASE_DURATION = 22; // frames per phrase
const FADE_IN_DURATION = 5;
const FADE_OUT_DURATION = 5;

export const NoPhrases: React.FC = () => {
  const frame = useCurrentFrame();
  const activeIndex = Math.min(
    Math.floor(frame / PHRASE_DURATION),
    PHRASES.length - 1
  );
  const localFrame = frame - activeIndex * PHRASE_DURATION;

  const opacity = interpolate(
    localFrame,
    [0, FADE_IN_DURATION, PHRASE_DURATION - FADE_OUT_DURATION, PHRASE_DURATION],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

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
          fontFamily: brand.fonts.heading,
          fontWeight: brand.fontWeight.bold,
          fontSize: 64,
          color: "#111111",
          textAlign: "center",
          opacity,
        }}
      >
        {PHRASES[activeIndex]}
      </div>
    </AbsoluteFill>
  );
};
