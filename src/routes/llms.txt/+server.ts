import db from '$lib/server/db';
import { listProducts } from '$lib/server/products';
import { listProjects } from '$lib/server/projects';
import { SITE, PERSON_DESCRIPTION } from '$lib/seo';
import type { RequestHandler } from './$types';

/**
 * /llms.txt — ringkasan situs dalam Markdown untuk mesin pencari AI
 * (ChatGPT, Claude, Perplexity, Gemini). Isinya dari DB yang sama dengan
 * halaman, jadi produk/project baru dari admin otomatis ikut.
 * Format: https://llmstxt.org
 */

const oneLine = (s: unknown) => String(s ?? '').replace(/\s+/g, ' ').trim();

export const GET: RequestHandler = async () => {
    const [products, projects, experiences] = await Promise.all([
        listProducts().catch(() => []),
        listProjects().catch(() => []),
        db
            .execute('SELECT role, company, period FROM experiences ORDER BY start_date DESC')
            .then((r: any) => r.rows as any[])
            .catch(() => [])
    ]);

    const lines = [
        `# ${SITE.personName} (${SITE.name})`,
        '',
        `> ${PERSON_DESCRIPTION}`,
        '',
        `${SITE.name} adalah ${SITE.jobTitle} yang berbasis di Indonesia. Ia membangun produk software end-to-end: implementasi dan kustomisasi Odoo ERP (modul kustom, integrasi API, migrasi, performa), aplikasi web (Laravel, CodeIgniter 4, Svelte/SvelteKit, Next.js), aplikasi desktop (Tauri/Rust), dan mobile (React Native). Tersedia untuk project freelance dan konsultasi.`,
        '',
        '## Halaman utama',
        '',
        `- [Beranda](${SITE.url}/): ringkasan keahlian, project unggulan, dan testimoni klien`,
        `- [Tentang](${SITE.url}/about): profil, pengalaman kerja, dan keahlian`,
        `- [Project](${SITE.url}/projects): portofolio lengkap project klien`,
        `- [Produk](${SITE.url}/products): produk dan alat buatan sendiri`,
        `- [Sertifikat](${SITE.url}/certificates): sertifikat dan kredensial`,
        `- [Kontak](${SITE.url}/contact): hubungi untuk project atau konsultasi`,
        ''
    ];

    if (products.length) {
        lines.push('## Produk', '');
        for (const p of products) {
            lines.push(`- [${p.name}](${SITE.url}/products/${p.slug}): ${oneLine(p.tagline)}`);
            if (p.problem) lines.push(`  - Masalah: ${oneLine(p.problem)}`);
            if (p.solution) lines.push(`  - Solusi: ${oneLine(p.solution)}`);
            if (p.features.length) lines.push(`  - Fitur: ${p.features.map(oneLine).join('; ')}`);
            if (p.tags.length) lines.push(`  - Tag: ${p.tags.join(', ')}`);
            if (p.github_url) lines.push(`  - Kode sumber: ${p.github_url}`);
        }
        lines.push('');
    }

    if (projects.length) {
        lines.push('## Project', '');
        for (const p of projects) {
            lines.push(`- [${oneLine(p.title)}](${SITE.url}/projects/${p.slug}): ${oneLine(p.description)}`);
            if (p.categories.length) lines.push(`  - Kategori: ${p.categories.join(', ')}`);
            if (p.tech.length) lines.push(`  - Teknologi: ${p.tech.join(', ')}`);
        }
        lines.push('');
    }

    if (experiences.length) {
        lines.push('## Pengalaman', '');
        for (const e of experiences) {
            lines.push(`- ${oneLine(e.role)} — ${oneLine(e.company)} (${oneLine(e.period)})`);
        }
        lines.push('');
    }

    lines.push(
        '## Kontak',
        '',
        `- Form kontak: ${SITE.url}/contact`,
        `- Situs: ${SITE.url}`,
        ''
    );

    return new Response(lines.join('\n'), {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=3600'
        }
    });
};
