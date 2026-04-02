# 10k Agents — Remotion Video

Blink marketing video celebrating 10,000 agents built on Blink.

## Setup

```bash
npm install
npm run dev
```

## Structure

```
src/
├── index.ts              # Remotion entry point
├── Root.tsx              # Composition registry
├── brand.ts              # Brand tokens (colors, fonts)
├── index.css             # Tailwind import
└── TenKAgentsVideo.tsx   # Main composition
public/                   # Static assets (mp4, png, mp3)
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Open Remotion Studio |
| `npm run build` | Bundle for render |
| `npm run lint` | ESLint + TypeScript check |

## Canvas

- **Resolution:** 1920×1080
- **FPS:** 60
- **Aspect ratio:** 16:9
