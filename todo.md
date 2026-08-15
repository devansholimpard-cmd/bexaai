# Project TODO

- [x] Glossy Gojo-versus-Sukuna dark visual system with black/navy foundation, electric blue and crimson/purple accents
- [x] Unauthenticated hero landing page with exact “Start Chatting” CTA and animated background treatment
- [x] Manus OAuth login and logout flow with authenticated-only chat access
- [x] Real Bexa AI chat powered by server-side invokeLLM
- [x] Full markdown rendering for assistant responses
- [x] Persistent per-user conversations and messages in the database
- [x] New conversation creation and conversation switching
- [x] Animated message bubbles, typing indicator, and smooth scroll-to-bottom behavior
- [x] Web Audio API click sound for every interactive button and send action
- [x] Responsive layout and accessible keyboard/focus states
- [x] Vitest coverage for chat/auth persistence behavior
- [x] Browser verification of landing, login-gated chat, new conversation, send, and logout flows

- [x] Audit Vercel compatibility for the current Express/tRPC/Manus runtime
- [x] Add Vercel deployment configuration and safe build routing
- [x] Document required Vercel environment variables and external service limitations
- [x] Validate Vercel-oriented build and tests

- [x] Push the completed Bexa project to GitHub repository devansholimpard-cmd/bexaai
- [x] Verify the remote branch and latest commit after upload

- [x] Fix Vercel function runtime configuration to match current Vercel standards
- [x] Validate the corrected Vercel config and push it to devansholimpard-cmd/bexaai

- [x] Fix production Start Chatting OAuth redirect and authenticated chat entry
- [x] Validate the production login gate and push the fix to GitHub

- [ ] Resolve Manus OAuth allowed redirect URI for https://bexaai.vercel.app/api/oauth/callback
- [x] Sync the OAuth callback guidance to GitHub

- [x] Remove Manus OAuth login triggers and callback dependency from Bexa
- [x] Superseded Google-only OAuth plan with email/password authentication
- [x] Preserved authenticated chat gating and per-user chat history under email accounts
- [x] Superseded Google OAuth secrets with local email/password configuration
- [x] Push email/password authentication changes to GitHub

- [x] Confirmed the deployment target changed to Netlify and Google OAuth is not required

- [x] Remove visible Manus name, logo, and user-facing branding from Bexa
- [x] Create a first-class anime-style Bexa landing page and Get Started CTA
- [x] Replace the incomplete Manus auth path with email/password login architecture
- [x] Add Netlify-compatible build configuration and SPA redirects
- [x] Validate and sync the redesigned Bexa app for Netlify deployment

- [x] Remove Google OAuth credential requirements and login flow
- [x] Add secure email/password registration and login flow
- [x] Add email/password auth UI while preserving Bexa chat access

- [ ] Deploy the email-auth Bexa app to Netlify and verify the live landing, registration, login, protected chat, persistence, and logout flow
- [ ] Record the final Netlify deployment URL and confirm no OAuth redirect dependency is active

- [x] Upload the latest email-login and Netlify-ready Bexa source directly to devansholimpard-cmd/bexaai
- [x] Verify the updated main branch and commit on GitHub
