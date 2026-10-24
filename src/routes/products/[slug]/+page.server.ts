import { error } from '@sveltejs/kit';
import { listProducts } from '$lib/server/products';
import { abs, breadcrumbLd, clip, fitTitle, PERSON_ID, type Seo } from '$lib/seo';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    // Ambil semua (jumlah produk kecil) supaya dapat nomor urut & produk berikutnya
    const products = await listProducts();
    const index = products.findIndex((p) => p.slug === params.slug);
    if (index === -1) error(404, 'Produk tidak ditemukan');

    const product = products[index];
    const next = products.length > 1 ? products[(index + 1) % products.length] : null;
    const path = `/products/${product.slug}`;

    const seo: Seo = {
        // tagline hanya ikut kalau judulnya masih muat
        title: fitTitle(
            `${product.name} — ${product.tagline}`,
            `${product.name} | Produk Chelvyn Kleden`,
            `${product.name} | Chelvyn Kleden`,
            product.name
        ),
        description: clip(
            [product.tagline, product.problem, product.solution].filter(Boolean).join(' ')
        ),
        path,
        type: 'article',
        jsonLd: [
            // Bukan SoftwareApplication: rich result Google untuk tipe itu wajib
            // punya harga + rating/review, dan tanpa itu Search Console menandainya
            // error. Rating tidak boleh dikarang, jadi pakai tipe tanpa syarat.
            {
                '@context': 'https://schema.org',
                '@type': product.github_url ? 'SoftwareSourceCode' : 'CreativeWork',
                name: product.name,
                headline: product.name,
                description: [product.tagline, product.description].filter(Boolean).join('\n\n'),
                url: abs(path),
                keywords: product.tags.join(', '),
                ...(product.github_url ? { codeRepository: product.github_url } : {}),
                ...(product.features.length ? { abstract: product.features.join('; ') } : {}),
                inLanguage: 'id-ID',
                author: { '@id': PERSON_ID },
                creator: { '@id': PERSON_ID },
                sameAs: [product.github_url, product.link_url].filter(Boolean)
            },
            breadcrumbLd([
                { name: 'Beranda', path: '/' },
                { name: 'Produk', path: '/products' },
                { name: product.name, path }
            ])
        ]
    };

    return {
        product,
        number: index + 1,
        total: products.length,
        next: next ? { slug: next.slug, name: next.name } : null,
        seo
    };
};
