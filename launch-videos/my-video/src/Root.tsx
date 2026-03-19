import "./index.css";
import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { BlinkClawIntro } from "./BlinkClawIntro";
import { BlinkClawDeploy } from "./BlinkClawDeploy";
import { DeployClickScene } from "./DeployClickScene";
import { MultiAgentParallel } from "./MultiAgentParallel";
import { AgentChatUI } from "./AgentChatUI";
import { TemplateGallery } from "./TemplateGallery";
import { CreateAndChoose, CREATE_AND_CHOOSE_FRAMES } from "./CreateAndChoose";
import { AndDots } from "./AndDots";
import { FullVideo, FULL_VIDEO_FRAMES } from "./FullVideo";
import { FullVideoNew, FULL_VIDEO_NEW_FRAMES } from "./FullVideoNew";
import { ToolsAndLLMsMarquee } from "./ToolsAndLLMsMarquee";
import { NoPhrases } from "./NoPhrases";
import { NoPhrasesWithIcons } from "./NoPhrasesWithIcons";
import { NoLoop } from "./NoLoop";
import { AboutTicker } from "./AboutTicker";
import { AboutCarousel } from "./AboutCarousel";
import { AppAgentToggle } from "./AppAgentToggle";
import { OutroScene } from "./OutroScene";
import { VideoDemoCard, DEMO_CARD_FRAMES } from "./VideoDemoCard";
import { VideoDemoCardNew, VIDEO_DEMO_CARD_NEW_FRAMES } from "./VideoDemoCardNew";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="outro-scene"
        component={OutroScene}
        width={1920}
        height={1080}
        fps={60}
        durationInFrames={175}
        defaultProps={{}}
      />

      <Composition
        id="video-demo-card"
        component={VideoDemoCard}
        width={1920}
        height={1080}
        fps={60}
        durationInFrames={DEMO_CARD_FRAMES}
        defaultProps={{}}
      />

      <Composition
        id="video-demo-card-new"
        component={VideoDemoCardNew}
        width={1920}
        height={1080}
        fps={60}
        durationInFrames={VIDEO_DEMO_CARD_NEW_FRAMES}
        defaultProps={{}}
      />

      <Composition
        id="app-agent-toggle"
        component={AppAgentToggle}
        width={1920}
        height={1080}
        fps={60}
        durationInFrames={120}
        defaultProps={{}}
      />

      <Composition
        id="full-video"
        component={FullVideo}
        width={1920}
        height={1080}
        fps={60}
        durationInFrames={FULL_VIDEO_FRAMES}
        defaultProps={{}}
      />

      <Composition
        id="full-video-new"
        component={FullVideoNew}
        width={1920}
        height={1080}
        fps={60}
        durationInFrames={FULL_VIDEO_NEW_FRAMES}
        defaultProps={{}}
      />

      <Composition
        id="and-dots"
        component={AndDots}
        width={1920}
        height={1080}
        fps={60}
        durationInFrames={64}
        defaultProps={{}}
      />

      <Composition
        id="create-and-choose"
        component={CreateAndChoose}
        width={1920}
        height={1080}
        fps={60}
        durationInFrames={CREATE_AND_CHOOSE_FRAMES}
        defaultProps={{}}
      />

      <Composition
        id="template-gallery"
        component={TemplateGallery}
        width={1920}
        height={1080}
        fps={60}
        durationInFrames={240}
        defaultProps={{}}
      />

      <Composition
        id="agent-chat-ui"
        component={AgentChatUI}
        width={1920}
        height={1080}
        fps={60}
        durationInFrames={180}
        defaultProps={{}}
      />

      <Composition
        id="multi-agent-parallel"
        component={MultiAgentParallel}
        width={1920}
        height={1080}
        fps={60}
        durationInFrames={240}
        defaultProps={{}}
      />
      <Composition
        id="deploy-click-scene"
        component={DeployClickScene}
        width={1920}
        height={1080}
        fps={60}
        durationInFrames={397}
        defaultProps={{}}
      />
      <Composition
        id="blink-claw-intro"
        component={BlinkClawIntro}
        width={1920}
        height={1080}
        fps={60}
        durationInFrames={90}
        defaultProps={{}}
      />
      <Composition
        id="tools-and-llms-marquee"
        component={ToolsAndLLMsMarquee}
        width={1920}
        height={1080}
        fps={60}
        durationInFrames={180}
        defaultProps={{}}
      />
      <Composition
        id="no-phrases-with-icons"
        component={NoPhrasesWithIcons}
        width={1920}
        height={1080}
        fps={60}
        durationInFrames={180}
        defaultProps={{}}
      />

      <Composition
        id="about-carousel"
        component={AboutCarousel}
        width={1920}
        height={1080}
        fps={60}
        durationInFrames={240}
        defaultProps={{}}
      />
    </>
  );
};
