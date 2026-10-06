# Staged integrations — PostHog + Sentry (DORMANT)

These two modules are **wired but not activated**. They are not imported
anywhere in the app, make zero network calls, and add zero bytes to the
bundle until activated.

## Why they're staged, not live

Both need a free-tier **account + key**. Standing rule: workers NEVER create
accounts in the owner's name — the key harvester owns signups. So this
directory holds the complete drop-in code, and activation is a 5-minute
manual step once the keys exist.

## Activate PostHog (retention analytics — 1M events/mo free)

1. Create the PostHog Cloud account, copy the project API key.
2. `VITE_POSTHOG_KEY=<key>` in `.env` (never commit the key).
3. In `src/components/ashlane-app.tsx` (or wherever boot happens), add:
   ```ts
   import { initPostHog, capture, AshlaneEvents } from "@/integrations-staged/posthog";
   initPostHog(); // no-op until the key exists
   ```
4. Sprinkle `capture(AshlaneEvents.ko, { fighter, mode })` etc. at the
   suggested call sites listed at the bottom of `posthog.ts`.

Money link: retention analytics — see which fighters/modes keep players and
where they bounce. Quality = reviews = revenue.

## Activate Sentry (crash tracking — 5k errors/mo free)

1. Create the Sentry account, copy the DSN.
2. `npm install @sentry/browser` (kept OUT of package.json while dormant).
3. `VITE_SENTRY_DSN=<dsn>` in `.env` (never commit the DSN).
4. At boot:
   ```ts
   import { initSentry } from "@/integrations-staged/sentry";
   void initSentry();
   ```

Money link: every unhandled PWA exception becomes a ticket instead of a
1-star review.

## Verification

- Dormant check: `grep -rn "integrations-staged" src/ --include="*.tsx" --include="*.ts"
  | grep -v "^src/integrations-staged"` must return **nothing**.
- After activation: open the PWA, trigger an event, confirm it lands in the
  PostHog/Sentry dashboard.
