---
name: remotion-compositions
description: Create or modify Remotion video compositions for Blink marketing videos. Use when the user asks to create a Remotion scene, create a Remotion composition, add a new scene, or modify existing Remotion compositions in the launch-videos project.
---

# Remotion Compositions

## Project Location

Remotion project: `launch-videos/my-video/`
- Source: `launch-videos/my-video/src/`
- Static assets: `launch-videos/my-video/public/`
- Compositions: registered in `Root.tsx`

## Canvas & Config

- **Resolution:** 1920×1080
- **FPS:** 60
- **Font:** Use `brand` from `./brand` — DM Sans, weights 400/600/700

## Creating a New Composition

1. Create `ComponentName.tsx` in `launch-videos/my-video/src/`
2. Import from Remotion: `AbsoluteFill`, `useCurrentFrame`, `useVideoConfig`, `interpolate`, `spring`, `Easing`, `Sequence`, `Series`, `Video`, `Img`, `staticFile` as needed
3. Import `brand` from `./brand` for typography
4. Export the component
5. Register in `Root.tsx`:
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

## Common Patterns

**Frame-based animation:**
```tsx
const frame = useCurrentFrame();
const { fps } = useVideoConfig();
const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
```

**Spring animation:**
```tsx
const s = spring({ fps, frame, config: { stiffness: 200, damping: 26 }, to: 1 });
const x = interpolate(s, [0, 1], [100, 0]);
```

**Gradient text (Blink brand):**
```tsx
<span style={{
  background: "linear-gradient(90deg, #0006BA, #A599FF)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  WebkitTextFillColor: "transparent",
  color: "transparent",
}}>Text</span>
```

**Video with playback rate:**
```tsx
<Video src={staticFile("filename.mp4")} playbackRate={1.5}
  style={{ width: "100%", height: "100%", objectFit: "cover" }} />
```

**Sequencing scenes:**
```tsx
<Series>
  <Series.Sequence durationInFrames={90} name="Scene1"><Scene1 /></Series.Sequence>
  <Series.Sequence durationInFrames={120} name="Scene2"><Scene2 /></Series.Sequence>
</Series>
```

## Integration with FullVideo

To add a scene to the full video:
1. Import the component and its frame count (e.g. `DEMO_CARD_FRAMES`)
2. Add `DUR_SCENE` using `snap(frames)` or `snapUp(frames)` for music sync (BEAT=35, 103 BPM)
3. Add `<Series.Sequence durationInFrames={DUR_SCENE} name="..."><Component /></Series.Sequence>`
4. Include `DUR_SCENE` in `FULL_VIDEO_FRAMES` (or `FULL_VIDEO_NEW_FRAMES` for full-video-new)
