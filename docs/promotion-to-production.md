# Promotion To Production

Staging does not equal production.

The staging control plane proves that a 1-shot app can build, deploy, and serve correctly from its approved staging subdomain. It does not decide production hosting or grant production domain ownership.

Promotion requires:

- Explicit approval
- Production domain decision
- Hosting/runtime decision
- Secrets review
- Analytics/privacy review
- Rollback path
- DNS cutover plan if needed

The production target may be GitHub Pages, a static host, a server runtime, a WordPress host, or another platform depending on what the app actually needs.

Do not add production custom domains or production deployment workflows to 1-shot staging templates.
