<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/985b8408-5882-409b-b021-b2a438f9d493

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to GitHub Pages

This repo now includes an automatic Pages deployment workflow at `.github/workflows/deploy-pages.yml`.

1. Push code to `main`.
2. In GitHub repo, open `Settings -> Pages` and set:
   - `Source: GitHub Actions`
3. In `Settings -> Secrets and variables -> Actions`, add these repository secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY` (if your app uses it in production)
4. Go to `Actions` tab and run `Deploy to GitHub Pages` (or push to `main` again).
5. Your site will be published at:
   - `https://<your-username>.github.io/<your-repo>/`

Notes:
- Router is configured with `HashRouter` for GitHub Pages compatibility.
- Vite base path is set to `./` so assets load correctly on Pages.
