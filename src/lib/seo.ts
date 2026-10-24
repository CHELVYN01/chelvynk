/**
 * Satu sumber untuk SEO: data situs, tipe meta per halaman, dan pembentuk
 * JSON-LD (schema.org). Tiap halaman mengembalikan `seo` dari load-nya;
 * +layout.svelte yang menulis <title>, meta, OG, canonical, dan JSON-LD —
 * jadi tidak ada lagi tag ganda antara layout dan halaman.
 */

export const SITE = {
	url: 'https://chelvynkleden.com',
	name: 'Chelvyn Kleden',
	personName: 'Blasius Chelvyn Kera Kleden',
	jobTitle: 'Odoo Technical Consultant & Product Software Engineer',
	ogImage: 'https://chelvynkleden.com/og-image.png',
	locale: 'id_ID'
};

export const DEFAULT_TITLE =
	'Blasius Chelvyn Kera Kleden — Odoo Technical Consultant & Freelance Developer';
export const DEFAULT_DESCRIPTION =
	'Blasius Chelvyn Kera Kleden (Chelvyn Kleden) — Odoo Technical Consultant & Odoo Developer freelance di Indonesia. Spesialis kustomisasi modul Odoo ERP, integrasi Odoo API, Laravel, CodeIgniter 4, Svelte, dan Next.js.';

export type Seo = {
	title?: string;
	description?: string;
	/** path relatif ("/projects") — dijadikan canonical absolut */
	path?: string;
	image?: string;
	type?: 'website' | 'article' | 'profile';
	noindex?: boolean;
	/** JSON-LD tambahan khusus halaman ini (Person & WebSite sudah global) */
	jsonLd?: Record<string, unknown>[];
};

export const abs = (path: string) => (path.startsWith('http') ? path : `${SITE.url}${path}`);

/** Potong teks bebas jadi meta description (~155 karakter, tidak putus di tengah kata). */
export function clip(text: string | null | undefined, max = 155): string {
	const t = (text ?? '').replace(/\s+/g, ' ').trim();
	if (t.length <= max) return t;
	const cut = t.slice(0, max - 1);
	return `${cut.slice(0, cut.lastIndexOf(' ') > 80 ? cut.lastIndexOf(' ') : cut.length)}…`;
}

export function slugify(text: string): string {
	return text
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 80);
}

/**
 * URL project: /projects/12-sistem-aset-pertamina. Tabel projects tidak punya
 * kolom slug — id di depan yang dipakai mencari, sisanya dari judul supaya URL
 * mengandung kata kunci. Judul diganti → slug ikut, URL lama di-redirect 301.
 */
export const projectSlug = (p: { id: number | string; title: string }) =>
	`${p.id}-${slugify(String(p.title))}`;

// ===== JSON-LD =====
export const PERSON_ID = `${SITE.url}/#person`;
export const WEBSITE_ID = `${SITE.url}/#website`;

export function siteGraph(sameAs: string[]) {
	return [
		{
			'@context': 'https://schema.org',
			'@type': 'WebSite',
			'@id': WEBSITE_ID,
			url: SITE.url,
			name: SITE.name,
			inLanguage: 'id-ID',
			publisher: { '@id': PERSON_ID }
		},
		{
			'@context': 'https://schema.org',
			'@type': 'Person',
			'@id': PERSON_ID,
			name: SITE.personName,
			alternateName: ['Chelvyn Kleden', 'Kleden Chelvyn'],
			url: SITE.url,
			image: `${SITE.url}/profile-bg-atas.jpg`,
			jobTitle: SITE.jobTitle,
			description: DEFAULT_DESCRIPTION,
			nationality: 'Indonesian',
			address: { '@type': 'PostalAddress', addressCountry: 'ID' },
			hasOccupation: {
				'@type': 'Occupation',
				name: 'Odoo Technical Consultant',
				occupationalCategory: 'Software Developer / ERP Consultant',
				occupationLocation: { '@type': 'Country', name: 'Indonesia' }
			},
			knowsAbout: [
				'Odoo ERP',
				'Odoo Development',
				'Odoo Custom Module',
				'Odoo API Integration',
				'Laravel',
				'CodeIgniter 4',
				'PHP',
				'Svelte',
				'Next.js',
				'React Native',
				'Rust',
				'Python',
				'Docker'
			],
			sameAs
		}
	];
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((it, i) => ({
			'@type': 'ListItem',
			position: i + 1,
			name: it.name,
			item: abs(it.path)
		}))
	};
}

export function collectionLd(opts: {
	name: string;
	description: string;
	path: string;
	items: { name: string; path: string }[];
}) {
	return {
		'@context': 'https://schema.org',
		'@type': 'CollectionPage',
		name: opts.name,
		description: opts.description,
		url: abs(opts.path),
		isPartOf: { '@id': WEBSITE_ID },
		author: { '@id': PERSON_ID },
		mainEntity: {
			'@type': 'ItemList',
			numberOfItems: opts.items.length,
			itemListElement: opts.items.map((it, i) => ({
				'@type': 'ListItem',
				position: i + 1,
				name: it.name,
				url: abs(it.path)
			}))
		}
	};
}
