import { error } from '@sveltejs/kit';
import { STORE_ENABLED } from '$lib/features';
import type { LayoutServerLoad } from './$types';

// Store sedang disembunyikan: /store dan /store/[id] jadi 404 (lihat $lib/features).
export const load: LayoutServerLoad = () => {
    if (!STORE_ENABLED) throw error(404, 'Halaman tidak ditemukan');
};
