import "./index.css";
import { Composition } from "remotion";
import { TenKAgentsVideo } from "./TenKAgentsVideo";
import { WorldMapVideo } from "./WorldMapVideo";

// 212 frames of animation + 60 frames (1s) static hold = 272 frames
const DURATION = 272;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="10k-agents"
        component={TenKAgentsVideo}
        width={1920}
        height={1080}
        fps={60}
        durationInFrames={DURATION}
        defaultProps={{}}
      />
      <Composition
        id="world-map-agents"
        component={WorldMapVideo}
        width={1920}
        height={1080}
        fps={60}
        durationInFrames={DURATION}
        defaultProps={{}}
      />
    </>
  );
};
