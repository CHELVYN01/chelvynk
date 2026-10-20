import db from '$lib/server/db';

export type Product = {
    id: number;
    slug: string;
    name: string;
    tagline: string;
    problem: string | null;
    solution: string | null;
    description: string | null;
    features: string[];
    tags: string[];
    status: string | null;
    github_url: string | null;
    link_url: string | null;
};

// tags dipisah koma, features satu poin per baris (lihat tabel products di db.ts)
const split = (v: unknown, sep: string | RegExp) =>
    v ? String(v).split(sep).map((s) => s.trim()).filter(Boolean) : [];

export function toProduct(row: any): Product {
    return {
        id: Number(row.id),
        slug: String(row.slug),
        name: String(row.name),
        tagline: String(row.tagline),
        problem: row.problem ? String(row.problem) : null,
        solution: row.solution ? String(row.solution) : null,
        description: row.description ? String(row.description) : null,
        features: split(row.features, /\r?\n/),
        tags: split(row.tags, ','),
        status: row.status ? String(row.status) : null,
        github_url: row.github_url ? String(row.github_url) : null,
        link_url: row.link_url ? String(row.link_url) : null
    };
}

/** Semua produk, urut sesuai sort_order (dipakai index & detail). */
export async function listProducts(): Promise<Product[]> {
    const result = await db.execute(
        'SELECT * FROM products ORDER BY sort_order ASC, created_at ASC'
    );
    return (result.rows as any[]).map(toProduct);
}
