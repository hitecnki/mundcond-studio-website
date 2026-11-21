# MundCond Studio Website — CMS build

## Temporary free hosting
Recommended: Netlify free tier for static sites (free usage limits apply). Create a GitHub repository, upload this folder, then import it into Netlify.

## Website editor (CMS)
A Decap CMS editor is included at `/admin/`. It can edit News, Projects and Team after configuring Decap Turbo GitHub backend.

### Required setup
1. Create a public GitHub repository and upload all website files to its `main` branch.
2. Sign up/connect the repo in Decap Turbo and obtain the site ID. Replace `REPLACE_WITH_TURBO_SITE_ID` in `admin/config.yml`.
3. In `content-config.js`, replace `REPLACE_OWNER` and `REPLACE_REPO` with your GitHub repository owner/name. This lets the public website read content entries through GitHub's public API.
4. Deploy the repository to Netlify (or another static host with automatic Git deploys).
5. Visit `https://YOUR_SITE/admin/` and sign in through the CMS backend.

## Publishing workflow
Edit/add News, Projects or Team in the CMS. Publish commits to GitHub; the site deploys automatically. The public page also reads the content folders from GitHub, so updates can appear after refresh even without a rebuild.

**Important:** CMS authentication needs an account/site connection and repo setup. Do not publish a personal access token in website files.
