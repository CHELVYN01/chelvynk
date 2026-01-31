import db from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    // Fetch all projects
    const rawProjects: any[] = db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all();

    const projects = rawProjects.map(p => ({
        ...p,
        tech: p.tech ? p.tech.split(',').map((s: string) => s.trim()) : [],
        categories: p.category ? p.category.split(',').map((s: string) => s.trim()) : []
    }));

    return { projects };
};
