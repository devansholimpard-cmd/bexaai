# Bexa on Netlify

Bexa is configured for a Vite client plus a Netlify Function that serves the Express/tRPC API. The site uses email/password authentication and does not require Google OAuth.

## Build settings

Use the repository `devansholimpard-cmd/bexaai` with these settings:

| Setting | Value |
|---|---|
| Build command | `pnpm build` |
| Publish directory | `dist/public` |
| Functions directory | `netlify/functions` |
| Node version | `22` |

`netlify.toml` already contains the API and SPA redirects.

## Required environment variables

Add the existing server-side values in Netlify Site configuration. The minimum required values are `DATABASE_URL`, `JWT_SECRET`, `BUILT_IN_FORGE_API_URL`, and `BUILT_IN_FORGE_API_KEY`. Set `VITE_APP_ID` to `bexa` if it is not already present. The AI answer flow uses the built-in server-side LLM gateway, so its credentials must remain server-side.

## Email login

The application exposes real email registration and login through the Bexa access dialog. Passwords are hashed with Node's built-in scrypt implementation and are never stored in plaintext. The database migration adds `users.passwordHash`.

After adding environment variables, trigger a new Netlify deploy. The production callback is not OAuth-based; users register or sign in directly on the Bexa landing page.
