# Blink AI Gateway — Design

> Universal OpenAI-compatible AI gateway for all Blink callers.
> Lives in **blink-apis** for uptime. Billing flows through existing auto-engineer infrastructure.

---

## What It Is

The Blink AI Gateway is a unified, workspace-scoped API for all agent capabilities — LLM calls, web search, HTTP proxy, file storage, and persistent database. One API key. No project_id. Think "OpenAI API but for everything agents need."

**Why not use existing blink-apis routes?** blink-apis is 100% project-scoped (`/api/{module}/{project_id}/action`). Creating a fake "system project" per agent would pollute project lists everywhere. The Gateway is the clean solution — a dedicated namespace for agent use cases that doesn't touch the project model.

**Callers in scope (Phase 1):**
| Caller | Key type | How they get a key |
|--------|---------|-------------------|
| Blink Claw agents | `blnk_ak_...` (auto-created at deploy) | Auto-created, injected as `BLINK_API_KEY` |
| Direct API users | `blnk_ak_...` (user-created in settings) | Workspace Settings > API Keys |

**Callers compatible via backward compat:**
| Caller | Key type | Change needed |
|--------|---------|--------------|
| Blink apps (blink-sdk) | `blnk_sk_...` or JWT (existing) | None — gateway accepts these too |

> **Future (out of scope for this feature):** blink-sdk could migrate to `blnk_ak_...` workspace keys for a simpler developer experience. Worth revisiting when upgrading the AI gateway offering for SDK customers.

---

## Architecture

```
Fly.io Container (OpenClaw fork)
  │  POST /api/v1/ai/chat/completions
  │  Authorization: Bearer blnk_ak_xxx
  │  { model: "anthropic/claude-sonnet-4.6", messages: [...], stream: true }
  │
  ▼
blink-apis: Gateway Middleware
  │  1. Auth: verify blnk_ak_... → workspace_id + owner_user_id
  │  2. Credit pre-check: POST /api/credits/validate (auto-engineer)
  │  3. gateway("anthropic/claude-sonnet-4.6")   ← @ai-sdk/gateway, same as text.ts
  │  4. Stream OpenAI SSE response to caller
  │  5. onFinish: deductCredits(userId, credits, {
  │       workspaceId, service: 'ai:text',
  │       source: 'claw', project_id: agentId,    ← for usage display
  │       model, input_tokens, output_tokens
  │     })
  │
  ▼
auto-engineer: POST /api/credits/deduct
  → recordWorkspaceUsage() in PG2
  → logCreditDeduction() in Tinybird
     { source: 'claw', project_id: agentId, model, tokens, credits }
  → Visible in Settings > Usage: source badge "Claw", detail: agent name
```

---

## Full `/api/v1/` Endpoint List

All use `Authorization: Bearer {BLINK_API_KEY}`.

```
POST /api/v1/ai/chat/completions  ← LLM, OpenAI-compat
GET  /api/v1/ai/models            ← model list
POST /api/v1/ai/image             ← image generation (fal.ai) ← implemented
POST /api/v1/ai/video             ← video generation (fal.ai) ← implemented
POST /api/v1/search               ← web search ← implemented
POST /api/v1/fetch                ← HTTP proxy ← implemented

# Phase 2 — connectors (needs user OAuth first)
/api/v1/connectors/notion/...
/api/v1/connectors/google-drive/...
```

**Status:** `/api/v1/search`, `/fetch`, `/ai/image`, `/ai/video` are implemented in `blink-apis/api/v1/`. LLM chat/completions and models endpoint pending gateway auth middleware.

For accessing user's Blink app data: the `blink-app` skill uses the user's own `blnk_sk_...` project secret key (stored in `/data/.env` on the Fly Volume) to call the **existing** blink-apis endpoints directly — no new endpoints needed. See [blink-skills.md](./blink-skills.md).

---

## Workspace API Keys (`blnk_ak_...`)

### New DB table in PG2

```sql
CREATE TABLE workspace_api_keys (
  id            TEXT PRIMARY KEY DEFAULT generate_custom_id('wak'),
  workspace_id  TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  created_by    TEXT NOT NULL REFERENCES users(id),
  name          TEXT NOT NULL,        -- "My AI Key", "Claw: My Assistant"
  key_value     TEXT NOT NULL UNIQUE, -- full key stored, same pattern as blnk_sk_...
  key_prefix    TEXT NOT NULL,        -- first 20 chars for display: "blnk_ak_abc12345_xx..."
  source        TEXT NOT NULL DEFAULT 'user',  -- 'user' | 'claw_agent'
  claw_agent_id TEXT REFERENCES claw_agents(id) ON DELETE CASCADE,
  last_used_at  TIMESTAMPTZ,
  revoked_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_workspace_api_keys_workspace ON workspace_api_keys(workspace_id);
CREATE INDEX idx_workspace_api_keys_key ON workspace_api_keys(key_value)
  WHERE revoked_at IS NULL;
```

### Key format

```
blnk_ak_{random48}

Example:
blnk_ak_xK9mP2nR4vW6qL0jTy8sB3eM5wA7cF1hZdRtNpYuQsIvBgHe
```

Fully opaque — no workspace ID, no agent ID, no encoded metadata. The database does all resolution. This is the OpenAI `sk-...` standard: the key is a random secret, nothing more.

### Auto-create per Claw agent

When a Claw agent is deployed, auto-engineer creates a `workspace_api_keys` row:
```typescript
const key = `blnk_ak_${generateId(48)}`   // pure random, nothing encoded

await prisma.workspace_api_keys.create({
  data: {
    workspace_id: workspaceId,
    created_by: userId,
    name: `Claw: ${agentName}`,
    key_value: key,
    key_prefix: key.slice(0, 20) + '...',
    source: 'claw_agent',
    claw_agent_id: agentId,   // for display + cascade delete only
  }
})
// Inject into Fly.io machine at creation:
//   BLINK_API_KEY={key}         ← workspace-scoped auth (like OpenAI's sk-...)
//   BLINK_AGENT_ID={agentId}    ← agent identity, sent as x-blink-agent-id header
```

When agent is deleted: `ON DELETE CASCADE` on `claw_agent_id` auto-revokes the key. No orphan keys.

**Key design (OpenAI pattern):**
- `BLINK_API_KEY` = workspace-scoped. Does NOT encode agent identity in the key string.
- `BLINK_AGENT_ID` = separate env var. Sent as `x-blink-agent-id: {agentId}` header on every request.
- blink-apis reads the header for per-agent billing, connector lookups, and usage tracking.
- Users creating manual workspace API keys (no agent) just use `BLINK_API_KEY` alone — the header is absent and calls are workspace-level only.
- `claw_agent_id` column in `workspace_api_keys` is for UI display ("this key belongs to agent X") and cascade deletion only — NOT parsed at request time.

---

## Auth in blink-apis (new middleware for gateway)

Add `verifyWorkspaceApiKey()` to `authn.ts` (~30 lines):

```typescript
const WORKSPACE_API_KEY_PREFIX = 'blnk_ak_'
const WS_API_KEY_CACHE_TTL = 300  // 5 min

// Cache key = hash of the token (never store the raw token as a cache key)
const cacheKeyFor = (key: string) => `blink:wsapikey:${crypto.createHash('sha256').update(key).digest('hex').slice(0, 16)}`

const verifyWorkspaceApiKey = async (key: string)
  : Promise<{ valid: boolean; workspaceId?: string; userId?: string }> => {
  if (!key.startsWith(WORKSPACE_API_KEY_PREFIX)) return { valid: false }

  // Check Redis cache first (keyed by token hash — no workspace ID parsing)
  const redis = getKvClient()
  const cacheKey = cacheKeyFor(key)
  const cached = await redis.get<{ workspaceId: string; userId: string }>(cacheKey)
  if (cached) return { valid: true, workspaceId: cached.workspaceId, userId: cached.userId }

  // DB lookup — fully opaque, no ID parsing from key string
  const result = await pg2Query(
    `SELECT wak.workspace_id, w.owner_id as user_id
     FROM workspace_api_keys wak
     JOIN workspaces w ON w.id = wak.workspace_id
     WHERE wak.key_value = $1 AND wak.revoked_at IS NULL LIMIT 1`,
    [key]
  )
  if (!result.rows.length) return { valid: false }

  const { workspace_id: workspaceId, user_id: userId } = result.rows[0]
  await redis.set(cacheKey, { workspaceId, userId }, { ex: WS_API_KEY_CACHE_TTL })
  return { valid: true, workspaceId, userId }
}
```

**New gateway-specific middleware** (`requireV1Auth`):

```typescript
// Accepts blnk_ak_... (primary for Claw/gateway) + blnk_sk_... and JWT (backwards compat)
// Sets req.billingWorkspaceId + req.billingUserId without needing projectId in URL
// Also reads x-blink-agent-id header (from BLINK_AGENT_ID env var in Claw containers)
// — NOT from the key itself. Key is workspace-scoped only.
export const requireV1Auth = async (req, res, next) => {
  const token = extractBearer(req)
  if (!token) return res.status(401).json({ error: 'Authorization required' })

  // Agent ID from header (separate from auth key — OpenAI pattern)
  // Set by Claw containers: x-blink-agent-id: ${BLINK_AGENT_ID}
  // Absent for direct API users (no agent context)
  const agentId = req.headers['x-blink-agent-id'] as string | undefined

  // 1. Workspace API key (primary path — Claw agents and direct API users)
  if (token.startsWith(WORKSPACE_API_KEY_PREFIX)) {
    const r = await verifyWorkspaceApiKey(token)
    if (!r.valid) return res.status(401).json({ error: 'Invalid API key' })

    // Validate agent belongs to this workspace (if provided)
    if (agentId) {
      const owned = await pg2Query(
        'SELECT 1 FROM claw_agents WHERE id = $1 AND workspace_id = $2 LIMIT 1',
        [agentId, r.workspaceId]
      )
      if (!owned.rows.length) return res.status(403).json({ error: 'Agent not found in workspace' })
    }

    req.billingWorkspaceId = r.workspaceId
    req.billingUserId = r.userId
    req.blinkAgentId = agentId   // undefined for non-agent calls
    return next()
  }

  // 2. Project secret key (backwards compat — existing blink apps)
  if (token.startsWith(SECRET_KEY_PREFIX)) {
    const r = await verifySecretKey(token)
    if (!r.valid) return res.status(401).json({ error: 'Invalid secret key' })
    const owner = await getProjectOwner(r.projectId)
    req.billingWorkspaceId = owner.workspaceId
    req.billingUserId = owner.userId
    return next()
  }

  // 3. JWT (backwards compat)
  const payload = verifyJwt(token)
  const owner = await getProjectOwner(payload.projectId)
  req.billingWorkspaceId = owner.workspaceId
  req.billingUserId = owner.userId
  next()
}
```

**`req.blinkAgentId`** is then read by:
- `billing.chargeRequest()` → passes as `projectId` in Tinybird (shows agent name in Settings > Usage)
- Connector lookup in `/v1/connectors/:provider/execute` → `agent_connection_links WHERE agent_id = req.blinkAgentId`

---

## Gateway Endpoint in blink-apis

## Full Gateway Endpoint List

```
POST /api/v1/chat/completions          ← LLM (already designed)
GET  /api/v1/models                    ← model list (already designed)
POST /api/v1/search                    ← Exa web search  ← NEW
POST /api/v1/fetch                     ← HTTP proxy      ← NEW
POST /api/v1/agents/{agentId}/storage/upload  ← S3 per agent  ← NEW
GET  /api/v1/agents/{agentId}/storage/list    ← ← NEW
GET  /api/v1/agents/{agentId}/storage/url     ← public URL    ← NEW
POST /api/v1/agents/{agentId}/db              ← Turso SQL     ← NEW
```

All endpoints: `Authorization: Bearer {BLINK_API_KEY}`. No project_id.

---

### `POST /api/v1/chat/completions`

**Request:** standard OpenAI chat completions format
```json
{
  "model": "anthropic/claude-sonnet-4.6",
  "messages": [{ "role": "user", "content": "Hello" }],
  "stream": true
}
```

**Response:** standard OpenAI SSE format (not Vercel Data Stream Protocol)

**Handler (`blink-apis/api/v1/ai/chat-completions.ts`):**
```typescript
app.post('/api/v1/chat/completions', requireGatewayAuth, async (req, res) => {
  const { model, messages, stream = false, max_tokens, temperature, ...rest } = req.body

  // 1. Credit pre-check
  const creditCheck = await validateUserCredits(req.billingUserId, 1, req.billingWorkspaceId)
  if (!creditCheck.canProceed) return res.status(402).json({ error: 'Insufficient credits' })

  // 2. Route via Vercel AI SDK gateway — same as text.ts
  const normalizedModel = normalizeModelId(model)  // passthrough: "anthropic/claude-sonnet-4.6"
  const configuredModel = gateway(normalizedModel)

  const agentId = req.headers['x-blink-agent-id'] as string | undefined  // optional metadata

  if (stream) {
    const result = streamText({
      model: configuredModel,
      messages,
      maxTokens: max_tokens,
      temperature,
      onFinish: async ({ usage }) => {
        await billing.chargeRequest(req, 'ai:text', {
          model: normalizedModel, usage
        }, {
          workspaceId: req.billingWorkspaceId,
          source: 'claw',                    // new source type
          project_id: agentId ?? undefined,  // agentId for per-agent breakdown
        })
      }
    })
    // Stream back in OpenAI SSE format (not Vercel Data Stream Protocol)
    res.setHeader('Content-Type', 'text/event-stream')
    for await (const chunk of result.textStream) {
      res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: chunk } }] })}\n\n`)
    }
    res.write('data: [DONE]\n\n')
    res.end()
    return
  }

  // Non-streaming
  const result = await generateText({ model: configuredModel, messages, maxTokens: max_tokens })
  await billing.chargeRequest(req, 'ai:text', { model: normalizedModel, usage: result.usage }, {
    workspaceId: req.billingWorkspaceId, source: 'claw', project_id: agentId
  })
  res.json({ choices: [{ message: { content: result.text } }], usage: result.usage })
})
```

### `GET /api/v1/models`

No auth required. Static list of supported models:
```json
{
  "data": [
    { "id": "anthropic/claude-sonnet-4.6", "name": "Claude Sonnet 4.5", "context_length": 200000 },
    { "id": "openai/gpt-5-1",             "name": "GPT-5.1",            "context_length": 128000 },
    { "id": "google/gemini-3-flash",       "name": "Gemini 3 Flash",     "context_length": 1000000 }
  ]
}
```

---

## Billing: Unified Strategy

| Concern | Value |
|---------|-------|
| **Margin** | 20% gross (same as all blink-apis AI calls today) |
| **Margin constant** | `GROSS_MARGIN = 0.25`, `MARGIN_MULTIPLIER = 1.25` in `billing/constants.ts` |
| **Routing** | `gateway(modelId)` from `@ai-sdk/gateway` — same for all callers |
| **Cost calculation** | `billing.calculate('ai:text', { model, usage })` — shared function |
| **Deduction** | `POST /api/credits/deduct` (auto-engineer) — same endpoint as all other billing |
| **Usage logging** | Tinybird `credit_deductions` datasource — same schema, new `source: 'claw'` value |
| **Per-agent tracking** | `project_id = agentId` in Tinybird (existing nullable field) |

**No separate billing code.** The gateway reuses the existing `billing.chargeRequest()` and `deductCredits()` functions exactly as they are.

---

## Usage Display in Settings > Usage

Existing `source` values: `chat`, `api`, `domain`, `project`, `download`.
New value: **`claw`** — shows as a new badge type in the activity log.

Activity log row for a Claw agent LLM call:
```
[Claw]  My Personal Assistant  anthropic/claude-sonnet-4.6  3,241 tokens  0.42 cr
```

Where "My Personal Assistant" = agent name, looked up from `agentId` stored in `project_id`.

This requires one small update to the activity log display in `UsageSection.tsx`: add the `claw` badge color and resolve `project_id` to agent name when `source === 'claw'`.

---

## Settings UI: Workspace API Keys

**New section in Settings > Workspace (auto-engineer):**

```
── Blink AI Gateway ──────────────────────────────────────────────
API Keys
Create API keys to access the Blink AI Gateway directly from
your own applications and scripts.

[+ Create API Key]

  My Automation Script   blnk_ak_a1b2...    Created Mar 1    [Revoke]
  Claw: My Assistant     blnk_ak_x9k3...    Created Mar 5    [Auto-managed] [Revoke]
  Claw: Code Reviewer    blnk_ak_m2p7...    Created Mar 6    [Auto-managed] [Revoke]

Auto-managed keys are created by Blink Claw and revoked automatically
when agents are deleted.
```

**Routes to add in auto-engineer:**
```
GET    /api/workspace/api-keys          — list keys (masked)
POST   /api/workspace/api-keys          — create key (returns full key ONCE)
DELETE /api/workspace/api-keys/:id      — revoke key
```

Auto-created Claw keys are created by the Claw deploy API and NOT returned to the user — they're only injected into the Fly.io machine. If the user wants to see/revoke them, they go to Settings > API Keys.

---

## New Files Summary

**blink-apis:**
```
api/v1/
  ai/
    chat-completions.ts  ← POST /api/v1/ai/chat/completions
    models.ts            ← GET  /api/v1/ai/models
  search.ts              ← POST /api/v1/search
  fetch.ts               ← POST /api/v1/fetch
  agents/
    storage.ts           ← /api/v1/agents/:agentId/storage/*
    db.ts                ← POST /api/v1/agents/:agentId/db
api/middleware/
  v1-auth.ts             ← requireV1Auth (blnk_ak_... + blnk_sk_... + JWT backwards compat)
```

Registered in `blink-apis/api/index.ts`:
```typescript
app.post('/api/v1/ai/chat/completions',          requireV1Auth, chatCompletionsHandler)
app.get( '/api/v1/ai/models',                    modelsHandler)
app.post('/api/v1/search',                       requireV1Auth, searchHandler)
app.post('/api/v1/fetch',                        requireV1Auth, fetchHandler)
app.post('/api/v1/agents/:agentId/db',           requireV1Auth, agentDbHandler)
app.post('/api/v1/agents/:agentId/storage/upload', requireV1Auth, agentStorageUploadHandler)
app.get( '/api/v1/agents/:agentId/storage/list',   requireV1Auth, agentStorageListHandler)
app.get( '/api/v1/agents/:agentId/storage/url',    requireV1Auth, agentStorageUrlHandler)
```

**blink-apis/api/middleware/authn.ts:** +`verifyWorkspaceApiKey()` (~30 lines)

**auto-engineer:**
```
src/app/api/workspace/api-keys/
  route.ts              ← GET + POST /api/workspace/api-keys
  [id]/route.ts         ← DELETE /api/workspace/api-keys/:id
src/components/settings/
  ApiKeysSection.tsx    ← new settings section
```

**PG2:**
```sql
CREATE TABLE workspace_api_keys (...)
```

**Tinybird:** add `claw` as valid `source` value (no schema change needed — it's a String column)

---

## Billing Deduct — No Changes Needed

`POST /api/credits/deduct` accepts `{ workspaceId, userId, credits, service, ... }`.
`resolveWorkspaceForCredits` resolves in priority order:
1. **`workspaceId` passed directly → use it** ← what we do (resolved from `blnk_ak_...` token)
2. `projectId` → look up project (legacy path)
3. `userId` → personal workspace fallback

Since the v1 auth middleware resolves `workspaceId` from the `blnk_ak_...` token, we pass it directly. No `projectId` needed. The existing deduct API works unchanged.

For Tinybird's `project_id` column (usage display), we pass `agentId` instead — it's an optional field.

## What's NOT Changing

- Existing `/api/ai/[project_id]/text` endpoints — untouched
- blink-sdk — untouched, continues using project keys
- `billing.chargeRequest()` — shared, no changes
- `POST /api/credits/deduct` — no changes; pass `workspaceId` directly, skip `projectId`
- Tinybird schema — no changes, `source: 'claw'` fits in existing `String` column
