# Build Types

Each 1-shot app repository owns its source code, build command, GitHub Pages workflow, `CNAME` file, and staging subdomain.

Default served URL pattern:

```txt
https://[subdomain].staging.maximisedai.com/[page]
```

## Static HTML/CSS/JS

Typical repository structure:

```txt
/
  index.html
  assets/
  pages/
```

Use `templates/workflows/deploy-static-pages.yml`. The template copies `index.html`, `assets/`, and optional `pages/` into `dist/`, writes `CNAME`, validates the output, and deploys through GitHub Pages.

Use relative links for assets and pages where practical.

## Vite / React / Vanilla Vite

Typical repository structure:

```txt
/
  package.json
  index.html
  src/
  vite.config.ts
```

Use `templates/workflows/deploy-vite-pages.yml`.

Because each app is served from its own staging subdomain, Vite should normally use:

```ts
base: '/'
```

The usual build output is `dist/`.

## Hugo

Typical repository structure:

```txt
/
  hugo.toml
  content/
  layouts/
  static/
```

Use `templates/workflows/deploy-hugo-pages.yml`.

The usual build output is `public/`. Set `baseURL` to the app staging domain:

```txt
https://[subdomain].staging.maximisedai.com/
```

## Astro

Typical repository structure:

```txt
/
  package.json
  astro.config.mjs
  src/
  public/
```

Use the generic workflow or adapt the Vite workflow. Set `site` to the app staging domain:

```txt
https://[subdomain].staging.maximisedai.com
```

The usual build output is `dist/`.

## Next.js Static Export

Typical repository structure:

```txt
/
  package.json
  next.config.js
  app/
  public/
```

Use `templates/workflows/deploy-next-static-pages.yml` only for static-export-compatible apps.

The required config shape is:

```js
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
```

The usual build output is `out/`.

This is not suitable for SSR, API routes, server actions, or runtime-only features.

## WordPress Static Export

GitHub Pages can serve static WordPress exports made of HTML, CSS, JavaScript, images, fonts, and other static files.

Suitable examples include brochure sites, landing pages, or archived previews exported from WordPress into static files.

GitHub Pages cannot run PHP or WordPress. Only static exports are suitable for GitHub Pages. If it needs `wp-admin`, PHP, database, plugins, WooCommerce, or server-side forms, it needs a real WordPress host.

## Real WordPress Staging

Real WordPress staging requires a PHP/WP-capable host with a database and runtime support. Do not model it as a GitHub Pages deployment.

Real WordPress staging still needs protected-domain review before any DNS changes. It may not assume ownership of MGRNZ or MaximisedAI production or protected staging domains.
