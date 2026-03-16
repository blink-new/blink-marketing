# Workspace-Level Connectors — Design

> Migrating connectors from user_id-scoped to workspace_id-scoped with explicit linking.
> Enables Blink Claw agents to use integrations (Discord, Notion, Gmail, Slack, etc.)
> while also improving the connector experience for regular Blink projects.

---

## What This Covers (and What It Doesn't)

### In scope: ConnectorProvider types
Discord, Notion, Google Drive, Google Calendar, Google Docs, Google Sheets, Google Slides, Slack, LinkedIn, HubSpot, Salesforce, GitHub, Gmail.

### NOT in scope (kept as-is, not affected)
| Integration | Why excluded |
|-------------|-------------|
| **Supabase** | Infrastructure — each Blink project maps to one specific Supabase project (their DB). Project-scoped is correct. Not a candidate for workspace sharing. |
| **RevenueCat** | Has its own dedicated `revenuecat_connections` table. Mobile billing SDK infrastructure. Not relevant for Claw agents. Already user-scoped separately. |

---

## New Schema

### Table: `workspace_connections` (new, replaces `connections` for ConnectorProvider types)

```sql
CREATE TABLE workspace_connections (
  id              TEXT PRIMARY KEY DEFAULT generate_custom_id('wcon'),
  workspace_id    TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  provider        TEXT NOT NULL,     -- 'notion' | 'discord' | 'slack' | 'gmail' | etc.
  name            TEXT NOT NULL,     -- User-given label: "Work Gmail", "Company Slack"
  tokens          TEXT NOT NULL,     -- AES-256-GCM encrypted JSON: { access_token, refresh_token, expires_at, ... }
  metadata        JSONB,             -- Provider-specific display info: email, workspace_name, org_id, etc.
  status          TEXT NOT NULL DEFAULT 'active',  -- active | revoked | expired | error
  last_used_at    TIMESTAMPTZ,
  created_by      TEXT NOT NULL REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_workspace_connections_workspace ON workspace_connections(workspace_id);
CREATE INDEX idx_workspace_connections_provider ON workspace_connections(workspace_id, provider);
```

### Table: `project_connection_links` (new)

Explicit linking of a workspace connection to a specific Blink project:

```sql
CREATE TABLE project_connection_links (
  id              TEXT PRIMARY KEY DEFAULT generate_custom_id('pcl'),
  project_id      TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  connection_id   TEXT NOT NULL REFERENCES workspace_connections(id) ON DELETE CASCADE,
  provider        TEXT NOT NULL,    -- Denormalized for fast lookup
  is_primary      BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, connection_id)
);

CREATE INDEX idx_project_connection_links_project ON project_connection_links(project_id, provider);
```

### Table: `agent_connection_links` (new)

Explicit linking of a workspace connection to a specific Claw agent:

```sql
CREATE TABLE agent_connection_links (
  id              TEXT PRIMARY KEY DEFAULT generate_custom_id('acl'),
  agent_id        TEXT NOT NULL REFERENCES claw_agents(id) ON DELETE CASCADE,
  connection_id   TEXT NOT NULL REFERENCES workspace_connections(id) ON DELETE CASCADE,
  provider        TEXT NOT NULL,    -- Denormalized for fast lookup
  is_primary      BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(agent_id, connection_id)
);

CREATE INDEX idx_agent_connection_links_agent ON agent_connection_links(agent_id, provider);
```

---

## Backward Compatibility Migration

The migration is **purely additive**. Existing tables (`connections`, `workspace_integrations`) remain unchanged. New code checks new tables first, falls back to old tables.

```sql
-- Migration: copy existing ConnectorProvider connections to workspace_connections
INSERT INTO workspace_connections (id, workspace_id, provider, name, tokens, metadata, status, created_by)
SELECT
  'wcon_' || generate_id(8),
  w.id AS workspace_id,
  c.provider,
  COALESCE(c.connection_data->>'workspace_name', c.provider || ' connection') AS name,
  encrypt(c.connection_data::text) AS tokens,
  c.connection_data AS metadata,
  c.status,
  c.user_id AS created_by
FROM connections c
JOIN workspaces w ON w.owner_id = c.user_id AND w.type = 'personal'
WHERE c.provider IN ('discord', 'notion', 'slack', 'google_drive', 'google_calendar', ...)
  AND c.status = 'active';

-- Auto-link to projects that had project-scoped connections
INSERT INTO project_connection_links (project_id, connection_id, provider)
SELECT p.id, wc.id, c.provider
FROM connections c
JOIN projects p ON p.id = c.project_id
JOIN workspace_connections wc ON wc.created_by = c.user_id AND wc.provider = c.provider
WHERE c.project_id IS NOT NULL
ON CONFLICT DO NOTHING;
```

**Token lookup fallback chain** (blink-apis connector auth, updated):
```typescript
async function resolveConnectionToken(params: {
  provider: string
  workspaceId?: string
  projectId?: string
  agentId?: string
}): Promise<string | null> {
  // 1. NEW: agent-linked connection (for Claw agents)
  if (params.agentId) {
    const link = await prisma.agent_connection_links.findFirst({
      where: { agent_id: params.agentId, provider: params.provider },
      include: { workspace_connections: true }
    })
    if (link) return decrypt(link.workspace_connections.tokens).access_token
  }

  // 2. NEW: project-linked connection
  if (params.projectId) {
    const link = await prisma.project_connection_links.findFirst({
      where: { project_id: params.projectId, provider: params.provider },
      include: { workspace_connections: true }
    })
    if (link) return decrypt(link.workspace_connections.tokens).access_token
  }

  // 3. NEW: any workspace connection (fallback if not explicitly linked)
  if (params.workspaceId) {
    const conn = await prisma.workspace_connections.findFirst({
      where: { workspace_id: params.workspaceId, provider: params.provider, status: 'active' }
    })
    if (conn) return decrypt(conn.tokens).access_token
  }

  // 4. LEGACY FALLBACK: old connections table (backward compat)
  const legacy = await getConnectorToken(params.projectId, params.provider)
  return legacy?.access_token ?? null
}
```

---

## OAuth Flow Changes

**Current:** OAuth callbacks in auto-engineer store to `connections`/`workspace_integrations` with `user_id` as scope.

**New:** OAuth callbacks store to `workspace_connections` with `workspace_id` as scope. The state object includes `workspaceId` instead of / in addition to `projectId`.

```typescript
// In /api/connect/{provider}/authorize:
const state = {
  userId,
  workspaceId,   // ← new
  projectId,     // ← keep for optional auto-linking
  nonce, timestamp, returnPath
}
```

The callback creates a `workspace_connections` row. If `projectId` was provided, also creates a `project_connection_links` row automatically.

---

## How Claw Agents Call Connectors

**Key design (OpenAI pattern):**
- `BLINK_API_KEY` (`blnk_ak_...`) = workspace-scoped auth. Does NOT encode agent ID.
- `BLINK_AGENT_ID` = separate env var. Sent as `x-blink-agent-id` header on every request.
- Agent ID is resolved from the HEADER, not from the key.

```
Agent Fly container:
  BLINK_API_KEY = blnk_ak_xxx   ← workspace key
  BLINK_AGENT_ID = clw_def      ← separate agent identity

POST /v1/connectors/notion/execute
Authorization: Bearer blnk_ak_xxx
x-blink-agent-id: clw_def            ← sent by OpenClaw blink provider headers config
{ "method": "/search", "params": { "query": "meeting notes" } }

blink-apis requireV1Auth middleware:
  1. Validate blnk_ak_xxx → workspace_id: ws_abc, userId: user_xyz
  2. Read x-blink-agent-id header → agentId: clw_def
  3. Validate: agent clw_def belongs to workspace ws_abc → OK
  4. Set req.billingWorkspaceId = ws_abc, req.blinkAgentId = clw_def

Connector lookup (uses req.blinkAgentId from header):
  resolveConnectionToken({ agentId: 'clw_def', provider: 'notion' })
  → agent_connection_links → workspace_connections → decrypt token
  → Call Notion API, return results
```

If agent hasn't been linked to a Notion connection → 403 with message:
```json
{ "error": "not_linked", "message": "This agent hasn't been linked to a Notion connection. Go to agent settings in Blink to connect." }
```

Multiple connections of same provider → agent passes `account_id` (connection ID or name) in request body to disambiguate.

---

## UI Changes

### Workspace Settings → Integrations (new section)
- List all workspace connections per provider
- Connect new account (OAuth flow)
- View/revoke existing connections
- Multi-account supported: "Add another Slack workspace"

### Project Settings → Integrations (updated)
- Dropdown per provider: "Link a Notion connection" → shows workspace connections to pick from
- Replaces current per-project OAuth flow
- Shows "Connected via: My Work Notion (connected Jan 1)" after linking

### Claw Agent Settings → Integrations (new, Phase 2)
- "Add Integration" → pick provider → pick which workspace connection
- Shows active linked integrations per agent
- Unlink / change account

---

## Claw Agent Connection Skills (Phase 2)

Once an agent has linked connections, it can use them directly via `/v1/connectors/:provider/execute` using `BLINK_API_KEY`. No user credentials needed — the API resolves the token from `agent_connection_links`.

```bash
# In blink-notion skill script:
curl -sf -X POST \
  -H "Authorization: Bearer ${BLINK_API_KEY}" \
  -H "Content-Type: application/json" \
  "${BLINK_APIS_URL}/v1/connectors/notion/execute" \
  -d '{"method": "/databases", "http_method": "GET"}'
```

**Available providers via this mechanism:**
Discord, Notion, Google Calendar, Google Drive, Google Sheets, Google Docs, Gmail, Slack, HubSpot, LinkedIn, Salesforce (everything in `ConnectorProvider`).

---

## What is NOT Changing

| Integration | Status | Why |
|-------------|--------|-----|
| **Supabase** | Unchanged | Project-scoped infrastructure (each project = one Supabase DB). Per-project is correct. `connections` rows with `provider='supabase'` excluded from migration. |
| **RevenueCat** | Unchanged | Has own `revenuecat_connections` table. Mobile billing SDK. Not relevant for Claw agents. |
| Existing `connections` table | Kept (not deleted) | Legacy fallback for backward compat |
| Existing `workspace_integrations` table | Kept | Legacy fallback for backward compat |
| blink-sdk connector API | Unchanged | v1 `/v1/connectors/:provider/execute` continues to work for projects |

---

## Phasing

| Phase | Work |
|-------|------|
| **P1 (Blink Claw)** | Add `workspace_connections`, `agent_connection_links` tables; update `resolveConnectionToken()` to check agent links; expose in Claw agent settings UI |
| **P2 (All Blink Projects)** | Add `project_connection_links`; update project settings UI; run OAuth migration for existing projects |
| **P3 (Full Migration)** | Migrate OAuth callbacks to use `workspaceId`; update workspace settings UI with multi-account; deprecate old tables |
