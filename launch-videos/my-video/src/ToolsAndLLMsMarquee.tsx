import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { brand } from "./brand";

const TOOLS_LOGOS = [
  "Slack.png",
  "Stripe.png",
  "Notion.png",
  "Airtable.png",
  "GitHub.png",
  "Figma.png",
  "X.png",
] as const;

const LLMS_LOGOS = [
  "OpenAI.png",
  "Anthropic.png",
  "Google.png",
  "Deepseek.png",
  "Grok.png",
  "Kimi.png",
  "Mixtral.png",
] as const;

const CARD_SIZE = 230;
const CARD_GAP = 32;
const LOOP_FRAMES = 180; // 3s at 60fps
const WORD_POP_DURATION = 10;

type Direction = "ltr" | "rtl";

const LogoRow: React.FC<{
  logos: readonly string[];
  direction: Direction;
}> = ({ logos, direction }) => {
  const frame = useCurrentFrame();
  const loopFrame = frame % LOOP_FRAMES;

  const items = [...logos, ...logos, ...logos];
  const totalWidth = items.length * (CARD_SIZE + CARD_GAP);

  const translate = interpolate(
    loopFrame,
    [0, LOOP_FRAMES],
    direction === "ltr" ? [-totalWidth / 2, 0] : [0, -totalWidth / 2]
  );

  return (
    <div style={{ width: "100%", overflow: "hidden" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: CARD_GAP,
          transform: `translateX(${translate}px)`,
        }}
      >
        {items.map((logo, index) => (
          <Img
            key={`${logo}-${index}`}
            src={staticFile(logo)}
            style={{
              width: CARD_SIZE,
              height: CARD_SIZE,
              objectFit: "contain",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export const ToolsAndLLMsMarquee: React.FC = () => {
  const { width, height, fps } = useVideoConfig();
  const frame = useCurrentFrame();

  const getWordPopStyle = (start: number) => {
    const end = start + WORD_POP_DURATION;

    const appear = interpolate(frame, [start, end], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

    const scale = interpolate(
      frame,
      [start, start + WORD_POP_DURATION * 0.5, end],
      [0.8, 1.05, 1],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }
    );

    return {
      transform: `scale(${scale})`,
      opacity: appear,
      display: "inline-block",
      transformOrigin: "center center",
    } as const;
  };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#ffffff",
        fontFamily: brand.fonts.heading,
        color: "#000000",
        justifyContent: "flex-start",
        alignItems: "stretch",
        paddingLeft: width * 0.05,
        paddingRight: width * 0.05,
        paddingTop: height * 0.08,
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          gap: height * 0.08,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "center",
            height: height * 0.35,
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: brand.fontWeight.semibold,
              textAlign: "center",
              letterSpacing: "-0.06em",
            }}
          >
            <span style={{ ...getWordPopStyle(0), marginRight: "0.28em" }}>
              Connect
            </span>
            <span
              style={{
                ...getWordPopStyle(6),
                background: "linear-gradient(180deg, #0006BA, #A599FF)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              100+ Tools
            </span>
          </div>
          <div
            style={{
              width: "100%",
              marginLeft: -width * 0.05,
              marginRight: -width * 0.05,
            }}
          >
            <LogoRow logos={TOOLS_LOGOS} direction="ltr" />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 32,
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: brand.fontWeight.semibold,
              textAlign: "center",
              letterSpacing: "-0.06em",
            }}
          >
            <span style={{ ...getWordPopStyle(0), marginRight: "0.28em" }}>
              Use
            </span>
            <span
              style={{
                ...getWordPopStyle(6),
                background: "linear-gradient(180deg, #0006BA, #A599FF)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              20+ LLMs
            </span>
          </div>
          <div
            style={{
              marginTop: height * 0.04,
              width: "100%",
              marginLeft: -width * 0.05,
              marginRight: -width * 0.05,
            }}
          >
            <LogoRow logos={LLMS_LOGOS} direction="rtl" />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

