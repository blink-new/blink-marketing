import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { brand } from "./brand";

const SCENE_DURATION_SECONDS = 1.5;
const FPS = 60;

// Animation fills the full 1.5 s (90 frames):
// "Introducing" starts at 0, "Blink" at 15, "Claw" at 30, each animates over 45 frames
const INTRO_START = 0;
const BLINK_START = 15;
const CLAW_START = 30;
const WORD_ANIM_DURATION = 45;

const getWordStyle = (frame: number, start: number): React.CSSProperties => {
  const end = start + WORD_ANIM_DURATION;

  const appear = interpolate(frame, [start, end], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const scale = interpolate(
    frame,
    [start, start + WORD_ANIM_DURATION * 0.5, end],
    [0.8, 1.02, 1],
    {
      easing: Easing.out(Easing.cubic),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  return {
    transform: `scale(${scale})`,
    opacity: appear,
    transformOrigin: "center center",
    whiteSpace: "pre",
  };
};

export const BlinkClawIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const ellipseTranslateY = interpolate(
    frame,
    [0, 45],
    [height * 0.5, 0],
    {
      easing: Easing.out(Easing.cubic),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#ffffff",
        justifyContent: "flex-start",
        alignItems: "center",
        paddingTop: height * 0.34,
      }}
    >
      <Img
        src={staticFile("Introducing Blink Claw - BG.png")}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: width * 0.008,
            alignItems: "baseline",
            justifyContent: "center",
            fontFamily: brand.fonts.heading,
            fontWeight: brand.fontWeight.semibold,
            fontSize: 145,
            lineHeight: 1,
            letterSpacing: "-0.06em",
          }}
        >
          <span
            style={{
              ...getWordStyle(frame, INTRO_START),
              color: "#000000",
              padding: "0.05em 0.08em",
            }}
          >
            Introducing
          </span>
          <span
            style={{
              ...getWordStyle(frame, BLINK_START),
              background: "linear-gradient(90deg, #0006BA, #A599FF)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              padding: "0.05em 0.08em",
            }}
          >
            Blink
          </span>
          <span
            style={{
              ...getWordStyle(frame, CLAW_START),
              background: "linear-gradient(90deg, #0006BA, #A599FF)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              padding: "0.05em 0.08em",
            }}
          >
            Claw
          </span>
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: height * 0.7,
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
            transform: `translateY(${ellipseTranslateY}px)`,
          }}
        >
          <Img
            src={staticFile("Ellipse 1.png")}
            style={{
              height: "100%",
              width: "auto",
              objectFit: "contain",
              objectPosition: "bottom center",
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

