# Portfolio

Personal portfolio website built with Astro and deployed on Cloudflare Pages.

🌐 **Live Site**: [fyzanshaik.in](https://fyzanshaik.in)

## Tech Stack

- **Framework**: Astro
- **Styling**: Tailwind CSS
- **Deployment**: Cloudflare Pages
- **Runtime**: Bun

## Development

```bash
# Install dependencies
bun install

# Start dev server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview
```

## Deployment

Automatically deployed to Cloudflare Pages on every push to `main`.

## Forking This Project

If you're forking this repo, note that Google Analytics is configured via environment variables. You'll need to:

1. Get your own GA Measurement ID from [Google Analytics](https://analytics.google.com/)
2. Add it to your deployment platform as `PUBLIC_GA_ID`
3. See `.env.example` for reference

Without setting this variable, analytics simply won't load (which is fine for most forks).
