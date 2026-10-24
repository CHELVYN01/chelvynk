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

    const app = appResult.rows[0] as any;
    return {
        app,
        seo: {
            title: `${app.title} | Chelvyn Store`,
            description: String(app.description ?? '').substring(0, 150),
            path: `/store/${id}`
        }
    };
};
