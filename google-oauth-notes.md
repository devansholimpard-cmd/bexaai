# Google OAuth Setup Notes

Official Google web-server OAuth guidance: https://developers.google.com/identity/protocols/oauth2/web-server
Official OpenID Connect guidance: https://developers.google.com/identity/openid-connect/openid-connect

Current Google Cloud project created in the signed-in account:
- Project name: Bexa AI
- Project ID: bexa-ai
- Account: qwertyuiop123hgng@gmail.com
- Google Auth Platform setup page: https://console.cloud.google.com/auth/overview?project=bexa-ai
- Current setup step: Create branding, App Information
- App name entered: Bexa AI
- User support email selected: qwertyuiop123hgng@gmail.com

Required Google OAuth redirect URI for the deployed application:
https://bexaai.vercel.app/api/auth/google/callback

Google OAuth credentials still need to be created after the consent/branding setup: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET. Never commit the secret to GitHub.
