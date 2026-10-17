import db from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    try {
        const result = await db.execute(
            'SELECT * FROM certificates ORDER BY issued_at DESC, created_at DESC'
        );
        return { certificates: result.rows as any[] };
    } catch (e) {
        console.error('[Certificates Load Error]:', e);
        return { certificates: [] as any[] };
    }
};
