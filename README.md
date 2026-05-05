# prod-staging

Central GitHub Pages staging surface for small, disposable, or client-preview apps.

Canonical staging domain:

```txt
https://staging.maximisedai.com
```

This repo is the controlled staging target. New 1-shot app repos should deploy here, not directly to live production domains.

## Purpose

`prod-staging` is the neutral pre-production bucket for experimental apps, demo pages, temporary client previews, landing page tests, and AI-built prototypes.

It supports the operating model:

```txt
Local Dev → Ready to Push → GitHub Action Running → Staging → Approved → Production → Failed
```

For now, GitHub Pages is the deployment engine. Later, Paperclip/Cockpit can listen to deploy events and map them into the pipeline states.

## Golden rule

A 1-shot app repo should build its static output, then publish that output into a subfolder of this repo.

Example:

```txt
1-shot-menu-app  →  https://staging.maximisedai.com/1-shot-menu-app/
petfilth-preview →  https://staging.maximisedai.com/petfilth-preview/
```

Do not deploy these apps to production domains unless explicitly approved.

## Repo roles

| Repo type | Role |
|---|---|
| Source app repo | Owns source code, build scripts, package dependencies, tests, and app-specific secrets. |
| `captjreacher/prod-staging` | Owns staged static output and the custom staging domain. |
| Future Cockpit/Paperclip | Tracks deployment state, approvals, failures, and promotion decisions. |

## Required source repo setup

Each source repo needs:

1. A valid build command.
2. A predictable static output folder.
3. A GitHub Actions workflow that copies build output into this repo.
4. A unique staging path.

Recommended staging path format:

```txt
/<repo-name>/
```

Examples:

```txt
/instamenu/
/petfilth-preview/
/client-demo-alpha/
```

## GitHub token requirement

To push from a source repo into this repo, the source repo needs a secret with write access to `captjreacher/prod-staging`.

Recommended secret name:

```txt
STAGING_DEPLOY_TOKEN
```

The token should have least-privilege access where possible:

- Contents: read/write for `captjreacher/prod-staging`
- No production repo access unless unavoidable

Do not hard-code tokens in workflow files.

## Common build types

### Vite / React / vanilla Vite

Typical files:

```txt
package.json
vite.config.ts or vite.config.js
src/
index.html
```

Typical build command:

```bash
npm ci
npm run build
```

Typical output folder:

```txt
dist
```

Important Vite base setting for subfolder deploys:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/YOUR_STAGING_PATH/',
})
```

Example:

```ts
base: '/instamenu/'
```

Final staging URL:

```txt
https://staging.maximisedai.com/instamenu/
```

### Plain static HTML/CSS/JS

Typical files:

```txt
index.html
assets/
```

Build command:

```bash
mkdir -p dist
cp -R index.html assets dist/
```

Typical output folder:

```txt
dist
```

No framework base setting is required, but all asset links should be relative where possible:

```html
<link rel="stylesheet" href="./assets/style.css">
<script src="./assets/app.js"></script>
```

### Next.js static export

Use only when the app can be statically exported. Server routes, server actions, runtime API handlers, and dynamic SSR pages are not suitable for GitHub Pages.

Recommended `next.config.js`:

```js
const stagingPath = process.env.STAGING_PATH || ''

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: stagingPath ? `/${stagingPath}` : '',
  assetPrefix: stagingPath ? `/${stagingPath}/` : '',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
```

Typical build command:

```bash
npm ci
STAGING_PATH=your-app-name npm run build
```

Typical output folder:

```txt
out
```

Final staging URL:

```txt
https://staging.maximisedai.com/your-app-name/
```

### Astro

Typical `astro.config.mjs`:

```js
import { defineConfig } from 'astro/config'

export default defineConfig({
  site: 'https://staging.maximisedai.com',
  base: '/your-app-name',
})
```

Typical build command:

```bash
npm ci
npm run build
```

Typical output folder:

```txt
dist
```

### SvelteKit static adapter

Use `@sveltejs/adapter-static`.

Typical `svelte.config.js`:

```js
import adapter from '@sveltejs/adapter-static'

const config = {
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: 'index.html',
      precompress: false,
      strict: false,
    }),
    paths: {
      base: '/your-app-name',
    },
  },
}

export default config
```

Typical output folder:

```txt
build
```

## Template workflow for source app repos

Copy this file into the source app repo as:

```txt
.github/workflows/deploy-to-staging.yml
```

Adjust:

- `STAGING_PATH`
- `BUILD_COMMAND`
- `BUILD_OUTPUT`
- Node version if needed

```yaml
name: Deploy to central staging

on:
  push:
    branches:
      - main
  workflow_dispatch:

env:
  STAGING_REPO: captjreacher/prod-staging
  STAGING_BRANCH: main
  STAGING_PATH: your-app-name
  BUILD_COMMAND: npm run build
  BUILD_OUTPUT: dist

permissions:
  contents: read

concurrency:
  group: staging-${{ github.repository }}
  cancel-in-progress: true

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout source repo
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build source app
        run: ${{ env.BUILD_COMMAND }}

      - name: Validate build output
        run: |
          test -d "${{ env.BUILD_OUTPUT }}"
          test -f "${{ env.BUILD_OUTPUT }}/index.html"

      - name: Checkout staging repo
        uses: actions/checkout@v4
        with:
          repository: ${{ env.STAGING_REPO }}
          ref: ${{ env.STAGING_BRANCH }}
          token: ${{ secrets.STAGING_DEPLOY_TOKEN }}
          path: staging

      - name: Copy build into staging path
        run: |
          rm -rf "staging/${{ env.STAGING_PATH }}"
          mkdir -p "staging/${{ env.STAGING_PATH }}"
          cp -R "${{ env.BUILD_OUTPUT }}/." "staging/${{ env.STAGING_PATH }}/"
          touch staging/.nojekyll

      - name: Commit and push staging update
        working-directory: staging
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add "${{ env.STAGING_PATH }}" .nojekyll
          git commit -m "Deploy ${{ github.repository }} to staging/${{ env.STAGING_PATH }}" || echo "No changes to deploy"
          git push

      - name: Print staging URL
        run: echo "https://staging.maximisedai.com/${{ env.STAGING_PATH }}/"
```

## Vite-specific source repo workflow

For Vite apps, use this simplified version when the app output is `dist`.

```yaml
name: Deploy Vite app to central staging

on:
  push:
    branches:
      - main
  workflow_dispatch:

env:
  STAGING_REPO: captjreacher/prod-staging
  STAGING_BRANCH: main
  STAGING_PATH: your-vite-app

permissions:
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout source repo
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Validate dist
        run: |
          test -d dist
          test -f dist/index.html

      - name: Checkout staging repo
        uses: actions/checkout@v4
        with:
          repository: ${{ env.STAGING_REPO }}
          ref: ${{ env.STAGING_BRANCH }}
          token: ${{ secrets.STAGING_DEPLOY_TOKEN }}
          path: staging

      - name: Publish to staging path
        run: |
          rm -rf "staging/${{ env.STAGING_PATH }}"
          mkdir -p "staging/${{ env.STAGING_PATH }}"
          cp -R dist/. "staging/${{ env.STAGING_PATH }}/"
          touch staging/.nojekyll

      - name: Commit staging output
        working-directory: staging
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add "${{ env.STAGING_PATH }}" .nojekyll
          git commit -m "Deploy ${{ github.repository }} to staging/${{ env.STAGING_PATH }}" || echo "No changes to deploy"
          git push
```

## Required GitHub Pages setting for this repo

In `captjreacher/prod-staging`:

```txt
Settings → Pages → Build and deployment → Source → Deploy from branch
Branch: main
Folder: /root
```

This repo is intentionally simple: Pages serves the committed static files from `main`.

Source app repos do the build. This repo only serves the built output.

## Deployment safety rules

1. One app per staging subfolder.
2. Never overwrite `/` except for the central staging landing page.
3. Never commit secrets, `.env`, private keys, or service-role keys.
4. Do not deploy backend-dependent apps unless the backend is separately hosted and configured.
5. Prefer relative links/assets or set framework base paths correctly.
6. Keep custom domains and production deployment out of 1-shot source repos.
7. Promote to production only after explicit approval.

## Common failure checks

### 404 at staging URL

Check:

- Was output copied into the correct subfolder?
- Does the folder contain `index.html`?
- Is GitHub Pages source set to branch/root for this repo?
- Did the staging repo push succeed?

### Blank page but files load

Usually a framework base path issue.

For Vite:

```ts
base: '/your-app-name/'
```

For Next static export:

```js
basePath: '/your-app-name'
assetPrefix: '/your-app-name/'
```

### CSS/JS 404s

Use framework base settings or relative asset paths.

### Git push fails from source workflow

Check:

- `STAGING_DEPLOY_TOKEN` exists in the source repo secrets.
- Token has write access to `captjreacher/prod-staging`.
- Branch protection is not blocking GitHub Actions pushes.

## Recommended agent instruction for 1-shot apps

When asking a coding agent to create a new 1-shot app, include:

```md
Deploy target is central staging only.
Do not create a production deployment.
Use `captjreacher/prod-staging` as the staging output repo.
Deploy built static output to `/<repo-name>/`.
The public staging URL should be `https://staging.maximisedai.com/<repo-name>/`.
For Vite, set `base: '/<repo-name>/'`.
Add `.github/workflows/deploy-to-staging.yml` using the central staging template.
Assume `STAGING_DEPLOY_TOKEN` exists as a GitHub Actions secret.
Never commit `.env` or secrets.
```
