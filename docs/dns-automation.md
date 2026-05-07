# DNS Automation

Each approved 1-shot app staging domain should use this DNS record shape:

```txt
[subdomain].staging.maximisedai.com CNAME captjreacher.github.io
```

The app repository's GitHub Pages workflow must also publish a `CNAME` file containing:

```txt
[subdomain].staging.maximisedai.com
```

## Option 1: Paperclip/Cockpit DNS Provisioner

This is the preferred long-term model.

A control-plane provisioner can read approved entries from `registry/staging-sites.yaml`, reject reserved names from `registry/reserved-subdomains.yaml`, and create or update only the matching `*.staging.maximisedai.com` CNAME record.

The provisioner must be scoped so it cannot modify production records or unrelated domains.

## Option 2: GitHub Actions DNS Step

This is acceptable only with a scoped DNS API token.

Rules:

- Do not commit DNS tokens.
- Store any DNS token only in the app repository or trusted automation secret store.
- The DNS token must not have root-domain destructive access.
- Automation may only manage approved records under `*.staging.maximisedai.com`.
- Automation must not touch `maximisedai.com`, `mgrnz.com`, or production records.

## Option 3: Manual DNS

Manual DNS is acceptable as an interim option.

Before creating a record, check:

- The subdomain is present in `registry/staging-sites.yaml`.
- The subdomain is not listed in `registry/reserved-subdomains.yaml`.
- The record is under `[subdomain].staging.maximisedai.com`.
- The target is `captjreacher.github.io`.

Manual changes should be documented in the registry or the relevant deployment ticket.
