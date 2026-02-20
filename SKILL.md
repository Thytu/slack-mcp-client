---
description: Guidance for using the slack-mcp-client CLI to interact with Slack
---

# Slack MCP Client

Use the `slack-mcp-client` CLI to search, read, and send messages in Slack from the terminal.

## Invocation

```bash
slack-mcp call <tool_name> '<json_args>'
```

To list all available tools:

```bash
slack-mcp tools
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
slack-mcp call slack_search_channels '{"query":"engineering"}'

# 2. Read recent messages
slack-mcp call slack_read_channel '{"channel_id":"C062HBQQ0GL"}'
```

### Search and dig into a thread

```bash
# 1. Search for the topic
slack-mcp call slack_search_public '{"query":"deployment issue"}'

# 2. Read the full thread using channel_id and message_ts from results
slack-mcp call slack_read_thread '{"channel_id":"C062HBQQ0GL","message_ts":"1234567890.123456"}'
```

### Find a user and message them

```bash
# 1. Find the user
slack-mcp call slack_search_users '{"query":"jane"}'

# 2. Send a DM (use their user_id as channel_id)
slack-mcp call slack_send_message '{"channel_id":"U123456","message":"Hey, quick question..."}'
```

## Authentication

If you get "Not authenticated", you need to run the login flow yourself:

1. Run `slack-mcp login --headless`
2. The CLI will print a Slack authorization URL to stderr
3. **Do NOT try to open the URL.** Show the URL to the user and ask them to:
   - Open it in their browser
   - Approve the app in Slack
   - After approval, Slack redirects to a localhost URL that fails to load — **this is expected**
   - Copy the full URL from the browser's address bar and paste it back to you
4. Write the redirect URL the user gives you to the CLI's stdin
5. Once login succeeds, retry the original command

Authentication only needs to happen once — the token is cached and reused for all subsequent commands.

## Output

- Tool results are JSON on **stdout** — safe to pipe to `jq` or other tools.
- Auth prompts and errors go to **stderr**.

## Common Pitfalls

- **Boolean operators (`AND`, `OR`, `NOT`) don't work in search.** Use spaces for implicit AND, `-` for exclusion.
- **You need a channel ID, not a name**, for `slack_read_channel` and `slack_send_message`. Use `slack_search_channels` first to find the ID.
- **You need a user ID, not a name**, for `slack_send_message` DMs. Use `slack_search_users` first.
- **Thread reading requires `message_ts`** — get it from search results or channel history.
- **Slack uses mrkdwn, not Markdown** — use `*bold*` not `**bold**`, `<url|text>` not `[text](url)`.
