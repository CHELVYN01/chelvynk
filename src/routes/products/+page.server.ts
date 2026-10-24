import { listProducts } from '$lib/server/products';
import { collectionLd, type Seo } from '$lib/seo';
import type { PageServerLoad } from './$types';

const TITLE = 'Produk — Chelvyn Kleden | Alat & Produk Buatan Sendiri';
const DESCRIPTION =
    'Produk dan alat buatan Chelvyn Kleden: software open source, tools developer, dan solusi Odoo — dirancang dari masalah nyata di lapangan.';

export const load: PageServerLoad = async () => {
    try {
        const products = await listProducts();
        const seo: Seo = {
            title: TITLE,
            description: DESCRIPTION,
            path: '/products',
            jsonLd: [
                collectionLd({
                    name: 'Produk Chelvyn Kleden',
                    description: DESCRIPTION,
                    path: '/products',
                    items: products.map((p) => ({ name: p.name, path: `/products/${p.slug}` }))
                })
            ]
        };
        return { products, seo };
    } catch (e) {
        console.error('[Products Load Error]:', e);
        return { products: [], seo: { title: TITLE, description: DESCRIPTION, path: '/products' } as Seo };
    }
};
