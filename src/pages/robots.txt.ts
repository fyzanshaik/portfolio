import type { APIRoute } from 'astro';

const getRobotsTxt = (sitemapURL: URL, llmsURL: URL) => `\
User-agent: *
Allow: /

Sitemap: ${sitemapURL.href}

User-agent: GPTBot
User-agent: ChatGPT-User
User-agent: CCBot
User-agent: anthropic-ai
User-agent: Claude-Web
User-agent: ClaudeBot
User-agent: Google-Extended
User-agent: PerplexityBot
Allow: /

# LLMs.txt for AI crawlers
# ${llmsURL.href}
`;

export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL('sitemap-index.xml', site);
  const llmsURL = new URL('llms.txt', site);
  return new Response(getRobotsTxt(sitemapURL, llmsURL));
};
