import { redirect } from '@sveltejs/kit';
import { isBot } from '$lib/server/security';
import type { RequestHandler } from './$types';

/**
 * Tombol WhatsApp di situs menunjuk ke /wa, bukan langsung ke wa.me. Nomornya
 * hanya ada di sini (server), jadi tidak pernah muncul di HTML dan tidak bisa
 * dipanen scraper yang sekadar membaca halaman.
 *
 * Yang lolos ke WhatsApp hanya klik sungguhan dari halaman situs ini:
 * 1. User-agent bukan bot/crawler/curl/python dsb.
 * 2. Navigasi berasal dari situs sendiri (Sec-Fetch-Site / Referer) — bot yang
 *    langsung menembak /wa tidak membawa header ini.
 * 3. Rate limit per IP, supaya /wa tidak bisa ditembak berulang.
 * Yang gagal dialihkan ke /contact, bukan error — kalau ternyata manusia,
 * mereka masih bisa menghubungi lewat form.
 */

const WA_NUMBER = '6285803480139';
const WA_TEXT = 'Halo Chelvyn, saya lihat portfolio Anda dan ingin berdiskusi.';

const LIMIT_MAX = 10;
const LIMIT_WINDOW_MS = 10 * 60 * 1000;
// In-memory: di serverless ini per-instance, cukup sebagai rem untuk tembakan beruntun.
const hits = new Map<string, { count: number; start: number }>();

function overLimit(ip: string): boolean {
	const now = Date.now();
	const rec = hits.get(ip);
	if (!rec || now - rec.start > LIMIT_WINDOW_MS) {
		hits.set(ip, { count: 1, start: now });
		return false;
	}
	rec.count += 1;
	return rec.count > LIMIT_MAX;
}

function fromOwnSite(request: Request, url: URL): boolean {
	const site = request.headers.get('sec-fetch-site');
	if (site) return site === 'same-origin';

	// Browser lama tanpa Sec-Fetch-*: cukup Referer dari host yang sama.
	const referer = request.headers.get('referer');
	if (!referer) return false;
	try {
		return new URL(referer).host === url.host;
	} catch {
		return false;
	}
}

export const GET: RequestHandler = ({ request, url, getClientAddress }) => {
	const ua = request.headers.get('user-agent') ?? '';
	const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || getClientAddress();

	if (isBot(ua) || !fromOwnSite(request, url) || overLimit(ip)) {
		console.warn(`[WA] Ditolak: ${ip} — ${ua.slice(0, 80)}`);
		redirect(303, '/contact');
	}

	redirect(303, `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_TEXT)}`);
};
