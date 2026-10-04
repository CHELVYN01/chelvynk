/**
 * Security Utilities untuk Portfolio
 * - Rate Limiting
 * - Input Sanitization
 * - Failed Login Tracking
 */

// Store untuk rate limiting (in-memory, reset saat server restart)
const loginAttempts: Map<string, { count: number; firstAttempt: number; blocked: boolean }> = new Map();
const RATE_LIMIT_MAX = 5; // Max percobaan
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 menit
const BLOCK_DURATION = 30 * 60 * 1000; // Block 30 menit setelah max attempts

// Store untuk failed login logging
const failedLogins: { ip: string; timestamp: Date; userAgent: string }[] = [];

/**
 * Check rate limit untuk IP tertentu
 */
export function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetIn: number } {
    const now = Date.now();
    const record = loginAttempts.get(ip);

    if (!record) {
        return { allowed: true, remaining: RATE_LIMIT_MAX, resetIn: 0 };
    }

    // Cek apakah window sudah expired
    if (now - record.firstAttempt > RATE_LIMIT_WINDOW) {
        loginAttempts.delete(ip);
        return { allowed: true, remaining: RATE_LIMIT_MAX, resetIn: 0 };
    }

    // Cek apakah masih di-block
    if (record.blocked) {
        const resetIn = Math.ceil((BLOCK_DURATION - (now - record.firstAttempt)) / 1000 / 60);
        return { allowed: false, remaining: 0, resetIn };
    }

    const remaining = RATE_LIMIT_MAX - record.count;
    return { allowed: remaining > 0, remaining: Math.max(0, remaining), resetIn: 0 };
}

/**
 * Record failed login attempt
 */
export function recordLoginAttempt(ip: string, success: boolean, userAgent: string = ''): void {
    const now = Date.now();

    if (success) {
        // Reset on successful login
        loginAttempts.delete(ip);
        return;
    }

    const record = loginAttempts.get(ip);

    if (!record || now - record.firstAttempt > RATE_LIMIT_WINDOW) {
        loginAttempts.set(ip, { count: 1, firstAttempt: now, blocked: false });
    } else {
        record.count++;
        if (record.count >= RATE_LIMIT_MAX) {
            record.blocked = true;
            console.warn(`[SECURITY] IP ${ip} blocked due to too many failed login attempts`);
        }
        loginAttempts.set(ip, record);
    }

    // Log failed attempt
    failedLogins.push({ ip, timestamp: new Date(), userAgent });
    if (failedLogins.length > 100) failedLogins.shift(); // Keep last 100

    console.warn(`[SECURITY] Failed login attempt from IP: ${ip}`);
}

// ===== Anti-spam form kontak =====
// Rate limit untuk form kontak ada di contact/+page.server.ts dan dihitung dari
// tabel contact_messages (bukan memori), supaya tetap berlaku setelah restart dan
// di serverless di mana tiap instance punya memori sendiri.

// Token waktu: dibuat saat halaman dirender, diverifikasi saat submit.
// Bot yang POST langsung tanpa membuka halaman tidak punya token; bot yang
// submit secepat kilat ditolak. Stateless (HMAC), jadi aman di serverless.
export const FORM_MIN_AGE_MS = 3_000;
export const FORM_MAX_AGE_MS = 6 * 60 * 60 * 1000;

async function hmacHex(secret: string, data: string): Promise<string> {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
        'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
    return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function createFormToken(secret: string): Promise<string> {
    const ts = Date.now();
    return `${ts}.${await hmacHex(secret, String(ts))}`;
}

/** 'ok' | 'invalid' (palsu/tidak ada) | 'too-fast' | 'expired' */
export async function verifyFormToken(
    secret: string,
    token: string | null | undefined
): Promise<'ok' | 'invalid' | 'too-fast' | 'expired'> {
    if (!token) return 'invalid';
    const [tsRaw, sig] = token.split('.');
    const ts = Number(tsRaw);
    if (!Number.isFinite(ts) || !sig) return 'invalid';
    if (sig !== (await hmacHex(secret, String(ts)))) return 'invalid';
    const age = Date.now() - ts;
    if (age < FORM_MIN_AGE_MS) return 'too-fast';
    if (age > FORM_MAX_AGE_MS) return 'expired';
    return 'ok';
}

// Pola spam yang sering muncul di form kontak: template "newsletter/updates"
// (hasil terjemahan mesin), SEO/backlink, judi, kripto, dll.
const SPAM_PATTERNS: RegExp[] = [
    /newsletter|buletin|bulletin|mailing list|unsubscribe|subscribe|langganan/i,
    /news and updates|weekly updates|product news|keep me posted|add me (for|to)/i,
    /pembaruan email|hubungi saya melalui email|informasi lebih lanjut\.? silakan/i,
    /\bseo\b|backlink|guest post|rank(ing)? (on )?google|web ?traffic/i,
    /casino|viagra|crypto|bitcoin|forex|\bloan\b|\bslot\b|judi online/i
];

/** Kembalikan alasan kalau pesan tampak spam, atau null kalau aman. */
export function detectSpam(fields: {
    name: string;
    email: string;
    subject: string;
    message: string;
}): string | null {
    const text = `${fields.subject}\n${fields.message}`;
    for (const re of SPAM_PATTERNS) {
        if (re.test(text)) return `pola: ${re.source.slice(0, 30)}`;
    }
    const links = (text.match(/https?:\/\/|www\./gi) || []).length;
    if (links >= 2) return 'banyak link';
    if (/https?:\/\/|www\./i.test(fields.name)) return 'link di nama';
    return null;
}

/**
 * Get recent failed logins (untuk analytics)
 */
export function getFailedLogins(): typeof failedLogins {
    return [...failedLogins];
}

/**
 * Sanitize string input untuk prevent XSS
 */
export function sanitizeInput(input: string | null | undefined): string {
    if (!input) return '';

    // Svelte automatically escapes outputs by default.
    // We only sanitize strict HTML tags < and > to prevent raw HTML injection.
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .trim();
}

/**
 * Sanitize URL input
 */
export function sanitizeUrl(url: string | null | undefined): string {
    if (!url) return '';

    const trimmed = url.trim();

    // Allow only http, https, and relative URLs
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/') || trimmed === '#') {
        return trimmed;
    }

    // If no protocol, add https
    if (trimmed && !trimmed.includes('://')) {
        return `https://${trimmed}`;
    }

    return '#';
}

/**
 * Validate PIN format
 */
export function validatePin(pin: string | null | undefined): boolean {
    if (!pin) return false;
    // PIN harus 4-8 digit angka
    return /^\d{4,8}$/.test(pin);
}

/**
 * Generate random token untuk CSRF atau session
 */
export function generateToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
        result += chars[array[i] % chars.length];
    }
    return result;
}

/**
 * Check if user agent looks like a bot
 */
export function isBot(userAgent: string): boolean {
    const botPatterns = [
        'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider',
        'yandexbot', 'ahrefsbot', 'semrushbot', 'bot', 'crawler', 'spider',
        'curl', 'wget', 'python', 'scrapy', 'httpclient', 'java/', 'libwww'
    ];
    const ua = userAgent.toLowerCase();
    return botPatterns.some(pattern => ua.includes(pattern));
}

/**
 * Check for suspicious request patterns
 */
export function isSuspiciousRequest(request: Request): boolean {
    const ua = request.headers.get('user-agent') || '';

    // No user agent
    if (!ua || ua.length < 10) return true;

    // Suspicious patterns
    const suspicious = ['sqlmap', 'nikto', 'nmap', 'masscan', 'burp', 'zap'];
    if (suspicious.some(s => ua.toLowerCase().includes(s))) return true;

    return false;
}
