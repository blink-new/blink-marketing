import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { brand } from "./brand";

const PHRASES = ["API Keys", "Config Anxiety", "Security Hassle"] as const;

const LOOP_FRAMES = 300;
const PHRASE_DURATION = 100; // 20 in + 60 hold + 20 out
const FADE_IN_DURATION = 20;
const FADE_OUT_DURATION = 20;

export const NoLoop: React.FC = () => {
  const frame = useCurrentFrame() % LOOP_FRAMES;
  const cycleFrame = frame % (PHRASE_DURATION * PHRASES.length); // 0–299

  const currentIndex = Math.floor(cycleFrame / PHRASE_DURATION) % PHRASES.length;
  const prevIndex = (currentIndex + PHRASES.length - 1) % PHRASES.length;
  const nextIndex = (currentIndex + 1) % PHRASES.length;
  const localFrame = cycleFrame % PHRASE_DURATION;

  const centerOpacity = interpolate(
    localFrame,
    [0, FADE_IN_DURATION, PHRASE_DURATION - FADE_OUT_DURATION, PHRASE_DURATION],
    [0, 1, 1, 0],
    {
      easing: Easing.out(Easing.cubic),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const groupOffset = interpolate(
    localFrame,
    [0, PHRASE_DURATION],
    [0, -220], // move entire stack up over one cycle
    {
      easing: Easing.inOut(Easing.quad),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
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
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 40,
          transform: `translateY(${groupOffset}px)`,
        }}
      >
        {/* Top phrase (previous) */}
        <div
          style={{
            fontFamily: brand.fonts.heading,
            fontWeight: brand.fontWeight.semibold,
            fontSize: 60,
            color: "#111111",
          }}
        >
          {PHRASES[prevIndex]}
        </div>

        {/* Middle row: No + highlighted current phrase */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 32,
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
              padding: "24px 80px",
              borderRadius: 32,
              backgroundColor: "#D4CCFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: centerOpacity,
            }}
          >
            <span
              style={{
                fontFamily: brand.fonts.heading,
                fontWeight: brand.fontWeight.semibold,
                fontSize: 80,
                color: "#111111",
                letterSpacing: "-0.04em",
                whiteSpace: "nowrap",
              }}
            >
              {PHRASES[currentIndex]}
            </span>
          </div>
        </div>

        {/* Bottom phrase (next) */}
        <div
          style={{
            fontFamily: brand.fonts.heading,
            fontWeight: brand.fontWeight.semibold,
            fontSize: 60,
            color: "#111111",
          }}
        >
          {PHRASES[nextIndex]}
        </div>
      </div>
    </AbsoluteFill>
  );
};


