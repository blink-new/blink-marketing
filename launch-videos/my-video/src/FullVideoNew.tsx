import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  Series,
  staticFile,
} from "remotion";
import { BlinkClawIntro } from "./BlinkClawIntro";
import { VideoDemoCardNew, VIDEO_DEMO_CARD_NEW_FRAMES } from "./VideoDemoCardNew";
import { ToolsAndLLMsMarquee } from "./ToolsAndLLMsMarquee";
import { NoPhrasesWithIcons } from "./NoPhrasesWithIcons";
import { CreateAndChoose, CREATE_AND_CHOOSE_FRAMES } from "./CreateAndChoose";
import { AndDots } from "./AndDots";
import { MultiAgentParallel } from "./MultiAgentParallel";
import { OutroScene } from "./OutroScene";
import { DeployClickScene } from "./DeployClickScene";

// ─── Beat grid (103 BPM @ 60 fps) ────────────────────────────────────────────
// 1 beat = 60/103 * 60 ≈ 35 frames   |   1 bar = 4 beats = 140 frames
const BEAT = 35;
const snap     = (f: number) => Math.round(f / BEAT) * BEAT;
const snapUp   = (f: number) => Math.ceil(f / BEAT) * BEAT;  // no clipping

// ─── Scene durations (beat-snapped for music sync) ───────────────────────────
//  Scene                      Raw f    Used      Time
//  1. BlinkClawIntro           90       90       1.5 s
//  2. VideoDemoCardNew        ~1836    exact     ~30.6 s (no clipping)
//  3. DeployClickScene         397      420      7.0 s   (12 beats, snapUp)
//  4. ToolsAndLLMsMarquee       —       70       1.2 s   (2 beats)
//  5. NoPhrasesWithIcons       180      175      2.9 s
//  6. CreateAndChoose          480      490      8.2 s   (14 beats)
//  7. AndDots                   64       70      1.2 s
//  8. MultiAgentParallel       240      245      4.1 s
//  9. OutroScene               150      175      2.9 s   (5 beats, snapUp)
const DUR_INTRO       = 90;
const DUR_DEMO_CARD   = VIDEO_DEMO_CARD_NEW_FRAMES;
const DUR_DEPLOY      = snapUp(397);     // 420 — 12 beats (no clip)
const DUR_TOOLS       = BEAT * 2;       //  70
const DUR_NO_PHRASES  = snap(180);      // 175
const DUR_CREATE      = snap(CREATE_AND_CHOOSE_FRAMES);  // 490 — 14 beats
const DUR_AND_DOTS    = snap(64);       //  70
const DUR_MULTI_AGENT = snap(240);      // 245
const DUR_OUTRO       = snapUp(150);    // 175 — 5 beats (2.5 s)

export const FULL_VIDEO_NEW_FRAMES =
  DUR_INTRO + DUR_DEMO_CARD + DUR_DEPLOY + DUR_TOOLS + DUR_NO_PHRASES +
  DUR_CREATE + DUR_AND_DOTS + DUR_MULTI_AGENT + DUR_OUTRO;

// ─── Music ────────────────────────────────────────────────────────────────────
// "Stop Hidin" — Feinsmecker, 103 BPM, 83.7 s
const MUSIC_START_S = 4.66;
const MUSIC = staticFile("feinsmecker - Stop Hidin - Instrumental version.mp3");

export const FullVideoNew: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#ffffff" }}>

      <Audio
        src={MUSIC}
        trimBefore={MUSIC_START_S}
        volume={(f) =>
          interpolate(
            f,
            [FULL_VIDEO_NEW_FRAMES - 60, FULL_VIDEO_NEW_FRAMES],
            [0.9, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          )
        }
      />

      <Series>

        {/* 1 · 90 f · 1.5 s */}
        <Series.Sequence durationInFrames={DUR_INTRO} name="Intro">
          <BlinkClawIntro />
        </Series.Sequence>

        {/* 2 · VideoDemoCardNew · ~30.9 s */}
        <Series.Sequence durationInFrames={DUR_DEMO_CARD} name="Video Demo Card">
          <VideoDemoCardNew />
        </Series.Sequence>

        {/* 3 · 420 f · 7.0 s */}
        <Series.Sequence durationInFrames={DUR_DEPLOY} name="Deploy Click Scene">
          <DeployClickScene />
        </Series.Sequence>

        {/* 4 · 70 f · 1.2 s */}
        <Series.Sequence durationInFrames={DUR_TOOLS} name="Tools & LLMs">
          <ToolsAndLLMsMarquee />
        </Series.Sequence>

        {/* 5 · 175 f · 2.9 s */}
        <Series.Sequence durationInFrames={DUR_NO_PHRASES} name="No Phrases">
          <NoPhrasesWithIcons />
        </Series.Sequence>

        {/* 6 · 490 f · 8.2 s */}
        <Series.Sequence durationInFrames={DUR_CREATE} name="Create & Choose">
          <CreateAndChoose />
        </Series.Sequence>

        {/* 7 · 70 f · 1.2 s */}
        <Series.Sequence durationInFrames={DUR_AND_DOTS} name="And Dots">
          <AndDots />
        </Series.Sequence>

        {/* 8 · 245 f · 4.1 s */}
        <Series.Sequence durationInFrames={DUR_MULTI_AGENT} name="Multi-Agent">
          <MultiAgentParallel />
        </Series.Sequence>

        {/* 9 · 175 f · 2.9 s */}
        <Series.Sequence durationInFrames={DUR_OUTRO} name="Outro">
          <OutroScene />
        </Series.Sequence>

      </Series>
    </AbsoluteFill>
  );
};
