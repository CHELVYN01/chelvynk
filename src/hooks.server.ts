import type { Handle } from '@sveltejs/kit';
import { isSuspiciousRequest } from '$lib/server/security';

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

    // Prevent clickjacking
    headers.set('X-Frame-Options', 'DENY');
    headers.set('Content-Security-Policy', "frame-ancestors 'none'");

    // Prevent MIME sniffing
    headers.set('X-Content-Type-Options', 'nosniff');

    // XSS Protection (legacy browsers)
    headers.set('X-XSS-Protection', '1; mode=block');

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
