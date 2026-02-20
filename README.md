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

On first run, you'll be prompted to authorize with Slack via OAuth.

### With a browser (local machine)

```bash
npx tsx src/cli.ts tools
```

Opens your browser automatically. Approve the app, and you're in. Token is cached to `~/.slack-mcp/tokens.json`.

### Without a browser (headless server)

```bash
npx tsx src/cli.ts --headless tools
```

1. The CLI prints an authorization URL
2. Open that URL in any browser (your laptop, phone, etc.)
3. Approve the app — the browser will redirect to a `localhost` URL that errors out
4. Copy the full URL from the address bar
5. Paste it back into the CLI

Token is cached — you only do this once.

### Re-authenticate

```bash
npx tsx src/cli.ts login        # browser
npx tsx src/cli.ts --headless login  # headless
```

## Commands

### List available tools

```bash
npx tsx src/cli.ts tools
```

### Call a tool

```bash
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
