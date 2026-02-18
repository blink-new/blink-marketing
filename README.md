# Blink Marketing — AI Skills Workspace

This repo contains AI agent skills for the Blink marketing team. These skills teach OpenCode how to write content briefs, video scripts, social posts, and more — all in Blink's voice.

---

## What's in here

```
.opencode/skills/
├── blink-brand-context/       # Brand voice, product facts, messaging rules
├── blink-app-ideas/           # App ideas and demo app suggestions
├── brief-review/              # Evaluate and improve influencer briefs
├── content-briefs/            # Write creator/influencer campaign briefs
├── short-form-video-scripts/  # Write and review TikTok/Reels/Shorts scripts
└── social-launch-posts/       # Write social posts for launches
```

Skills are automatically available to OpenCode when you open this folder. You don't need to configure anything — just open this project and start asking.

---

## Setup

### 1. Install OpenCode

**macOS / Linux** — run the install script:

```bash
curl -fsSL https://opencode.ai/install | bash
```

**macOS with Homebrew:**

```bash
brew install anomalyco/tap/opencode
```

**Windows** — use Chocolatey or Scoop:

```bash
choco install opencode
# or
scoop install opencode
```

**VS Code / Cursor / Windsurf** — just run `opencode` in the integrated terminal and the extension installs automatically. Then use `Cmd+Esc` (Mac) or `Ctrl+Esc` (Windows) to open it anytime.

---

### 2. Get an Anthropic API key

1. Go to [console.anthropic.com](https://console.anthropic.com/)
2. Sign in or create an account
3. Navigate to **API Keys** and click **Create Key**
4. Copy the key (starts with `sk-ant-...`)

---

### 3. Connect Anthropic to OpenCode

Open a terminal in this project folder and run:

```bash
opencode
```

Then inside OpenCode, run:

```
/connect
```

Select **Anthropic**, then choose one of:

- **Claude Pro/Max** — authenticates via your browser if you have a subscription
- **Create an API Key** — opens the Anthropic console in your browser
- **Manually enter API Key** — paste your `sk-ant-...` key directly

Once connected, run `/models` and select a Claude model (recommend **claude-sonnet-4** for most tasks).

---

### 4. Open this project

```bash
cd /path/to/blink-marketing
opencode
```

The skills in `.opencode/skills/` are automatically discovered. You'll see them available when OpenCode needs to use one.

---

## Using the skills

Mention the skill by name in your prompt and OpenCode will load it. You can also just describe what you want and it will pick the right one automatically.

**Write a content brief:**

```
Use the content-briefs skill to write a TikTok campaign brief targeting freelancers who want to build portfolio sites
```

**Review an existing brief:**

```
Use the brief-review skill to score and give feedback on this brief: [paste brief]
```

**Write a video script:**

```
Use the short-form-video-scripts skill to write a 45-second YouTube Shorts script, website builder angle, casual tone
```

**Write social launch posts:**

```
Use the social-launch-posts skill to write 5 post options for the new mobile app feature launch
```

**Get demo app ideas:**

```
Use the blink-app-ideas skill to suggest 10 demo app ideas for a creator whose audience is solopreneurs
```

All skills reference `blink-brand-context` automatically — brand voice, product facts, and messaging rules are always applied.
