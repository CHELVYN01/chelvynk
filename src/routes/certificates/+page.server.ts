import db from '$lib/server/db';
import type { Seo } from '$lib/seo';
import type { PageServerLoad } from './$types';

const TITLE = 'Sertifikat — Chelvyn Kleden | Odoo Technical Consultant';
const DESCRIPTION =
    'Sertifikat dan kredensial Chelvyn Kleden — Odoo ERP, pengembangan software, dan engineering — lengkap dengan link verifikasi.';

export const load: PageServerLoad = async () => {
    try {
        const result = await db.execute(
            'SELECT * FROM certificates ORDER BY issued_at DESC, created_at DESC'
        );
        const certificates = result.rows as any[];
        const seo: Seo = {
            title: TITLE,
            description: DESCRIPTION,
            path: '/certificates',
            jsonLd: [
                {
                    '@context': 'https://schema.org',
                    '@type': 'ItemList',
                    name: 'Sertifikat Chelvyn Kleden',
                    itemListElement: certificates.map((c, i) => ({
                        '@type': 'ListItem',
                        position: i + 1,
                        item: {
                            '@type': 'EducationalOccupationalCredential',
                            name: String(c.title),
                            recognizedBy: { '@type': 'Organization', name: String(c.issuer) },
                            ...(c.issued_at ? { dateCreated: String(c.issued_at) } : {}),
                            ...(c.credential_url ? { url: String(c.credential_url) } : {})
                        }
                    }))
                }
            ]
        };
        return { certificates, seo };
    } catch (e) {
        console.error('[Certificates Load Error]:', e);
        return {
            certificates: [] as any[],
            seo: { title: TITLE, description: DESCRIPTION, path: '/certificates' } as Seo
        };
    }
};
