import "./index.css";
import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { BlinkClawIntro } from "./BlinkClawIntro";
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
        id="about-ticker"
        component={AboutTicker}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={420}
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
