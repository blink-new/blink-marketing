# Blink Claw — Custom Blink-Powered Skills

> Skills that give Claw agents access to Blink's platform.
> Credential storage design: `/data/.env` (OpenClaw's own secure env file, auto-loaded, chmod 0600, persists on Fly Volume).

---

## Complete blink-apis Endpoint Catalog

All project-scoped endpoints require `blnk_sk_...` + `project_id` in URL.
User stores credentials once via `save-credentials.sh` → `/data/.env`.

### Database
| Endpoint | What it does | Agent use case |
|----------|-------------|----------------|
| `POST /api/db/{pid}/sql` | Raw SQL (SELECT/INSERT/UPDATE/DELETE) | Query any app data |
| `POST /api/db/{pid}/batch` | Batch SQL in transaction | Multi-step data updates |
| `GET /api/db/{pid}/rest/v1/{table}` | REST table select | Read specific table |
| `POST /api/db/{pid}/rest/v1/{table}` | REST insert | Add records |
| `PATCH /api/db/{pid}/rest/v1/{table}` | REST update | Update records |
| `DELETE /api/db/{pid}/rest/v1/{table}` | REST delete | Remove records |

### Storage (S3/R2)
| Endpoint | What it does | Agent use case |
|----------|-------------|----------------|
| `POST /api/storage/{pid}/upload` | Upload file | Save reports, images, exports |
| `GET /api/storage/{pid}/list` | List files | Browse stored files |
| `GET /api/storage/{pid}/public-url` | Get public URL | Share file with user |
| `GET /api/storage/{pid}/download` | Signed download URL | Retrieve stored content |
| `DELETE /api/storage/{pid}/remove` | Delete files | Cleanup |
| `POST /api/storage/{pid}/move` | Move/rename | Organize |
| `POST /api/storage/{pid}/copy` | Copy file | Duplicate |

### Data / Web
| Endpoint | What it does | Agent use case |
|----------|-------------|----------------|
| `POST /api/data/{pid}/search` | Exa web search | Research, lookups |
| `POST /api/data/{pid}/fetch` | HTTP proxy | Call any external API |
| `POST /api/data/{pid}/scrape` | Scrape webpage | Extract content from any page |
| `POST /api/data/{pid}/extract-from-url` | Structured extraction from URL | "Get all products from this page" |
| `POST /api/data/{pid}/extract-from-blob` | Extract from uploaded file | PDF/doc parsing |
| `POST /api/data/{pid}/screenshot` | Screenshot any URL | Visual monitoring |

### Notifications
| Endpoint | What it does | Agent use case |
|----------|-------------|----------------|
| `POST /api/notifications/{pid}/email` | Send email | Notify users, send reports |

### Realtime
| Endpoint | What it does | Agent use case |
|----------|-------------|----------------|
| `POST /api/realtime/{pid}/publish` | Publish to channel | Push live updates to Blink app |
| `GET /api/realtime/{pid}/presence` | Channel presence | Who's online in user's app |
| `GET /api/realtime/{pid}/messages` | Channel history | Read message history |

### RAG (Vector Search)
| Endpoint | What it does | Agent use case |
|----------|-------------|----------------|
| `POST /api/rag/{pid}/search` | Vector similarity search | Query knowledge base |
| `POST /api/rag/{pid}/ai-search` | AI-assisted RAG | Smart knowledge retrieval |
| `POST /api/rag/{pid}/documents` | Add documents | Expand knowledge base |
| `GET /api/rag/{pid}/documents` | List documents | Browse knowledge base |
| `DELETE /api/rag/{pid}/documents/{id}` | Remove document | Clean up |

### AI (project-scoped — agent uses BLINK_API_KEY for its own LLM calls)
| Endpoint | What it does | Agent use case |
|----------|-------------|----------------|
| `POST /api/ai/{pid}/image` | Image generation | Generate/save images to project |
| `POST /api/ai/{pid}/speech` | Text-to-speech | Generate audio files |
| `POST /api/ai/{pid}/transcribe` | Audio transcription | Transcribe audio from project storage |

### Connectors (Phase 2 — needs user OAuth first)
| Endpoint | What it does |
|----------|-------------|
| `/api/connectors/notion` | Notion read/write |
| `/api/connectors/google-drive` | Google Drive files |
| `/api/connectors/google-calendar` | Calendar events |
| `/api/connectors/google-docs` | Google Docs |
| `/api/connectors/google-sheets` | Google Sheets |
| `/api/connectors/slack` | Slack messages |
| `/api/connectors/discord` | Discord messages |
| `/api/connectors/hubspot` | HubSpot CRM |
| `/api/connectors/linkedin` | LinkedIn |
| `/v1/connectors` | Unified connector API |

### Sandbox (E2B) — Low priority for agents
Agents already have direct shell access in the Fly container. E2B sandbox endpoints (`/api/sandbox/{pid}/exec`, `/files/*`, etc.) are mainly for Blink app builders, not autonomous agents.

### Not useful for agents
- `POST /api/db/create` — provisions new DB (project provisioning, not agent work)
- `DELETE /api/db/:project_id` — deletes project DB (dangerous, not for agents)

---

## Credential Storage — `/data/.env`

OpenClaw's canonical secret file. Lives on Fly Volume. Auto-loaded. `chmod 0600` enforced.

```bash
# Agent stores user-provided credentials:
echo "BLINK_APP_TODO_ID=proj_abc123" >> /data/.env
echo "BLINK_APP_TODO_SECRET=blnk_sk_xxx" >> /data/.env
chmod 600 /data/.env

# Skills source it:
source /data/.env 2>/dev/null || true
# Then: ${BLINK_APP_TODO_ID}, ${BLINK_APP_TODO_SECRET}
```

---

## Blink Skills — Complete Set

### Workspace-scoped skills (use `BLINK_API_KEY`, no project needed)

#### `blink-search`
Web search via Exa — `POST /api/v1/search`.
```bash
scripts/search.sh "query" [count]
```

#### `blink-fetch`  
HTTP proxy — `POST /api/v1/fetch`.
```bash
scripts/fetch.sh "https://api.example.com/data" "GET"
```

---

### Project-scoped skills (use user's `blnk_sk_...` from `/data/.env`)

#### `blink-app` — Database & Storage
Access user's Blink apps. Core skill.

```
scripts/save-credentials.sh <alias> <project_id> <secret>
scripts/db-sql.sh <alias> <SQL>
scripts/db-query.sh <alias> <table> [filters]
scripts/storage-upload.sh <alias> <local_file> <destination_path>
scripts/storage-list.sh <alias> [path]
scripts/storage-url.sh <alias> <file_path>
```

**`scripts/save-credentials.sh`:**
```bash
#!/usr/bin/env bash
set -euo pipefail
ALIAS="${1:-}"; PROJECT_ID="${2:-}"; SECRET="${3:-}"
[ -z "$ALIAS" ] || [ -z "$PROJECT_ID" ] || [ -z "$SECRET" ] && \
  echo "Usage: save-credentials.sh <alias> <projectId> <secretKey>" && exit 1
ALIAS_UPPER=$(echo "$ALIAS" | tr '[:lower:]' '[:upper:]' | tr '-' '_')
ENV_FILE="/data/.env"; touch "$ENV_FILE"; chmod 600 "$ENV_FILE"
grep -v "^BLINK_APP_${ALIAS_UPPER}_" "$ENV_FILE" > /tmp/.blink_env_tmp && mv /tmp/.blink_env_tmp "$ENV_FILE" || true
{ echo "BLINK_APP_${ALIAS_UPPER}_ID=${PROJECT_ID}"; echo "BLINK_APP_${ALIAS_UPPER}_SECRET=${SECRET}"; } >> "$ENV_FILE"
chmod 600 "$ENV_FILE"
echo "✓ Saved credentials for '${ALIAS}' (${PROJECT_ID})"
```

**`scripts/db-sql.sh`:**
```bash
#!/usr/bin/env bash
set -euo pipefail
ALIAS="${1:-}"; SQL="${2:-}"
[ -z "$ALIAS" ] || [ -z "$SQL" ] && echo "Usage: db-sql.sh <alias> <SQL>" && exit 1
source /data/.env 2>/dev/null || true
ALIAS_UPPER=$(echo "$ALIAS" | tr '[:lower:]' '[:upper:]' | tr '-' '_')
PID="${!BLINK_APP_${ALIAS_UPPER}_ID:-}" 2>/dev/null || PID=$(eval echo "\${BLINK_APP_${ALIAS_UPPER}_ID:-}")
SEC=$(eval echo "\${BLINK_APP_${ALIAS_UPPER}_SECRET:-}")
[ -z "$PID" ] && echo "No credentials for '${ALIAS}'. Run save-credentials.sh first." && exit 1
curl -sf -X POST \
  -H "Authorization: Bearer ${SEC}" -H "Content-Type: application/json" \
  "${BLINK_APIS_URL:-https://core.blink.new}/api/db/${PID}/sql" \
  -d "{\"sql\": $(python3 -c "import json,sys; print(json.dumps(sys.stdin.read()))" <<< "$SQL")}"
```

**`scripts/storage-upload.sh`:**
```bash
#!/usr/bin/env bash
set -euo pipefail
ALIAS="${1:-}"; LOCAL_FILE="${2:-}"; DEST="${3:-}"
[ -z "$ALIAS" ] || [ -z "$LOCAL_FILE" ] || [ -z "$DEST" ] && echo "Usage: storage-upload.sh <alias> <file> <dest>" && exit 1
source /data/.env 2>/dev/null || true
ALIAS_UPPER=$(echo "$ALIAS" | tr '[:lower:]' '[:upper:]' | tr '-' '_')
PID=$(eval echo "\${BLINK_APP_${ALIAS_UPPER}_ID:-}"); SEC=$(eval echo "\${BLINK_APP_${ALIAS_UPPER}_SECRET:-}")
[ -z "$PID" ] && echo "No credentials for '${ALIAS}'." && exit 1
curl -sf -X POST -H "Authorization: Bearer ${SEC}" \
  -F "file=@${LOCAL_FILE}" -F "path=${DEST}" \
  "${BLINK_APIS_URL:-https://core.blink.new}/api/storage/${PID}/upload"
```

---

#### `blink-email` — Send Emails
Send emails from user's Blink app to their users.

```
scripts/send.sh <alias> <to> <subject> <body_html>
```

**`SKILL.md` key instructions:**
```
Use when the user wants to send email notifications to their app's users.
Always confirm recipient, subject, and content before sending.
```

**`scripts/send.sh`:**
```bash
#!/usr/bin/env bash
set -euo pipefail
ALIAS="${1:-}"; TO="${2:-}"; SUBJECT="${3:-}"; BODY="${4:-}"
[ -z "$ALIAS" ] || [ -z "$TO" ] || [ -z "$SUBJECT" ] && echo "Usage: send.sh <alias> <to> <subject> <body>" && exit 1
source /data/.env 2>/dev/null || true
ALIAS_UPPER=$(echo "$ALIAS" | tr '[:lower:]' '[:upper:]' | tr '-' '_')
PID=$(eval echo "\${BLINK_APP_${ALIAS_UPPER}_ID:-}"); SEC=$(eval echo "\${BLINK_APP_${ALIAS_UPPER}_SECRET:-}")
[ -z "$PID" ] && echo "No credentials for '${ALIAS}'." && exit 1
curl -sf -X POST \
  -H "Authorization: Bearer ${SEC}" -H "Content-Type: application/json" \
  "${BLINK_APIS_URL:-https://core.blink.new}/api/notifications/${PID}/email" \
  -d "{\"to\": \"${TO}\", \"subject\": \"${SUBJECT}\", \"html\": $(python3 -c "import json,sys; print(json.dumps(sys.stdin.read()))" <<< "$BODY")}"
```

---

#### `blink-scrape` — Scrape & Extract
Scrape webpages or extract structured data from URLs. Server-side, no browser needed.

```
scripts/scrape.sh <alias> <url>                          ← raw content
scripts/extract.sh <alias> <url> <instruction>           ← structured extraction
scripts/screenshot.sh <alias> <url>                      ← visual screenshot
```

**`scripts/scrape.sh`:**
```bash
#!/usr/bin/env bash
set -euo pipefail
ALIAS="${1:-}"; URL="${2:-}"
[ -z "$ALIAS" ] || [ -z "$URL" ] && echo "Usage: scrape.sh <alias> <url>" && exit 1
source /data/.env 2>/dev/null || true
ALIAS_UPPER=$(echo "$ALIAS" | tr '[:lower:]' '[:upper:]' | tr '-' '_')
PID=$(eval echo "\${BLINK_APP_${ALIAS_UPPER}_ID:-}"); SEC=$(eval echo "\${BLINK_APP_${ALIAS_UPPER}_SECRET:-}")
[ -z "$PID" ] && echo "No credentials for '${ALIAS}'." && exit 1
curl -sf -X POST \
  -H "Authorization: Bearer ${SEC}" -H "Content-Type: application/json" \
  "${BLINK_APIS_URL:-https://core.blink.new}/api/data/${PID}/scrape" \
  -d "{\"url\": \"${URL}\"}"
```

**`scripts/extract.sh`** → calls `/api/data/{pid}/extract-from-url` with `{ url, instructions }`

---

#### `blink-realtime` — Publish to App Channels
Push live notifications/updates to Blink apps the agent manages.

```
scripts/publish.sh <alias> <channel> <event> <data_json>
```

**`scripts/publish.sh`:**
```bash
#!/usr/bin/env bash
set -euo pipefail
ALIAS="${1:-}"; CHANNEL="${2:-}"; EVENT="${3:-}"; DATA="${4:-{}}"
source /data/.env 2>/dev/null || true
ALIAS_UPPER=$(echo "$ALIAS" | tr '[:lower:]' '[:upper:]' | tr '-' '_')
PID=$(eval echo "\${BLINK_APP_${ALIAS_UPPER}_ID:-}"); SEC=$(eval echo "\${BLINK_APP_${ALIAS_UPPER}_SECRET:-}")
[ -z "$PID" ] && echo "No credentials for '${ALIAS}'." && exit 1
curl -sf -X POST \
  -H "Authorization: Bearer ${SEC}" -H "Content-Type: application/json" \
  "${BLINK_APIS_URL:-https://core.blink.new}/api/realtime/${PID}/publish" \
  -d "{\"channel\": \"${CHANNEL}\", \"event\": \"${EVENT}\", \"data\": ${DATA}}"
```

**Use case:** Agent monitors a condition, then publishes a realtime event to update a live dashboard in the user's Blink app.

---

#### `blink-rag` — Search Knowledge Bases
Query vector knowledge bases the user has in their Blink apps.

```
scripts/search.sh <alias> <collection_id> <query>
scripts/ai-search.sh <alias> <collection_id> <question>
```

**`scripts/search.sh` (RAG):**
```bash
#!/usr/bin/env bash
set -euo pipefail
ALIAS="${1:-}"; COL="${2:-}"; QUERY="${3:-}"
source /data/.env 2>/dev/null || true
ALIAS_UPPER=$(echo "$ALIAS" | tr '[:lower:]' '[:upper:]' | tr '-' '_')
PID=$(eval echo "\${BLINK_APP_${ALIAS_UPPER}_ID:-}"); SEC=$(eval echo "\${BLINK_APP_${ALIAS_UPPER}_SECRET:-}")
curl -sf -X POST \
  -H "Authorization: Bearer ${SEC}" -H "Content-Type: application/json" \
  "${BLINK_APIS_URL:-https://core.blink.new}/api/rag/${PID}/ai-search" \
  -d "{\"collection_id\": \"${COL}\", \"query\": \"${QUERY}\"}"
```

---

## What's NOT in P0 (Phase 2+)

| Endpoint | Reason deferred |
|----------|----------------|
| Connectors (Notion, Google, Slack, etc.) | Need user OAuth flow — complex setup |
| `/api/ai/{pid}/image` | Niche; agent can generate images but saving to project needs project key and storage knowledge |
| `/api/ai/{pid}/speech` / `/transcribe` | Niche for most agent workflows |
| Sandbox (`/api/sandbox/*`) | Agent has direct shell; redundant |

---

## Skills Summary

| Skill | Auth | Uses |
|-------|------|------|
| `blink-search` | `BLINK_API_KEY` | Exa search |
| `blink-fetch` | `BLINK_API_KEY` | HTTP proxy |
| `blink-app` | User's `blnk_sk_...` | DB (sql/rest), Storage (upload/list/url) |
| `blink-email` | User's `blnk_sk_...` | Send email to app users |
| `blink-scrape` | User's `blnk_sk_...` | Scrape/extract from URLs, screenshots |
| `blink-realtime` | User's `blnk_sk_...` | Push live updates to Blink apps |
| `blink-rag` | User's `blnk_sk_...` | Query knowledge bases |

Phase 2: `blink-notion`, `blink-google-drive`, `blink-calendar`, `blink-sheets` via connectors.
