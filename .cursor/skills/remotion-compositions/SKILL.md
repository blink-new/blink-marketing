---
name: remotion-compositions
description: Create or modify Remotion video compositions for Blink marketing videos. Use when the user asks to create a Remotion scene, create a Remotion composition, add a new scene, or modify existing Remotion compositions in the launch-videos project.
---

# Remotion Compositions — Complete Reference

## 1. Project Layout

| Path | Purpose |
|------|---------|
| `launch-videos/<project>/` | Remotion project root |
| `launch-videos/<project>/src/` | All compositions, components, and utilities |
| `launch-videos/<project>/public/` | Static assets (images, videos, audio) |
| `launch-videos/<project>/src/Root.tsx` | Composition registration — every composition must be registered here |
| `launch-videos/<project>/src/brand.ts` | Brand tokens (colors, fonts, spacing) — always use this |

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
| `brand.fontWeight.bold` | `"700"` |
| `brand.fontSize.title` | 72 |
| `brand.fontSize.subtitle` | 36 |
| `brand.fontSize.body` | 24 |
| `brand.paddingHorizontal` | 0.1 (10% each side) |

---

## 4. Blink Gradient (Accent Text)

```tsx
background: "linear-gradient(90deg, #0006BA, #A599FF)",
WebkitBackgroundClip: "text",
backgroundClip: "text",
WebkitTextFillColor: "transparent",
color: "transparent",
```

---

## 5. Remotion Imports (Common)

```tsx
import {
  AbsoluteFill,
  Audio,
  Easing,
  Freeze,
  Img,
  interpolate,
  OffthreadVideo,
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

Reference via `staticFile()`:

```tsx
<Img src={staticFile("logo.png")} ... />
<Video src={staticFile("demo.mp4")} ... />
<Audio src={staticFile("music.mp3")} ... />
```

---

## 7. Core Remotion Hooks & APIs

### `useCurrentFrame()`
Returns current frame (0-based).

### `useVideoConfig()`
Returns `{ fps, width, height, durationInFrames }`.

### `interpolate(frame, inputRange, outputRange, options?)`
Always use `extrapolateLeft/Right: "clamp"` to prevent overshoot:

```tsx
const opacity = interpolate(frame, [0, 20], [0, 1], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
  easing: Easing.out(Easing.cubic),
});
```

### `spring({ fps, frame, config?, durationInFrames?, to? })`

```tsx
const s = spring({
  fps,
  frame: Math.max(0, localFrame), // clamp to avoid negative frames
  config: { stiffness: 700, damping: 32, mass: 0.8 },
  durationInFrames: 14,
  to: 1,
});
```

---

## 8. Sequencing & Composition

### `Sequence` — render child for a frame range
```tsx
<Sequence from={100} durationInFrames={200}>
  <MyScene />
</Sequence>
```

### `Series` — play children sequentially
```tsx
<Series>
  <Series.Sequence durationInFrames={90} name="Intro">
    <BlinkClawIntro />
  </Series.Sequence>
</Series>
```

---

## 9. Media Components

### `Video` — for standard playback
```tsx
<Video src={staticFile("demo.mp4")} playbackRate={1.5}
  style={{ width: "100%", height: "100%", objectFit: "cover" }} />
```

### `OffthreadVideo` — preferred for background videos
Use `OffthreadVideo` (not `Video`) when you need frame-accurate rendering or the `time` prop for clamping. It renders off the main thread, producing sharper frames and avoiding flicker.

```tsx
<OffthreadVideo
  src={staticFile("bg.mp4")}
  time={videoTime}  // explicit time in seconds — use this instead of startFrom
  style={{ width: "100%", height: "100%", objectFit: "cover" }}
/>
```

**Clamping a video to freeze at a specific second:**
```tsx
const videoTime = Math.min(frame / fps, FREEZE_AT_FRAME / fps);
<OffthreadVideo src={staticFile("bg.mp4")} time={videoTime} ... />
```

**IMPORTANT:** Always verify the video file's actual duration with `ffprobe` before using `time`/`startFrom` offsets — the video may be shorter than expected.

### `Audio`
```tsx
<Audio
  src={staticFile("music.mp3")}
  volume={(f) => interpolate(f, [totalFrames - 60, totalFrames], [0.9, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp"
  })}
/>
```

---

## 10. `Freeze` — Static Hold at End of Video

To freeze the last frame for N seconds (e.g. a 1-second pause):

```tsx
// At top of file
const FREEZE_AT_FRAME = 212; // last animated frame
// DURATION = FREEZE_AT_FRAME + 60 (1s hold at 60fps) = 272

export const MyVideo: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Freeze frame={Math.min(frame, FREEZE_AT_FRAME)}>
      <MyLayout />
    </Freeze>
  );
};
```

**Critical rules for `Freeze`:**
- **Always** render `<Freeze>` unconditionally with `Math.min(frame, FREEZE_AT_FRAME)` as the `frame` prop.
- **Never** conditionally render `<Freeze>` (e.g. `{frame >= X && <Freeze>}`). Conditional rendering causes React to unmount/remount, producing a 1-frame transparent flash at the boundary.
- `useCurrentFrame()` inside `<Freeze>` correctly reports the frozen frame value — all child animations automatically hold.

---

## 11. Video Color Shifting (CSS Filters)

To shift a video's colour palette (e.g. purple → deep blue):

```tsx
<OffthreadVideo
  src={staticFile("bg.mp4")}
  time={videoTime}
  style={{
    width: "100%", height: "100%", objectFit: "cover",
    filter: "hue-rotate(-65deg) saturate(1.6) brightness(0.6)",
  }}
/>
{/* Force neutral/grey tones into the target hue */}
<div style={{
  position: "absolute",
  inset: 0,
  background: "#1e3a8a",      // target colour
  mixBlendMode: "color",
  opacity: 0.75,
  pointerEvents: "none",
}} />
```

**Filter tuning guide:**
- `hue-rotate`: degrees to shift on colour wheel. Purple→Blue ≈ `-65deg`. Over-rotating (e.g. `-100deg`) lands in green.
- `saturate`: boost above 1 for richer colour; reduce for muted.
- `brightness`: reduce for darker feel.
- The `mix-blend-mode: color` overlay forces remaining grey/neutral tones into the target hue — essential when the filter alone doesn't fully control neutral areas.

---

## 12. Split-Screen Layout

For side-by-side panels (e.g. 2/5 text + 3/5 content):

```tsx
const CANVAS_W = 1920;
const CANVAS_H = 1080;
const TEXT_W = Math.round((CANVAS_W * 2) / 5); // 768px
const CONTENT_W = CANVAS_W - TEXT_W;           // 1152px

const Layout: React.FC = () => (
  <AbsoluteFill style={{ flexDirection: "row" }}>
    <div style={{ width: TEXT_W, height: CANVAS_H, flexShrink: 0, position: "relative", overflow: "hidden" }}>
      <LeftPanel />
    </div>
    <div style={{ width: CONTENT_W, height: CANVAS_H, position: "relative", overflow: "hidden" }}>
      <RightPanel />
    </div>
  </AbsoluteFill>
);
```

---

## 13. Animated Number Counter

```tsx
const rawCount = interpolate(frame, [COUNTER_START, COUNTER_END], [0, 10000], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
  easing: Easing.out(Easing.cubic),
});
const displayCount = Math.round(rawCount).toLocaleString(); // "7,432"
```

---

## 14. Word-by-Word Pop Animation

```tsx
const wordSpring = (localFrame: number) =>
  spring({
    fps,
    frame: Math.max(0, localFrame),
    config: { stiffness: 700, damping: 32, mass: 0.8 },
    durationInFrames: 14,
    to: 1,
  });

const WORDS = ["Claw", "Agents"];
const WORD_STAGGER = 22; // frames between each word

{WORDS.map((word, i) => {
  const pop = wordSpring(frame - DELAY - i * WORD_STAGGER);
  const y   = interpolate(pop, [0, 1], [36, 0]);
  const opacity = interpolate(pop, [0, 1], [0, 1]);
  const scale = interpolate(pop, [0, 1], [0.72, 1]);
  return (
    <div key={word} style={{
      opacity,
      transform: `translateY(${y}px) scale(${scale})`,
      transformOrigin: "left bottom",
    }}>
      {word}
    </div>
  );
})}
```

---

## 15. Globe / World Map Composition

Use `react-simple-maps` + `d3-geo` for an animated rotating globe.

**Install (React 19 projects need `--legacy-peer-deps`):**
```bash
npm install react-simple-maps d3-geo --legacy-peer-deps
npm install prop-types --legacy-peer-deps  # peer dep of react-simple-maps
```

**Download map data:**
```bash
curl -o public/countries-110m.json https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json
```

**Globe SVG layer:**
```tsx
import { ComposableMap, Geographies, Geography, Graticule, Sphere } from "react-simple-maps";
import { geoOrthographic } from "d3-geo";

const GEO_URL = staticFile("countries-110m.json");

// rotateLon drives the spin via interpolate()
<ComposableMap
  width={MAP_W} height={CANVAS_H}
  projection="geoOrthographic"
  projectionConfig={{ scale: GLOBE_SCALE, rotate: [-rotateLon, -8, 0] }}
  style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}
>
  <Sphere id="rsm-sphere" fill="#c5e3f5" stroke="#6eb0d8" strokeWidth={2} />
  <Graticule stroke="#a0cce8" strokeWidth={0.5} />
  <Geographies geography={GEO_URL}>
    {({ geographies }) => geographies.map((geo) => (
      <Geography key={geo.rsmKey} geography={geo}
        fill="#ddeef8" stroke="#85b4d0" strokeWidth={0.5}
        style={{ default: { outline: "none" }, hover: { outline: "none" }, pressed: { outline: "none" } }}
      />
    ))}
  </Geographies>
</ComposableMap>
```

**Dual-layer pattern for HTML cards on SVG globe:**

Build a `d3-geo` projection that **exactly matches** what `react-simple-maps` uses internally. Pre-project all pins once per frame. Render SVG dots inside `<ComposableMap>` and HTML cards as a separate absolute-positioned div using the same pixel coordinates:

```tsx
// Match the same projection react-simple-maps uses
const projection = geoOrthographic()
  .scale(GLOBE_SCALE)
  .translate([MAP_W / 2, CANVAS_H / 2])
  .rotate([-rotateLon, -8, 0]);

// geoOrthographic returns null for back-hemisphere points
const projected = PINS.map((pin) => projection(pin.coords));

// SVG layer — dots inside <ComposableMap>
{PINS.map((pin, i) => {
  const pos = projected[i];
  if (!pos) return null; // back hemisphere — naturally disappears
  const [x, y] = pos;
  return (
    <g key={pin.city} transform={`translate(${x},${y})`}>
      <circle r={3.5} fill="#22c55e" />
    </g>
  );
})}

// HTML layer — absolute-positioned cards outside <ComposableMap>
<div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
  {PINS.map((pin, i) => {
    const pos = projected[i];
    if (!pos) return null;
    const [x, y] = pos;
    return (
      <div key={pin.city} style={{ position: "absolute", left: x + 16, top: y - CARD_H - 16 }}>
        {/* agent card */}
      </div>
    );
  })}
</div>
```

**Pin visibility — limb guard (pop-in only):**

Apply the angular distance check **only during the first 10 frames** a pin is alive. This prevents pins from popping in at the distorted globe edge (in ocean), but lets them persist as the globe rotates — they disappear naturally when `projection()` returns `null` (back hemisphere).

```tsx
const appearFrame = PIN_APPEAR_START + i * PIN_STAGGER;
const localFrame  = frame - appearFrame;
if (localFrame < 0) return null;

if (localFrame < 10) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const [pLon, pLat] = pin.coords;
  const a = Math.sin(toRad((pLat - 8) / 2)) ** 2
    + Math.cos(toRad(8)) * Math.cos(toRad(pLat))
    * Math.sin(toRad((pLon - rotateLon) / 2)) ** 2;
  const angDist = 2 * Math.asin(Math.sqrt(a)) * (180 / Math.PI);
  if (angDist > 72) return null; // prevent ocean pop-in only
}
// After 10 frames: stays visible until pos === null (back hemisphere)
```

**Globe rotation:**
```tsx
const GLOBE_SPIN_START =  80;  // Asia-Pacific
const GLOBE_SPIN_END   = -30;  // Atlantic (shows Americas + Africa simultaneously)
const GLOBE_SETTLE     = 155;  // frames until it stops

const rotateLon = interpolate(frame, [0, GLOBE_SETTLE], [GLOBE_SPIN_START, GLOBE_SPIN_END], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
  easing: Easing.out(Easing.cubic),
});
```

**Pin stagger — for 150+ pins:**
```tsx
const PIN_APPEAR_START = 5;
const PIN_STAGGER = 1.2; // 150 pins × 1.2 = 180 frames (3s at 60fps)
```

**Pulsing dot animation:**
```tsx
const pulse = (Math.sin((frame / 60) * Math.PI * 2.5) + 1) / 2;
const ringR = interpolate(pulse, [0, 1], [4, 10]);
const ringOpacity = interpolate(pulse, [0, 1], [0.5, 0]);

<circle r={ringR} fill="none" stroke="#22c55e" strokeWidth={1} opacity={ringOpacity} />
<circle r={3.5} fill="#22c55e" />
```

---

## 16. Common Animation Patterns

### Linear fade-in
```tsx
const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
```

### Slide in from right
```tsx
const x = interpolate(frame, [0, 20], [700, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
```

### Scale pop (spring)
```tsx
const s = spring({ fps, frame, config: { stiffness: 480, damping: 28 }, durationInFrames: 20, to: 1 });
const scale = interpolate(s, [0, 1], [0.5, 1]);
```

### Looping marquee
```tsx
const loopFrame = frame % LOOP_FRAMES;
const translate = interpolate(loopFrame, [0, LOOP_FRAMES], [-totalWidth / 2, 0]);
```

### Exponential grid zoom-out (infinite grid effect)
```tsx
const INITIAL_SCALE = 18;
const scale = interpolate(frame, [ZOOM_START, ZOOM_START + ZOOM_DURATION], [INITIAL_SCALE, 1], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
  easing: Easing.out(Easing.cubic),
});
// Apply to a grid container: transform: `scale(${scale})`
// Grid cards use display:grid with gridTemplateColumns repeat(N, Xpx) and gap
```

---

## 17. Browser Chrome (Demo Cards)

```tsx
const BrowserHeader: React.FC<{ url: string }> = ({ url }) => (
  <div style={{ width: "100%", height: 52, background: "#F2F2F2", borderBottom: "1px solid #DCDCDC",
    display: "flex", alignItems: "center", padding: "0 20px", gap: 10 }}>
    {/* Traffic light dots + URL bar */}
  </div>
);
```

---

## 18. Beat Grid (Music Sync)

For full-video compositions with background music (103 BPM, 60 fps):

```tsx
const BEAT = 35; // 60/103 * 60 ≈ 35 frames per beat
const snap   = (f: number) => Math.round(f / BEAT) * BEAT;
const snapUp = (f: number) => Math.ceil(f / BEAT) * BEAT;
```

---

## 19. Creating a New Composition

1. Create `ComponentName.tsx` in `src/`.
2. Export the component.
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

4. For static hold at end: `durationInFrames = FREEZE_AT_FRAME + holdFrames`.

---

## 20. Commands

```bash
cd launch-videos/<project>
npm run dev      # Remotion Studio
npm run build    # Bundle for render
npm run lint     # ESLint + TypeScript
```

---

## 21. Do's and Don'ts

- **Do** use `brand` for typography and colors.
- **Do** use `staticFile()` for assets; never hardcode paths.
- **Do** use `extrapolateLeft/Right: "clamp"` in every `interpolate` call.
- **Do** keep all timing constants at top of file as named constants.
- **Do** use `OffthreadVideo` (not `Video`) for background videos — sharper, no flicker.
- **Do** use `Math.min(frame, FREEZE_AT_FRAME)` with unconditional `<Freeze>` for end-hold.
- **Do** install packages with `--legacy-peer-deps` if the project uses React 19.
- **Do** verify video duration with `ffprobe` before using time offsets.
- **Don't** conditionally render `<Freeze>` — causes a 1-frame transparent flash on mount/unmount.
- **Don't** use `objectFit` carelessly — `cover` crops, `contain` letterboxes, `fill` stretches.
- **Don't** forget to register new compositions in `Root.tsx`.
- **Don't** apply angular distance checks on every frame for globe pins — only guard the pop-in (first ~10 frames), then let `projection() === null` handle back-hemisphere hiding naturally.
