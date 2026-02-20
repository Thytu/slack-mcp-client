#!/usr/bin/env npx tsx
import { createConnectedClient, listTools, callTool } from "./client.js";
import { clearTokenFile } from "./token-store.js";

const USAGE = `Usage:
  slack-mcp [--headless] login                     Force re-authentication
  slack-mcp [--headless] tools                     List available tools
  slack-mcp [--headless] call <tool> [json-args]   Call a tool with optional JSON arguments

Options:
  --headless   Don't open a browser; print the auth URL and prompt for the redirect URL`;

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

  const connectOpts = { headless };

  switch (command) {
    case "login": {
      clearTokenFile();
      console.log("Cleared saved tokens.");
      const client = await createConnectedClient(connectOpts);
      await client.close();
      console.log("Logged in successfully.");
      break;
    }

    case "tools": {
      const client = await createConnectedClient(connectOpts);
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

      const client = await createConnectedClient(connectOpts);
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
