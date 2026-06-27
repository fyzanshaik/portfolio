# Portfolio

Personal portfolio and blog built with Astro, deployed on Cloudflare Workers.

## Stack

- **Framework**: Astro 7 with TypeScript
- **Styling**: Tailwind CSS 4
- **Deployment**: Cloudflare Workers (via Wrangler, adapter `@astrojs/cloudflare` v14)
- **Package Manager**: bun

## Commands

```bash
bun run dev          # Start dev server (localhost:4321)
bun run build        # Type-check + build (emits Worker in dist/server, assets in dist/client)
bun run check        # Lint + format check
bun run deploy       # Build and deploy Worker to Cloudflare (uses dist/server/wrangler.json)
```

## Project Structure

- `src/pages/posts/*.md` - Blog posts (frontmatter: title, description, date, tags)
- `src/components/` - Astro components
- `src/layouts/` - Page layouts (Layout.astro, BlogPost.astro)

## Blog Posts

Posts use this frontmatter format:

```yaml
---
layout: ../../layouts/BlogPost.astro
title: 'Post Title'
description: 'Short description'
date: YYYY-MM-DD
tags: ['tag1', 'tag2']
---
```

## Notes

- Pre-commit hooks run lint-staged (prettier + eslint)
- Use `bun` for all package operations, not npm/yarn
