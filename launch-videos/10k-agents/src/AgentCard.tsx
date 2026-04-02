import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { brand } from "./brand";
import type { Agent } from "./agents";

// Card dimensions (natural CSS px — the grid transform scales these)
export const CARD_W = 380;
export const CARD_H = 244;
export const CARD_GAP = 20;

export const AgentCard: React.FC<{ agent: Agent }> = ({ agent }) => {
  const frame = useCurrentFrame();

  // Green dot pulses ~1.5 times per second (all cards in sync)
  const pulse = (Math.sin((frame / 60) * Math.PI * 3) + 1) / 2; // 0 → 1 oscillating
  const dotOpacity = interpolate(pulse, [0, 1], [0.45, 1.0]);
  const dotScale = interpolate(pulse, [0, 1], [0.85, 1.15]);

  return (
    <div
      style={{
        width: CARD_W,
        height: CARD_H,
        background: "#ffffff",
        border: "1px solid #e4e4e7",
        borderRadius: 16,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        fontFamily: brand.fonts.body,
        letterSpacing: "-0.06em",
        boxSizing: "border-box",
      }}
    >
      {/* Avatar */}
      <Img
        src={staticFile(`avatars/${agent.avatar}`)}
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          objectFit: "cover",
          marginBottom: 14,
          flexShrink: 0,
        }}
      />

      {/* Name */}
      <div
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: "#111111",
          lineHeight: 1.3,
          marginBottom: 8,
          flexShrink: 0,
        }}
      >
        {agent.name}
      </div>

      {/* Description */}
      <div
        style={{
          fontSize: 13,
          fontWeight: 400,
          color: "#71717a",
          lineHeight: 1.55,
          flex: 1,
          overflow: "hidden",
        }}
      >
        {agent.description}
      </div>

      {/* Footer: separator + Running status */}
      <div
        style={{
          borderTop: "1px solid #f4f4f5",
          paddingTop: 10,
          marginTop: 10,
          display: "flex",
          alignItems: "center",
          gap: 6,
          flexShrink: 0,
        }}
      >
        {/* Green pulsing dot */}
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#22c55e",
            flexShrink: 0,
            opacity: dotOpacity,
            transform: `scale(${dotScale})`,
          }}
        />
        <span
          style={{
            fontSize: 12,
            color: "#16a34a",
            fontWeight: 500,
            letterSpacing: "-0.06em",
          }}
        >
          Running
        </span>
      </div>
    </div>
  );
};
