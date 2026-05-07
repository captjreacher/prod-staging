# Git Workflow

Recommended lifecycle:

```txt
Local Dev
-> Ready to Push
-> GitHub Action Running
-> Staging
-> Approved
-> Production
-> Failed
```

## Development

Work on feature branches where practical. Keep app changes in the source app repository, not in this control-plane repository.

## Staging Deployment

Merging to `main` in the app repository should trigger the app's GitHub Pages deployment workflow.

The GitHub Pages deployment is the staging release artifact. The workflow should build the app, write `CNAME`, validate `index.html` and the expected domain, upload the Pages artifact, and deploy.

The staging URL should follow:

```txt
https://[subdomain].staging.maximisedai.com/[page]
```

## Failure Handling

Failed deploys should not be promoted.

When a deploy fails, inspect the app repository workflow logs, fix the source app or workflow template, and rerun the deployment. Do not patch production as a workaround for a failed staging release.

## Approval

Production promotion is explicit approval only. A successful staging deploy is evidence for review, not permission to ship.

## Production Domains

Do not include production custom domains in 1-shot staging workflows.

Production domain selection, runtime hosting, secrets, analytics, privacy, rollback, and DNS cutover all belong to a separate promotion decision.
