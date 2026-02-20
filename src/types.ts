import type { OAuthTokens, OAuthClientInformation } from "@modelcontextprotocol/sdk/shared/auth.js";

export interface TokenFile {
  tokens?: OAuthTokens;
  clientInfo?: OAuthClientInformation;
  codeVerifier?: string;
}
