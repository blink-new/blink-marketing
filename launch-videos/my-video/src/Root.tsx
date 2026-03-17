import "./index.css";
import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { BlinkClawIntro } from "./BlinkClawIntro";
import { BlinkClawDeploy } from "./BlinkClawDeploy";
import { DeployClickScene } from "./DeployClickScene";
import { MultiAgentParallel } from "./MultiAgentParallel";
import { AgentChatUI } from "./AgentChatUI";
import { TemplateGallery } from "./TemplateGallery";
import { CreateAndChoose } from "./CreateAndChoose";
import { ToolsAndLLMsMarquee } from "./ToolsAndLLMsMarquee";
import { NoPhrases } from "./NoPhrases";
import { NoPhrasesWithIcons } from "./NoPhrasesWithIcons";
import { NoLoop } from "./NoLoop";
import { AboutTicker } from "./AboutTicker";
import { AboutCarousel } from "./AboutCarousel";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="create-and-choose"
        component={CreateAndChoose}
        width={1920}
        height={1080}
        fps={60}
        durationInFrames={388}
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
        durationInFrames={360}
        defaultProps={{}}
      />
      <Composition
        id="blink-claw-intro"
        component={BlinkClawIntro}
        width={1920}
        height={1080}
        fps={60}
        durationInFrames={45}
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
        durationInFrames={300}
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
