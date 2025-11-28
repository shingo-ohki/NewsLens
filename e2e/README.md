# Playwright E2E Test Setup (Local)

This folder contains Playwright E2E tests for the NewsLens app. These tests run against the dev server and use the mock LLM to keep responses deterministic.

Prerequisites:
- Node.js and NPM installed
- Dev dependencies installed: `npm install`
- Playwright browsers installed: `npx playwright install --with-deps`

Run tests locally:

```bash
# Install deps
npm install
# Install browsers (if not already installed)
npx playwright install --with-deps

# Run Playwright tests. This will start `npm run dev` automatically via playwright.config.ts webServer
npm run e2e
```

Notes:
- Tests intercept `/api/result` POST and GET requests to avoid requiring a Supabase instance for local testing.
- Tests rely on `USE_MOCK_LLM=true` being set in the Playwright webServer env. If you want to hit a real LLM or DB, update config accordingly.