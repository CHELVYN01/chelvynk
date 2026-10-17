import db from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    try {
        // Query saling independen -> jalankan paralel supaya latensi Turso tidak menumpuk.
        const [result, settingsResult, expResult, reviewsResult] = await Promise.all([
            // Fetch only featured projects for the home page
            db.execute('SELECT * FROM projects WHERE featured = 1 ORDER BY created_at DESC'),
            db.execute("SELECT value FROM settings WHERE key = 'status'"),
            db.execute('SELECT * FROM experiences ORDER BY start_date DESC'),

            // Testimoni klien yang sudah di-approve.
            // Judul project diambil dari tabel projects kalau token-nya tertaut
            // (project_id), kalau tidak pakai project_name yang diketik manual.
            db.execute(`
                SELECT r.rating, r.testimonial, r.reviewer_name, r.reviewer_role,
                       COALESCE(p.title, t.project_name) AS project_title
                FROM reviews r
                LEFT JOIN review_tokens t ON r.token_id = t.id
                LEFT JOIN projects p ON t.project_id = p.id
                WHERE r.status = 'approved'
                ORDER BY r.created_at DESC
            `)
        ]);

        const projects = (result.rows as any[]).map(p => ({
            ...p,
            tech: p.tech ? (p.tech as string).split(',').map((s: string) => s.trim()) : [],
            categories: p.category ? (p.category as string).split(',').map((s: string) => s.trim()) : []
        }));

        const siteStatus = settingsResult.rows[0]?.value as string || 'Tersedia untuk Project Baru';

        return { projects, siteStatus, experiences: expResult.rows, reviews: reviewsResult.rows };
    } catch (e) {
        console.error('[Home Load Error]:', e);
        return { projects: [], siteStatus: 'Tersedia untuk Project Baru', experiences: [], reviews: [] };
    }
};
