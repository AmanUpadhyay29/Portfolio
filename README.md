# Portfolio

The source of my personal portfolio site: a short introduction, the projects I build and the tools I work with. Every page is plain HTML first, so the core content reads fine without JavaScript.

It is a static Next.js 16 site (TypeScript and Tailwind CSS), exported to plain files and served by Cloudflare as an assets-only Worker with no server code. Run `pnpm install`, then `pnpm dev` to work on it, or `pnpm build` to produce the `out/` folder that gets deployed.

Deploying: set the build variable `SITE_URL` to the site's public address (for example `https://example.workers.dev`), and `REQUIRE_SITE_URL=1`. A production build fails without `SITE_URL`, so share cards never point at localhost. The scripts that measure commit counts and resize images read local folder paths from `scripts/local-paths.json`; copy `scripts/local-paths.example.json` to create it.

Built with Claude Code.
