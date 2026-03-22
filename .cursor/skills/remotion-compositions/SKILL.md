---
name: remotion-compositions
description: Create or modify Remotion video compositions for Blink marketing videos. Use when the user asks to create a Remotion scene, create a Remotion composition, add a new scene, or modify existing Remotion compositions in the launch-videos project.
---

# Remotion Compositions — Complete Reference

## 1. Project Layout

| Path | Purpose |
|------|---------|
| `launch-videos/my-video/` | Remotion project root |
| `launch-videos/my-video/src/` | All compositions, components, and utilities |
| `launch-videos/my-video/public/` | Static assets (images, videos, audio) |
| `launch-videos/my-video/src/Root.tsx` | Composition registration — every composition must be registered here |
| `launch-videos/my-video/src/brand.ts` | Brand tokens (colors, fonts, spacing) — always use this |

**Dependencies:** Remotion 4.x, `@remotion/google-fonts`, `@remotion/tailwind-v4`, `lucide-react`.

---

## 2. Canvas & Config (Fixed)

- **Resolution:** 1920×1080
- **FPS:** 60
- **Aspect ratio:** 16:9 (landscape)

---

## 3. Brand Tokens (`./brand`)

Import `brand` in every composition for consistency:

```tsx
import { brand } from "./brand";
```

| Token | Values |
|-------|--------|
| `brand.colors.primary` | `#0066CC` |
| `brand.colors.background` | `#000000` |
| `brand.colors.text` | `#FFFFFF` |
| `brand.fonts.heading` / `brand.fonts.body` | DM Sans (loaded via `@remotion/google-fonts/DMSans`) |
| `brand.fontWeight.regular` | `"400"` |
| `brand.fontWeight.semibold` | `"600"` |
| `brand.fontWeight.bold` | `"700"` |
| `brand.fontSize.title` | 72 |
| `brand.fontSize.subtitle` | 36 |
| `brand.fontSize.body` | 24 |
| `brand.fontSize.small` | 18 |
| `brand.paddingHorizontal` | 0.1 (10% each side) |

---

## 4. Blink Gradient (Accent Text)

Use for highlight words ("Blink", "Claw", feature names):

```tsx
background: "linear-gradient(90deg, #0006BA, #A599FF)",
WebkitBackgroundClip: "text",
backgroundClip: "text",
WebkitTextFillColor: "transparent",
color: "transparent",
```

Vertical variant when needed:

```tsx
background: "linear-gradient(180deg, #0006BA, #A599FF)",
```

---

## 5. Remotion Imports (Common)

```tsx
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  interpolate,
  Sequence,
  Series,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  Video,
} from "remotion";
```

---

## 6. Static Assets

All assets live in `launch-videos/my-video/public/`. Reference via `staticFile()`:

```tsx
<Img src={staticFile("Introducing Blink Claw - BG.png")} ... />
<Video src={staticFile("Agent Demo 1.mp4")} ... />
<Audio src={staticFile("feinsmecker - Stop Hidin - Instrumental version.mp3")} ... />
```

**Available assets (examples):**  
Images: `Introducing Blink Claw - BG.png`, `Ellipse 1.png`, `Slack.png`, `OpenAI.png`, etc.  
Videos: `Agent Demo 1.mp4`, `Agent Demo 2 New.mp4`, `Agent Demo 3 New.mp4`, `Jamie Slack Video New.mp4`, `Notion.mp4`  
Avatars: `jamie.webp`, `alex.webp`, `maya.webp`, etc.

---

## 7. Core Remotion Hooks & APIs

### `useCurrentFrame()`
Returns current frame (0-based). Use for time-based animation.

```tsx
const frame = useCurrentFrame();
```

### `useVideoConfig()`
Returns `{ fps, width, height, durationInFrames }`.

```tsx
const { fps, width, height } = useVideoConfig();
```

### `interpolate(frame, inputRange, outputRange, options?)`
Maps frame to a value. Always prefer over manual math.

```tsx
const opacity = interpolate(frame, [0, 20], [0, 1], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});
```

### `Easing`
Use for non-linear timing:

```tsx
easing: Easing.out(Easing.cubic),
easing: Easing.in(Easing.cubic),
easing: Easing.inOut(Easing.cubic),
```

### `spring({ fps, frame, config?, durationInFrames?, to? })`
Bouncy or smooth spring animation:

```tsx
const s = spring({
  fps,
  frame,
  config: { stiffness: 200, damping: 26, mass: 1 },
  durationInFrames: 15,
  to: 1,
});
const x = interpolate(s, [0, 1], [100, 0]);
```

---

## 8. Sequencing & Composition

### `Sequence`
Render a child only for a range of frames:

```tsx
<Sequence from={100} durationInFrames={200}>
  <MyScene />
</Sequence>
```

Use `layout="none"` to avoid layout shift when overlaying:

```tsx
<Sequence from={C4_TAB} layout="none">
  <NotionSlide />
</Sequence>
```

### `Series`
Play children sequentially (like slides). Each `Series.Sequence` has a fixed duration:

```tsx
<Series>
  <Series.Sequence durationInFrames={90} name="Intro">
    <BlinkClawIntro />
  </Series.Sequence>
  <Series.Sequence durationInFrames={120} name="Scene2">
    <Scene2 />
  </Series.Sequence>
</Series>
```

---

## 9. Media Components

### `Img`
```tsx
<Img
  src={staticFile("logo.png")}
  style={{
    width: CARD_SIZE,
    height: CARD_SIZE,
    objectFit: "contain",
  }}
/>
```

### `Video`
```tsx
<Video
  src={staticFile("demo.mp4")}
  playbackRate={1.5}
  style={{
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  }}
/>
```

- Use `objectFit: "cover"` or `objectFit: "fill"` depending on layout.
- For browser-chrome style cards, use `playbackRate={1.5}` to speed up demos.
- Video frame count at 1.5x: `Math.round(videoSeconds * 60 / 1.5)`.

### `Audio`
```tsx
<Audio
  src={staticFile("music.mp3")}
  trimBefore={4.66}
  volume={(f) =>
    interpolate(
      f,
      [totalFrames - 60, totalFrames],
      [0.9, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    )
  }
/>
```

---

## 10. Common Animation Patterns

### Linear fade-in
```tsx
const opacity = interpolate(frame, [0, 20], [0, 1], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});
```

### Slide in from right
```tsx
const x = interpolate(frame, [0, 20], [700, 0], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
  easing: Easing.out(Easing.cubic),
});
```

### Scale pop (word-by-word)
```tsx
const scale = interpolate(
  frame,
  [start, start + duration * 0.5, end],
  [0.8, 1.05, 1],
  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
);
```

### Looping marquee (infinite scroll)
```tsx
const loopFrame = frame % LOOP_FRAMES;
const translate = interpolate(
  loopFrame,
  [0, LOOP_FRAMES],
  [-totalWidth / 2, 0]
);
```

### Carousel / rotating content (by index)
```tsx
const activeIndex = Math.min(
  Math.floor(frame / PHRASE_DURATION),
  items.length - 1
);
const localFrame = frame - activeIndex * PHRASE_DURATION;
```

---

## 11. Browser Chrome (Demo Cards)

For product demos inside a fake browser window:

```tsx
const BROWSER_H = 52;
const DOTS = [
  { color: "#FF5F57" },
  { color: "#FEBC2E" },
  { color: "#28C840" },
];

const BrowserHeader: React.FC<{ url: string }> = ({ url }) => (
  <div style={{
    width: "100%",
    height: BROWSER_H,
    background: "#F2F2F2",
    borderBottom: "1px solid #DCDCDC",
    display: "flex",
    alignItems: "center",
    padding: "0 20px",
    gap: 10,
  }}>
    {/* Traffic light dots + URL bar + url text */}
  </div>
);
```

Card container: rounded corners, shadow, `overflow: hidden` for video.

---

## 12. Video Demo Card Timing

Standard card animation constants:

```tsx
const T_IN = 15;         // spring in
const T_OUT = 8;        // short exit
const T_OUT_OVERLAP = 5; // start exit 5 frames before video ends (no pause)
```

Frame calculation for a single video card:

```tsx
const VIDEO_FRAMES = Math.round(videoDurationSeconds * 60 / playbackRate);
const CARD_FRAMES = T_IN + VIDEO_FRAMES - T_OUT_OVERLAP + T_OUT;
```

---

## 13. Beat Grid (Music Sync)

For full-video compositions with background music (103 BPM, 60 fps):

```tsx
const BEAT = 35; // 60/103 * 60 ≈ 35 frames per beat
const snap   = (f: number) => Math.round(f / BEAT) * BEAT;
const snapUp = (f: number) => Math.ceil(f / BEAT) * BEAT;  // no clipping
```

- Use `snap()` to round scene durations to beats.
- Use `snapUp()` when you must not clip content (e.g. DeployClickScene, OutroScene).

---

## 14. Creating a New Composition

1. Create `ComponentName.tsx` in `launch-videos/my-video/src/`.
2. Export the component (and optionally a `*_FRAMES` constant).
3. Register in `Root.tsx`:

```tsx
<Composition
  id="kebab-case-id"
  component={ComponentName}
  width={1920}
  height={1080}
  fps={60}
  durationInFrames={N}
  defaultProps={{}}
/>
```

4. Use `brand`, `staticFile`, `interpolate`, `spring`, `Easing` as needed.

---

## 15. Adding a Scene to FullVideo / FullVideoNew

1. Import the component and its frame count constant.
2. Add duration (beat-snapped):

```tsx
const DUR_NEW = snap(rawFrames);  // or snapUp for no clipping
```

3. Add to `Series`:

```tsx
<Series.Sequence durationInFrames={DUR_NEW} name="My Scene">
  <MyScene />
</Series.Sequence>
```

4. Add `DUR_NEW` to `FULL_VIDEO_FRAMES` or `FULL_VIDEO_NEW_FRAMES`.

---

## 16. Existing Compositions (Quick Reference)

| Id | Component | Duration |
|----|-----------|----------|
| `blink-claw-intro` | BlinkClawIntro | 90 |
| `video-demo-card` | VideoDemoCard | ~901 |
| `video-demo-card-new` | VideoDemoCardNew | ~1836 |
| `deploy-click-scene` | DeployClickScene | 397 |
| `tools-and-llms-marquee` | ToolsAndLLMsMarquee | 180 |
| `no-phrases-with-icons` | NoPhrasesWithIcons | 180 |
| `create-and-choose` | CreateAndChoose | 480 |
| `and-dots` | AndDots | 64 |
| `multi-agent-parallel` | MultiAgentParallel | 240 |
| `outro-scene` | OutroScene | 175 |
| `full-video` | FullVideo | sum of scenes |
| `full-video-new` | FullVideoNew | sum of scenes |

---

## 17. Commands

```bash
cd launch-videos/my-video
npm run dev      # Remotion Studio
npm run build    # Bundle for render
npm run lint     # ESLint + TypeScript
```

---

## 18. Do's and Don'ts

- **Do** use `brand` for typography and colors.
- **Do** use `staticFile()` for assets; never hardcode paths.
- **Do** export `*_FRAMES` when the composition has a derived duration.
- **Do** use `extrapolateLeft` / `extrapolateRight: "clamp"` in `interpolate` to avoid overshoot.
- **Do** keep design tokens (sizes, timings) as constants at top of file.
- **Don't** use `objectFit` carelessly — `cover` crops, `contain` letterboxes, `fill` stretches.
- **Don't** forget to register new compositions in `Root.tsx`.
- **Don't** add post-video pauses in demo cards; use `T_OUT_OVERLAP` for smooth transitions.
