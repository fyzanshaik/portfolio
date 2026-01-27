# Portfolio

Personal portfolio and blog built with Astro, deployed on Cloudflare Pages.

## Stack

- **Framework**: Astro 5 with TypeScript
- **Styling**: Tailwind CSS 4
- **Deployment**: Cloudflare Pages (via Wrangler)
- **Package Manager**: bun

## Commands

```bash
bun run dev          # Start dev server (localhost:4321)
bun run build        # Type-check + build
bun run check        # Lint + format check
bun run pages:deploy # Build and deploy to Cloudflare
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
