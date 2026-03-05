import db from '$lib/server/db';

export const load = async () => {
    // Fetch all apps from the store_apps table
    const appsResult = await db.execute('SELECT * FROM store_apps ORDER BY created_at DESC');

    return {
        apps: appsResult.rows
    };
};
