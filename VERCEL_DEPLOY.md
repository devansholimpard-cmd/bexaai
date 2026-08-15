# Deploying Bexa on Vercel

Bexa is configured as a Vercel project with a Vite static frontend and an Express serverless function at `api/index.ts`. The API function serves tRPC, OAuth callbacks, storage proxy routes, and the server-side Bexa LLM procedure.

## Deployment

Import the repository into Vercel with the project root set to the repository root. Vercel will read `vercel.json`, run `pnpm build`, publish `dist/public`, route `/api/*` to `api/index.ts`, and route client-side navigation to `index.html`. The config intentionally does not declare a custom `functions.runtime`: Vercel auto-detects Node.js for TypeScript files under `/api`, while `package.json` pins the deployment to supported Node.js `22.x`.

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

For this deployment, register this exact callback URL in the Manus OAuth application's allowed redirect URI list:

```text
https://bexaai.vercel.app/api/oauth/callback
```

The Bexa frontend constructs the callback from `window.location.origin`, so the hostname, HTTPS scheme, path, and trailing path must match exactly. If you later attach a custom domain, add its matching callback separately, for example `https://your-domain.com/api/oauth/callback`. Preview deployments also need their own callback URI if preview authentication is required.

If Manus shows `invalid redirect_uri` or says the domain is not allowed, the code is already generating the correct callback; the fix is to add the exact URI above to the OAuth application's allowlist and then retry login. The public Manus app ID is `aspQDYuno2bVeoBFZKFWPx`.

## Important compatibility note

Vercel can host the frontend and the Express API function, but it does not automatically provide Manus's built-in credentials or the project database. The `DATABASE_URL`, OAuth values, and built-in Forge values must therefore be valid Vercel environment variables. If the built-in LLM endpoint is not reachable from the Vercel deployment, replace the server-side LLM adapter with another OpenAI-compatible provider; do not move the API key into client-side code.

## Local verification

Run the following commands before pushing:

```bash
pnpm check
pnpm test
pnpm build
```
