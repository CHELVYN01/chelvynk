import { breadcrumbLd, PERSON_ID, SITE, type Seo } from '$lib/seo';
import type { PageLoad } from './$types';

export const load: PageLoad = () => {
    const seo: Seo = {
        title: 'Tentang Chelvyn Kleden — Odoo Developer & Software Engineer',
        description:
            'Profil Blasius Chelvyn Kera Kleden: Odoo Technical Consultant & Product Software Engineer di Indonesia — pengalaman, keahlian Odoo ERP, web, dan mobile.',
        path: '/about',
        type: 'profile',
        jsonLd: [
            {
                '@context': 'https://schema.org',
                '@type': 'ProfilePage',
                url: `${SITE.url}/about`,
                mainEntity: { '@id': PERSON_ID }
            },
            breadcrumbLd([
                { name: 'Beranda', path: '/' },
                { name: 'Tentang', path: '/about' }
            ])
        ]
    };
    return { seo };
};
