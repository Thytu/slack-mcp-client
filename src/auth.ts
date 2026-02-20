import type { OAuthClientProvider } from "@modelcontextprotocol/sdk/client/auth.js";
import type {
  OAuthTokens,
  OAuthClientMetadata,
  OAuthClientInformationMixed,
} from "@modelcontextprotocol/sdk/shared/auth.js";
import { loadTokenFile, saveTokenFile } from "./token-store.js";

export class SlackOAuthProvider implements OAuthClientProvider {
  private clientId: string;
  private callbackPort: number;
  private _onRedirect: (url: string) => void;

  constructor(opts: {
    clientId: string;
    callbackPort: number;
    onRedirect: (url: string) => void;
  }) {
    this.clientId = opts.clientId;
    this.callbackPort = opts.callbackPort;
    this._onRedirect = opts.onRedirect;
  }

  get redirectUrl(): string {
    return `http://localhost:${this.callbackPort}/callback`;
  }

  get clientMetadata(): OAuthClientMetadata {
    return {
      redirect_uris: [this.redirectUrl],
      token_endpoint_auth_method: "none",
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      client_name: "slack-mcp-client",
    };
  }

  async clientInformation(): Promise<OAuthClientInformationMixed | undefined> {
    return { client_id: this.clientId };
  }

  async saveClientInformation(_info: OAuthClientInformationMixed): Promise<void> {
    // We use a hardcoded client_id, nothing to save
  }

  async tokens(): Promise<OAuthTokens | undefined> {
    const file = loadTokenFile();
    return file?.tokens ?? undefined;
  }

  async saveTokens(tokens: OAuthTokens): Promise<void> {
    saveTokenFile({ tokens });
  }

  async codeVerifier(): Promise<string> {
    const file = loadTokenFile();
    return file?.codeVerifier ?? "";
  }

  async saveCodeVerifier(codeVerifier: string): Promise<void> {
    saveTokenFile({ codeVerifier });
  }

  async redirectToAuthorization(url: URL): Promise<void> {
    this._onRedirect(url.toString());
  }

  async invalidateCredentials(scope: "all" | "client" | "tokens" | "verifier"): Promise<void> {
    if (scope === "all" || scope === "tokens") {
      const file = loadTokenFile();
      if (file) {
        delete file.tokens;
        saveTokenFile(file);
      }
    }
    if (scope === "all" || scope === "verifier") {
      const file = loadTokenFile();
      if (file) {
        delete file.codeVerifier;
        saveTokenFile(file);
      }
    }
  }
}
