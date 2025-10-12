// Astro types are automatically included via tsconfig.json

// Custom types declarations
declare namespace App {
  interface Locals {
    // Add your custom local types here
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
