// Ambient type shim for the DORMANT Sentry integration.
// Lets src/integrations-staged/sentry.ts typecheck WITHOUT @sentry/browser
// installed. Activation step 2 (`npm install @sentry/browser`) replaces this
// with the real package types — delete this file then.
declare module "@sentry/browser" {
  export function init(opts: {
    dsn: string;
    environment?: string;
    tracesSampleRate?: number;
    beforeSend?: (event: { request?: { url?: string } }) => unknown;
  }): void;
  export function captureException(err: unknown, ctx?: { extra?: unknown }): void;
}
