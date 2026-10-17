// Strategy literals Clerk expects for signIn.sso()/signUp.sso() — scoped to just
// the providers this app actually has enabled, rather than importing Clerk's
// full internal OAuthStrategy union.
export type OAuthStrategy = "oauth_google" | "oauth_slack" | "oauth_atlassian";

// Social connections enabled on the Clerk dashboard for this app.
export const OAUTH_PROVIDERS: { strategy: OAuthStrategy; label: string }[] = [
  { strategy: "oauth_google", label: "Google" },
  { strategy: "oauth_slack", label: "Slack" },
  { strategy: "oauth_atlassian", label: "Atlassian" },
];
