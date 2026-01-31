import db from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    // Fetch all projects
    const result = await db.execute('SELECT * FROM projects ORDER BY created_at DESC');
    const rawProjects = result.rows as any[];

    const projects = rawProjects.map(p => ({
        ...p,
        tech: p.tech ? (p.tech as string).split(',').map((s: string) => s.trim()) : [],
        categories: p.category ? (p.category as string).split(',').map((s: string) => s.trim()) : []
    }));

    return { projects };
};
