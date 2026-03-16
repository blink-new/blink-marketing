[x] Trace UI chat request flow
[x] Inspect live PG2 agent records
[x] Probe deployed agent health and chat endpoints
[x] Root cause: OpenClaw gateway crash — missing gateway.controlUi config for --bind lan
[x] Fix buildOpenclawJson() — add gateway.controlUi config (allowHostHeaderOriginFallback + disableDeviceAuth)
[x] Verified fix on live agent — crash error gone from Fly logs
[x] New API endpoint: GET /api/claw/agents/:id/control-ui-access (authenticated gateway token reveal)
[x] UI: "Open Control UI" button in AgentSettingsPanel (copies token + opens Fly URL)
[ ] Deploy fresh agent to verify full end-to-end chat + Control UI flow
