# Slack MCP Client

A standalone CLI that connects to Slack's remote MCP server. Use it to search messages, read channels, send messages, and more — from any terminal, any server, any environment.

No Cursor. No Claude Code. Just a CLI.

## Install

```bash
git clone https://github.com/Thytu/slack-mcp-client.git
cd slack-mcp-client
npm install
npm link
```

This registers `slack-mcp` as a global command.

## Authentication

You authenticate once. The token is cached at `~/.slack-mcp/tokens.json` and reused automatically.

### On a local machine (has a browser)

```bash
slack-mcp login
```

Opens your browser. Approve the app. Done.

### On a headless server or as an AI agent

```bash
slack-mcp login --headless
```

The flow:

1. The CLI prints a Slack authorization URL and waits
2. A human opens that URL in their browser (any device)
3. The human approves the app in Slack
4. Slack redirects to `http://localhost:3118/callback?code=...` — the page will fail to load. **This is expected.**
5. The human copies the full URL from the browser's address bar
6. The human pastes it back into the CLI (which is waiting at "Paste the redirect URL here:")
7. Done — token is cached

**If you are an AI agent:** Do NOT try to open the URL yourself. Print the URL, ask the human to open it, and ask them to give you back the redirect URL. Then write that URL to the waiting process's stdin.

### Re-authenticate

```bash
slack-mcp login              # browser
slack-mcp login --headless   # headless
```

## Setting Up the Skill for Your AI Agent

After installing and authenticating, copy the `SKILL.md` file into wherever your AI agent reads its skills/instructions from. For example:

- **Claude Code**: Copy `SKILL.md` to your project's skills directory (e.g. `.claude/skills/slack.md`)
- **Other agents**: Include the contents of `SKILL.md` in your agent's system prompt, instructions folder, or skill registry

The SKILL file contains all the instructions the LLM needs to use the CLI — tool reference, search strategies, common workflows, and pitfalls. It assumes authentication is already done.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SLACK_MCP_CLIENT_ID` | `1601185624273.8899143856786` | OAuth client ID |
| `SLACK_MCP_CALLBACK_PORT` | `3118` | Local port for OAuth callback |
| `SLACK_MCP_SERVER_URL` | `https://mcp.slack.com/mcp` | MCP server URL |

## Notes

- Tool output goes to **stdout**, auth prompts go to **stderr** — safe to pipe (`| jq`)
- Your Slack workspace admin must have approved MCP integration
- If a command fails with "Not authenticated", run `login` again
