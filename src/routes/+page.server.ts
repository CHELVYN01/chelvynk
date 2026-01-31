import db from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    try {
        // Fetch only featured projects for the home page
        const result = await db.execute('SELECT * FROM projects WHERE featured = 1 ORDER BY created_at DESC');
        const rawProjects = result.rows as any[];

        const projects = rawProjects.map(p => ({
            ...p,
            tech: p.tech ? (p.tech as string).split(',').map((s: string) => s.trim()) : [],
            categories: p.category ? (p.category as string).split(',').map((s: string) => s.trim()) : []
        }));

        const settingsResult = await db.execute("SELECT value FROM settings WHERE key = 'status'");
        const siteStatus = settingsResult.rows[0]?.value as string || 'Tersedia untuk Project Baru';

        const expResult = await db.execute('SELECT * FROM experiences ORDER BY start_date DESC');

        return { projects, siteStatus, experiences: expResult.rows };
    } catch (e) {
        console.error('[Home Load Error]:', e);
        return { projects: [], siteStatus: 'Tersedia untuk Project Baru', experiences: [] };
    }
};
