import db from '$lib/server/db';
import { projectSlug } from '$lib/seo';

// tech & category di DB dipisah koma; slug dibentuk dari id + judul (lihat $lib/seo).
const split = (v: unknown) =>
    v ? String(v).split(',').map((s) => s.trim()).filter(Boolean) : [];

export function toProject(row: any) {
    return {
        ...row,
        id: Number(row.id),
        slug: projectSlug({ id: row.id, title: String(row.title) }),
        tech: split(row.tech),
        categories: split(row.category)
    };
}

export type Project = ReturnType<typeof toProject>;

export async function listProjects(): Promise<Project[]> {
    const result = await db.execute('SELECT * FROM projects ORDER BY created_at DESC');
    return (result.rows as any[]).map(toProject);
}
