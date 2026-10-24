import { error, redirect } from '@sveltejs/kit';
import { listProjects } from '$lib/server/projects';
import { formatUrl } from '$lib/url';
import { abs, breadcrumbLd, clip, fitTitle, PERSON_ID, type Seo } from '$lib/seo';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    const id = Number(params.slug.match(/^(\d+)/)?.[1]);
    if (!id) error(404, 'Project tidak ditemukan');

    // Jumlah project kecil — ambil semua sekalian untuk nomor urut & project berikutnya.
    const projects = await listProjects();
    const index = projects.findIndex((p) => p.id === id);
    if (index === -1) error(404, 'Project tidak ditemukan');

    const project = projects[index];
    // Judul diganti / slug diketik asal → arahkan permanen ke URL resmi,
    // supaya Google tidak mengindeks dua URL untuk satu project.
    if (params.slug !== project.slug) redirect(301, `/projects/${project.slug}`);

    const next = projects.length > 1 ? projects[(index + 1) % projects.length] : null;
    const path = `/projects/${project.slug}`;
    const title = String(project.title);
    const links = [project.link, project.github, project.demo].filter(Boolean).map(formatUrl);

    const seo: Seo = {
        // Kategori diketik bebas di admin dan bisa panjang — ikut hanya kalau muat
        title: fitTitle(
            ...(project.categories[0]
                ? [`${title} — ${project.categories[0]} | Chelvyn Kleden`]
                : []),
            `${title} | Project Chelvyn Kleden`,
            `${title} | Chelvyn Kleden`,
            title
        ),
        description: clip(String(project.description)),
        path,
        type: 'article',
        jsonLd: [
            {
                '@context': 'https://schema.org',
                '@type': 'CreativeWork',
                '@id': `${abs(path)}#project`,
                name: title,
                headline: title,
                description: String(project.description),
                url: abs(path),
                genre: project.categories.join(', '),
                keywords: [...project.categories, ...project.tech].join(', '),
                about: project.tech.map((t: string) => ({ '@type': 'Thing', name: t })),
                ...(project.created_at ? { dateCreated: String(project.created_at).slice(0, 10) } : {}),
                inLanguage: 'id-ID',
                author: { '@id': PERSON_ID },
                creator: { '@id': PERSON_ID },
                ...(links.length ? { sameAs: links } : {})
            },
            breadcrumbLd([
                { name: 'Beranda', path: '/' },
                { name: 'Project', path: '/projects' },
                { name: title, path }
            ])
        ]
    };

    return {
        project,
        // sama dengan nomor di /projects (terbaru = 01)
        number: index + 1,
        total: projects.length,
        next: next ? { slug: next.slug, title: String(next.title) } : null,
        seo
    };
};
