import { listProducts } from '$lib/server/products';
import { listProjects } from '$lib/server/projects';
import { SITE } from '$lib/seo';
import type { RequestHandler } from './$types';

/**
 * Sitemap dibentuk dari DB — produk & project baru dari admin langsung masuk,
 * tanpa perlu menyunting file statis.
 */

const STATIC_PAGES: [path: string, changefreq: string, priority: string][] = [
    ['/', 'weekly', '1.0'],
    ['/about', 'monthly', '0.8'],
    ['/projects', 'weekly', '0.9'],
    ['/products', 'weekly', '0.9'],
    ['/certificates', 'monthly', '0.7'],
    ['/contact', 'yearly', '0.7']
];

const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const day = (v: unknown) => (v ? String(v).slice(0, 10) : undefined);

function url(path: string, changefreq: string, priority: string, lastmod?: string) {
    return `  <url>
    <loc>${esc(SITE.url + path)}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

export const GET: RequestHandler = async () => {
    const [products, projects] = await Promise.all([
        listProducts().catch(() => []),
        listProjects().catch(() => [])
    ]);

    const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[
    ...STATIC_PAGES.map(([p, f, pr]) => url(p, f, pr)),
    ...products.map((p) => url(`/products/${p.slug}`, 'monthly', '0.8')),
    ...projects.map((p) => url(`/projects/${p.slug}`, 'monthly', '0.8', day(p.created_at)))
].join('\n')}
</urlset>`;

    return new Response(body, {
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600'
        }
    });
};
