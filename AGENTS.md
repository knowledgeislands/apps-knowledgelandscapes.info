# AGENTS.md — Knowledge Landscapes

Always-loaded orientation for an agent working in this repo, whichever runtime you are. [README.md](README.md) has the full picture; this file is the short anchor.

## What this repo is

The Knowledge Landscapes holding page, a single public page at `knowledgelandscapes.info` that says Knowledge Landscapes, part of Knowledge Islands, is coming soon. It is built with the house web stack, Eleventy 3, Nunjucks, TypeScript on Bun and config-less Tailwind 4, into a portable `apps/site/dist/` that a Cloudflare Worker serves.

## Working here

- **A holding page only.** It carries the domain and one line. Add no claims about what Knowledge Landscapes will be until its owner sets them.
- **`verify:page` gates the build.** It checks that the built page shows the domain, the coming-soon line and the link to knowledgeislands.info.
- **The repository contract** is declared in `.ki.toml`; `ki repo audit --repo .` is the gate. The website seam, the Eleventy layout, the Cloudflare hosting and the toolchain each follow their declared skill.
- **The repo shape mirrors the KI Website** (`knowledgeislands/apps-knowledgeislands.info`): a Bun workspace monorepo with the site in `apps/site`, dependency boundaries in `.dependency-cruiser.ts` proved by the Vitest workspace `packages/boundaries/` through the isolated checker at `tooling/depcruise/`, and Turborepo owning the task graph.
- **Hosting**: `apps/site/wrangler.jsonc` declares the Worker `info-knowledgelandscapes` in the Knowledge Islands Cloudflare account, with the custom domains `knowledgelandscapes.info` and `www.knowledgelandscapes.info`. Never run `ki:site:deploy` or `ki:site:upload` without the owner's explicit authority; both change Cloudflare.

## Toolchain

```bash
bun install            # install deps and bind the commit hooks
bun run ki:site:dev    # Tailwind watch + Eleventy serve on http://localhost:3000
bun run ki:site:build  # compile the site to apps/site/dist/
bun run ki:site:clean  # remove dist/ and local Wrangler state
bun run test           # the site's suites and the boundary proof
ki repo audit --repo . # the repository gate
```

## Commits

Commits follow `ki-git`. If a unit cannot yet be verified, report the checkpoint and leave it uncommitted until its verification is complete.

## Cross-repository choreography

Knowledge Islands repositories hand work and rollouts to one another as a line in the receiving work's `messages.md`, never as a record in one another's roadmap or triage, as Kris set under HANDOFF-AS-MESSAGE on 2026-10-20. The receiving repository owns its priority, plan and execution.
