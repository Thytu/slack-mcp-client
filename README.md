# Slack MCP Client

A standalone CLI that connects to Slack's remote MCP server. Use it to search messages, read channels, send messages, and more — from any terminal, any server, any environment.

No Cursor. No Claude Code. Just a CLI.

## Setup

```bash
git clone https://github.com/Thytu/slack-mcp-client.git
cd slack-mcp-client
npm install
```

## Authentication

You authenticate once. The token is cached at `~/.slack-mcp/tokens.json` and reused automatically.

### On a local machine (has a browser)

```bash
npx tsx src/cli.ts login
```

Opens your browser. Approve the app. Done.

### On a headless server or as an AI agent

```bash
npx tsx src/cli.ts login --headless
```

This prints an authorization URL. The flow:

1. The CLI prints a Slack authorization URL and waits
2. A human opens that URL in their browser (any device)
3. The human approves the app in Slack
4. Slack redirects to `http://localhost:3118/callback?code=...` — the page will fail to load. **This is expected.**
5. The human copies the full URL from the browser's address bar
6. The human pastes it back into the CLI (which is waiting at "Paste the redirect URL here:")
7. Done — token is cached

**If you are an AI agent:** you do NOT have a browser. Do NOT try to open the URL yourself. Print the URL, ask the human to open it, and ask them to give you back the redirect URL. Then write that URL to the waiting process's stdin.

### Re-authenticate

```bash
npx tsx src/cli.ts login              # browser
npx tsx src/cli.ts login --headless   # headless
```

## Usage

Once authenticated, no flags needed:

```bash
# List available tools
npx tsx src/cli.ts tools

# Call a tool
npx tsx src/cli.ts call <tool_name> '<json_args>'
```

### Examples

```bash
# Search public channels
npx tsx src/cli.ts call slack_search_public '{"query":"deployment"}'

# List channels matching a name
npx tsx src/cli.ts call slack_search_channels '{"query":"eng"}'

# Read recent messages from a channel
npx tsx src/cli.ts call slack_read_channel '{"channel_id":"C062HBQQ0GL"}'

# Read a thread
npx tsx src/cli.ts call slack_read_thread '{"channel_id":"C062HBQQ0GL","message_ts":"1234567890.123456"}'

# Send a message
npx tsx src/cli.ts call slack_send_message '{"channel_id":"C062HBQQ0GL","message":"Hello from the CLI"}'

# Find a user
npx tsx src/cli.ts call slack_search_users '{"query":"jane"}'

# Get your own profile
npx tsx src/cli.ts call slack_read_user_profile '{}'
```

## Available Tools

| Tool | What it does |
|------|-------------|
| `slack_search_public` | Search messages/files in public channels |
| `slack_search_public_and_private` | Search all channels including private/DMs |
| `slack_search_channels` | Find channels by name or description |
| `slack_search_users` | Find users by name, email, or role |
| `slack_read_channel` | Read messages from a channel |
| `slack_read_thread` | Read a thread conversation |
| `slack_read_canvas` | Read a Canvas document |
| `slack_read_user_profile` | Get user profile info |
| `slack_send_message` | Send a message to a channel or DM |
| `slack_send_message_draft` | Save a draft message |
| `slack_schedule_message` | Schedule a message for later |
| `slack_create_canvas` | Create a Canvas document |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SLACK_MCP_CLIENT_ID` | `1601185624273.8899143856786` | OAuth client ID |
| `SLACK_MCP_CALLBACK_PORT` | `3118` | Local port for OAuth callback |
| `SLACK_MCP_SERVER_URL` | `https://mcp.slack.com/mcp` | MCP server URL |

## Notes

- Tool output goes to **stdout**, auth prompts go to **stderr** — safe to pipe (`| jq`)
- Tokens are cached at `~/.slack-mcp/tokens.json`
- Your Slack workspace admin must have approved MCP integration
- If a command fails with "Not authenticated", run `login` again
