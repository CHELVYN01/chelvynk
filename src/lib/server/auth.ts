import type { Cookies } from '@sveltejs/kit';
import db from './db';

// Sesi login admin disimpan di DB, bukan cuma "cookie ada". Tiap request
// mencocokkan token cookie dengan baris sesi yang belum kedaluwarsa, sehingga
// cookie palsu (admin_token=x) tidak bisa lagi melewati autentikasi.

export const SESSION_TTL_MS = 4 * 60 * 60 * 1000; // 4 jam, samakan dengan maxAge cookie

export async function createSession(token: string): Promise<void> {
    const now = Date.now();
    await db.execute(
        'INSERT INTO sessions (token, created_at, expires_at) VALUES (?, ?, ?)',
        [token, now, now + SESSION_TTL_MS]
    );
    // Bersihkan sesi kedaluwarsa sekalian (opportunistic cleanup).
    await db.execute('DELETE FROM sessions WHERE expires_at < ?', [now]);
}

export async function deleteSession(token: string | undefined): Promise<void> {
    if (!token) return;
    await db.execute('DELETE FROM sessions WHERE token = ?', [token]);
}

/** true hanya jika cookie lengkap DAN token cocok dengan sesi aktif di DB. */
export async function isAuthenticated(cookies: Cookies): Promise<boolean> {
    const auth = cookies.get('admin_auth');
    const token = cookies.get('admin_token');
    if (auth !== 'true' || !token) return false;

    try {
        const r = await db.execute(
            'SELECT 1 FROM sessions WHERE token = ? AND expires_at > ? LIMIT 1',
            [token, Date.now()]
        );
        return r.rows.length > 0;
    } catch (e) {
        console.error('[AUTH] Session check error:', e);
        return false;
    }
}
