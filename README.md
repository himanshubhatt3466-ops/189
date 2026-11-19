# Manas College AI Review Generator — No Node.js

This version is designed for **GitHub Pages**. It does not use Node.js, npm, Express, or a server you manage.

- Frontend: HTML, CSS and JavaScript
- Hosting: GitHub Pages
- AI backend: Google Apps Script
- AI: Gemini API
- API key: stored privately in Google Apps Script Script Properties (not in GitHub files)

## Folder contents

```text
manas-college-review/
├── index.html
├── qr.html
├── Code.gs
└── README.md
```

## Step 1 — Set up the secure AI endpoint

1. Open https://script.google.com/ and create a **New project**.
2. Remove the default code and paste the complete contents of `Code.gs`.
3. Open **Project Settings** (gear icon) → **Script Properties** → Add script property:
   - Property: `GEMINI_API_KEY`
   - Value: your NEW Gemini API key
4. Save the project.
5. Click **Deploy** → **New deployment**.
6. Select type **Web app**.
7. Execute as: **Me**.
8. Who has access: **Anyone**.
9. Click Deploy and complete Google's authorization steps.
10. Copy the deployed Web App URL ending in `/exec`.

**Security:** The Gemini API key that was previously pasted into chat should be revoked. Create a fresh key and store it only in Script Properties. Never put it in `index.html`, GitHub, or the QR code.

## Step 2 — Connect GitHub Pages

1. Open `index.html`.
2. Find this line:

```js
const APPS_SCRIPT_URL = "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";
```

3. Replace the placeholder with your deployed Apps Script `/exec` URL. Keep the URL inside quotes.
4. Save `index.html`.
5. Create a GitHub repository, e.g. `manas-college-review`.
6. Upload `index.html`, `qr.html`, and `README.md`. Do not upload any API key.
7. GitHub repository → **Settings** → **Pages**.
8. Under Build and deployment, choose **Deploy from a branch**.
9. Select branch `main` and folder `/ (root)`, then Save.
10. Wait for GitHub Pages to publish. Your site URL will look like:
    `https://YOUR-USERNAME.github.io/manas-college-review/`

## Step 3 — Make the QR poster

1. Open your live website URL and confirm review generation works.
2. Open `https://YOUR-USERNAME.github.io/manas-college-review/qr.html`.
3. Enter the main website URL (without `qr.html`).
4. Click Update QR → Print Poster.

## Important Google Review limitation

Google does not let an external app silently submit a review or pre-fill its review editor. The app copies the visitor's draft and opens the Google Review page; the visitor must paste, check, and submit it themselves. Reviews must reflect real experiences.

## If you update Apps Script later

After editing `Code.gs`, create a new version of the deployment (Deploy → Manage deployments → Edit → New version → Deploy). The `/exec` URL usually remains the same for an edited deployment.
