import {
  AbsoluteFill,
  Easing,
  Freeze,
  interpolate,
  OffthreadVideo,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { brand } from "./brand";
import { AgentCard, CARD_W, CARD_H, CARD_GAP } from "./AgentCard";
import { AGENTS } from "./agents";

// ─── Canvas split ─────────────────────────────────────────────────────────────
const CANVAS_W = 1920;
const CANVAS_H = 1080;
const TEXT_W = Math.round(CANVAS_W * 2 / 5); // 768px
const GRID_W = CANVAS_W - TEXT_W;             // 1152px

// ─── Grid config ─────────────────────────────────────────────────────────────
const COLS = 21; // odd — center card sits in exact middle
const ROWS = 19;

// ─── Scale for the right (1152px-wide) panel ─────────────────────────────────
// INITIAL_SCALE = 3.0:
//   Card on screen: 380 × 3 = 1140px (99% of 1152px panel width) ✓
//   Adjacent isolation: 1152/3 = 384px visible; margin = (384-380)/2 = 2px < GAP(20) ✓
//   Card height: 244 × 3 = 732px — centred in 1080px with breathing room
// FINAL_SCALE = 0.25:
//   Grid W: 8380 × 0.25 = 2095px > 1152 ✓ (overflows ~470px each side)
//   Grid H: 4996 × 0.25 = 1249px > 1080 ✓
const INITIAL_SCALE = 3.0;
const FINAL_SCALE = 0.25;

// ─── Timing (both panels run simultaneously from frame 0) ─────────────────────
// Total: 210 frames = 00:03.30 @ 60fps
// 0–25   : single-card hold
// 25–210 : exponential zoom-out (completes exactly at last frame)
const ZOOM_START = 25;
const ZOOM_DURATION = 185; // frame 25 → 210

// Last animated frame — hold from here to end (1s static)
const FREEZE_AT_FRAME = 212;

// Text animation timing (relative to composition frame 0)
// Counter starts at frame 47 (00:00.47) and ends at frame 180 (00:03:00)
const COUNTER_START = 47;
const COUNTER_END = 180;
const COUNTER_DURATION = COUNTER_END - COUNTER_START; // 133 frames
const CLAW_DELAY = 50;    // "Claw" pops in at ~0.83s
const WORD_STAGGER = 22;  // "Agents" at ~1.2s
const SENTENCE_DELAY = 110; // "now live on Blink.new" at ~1.83s

// ─── Helpers ─────────────────────────────────────────────────────────────────
function agentFor(row: number, col: number) {
  return AGENTS[(row * 3 + col * 5) % AGENTS.length];
}

function getScale(frame: number): number {
  const t = Math.max(0, Math.min(1, (frame - ZOOM_START) / ZOOM_DURATION));
  return INITIAL_SCALE * Math.pow(FINAL_SCALE / INITIAL_SCALE, t);
}

// ─── Left panel: Text + video bg ─────────────────────────────────────────────
const TextPanel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const wordSpring = (localFrame: number) =>
    spring({
      fps,
      frame: Math.max(0, localFrame),
      config: { stiffness: 700, damping: 32, mass: 0.8 },
      durationInFrames: 14,
      to: 1,
    });

  // Animated counter: starts at frame 47, ends at frame 180
  const rawCount = interpolate(
    frame,
    [COUNTER_START, COUNTER_END],
    [0, 10000],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    },
  );
  const displayCount = Math.round(rawCount).toLocaleString();

  // Counter pop-in starts at COUNTER_START
  const counterPop = wordSpring(frame - COUNTER_START);
  const counterY = interpolate(counterPop, [0, 1], [36, 0]);
  const counterOpacity = interpolate(counterPop, [0, 1], [0, 1]);
  const counterScale = interpolate(counterPop, [0, 1], [0.72, 1]);

  // Word rows
  const HEADLINE_WORDS = ["Claw", "Agents"];

  // Subtitle
  const sentencePop = wordSpring(frame - SENTENCE_DELAY);
  const sentenceY = interpolate(sentencePop, [0, 1], [28, 0]);
  const sentenceOpacity = interpolate(sentencePop, [0, 1], [0, 1]);

  const textStyle: React.CSSProperties = {
    fontFamily: brand.fonts.heading,
    letterSpacing: "-0.06em",
    color: "#ffffff",
    textAlign: "left" as const,
  };

  // Clamp video time so it freezes at FREEZE_AT_FRAME
  const videoTime = Math.min(frame / fps, FREEZE_AT_FRAME / fps);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* Video background — freezes at 00:03.32 */}
      <OffthreadVideo
        src={staticFile("9256342-hd_1920_1080_24fps.mp4")}
        time={videoTime}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "hue-rotate(-65deg) saturate(1.6) brightness(0.6)",
        }}
      />
      {/* Forces any grey/neutral tones to adopt the blue hue */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "#1e3a8a",
          mixBlendMode: "color",
          opacity: 0.75,
          pointerEvents: "none",
        }}
      />

      {/* Text — left-aligned, vertically centred */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          paddingLeft: 64,
          paddingRight: 32,
          gap: 0,
        }}
      >
        {/* Animated counter — bigger */}
        <div
          style={{
            ...textStyle,
            fontSize: 148,
            fontWeight: 700,
            lineHeight: 1,
            opacity: counterOpacity,
            transform: `translateY(${counterY}px) scale(${counterScale})`,
            transformOrigin: "left bottom",
          }}
        >
          {displayCount}
        </div>

        {/* "Claw Agents" — same line, each word pops in */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "baseline",
            gap: 18,
            marginTop: 4,
          }}
        >
          {HEADLINE_WORDS.map((word, i) => {
            const pop = wordSpring(frame - CLAW_DELAY - i * WORD_STAGGER);
            const y = interpolate(pop, [0, 1], [36, 0]);
            const opacity = interpolate(pop, [0, 1], [0, 1]);
            const scale = interpolate(pop, [0, 1], [0.72, 1]);
            return (
              <div
                key={word}
                style={{
                  ...textStyle,
                  fontSize: 110,
                  fontWeight: 700,
                  lineHeight: 1.05,
                  opacity,
                  transform: `translateY(${y}px) scale(${scale})`,
                  transformOrigin: "left bottom",
                }}
              >
                {word}
              </div>
            );
          })}
        </div>

        {/* Subtitle */}
        <div
          style={{
            ...textStyle,
            fontSize: 45,
            fontWeight: 500,
            lineHeight: 1.3,
            color: "rgba(255,255,255,0.85)",
            marginTop: 28,
            opacity: sentenceOpacity,
            transform: `translateY(${sentenceY}px)`,
          }}
        >
          now live on Blink.new
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── Right panel: Grid zoom-out ───────────────────────────────────────────────
const GridPanel: React.FC = () => {
  const frame = useCurrentFrame();
  const scale = getScale(frame);

  return (
    <AbsoluteFill
      style={{
        background: "#f9fafb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${COLS}, ${CARD_W}px)`,
            gridTemplateRows: `repeat(${ROWS}, ${CARD_H}px)`,
            gap: CARD_GAP,
          }}
        >
          {Array.from({ length: ROWS * COLS }, (_, i) => {
            const row = Math.floor(i / COLS);
            const col = i % COLS;
            return <AgentCard key={i} agent={agentFor(row, col)} />;
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Shared layout (used with and without Freeze) ────────────────────────────
const VideoLayout: React.FC = () => (
  <AbsoluteFill style={{ flexDirection: "row" }}>
    {/* Left: text panel (2/5) */}
    <div
      style={{
        width: TEXT_W,
        height: CANVAS_H,
        flexShrink: 0,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <TextPanel />
    </div>

    {/* Right: grid zoom (3/5) */}
    <div
      style={{
        width: GRID_W,
        height: CANVAS_H,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <GridPanel />
    </div>
  </AbsoluteFill>
);

// ─── Root composition ─────────────────────────────────────────────────────────
export const TenKAgentsVideo: React.FC = () => {
  const frame = useCurrentFrame();

  // Always same component tree (no remount = no flash).
  // Freeze is a pass-through when frame < FREEZE_AT_FRAME; freezes at 212 after.
  return (
    <Freeze frame={Math.min(frame, FREEZE_AT_FRAME)}>
      <VideoLayout />
    </Freeze>
  );
};
