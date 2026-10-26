import type { Handle } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { isSuspiciousRequest } from '$lib/server/security';

/**
 * Content Security Policy.
 * - script/style 'unsafe-inline': dibutuhkan skrip inline anti-FOUC di app.html,
 *   skrip hydration SvelteKit, dan JSON-LD. (Nonce/hash menyeluruh berisiko di
 *   situs live; bisa jadi peningkatan berikutnya.)
 * - fonts.googleapis.com / fonts.gstatic.com: Google Fonts dipakai di layout.
 * - img-src https:: gambar sertifikat/produk bisa dari URL eksternal.
 * - object-src 'none', base-uri 'self', form-action 'self': tutup vektor klasik.
 * - Dev (Vite HMR) perlu 'unsafe-eval' + ws: yang tidak diberikan di produksi.
 */
function buildCsp(): string {
    const scriptSrc = ["'self'", "'unsafe-inline'", ...(dev ? ["'unsafe-eval'"] : [])];
    const connectSrc = ["'self'", ...(dev ? ['ws:'] : [])];
    const directives = [
        `default-src 'self'`,
        `script-src ${scriptSrc.join(' ')}`,
        `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
        `font-src 'self' https://fonts.gstatic.com data:`,
        `img-src 'self' data: https:`,
        `connect-src ${connectSrc.join(' ')}`,
        `object-src 'none'`,
        `base-uri 'self'`,
        `form-action 'self'`,
        `frame-ancestors 'none'`,
        `upgrade-insecure-requests`
    ];
    return directives.join('; ');
}

/**
 * Security Headers & Request Filtering
 */
export const handle: Handle = async ({ event, resolve }) => {
    const { request } = event;

    // Block suspicious requests
    if (isSuspiciousRequest(request)) {
        console.warn(`[SECURITY] Blocked suspicious request from: ${event.getClientAddress()}`);
        return new Response('Forbidden', { status: 403 });
    }

    // Resolve the request
    const response = await resolve(event);

    // Add Security Headers
    const headers = new Headers(response.headers);

    // Prevent clickjacking (X-Frame-Options untuk browser lama, CSP untuk yang modern)
    headers.set('X-Frame-Options', 'DENY');
    headers.set('Content-Security-Policy', buildCsp());

    // Prevent MIME sniffing
    headers.set('X-Content-Type-Options', 'nosniff');

    // X-XSS-Protection: filter XSS legacy ini sudah usang & bisa menimbulkan bug;
    // praktik modern (OWASP) adalah mematikannya dan mengandalkan CSP.
    headers.set('X-XSS-Protection', '0');

    // Referrer Policy
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions Policy (disable unnecessary features)
    headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    // HSTS - Force HTTPS (browser akan ingat selama 1 tahun)
    headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
    });
};
