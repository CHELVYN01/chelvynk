import db from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    try {
        // Fetch only featured projects for the home page
        const result = await db.execute('SELECT * FROM projects WHERE featured = 1 ORDER BY created_at DESC');
        const rawProjects = result.rows as any[];

        const projects = rawProjects.map(p => {
            // DEBUG LOG UNTUK KITA CEK PAK
            console.log(`[DEBUG] Project: ${p.title} | GitHub: ${p.github} | Demo: ${p.demo}`);

            return {
                ...p,
                tech: p.tech ? (p.tech as string).split(',').map((s: string) => s.trim()) : [],
                categories: p.category ? (p.category as string).split(',').map((s: string) => s.trim()) : []
            };
        });

        const settingsResult = await db.execute("SELECT value FROM settings WHERE key = 'status'");
        const siteStatus = settingsResult.rows[0]?.value as string || 'Tersedia untuk Project Baru';

        const expResult = await db.execute('SELECT * FROM experiences ORDER BY start_date DESC');

        // Testimoni klien yang sudah di-approve.
        // Judul project diambil dari tabel projects kalau token-nya tertaut
        // (project_id), kalau tidak pakai project_name yang diketik manual.
        const reviewsResult = await db.execute(`
            SELECT r.rating, r.testimonial, r.reviewer_name, r.reviewer_role,
                   COALESCE(p.title, t.project_name) AS project_title
            FROM reviews r
            LEFT JOIN review_tokens t ON r.token_id = t.id
            LEFT JOIN projects p ON t.project_id = p.id
            WHERE r.status = 'approved'
            ORDER BY r.created_at DESC
        `);

        return { projects, siteStatus, experiences: expResult.rows, reviews: reviewsResult.rows };
    } catch (e) {
        console.error('[Home Load Error]:', e);
        return { projects: [], siteStatus: 'Tersedia untuk Project Baru', experiences: [], reviews: [] };
    }
};
