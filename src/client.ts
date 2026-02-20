import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { UnauthorizedError } from "@modelcontextprotocol/sdk/client/auth.js";
import open from "open";
import { SlackOAuthProvider } from "./auth.js";
import { waitForAuthCode } from "./callback-server.js";
import { prompt } from "./prompt.js";

const DEFAULT_SERVER_URL = "https://mcp.slack.com/mcp";
const DEFAULT_CLIENT_ID = "1601185624273.8899143856786";
const DEFAULT_CALLBACK_PORT = 3118;

function getConfig() {
  return {
    serverUrl: process.env.SLACK_MCP_SERVER_URL ?? DEFAULT_SERVER_URL,
    clientId: process.env.SLACK_MCP_CLIENT_ID ?? DEFAULT_CLIENT_ID,
    callbackPort: Number(process.env.SLACK_MCP_CALLBACK_PORT ?? DEFAULT_CALLBACK_PORT),
  };
}

export interface LoginOptions {
  headless?: boolean;
}

/**
 * Run the full OAuth login flow. Use this for the `login` command.
 */
export async function login(opts?: LoginOptions): Promise<void> {
  const config = getConfig();
  const headless = opts?.headless ?? false;

  const authProvider = new SlackOAuthProvider({
    clientId: config.clientId,
    callbackPort: config.callbackPort,
    onRedirect: (url) => {
      console.error("\nOpen this URL to authorize:\n");
      console.error(url);
      console.error();

      if (!headless) {
        open(url);
      }
    },
  });

  const client = new Client({ name: "slack-mcp-client", version: "0.1.0" });

  let transport = new StreamableHTTPClientTransport(
    new URL(config.serverUrl),
    { authProvider },
  );

  try {
    await client.connect(transport);
    await client.close();
    console.log("Logged in successfully.");
    return;
  } catch (err) {
    if (!(err instanceof UnauthorizedError)) {
      throw err;
    }
  }

  let authCode: string;

  if (headless) {
    const redirectUrl = await prompt("Paste the redirect URL here: ");
    const url = new URL(redirectUrl);
    const code = url.searchParams.get("code");
    if (!code) {
      throw new Error("No 'code' parameter found in the URL you pasted.");
    }
    authCode = code;
  } else {
    console.error(`Waiting for OAuth callback on port ${config.callbackPort}...`);
    authCode = await waitForAuthCode(config.callbackPort);
  }

  await transport.finishAuth(authCode);

  const freshTransport = new StreamableHTTPClientTransport(
    new URL(config.serverUrl),
    { authProvider },
  );

  const freshClient = new Client({ name: "slack-mcp-client", version: "0.1.0" });
  await freshClient.connect(freshTransport);
  await freshClient.close();
  console.log("Logged in successfully.");
}

/**
 * Connect using cached tokens. Fails if not authenticated.
 */
export async function createConnectedClient(): Promise<Client> {
  const config = getConfig();

  const authProvider = new SlackOAuthProvider({
    clientId: config.clientId,
    callbackPort: config.callbackPort,
    onRedirect: () => {
      // Don't open anything — just fail below
    },
  });

  const client = new Client({ name: "slack-mcp-client", version: "0.1.0" });

  const transport = new StreamableHTTPClientTransport(
    new URL(config.serverUrl),
    { authProvider },
  );

  try {
    await client.connect(transport);
    return client;
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      throw new Error(
        "Not authenticated. Run `slack-mcp login` (or `slack-mcp --headless login`) first.",
      );
    }
    throw err;
  }
}

export async function listTools(client: Client): Promise<void> {
  const result = await client.listTools();

  if (result.tools.length === 0) {
    console.log("No tools available.");
    return;
  }

  console.log(`Available tools (${result.tools.length}):\n`);
  for (const tool of result.tools) {
    console.log(`  ${tool.name}`);
    if (tool.description) {
      console.log(`    ${tool.description}`);
    }
    console.log();
  }
}

export async function callTool(
  client: Client,
  toolName: string,
  args: Record<string, unknown>,
): Promise<void> {
  const result = await client.callTool({ name: toolName, arguments: args });
  console.log(JSON.stringify(result, null, 2));
}
