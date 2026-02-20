#!/usr/bin/env npx tsx
import { login, createConnectedClient, listTools, callTool } from "./client.js";
import { clearTokenFile } from "./token-store.js";

const USAGE = `Usage:
  slack-mcp login [--headless]        Authenticate with Slack
  slack-mcp tools                     List available tools
  slack-mcp call <tool> [json-args]   Call a tool with optional JSON arguments

Options:
  --headless   (login only) Print the auth URL instead of opening a browser`;

function parseArgs(argv: string[]) {
  const args = argv.slice(2);
  const headless = args.includes("--headless");
  const positional = args.filter((a) => a !== "--headless");
  return { headless, command: positional[0], rest: positional.slice(1) };
}

async function main() {
  const { headless, command, rest } = parseArgs(process.argv);

  if (!command || command === "--help" || command === "-h") {
    console.log(USAGE);
    process.exit(0);
  }

  switch (command) {
    case "login": {
      clearTokenFile();
      console.log("Cleared saved tokens.");
      await login({ headless });
      break;
    }

    case "tools": {
      const client = await createConnectedClient();
      await listTools(client);
      await client.close();
      break;
    }

    case "call": {
      const toolName = rest[0];
      if (!toolName) {
        console.error("Error: missing tool name.\n");
        console.log(USAGE);
        process.exit(1);
      }

      let args: Record<string, unknown> = {};
      if (rest[1]) {
        try {
          args = JSON.parse(rest[1]);
        } catch {
          console.error("Error: invalid JSON arguments.");
          process.exit(1);
        }
      }

      const client = await createConnectedClient();
      await callTool(client, toolName, args);
      await client.close();
      break;
    }

    default:
      console.error(`Unknown command: ${command}\n`);
      console.log(USAGE);
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
