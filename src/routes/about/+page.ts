import { breadcrumbLd, personLd, personSameAs, SITE, type Seo } from '$lib/seo';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
    const { settings } = await parent();
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
                // Person ditulis lengkap (bukan cuma @id) — Google mensyaratkan
                // mainEntity ProfilePage punya `name` yang terbaca langsung.
                mainEntity: personLd(personSameAs(settings))
            },
            breadcrumbLd([
                { name: 'Beranda', path: '/' },
                { name: 'Tentang', path: '/about' }
            ])
        ]
    };
    return { seo };
};
