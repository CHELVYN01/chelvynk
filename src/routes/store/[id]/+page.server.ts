import db from '$lib/server/db';
import { error } from '@sveltejs/kit';

export const load = async ({ params }) => {
    const id = Number(params.id);
    if (isNaN(id)) {
        throw error(400, 'Invalid App ID');
    }

    const appResult = await db.execute('SELECT * FROM store_apps WHERE id = ?', [id]);
    
    if (appResult.rows.length === 0) {
        throw error(404, 'App not found');
    }

    return {
        app: appResult.rows[0]
    };
};
