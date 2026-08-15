# Deploying Bexa on Vercel

Bexa is configured as a Vercel project with a Vite static frontend and an Express serverless function at `api/index.ts`. The API function serves tRPC, OAuth callbacks, storage proxy routes, and the server-side Bexa LLM procedure.

## Deployment

Import the repository into Vercel with the project root set to the repository root. Vercel will read `vercel.json`, run `pnpm build`, publish `dist/public`, route `/api/*` to `api/index.ts`, and route client-side navigation to `index.html`.

## Required environment variables

Add these variables in Vercel Project Settings for both Preview and Production environments:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | MySQL/TiDB connection string for users, conversations, and messages |
| `JWT_SECRET` | Session cookie signing secret |
| `VITE_APP_ID` | Manus OAuth application ID |
| `OAUTH_SERVER_URL` | Manus OAuth backend URL |
| `VITE_OAUTH_PORTAL_URL` | Manus login portal URL |
| `BUILT_IN_FORGE_API_URL` | Server-side Manus built-in API base URL used by `invokeLLM` |
| `BUILT_IN_FORGE_API_KEY` | Server-side credential for the built-in API |
| `OWNER_OPEN_ID` | Owner identity used by the existing auth bootstrap |
| `VITE_FRONTEND_FORGE_API_KEY` | Frontend Manus runtime credential if required by the scaffold |
| `VITE_FRONTEND_FORGE_API_URL` | Frontend Manus runtime URL if required by the scaffold |
| `VITE_ANALYTICS_ENDPOINT` | Optional analytics endpoint |
| `VITE_ANALYTICS_WEBSITE_ID` | Optional analytics website ID |

Never commit these values to the repository. Configure them in the Vercel dashboard or with the Vercel CLI.

## OAuth callback

After receiving the deployed domain, register this callback URL with the Manus OAuth application:

```text
https://YOUR_VERCEL_DOMAIN/api/oauth/callback
```

Use the same callback URL for the Production domain and the corresponding Preview URL if preview authentication is required.

## Important compatibility note

Vercel can host the frontend and the Express API function, but it does not automatically provide Manus's built-in credentials or the project database. The `DATABASE_URL`, OAuth values, and built-in Forge values must therefore be valid Vercel environment variables. If the built-in LLM endpoint is not reachable from the Vercel deployment, replace the server-side LLM adapter with another OpenAI-compatible provider; do not move the API key into client-side code.

## Local verification

Run the following commands before pushing:

```bash
pnpm check
pnpm test
pnpm build
```
