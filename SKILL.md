---
description: Guidance for using the slack-mcp-client CLI to interact with Slack
---

# Slack MCP Client

This skill provides guidance for using the `slack-mcp-client` CLI to search, read, and send messages in Slack from the terminal.

## When to Use

Apply this skill when you need to interact with Slack programmatically — searching for messages, reading channels/threads, sending messages, finding users, or managing canvases — without a GUI or IDE integration.

## Authentication

**You must authenticate before using any tools.** Run login once — the token is cached and reused.

### If you are an AI agent (no browser)

```bash
npx tsx src/cli.ts login --headless
```

This will:
1. Print a Slack authorization URL
2. Wait for you to provide the redirect URL

**You do NOT have a browser. Do NOT try to open the URL.** Instead:
1. Show the authorization URL to the user and ask them to open it
2. Tell the user: "After you approve, Slack will redirect to a localhost URL that fails to load. This is expected. Copy the full URL from your browser's address bar and paste it here."
3. Take the URL the user gives you and write it to the CLI's stdin

Once authenticated, you never need `--headless` again. All subsequent commands work without it.

### If running on a machine with a browser

```bash
npx tsx src/cli.ts login
```

## Invocation

```bash
npx tsx src/cli.ts call <tool_name> '<json_args>'
```

## Tool Reference

### Searching

| Tool | Use When |
|------|----------|
| `slack_search_public` | Searching public channels. No user consent needed. |
| `slack_search_public_and_private` | Searching all channels including private, DMs, group DMs. Needs consent. |
| `slack_search_channels` | Finding channels by name or description. |
| `slack_search_users` | Finding people by name, email, or role. |

### Reading

| Tool | Use When |
|------|----------|
| `slack_read_channel` | Reading message history from a specific channel. |
| `slack_read_thread` | Reading a full thread (parent message + replies). |
| `slack_read_canvas` | Reading the content of a Canvas document. |
| `slack_read_user_profile` | Getting a user's profile (name, email, title, timezone). |

### Writing

| Tool | Use When |
|------|----------|
| `slack_send_message` | Sending a message immediately to a channel or DM. |
| `slack_send_message_draft` | Saving a draft message without sending it. |
| `slack_schedule_message` | Scheduling a message for a future time. |
| `slack_create_canvas` | Creating a new Canvas document. |

## Search Strategy

1. **Start broad, then narrow.** Begin with a simple query, then add filters if too many results.
2. **Use multiple searches.** Break complex questions into smaller queries.
3. **Choose the right mode:**
   - Natural language (e.g., `"What is the status of project X?"`) for fuzzy/conceptual search
   - Keywords (e.g., `"project X status"`) for exact matches

### Search Modifiers

```
in:channel-name          Search in a specific channel
from:<@U123456>          Messages from a user (by ID)
from:username            Messages from a user (by username)
before:YYYY-MM-DD       Before a date
after:YYYY-MM-DD        After a date
on:YYYY-MM-DD           On a specific date
is:thread                Only threaded messages
has:link                 Messages with links
has:file                 Messages with attachments
"exact phrase"           Exact phrase match
-word                    Exclude a word
```

### File Search

Add `content_types="files"` with a type filter:

```
type:images | type:documents | type:pdfs | type:spreadsheets | type:canvases
```

Example: `'{"query":"budget after:2025-01-01","content_types":"files"}'`

## Common Workflows

### Find and read a channel

```bash
# 1. Find the channel ID
npx tsx src/cli.ts call slack_search_channels '{"query":"engineering"}'

# 2. Read recent messages
npx tsx src/cli.ts call slack_read_channel '{"channel_id":"C062HBQQ0GL"}'
```

### Search and dig into a thread

```bash
# 1. Search for the topic
npx tsx src/cli.ts call slack_search_public '{"query":"deployment issue"}'

# 2. Read the full thread using channel_id and message_ts from results
npx tsx src/cli.ts call slack_read_thread '{"channel_id":"C062HBQQ0GL","message_ts":"1234567890.123456"}'
```

### Find a user and message them

```bash
# 1. Find the user
npx tsx src/cli.ts call slack_search_users '{"query":"jane"}'

# 2. Send a DM (use their user_id as channel_id)
npx tsx src/cli.ts call slack_send_message '{"channel_id":"U123456","message":"Hey, quick question..."}'
```

## Output

- Tool results are JSON on **stdout** — safe to pipe to `jq` or other tools.
- Auth prompts and errors go to **stderr**.
- If you get "Not authenticated", run `npx tsx src/cli.ts login --headless` first.

## Common Pitfalls

- **Boolean operators (`AND`, `OR`, `NOT`) don't work in search.** Use spaces for implicit AND, `-` for exclusion.
- **You need a channel ID, not a name**, for `slack_read_channel` and `slack_send_message`. Use `slack_search_channels` first to find the ID.
- **You need a user ID, not a name**, for `slack_send_message` DMs. Use `slack_search_users` first.
- **Thread reading requires `message_ts`** — get it from search results or channel history.
- **Slack uses mrkdwn, not Markdown** — use `*bold*` not `**bold**`, `<url|text>` not `[text](url)`.
