import { error } from '@sveltejs/kit';
import { listProducts } from '$lib/server/products';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    // Ambil semua (jumlah produk kecil) supaya dapat nomor urut & produk berikutnya
    const products = await listProducts();
    const index = products.findIndex((p) => p.slug === params.slug);
    if (index === -1) error(404, 'Produk tidak ditemukan');

    const next = products.length > 1 ? products[(index + 1) % products.length] : null;
    return {
        product: products[index],
        number: index + 1,
        total: products.length,
        next: next ? { slug: next.slug, name: next.name } : null
    };
};
