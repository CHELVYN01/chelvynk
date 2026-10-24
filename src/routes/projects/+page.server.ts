import { listProjects } from '$lib/server/projects';
import { collectionLd, type Seo } from '$lib/seo';
import type { PageServerLoad } from './$types';

const DESCRIPTION =
    'Portofolio project Chelvyn Kleden: implementasi & kustomisasi Odoo ERP, aplikasi web Laravel, CodeIgniter 4, Svelte, Next.js, hingga aplikasi mobile.';

export const load: PageServerLoad = async () => {
    const projects = await listProjects();

    const seo: Seo = {
        title: 'Portofolio Project — Chelvyn Kleden | Odoo, Laravel & Web Developer',
        description: DESCRIPTION,
        path: '/projects',
        jsonLd: [
            collectionLd({
                name: 'Portofolio Project Chelvyn Kleden',
                description: DESCRIPTION,
                path: '/projects',
                items: projects.map((p) => ({ name: String(p.title), path: `/projects/${p.slug}` }))
            })
        ]
    };

    return { projects, seo };
};
