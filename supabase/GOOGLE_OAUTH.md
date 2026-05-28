# Google OAuth setup

The frontend button is wired. Two manual steps in Google Cloud + Supabase:

## 1. Google Cloud Console

1. Open https://console.cloud.google.com → create a project (or pick existing)
2. APIs & Services → **OAuth consent screen**
   - User type: **External**
   - App name: `Termino`
   - Support email: your email
   - Save (no scopes needed)
3. APIs & Services → **Credentials** → **Create Credentials** → **OAuth client ID**
   - Application type: **Web application**
   - Name: `Termino Web`
   - **Authorized JavaScript origins**:
     - `http://localhost:5173`
     - your production URL once deployed
   - **Authorized redirect URIs**:
     - `https://iziqwdxkqonraalooafd.supabase.co/auth/v1/callback`
   - Create → copy **Client ID** + **Client Secret**

## 2. Supabase Dashboard

1. Authentication → Providers → **Google**
2. Toggle **Enable**
3. Paste Client ID + Client Secret from step 1
4. Save

Done. The "Kontynuuj z Google" button on `/auth` will now work.
