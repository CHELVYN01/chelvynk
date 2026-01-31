import db from '$lib/server/db';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
    try {
        const result = await db.execute('SELECT * FROM settings');
        const settings = result.rows.reduce((acc: any, row: any) => {
            acc[row.key] = row.value;
            return acc;
        }, {});

        return { settings };
    } catch (e) {
        console.error('[Layout Load Error]:', e);
        return { settings: {} };
    }
};
