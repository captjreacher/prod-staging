# 1-shot app staging

This repository, `captjreacher/1-shot-app-staging`, is the staging control plane for 1-shot apps.

Canonical control-plane URL:

```txt
https://staging.maximisedai.com
```

The control plane provides documentation, templates, registry data, protected-domain rules, DNS guidance, and GitHub Pages workflow templates. It does not own the built artifacts for every 1-shot app.

## Staging Model

Each 1-shot app has its own source repository, GitHub Pages deployment, and staging subdomain.

Default app staging pattern:

```txt
https://[subdomain].staging.maximisedai.com/[page]
```

Example:

```txt
Repo:   captjreacher/petfilth
Domain: petfilth.staging.maximisedai.com
Pages:  https://petfilth.staging.maximisedai.com/
        https://petfilth.staging.maximisedai.com/menu/
```

The root staging domain remains the control-plane landing page:

```txt
https://staging.maximisedai.com
```

Do not deploy 1-shot apps into folders under the control-plane domain as the primary model.

## Naming Convention

1-shot app repositories should use lowercase kebab-case names.

By default:

```txt
[subdomain] = [repo-name]
```

Exceptions must be recorded in [`registry/staging-sites.yaml`](registry/staging-sites.yaml).

## Deployment Contract

Each source app repository owns its own build and deploy workflow:

1. The app repository builds itself.
2. The app repository deploys its static output to GitHub Pages.
3. The workflow writes a `CNAME` file containing `[subdomain].staging.maximisedai.com`.
4. DNS points `[subdomain].staging.maximisedai.com` to the GitHub Pages host.
5. The app is served from its own staging subdomain.

Target DNS shape:

```txt
[subdomain].staging.maximisedai.com CNAME captjreacher.github.io
```

This repository is the template source and registry, not a shared artifact bucket for app outputs.

## Supported Build Types

Supported GitHub Pages staging targets:

- Static HTML/CSS/JS
- Vite, including React and vanilla Vite
- Hugo
- Astro
- Next.js static export
- WordPress static export only

Real WordPress staging must use a PHP/WordPress-capable host, not GitHub Pages. If the app needs `wp-admin`, PHP, a database, plugins, WooCommerce, or server-side forms, it is not a GitHub Pages app.

See [`docs/build-types.md`](docs/build-types.md) for details.

## Templates

Workflow templates live in [`templates/workflows/`](templates/workflows/):

- `deploy-pages.yml`
- `deploy-static-pages.yml`
- `deploy-vite-pages.yml`
- `deploy-hugo-pages.yml`
- `deploy-next-static-pages.yml`

Config examples live in [`templates/configs/`](templates/configs/):

- `vite.config.example.ts`
- `next.config.example.js`
- `astro.config.example.mjs`
- `hugo.toml.example`

## Registry

Approved staging sites are tracked in [`registry/staging-sites.yaml`](registry/staging-sites.yaml).

Reserved names are tracked in [`registry/reserved-subdomains.yaml`](registry/reserved-subdomains.yaml).

## Protected-Domain Rule

1-shot apps must never overwrite, repoint, or assume ownership of MGRNZ or MaximisedAI production or protected staging domains.

A 1-shot app may only create or modify DNS under its own approved `[subdomain].staging.maximisedai.com` record.

See [`docs/protected-domains.md`](docs/protected-domains.md) and [`docs/dns-automation.md`](docs/dns-automation.md).

## Production Promotion

Staging does not equal production. Promotion requires explicit approval, a production domain decision, a hosting/runtime decision, secrets review, analytics/privacy review, a rollback path, and a DNS cutover plan where needed.

See [`docs/promotion-to-production.md`](docs/promotion-to-production.md).
