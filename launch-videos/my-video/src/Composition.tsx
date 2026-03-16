import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  Series,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { brand } from "./brand";

const TEXT = "Introducing Blink Deployments";
const TITLE_FONT_SIZE = 56;
const ZOOM_OUT_FRAMES = 40;

const INTRO_DURATION = 60;
const MODAL_DURATION = 120;

const STEPS = [
  "Building package",
  "Uploading files",
  "Deploying",
  "Running health check",
] as const;

const STEP_DONE_OFFSETS = [15, 35, 55, 75];

function SpinnerIcon() {
  const frame = useCurrentFrame();
  const rotation = (frame * 8) % 360;
  return (
    <div
      style={{
        width: 20,
        height: 20,
        borderRadius: "50%",
        border: "2px solid #3b82f6",
        borderTopColor: "transparent",
        animation: "none",
        transform: `rotate(${rotation}deg)`,
      }}
    />
  );
}

function CheckIcon() {
  return (
    <div
      style={{
        width: 20,
        height: 20,
        borderRadius: "50%",
        background: "#22c55e",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        style={{ display: "block" }}
      >
        <path
          d="M2 6l3 3 5-6"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function PendingIcon() {
  return (
    <div
      style={{
        width: 20,
        height: 20,
        borderRadius: "50%",
        border: "2px solid #6b7280",
      }}
    />
  );
}

function StepRow({
  label,
  isDone,
  isActive,
  doneFrame,
}: {
  label: string;
  isDone: boolean;
  isActive: boolean;
  doneFrame: number;
}) {
  const frame = useCurrentFrame();
  const justCompleted = isDone && frame >= doneFrame && frame < doneFrame + 8;
  const checkScale = justCompleted
    ? interpolate(
        frame - doneFrame,
        [0, 8],
        [0.5, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      )
    : 1;

  const icon = isDone ? (
    <div style={{ transform: `scale(${checkScale})` }}>
      <CheckIcon />
    </div>
  ) : isActive ? (
    <SpinnerIcon />
  ) : (
    <PendingIcon />
  );

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 0",
        color: isDone || isActive ? "#fff" : "#9ca3af",
        fontSize: 15,
      }}
    >
      {icon}
      <span style={{ flex: 1 }}>{label}</span>
      {isDone && (
        <span style={{ color: "#22c55e", fontSize: 14, fontWeight: 500 }}>
          Done
        </span>
      )}
    </div>
  );
}

function PublishModal() {
  const frame = useCurrentFrame();
  const modalAppear = interpolate(
    frame,
    [0, 12],
    [0, 1],
    {
      easing: Easing.out(Easing.cubic),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  return (
    <div
      style={{
        width: 440,
        borderRadius: 12,
        background: "#1f2937",
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
        overflow: "hidden",
        opacity: modalAppear,
        transform: `scale(${modalAppear})`,
        transformOrigin: "center center",
      }}
    >
      <div style={{ padding: "20px 24px 16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 6,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: "#3b82f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <div>
              <div
                style={{
                  color: "#fff",
                  fontSize: 18,
                  fontWeight: 700,
                  marginBottom: 2,
                }}
              >
                Publish changes
              </div>
              <div style={{ color: "#9ca3af", fontSize: 13 }}>
                Deploys to{" "}
                <span style={{ color: "#60a5fa" }}>aiweb1.blinkpowered.com</span>
              </div>
            </div>
          </div>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#9ca3af",
              fontSize: 18,
              cursor: "pointer",
            }}
          >
            ×
          </div>
        </div>
      </div>
      <div style={{ padding: "0 24px 24px" }}>
        <div
          style={{
            color: "#9ca3af",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.05em",
            marginBottom: 16,
          }}
        >
          DEPLOYING...
        </div>
        {STEPS.map((label, i) => (
          <StepRow
            key={label}
            label={label}
            isDone={frame >= STEP_DONE_OFFSETS[i]}
            isActive={
              frame >= (i === 0 ? 0 : STEP_DONE_OFFSETS[i - 1]) &&
              frame < STEP_DONE_OFFSETS[i]
            }
            doneFrame={STEP_DONE_OFFSETS[i]}
          />
        ))}
      </div>
    </div>
  );
}

function IntroScene() {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const zoomOutProgress = interpolate(
    frame,
    [0, ZOOM_OUT_FRAMES],
    [0, 1],
    {
      easing: Easing.out(Easing.cubic),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
  const scale = interpolate(zoomOutProgress, [0, 1], [1, 0.88], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          color: brand.colors.text,
          fontSize: TITLE_FONT_SIZE,
          fontWeight: brand.fontWeight.semibold,
          fontFamily: brand.fonts.heading,
          width: width * (1 - 2 * brand.paddingHorizontal),
          textAlign: "center",
          position: "relative",
          zIndex: 1,
          transform: `scale(${scale})`,
          textShadow: "0 4px 28.2px rgba(255, 255, 255, 0.5)",
        }}
      >
        {TEXT}
      </div>
    </AbsoluteFill>
  );
}

function ModalScene() {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill
      style={{
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        paddingTop: height * 0.12,
      }}
    >
      <div
        style={{
          color: brand.colors.text,
          fontSize: 36,
          fontWeight: brand.fontWeight.semibold,
          fontFamily: brand.fonts.heading,
          width: width * (1 - 2 * brand.paddingHorizontal),
          textAlign: "center",
          marginBottom: 40,
          textShadow: "0 4px 28.2px rgba(255, 255, 255, 0.5)",
        }}
      >
        {TEXT}
      </div>
      <PublishModal />
    </AbsoluteFill>
  );
}

export const MyComposition: React.FC = () => {
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Img
        src={staticFile("video-bg.png")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          position: "absolute",
          inset: 0,
        }}
      />
      <Series>
        <Series.Sequence durationInFrames={INTRO_DURATION}>
          <IntroScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={MODAL_DURATION}>
          <ModalScene />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
