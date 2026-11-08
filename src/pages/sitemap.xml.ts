import type { APIRoute } from 'astro';
import { projects } from '../data/content';
import { SITE } from '../config/site';

const paths = ['/', '/about/', '/experience/', '/projects/', ...projects.map((p) => `/projects/${p.slug}/`), '/education/', '/awards/', '/skills/', '/cv/', '/privacy/'];

export const GET: APIRoute = () => {
  const urls = paths.map((p) => `<url><loc>${new URL(p, SITE.url).href}</loc></url>`).join('');
  const body = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
};
