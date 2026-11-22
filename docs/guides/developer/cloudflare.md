# Cloudflare

The Knowledge Landscapes holding page is deployed as a Cloudflare Worker, in the Knowledge Islands Cloudflare account, serving the static files generated in `apps/site/dist/`. The versioned Worker configuration lives in `apps/site/wrangler.jsonc`; this guide records the complementary settings owned by the Cloudflare dashboard.

The domain is registered. The Worker is created at the first deploy; its custom domains attach once the `knowledgelandscapes.info` zone is active in the Knowledge Islands account, and its Workers Build is connected separately.

## Workers Builds

Configure the Git-connected Workers Build from the repository root with these exact values:

- Production branch: `main`
- Build command: `bun run ki:site:build`
- Deploy command: `bun run ki:site:deploy`
- Root directory: repository root

Do not configure a Pages deploy directory. The `assets.directory` field in `apps/site/wrangler.jsonc` selects the generated output.

## Domains

The canonical domain is `knowledgelandscapes.info`. The Worker also receives `www.knowledgelandscapes.info`; configure a permanent Cloudflare redirect from `www` to the canonical apex while preserving the request path and query string.

Keep the `workers.dev` route disabled for the production service unless an operator explicitly decides to retain it as a diagnostic endpoint.

## Operations

Pushing `main` triggers Workers Builds once it is connected. Local build, audit, and conformance commands must not execute `ki:site:deploy` or `ki:site:upload`; both are credentialed remote mutations and require explicit operator authority.
