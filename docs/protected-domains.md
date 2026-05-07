# Protected Domains

1-shot apps must never overwrite, repoint, or assume ownership of MGRNZ or MaximisedAI production or protected staging domains.

Protected domains include at least:

```txt
maximisedai.com
www.maximisedai.com
staging.maximisedai.com
mgrnz.com
www.mgrnz.com
staging.mgrnz.com
mgrnz.staging.maximisedai.com
maximisedai.staging.maximisedai.com
```

Reserved subdomains are tracked in `registry/reserved-subdomains.yaml`.

## DNS Rule

A 1-shot app may only create or modify DNS under its own approved `[subdomain].staging.maximisedai.com` record.

An app may not claim a reserved subdomain, production domain, apex domain, `www` domain, or another app's approved staging subdomain.

## Review Checklist

Before any staging DNS change:

- Confirm the app is listed in `registry/staging-sites.yaml`.
- Confirm the requested subdomain is not reserved.
- Confirm the requested record is under `*.staging.maximisedai.com`.
- Confirm the change does not affect production traffic.
- Confirm no DNS credentials or provider tokens are committed.
