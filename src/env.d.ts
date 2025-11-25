// Astro types are automatically included via tsconfig.json
/// <reference types="@cloudflare/workers-types" />

// Custom types declarations
declare namespace App {
  interface Locals {
    runtime: {
      env: {
        TIMER_GAME_DB: D1Database;
        TIMER_GAME_KV: KVNamespace;
      };
    };
    user?: {
      id: string;
      name: string;
      email: string;
    };
  }
}

// Cloudflare Workers globals
declare global {
  const ASSETS: Fetcher;
}

// Extend Astro HTML JSX for custom attributes
declare namespace astroHTML.JSX {
  interface HTMLAttributes {
    'data-theme'?: 'light' | 'dark';
    'data-variant'?: string;
  }
}
