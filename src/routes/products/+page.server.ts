import { listProducts } from '$lib/server/products';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    try {
        return { products: await listProducts() };
    } catch (e) {
        console.error('[Products Load Error]:', e);
        return { products: [] };
    }
};
