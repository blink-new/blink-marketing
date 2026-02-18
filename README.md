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

Just describe what you want in plain English. OpenCode will load the right skill automatically.

**Examples:**

```
Write a content brief for a TikTok campaign targeting freelancers who want to build portfolio sites
```

```
Review this influencer brief and score it
```

```
Write a short-form video script for a YouTube Shorts creator, 45 seconds, website builder angle
```

```
Write 5 launch post options for the new mobile app feature
```

```
Suggest 10 demo app ideas for a creator with an audience of solopreneurs
```

The skills will guide OpenCode to follow Blink's brand voice, messaging rules, and content standards automatically.
