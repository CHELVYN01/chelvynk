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

// ===== Rate limit login admin (berbasis DB) =====
// In-memory Map tidak andal di serverless: tiap instance punya memorinya
// sendiri, jadi batas percobaan mudah dilewati dengan request yang mendarat
// di instance berbeda. Hitungan dari DB berlaku lintas instance & tahan restart.
const RL_WINDOW_MS = 15 * 60 * 1000; // jendela 15 menit
const RL_MAX_FAILS = 5; // maksimal gagal per IP dalam jendela

/** Boleh coba login? resetIn = menit sampai blokir mereda (0 kalau masih boleh). */
export async function checkLoginRateLimit(
    ip: string
): Promise<{ allowed: boolean; resetIn: number }> {
    const since = Date.now() - RL_WINDOW_MS;
    try {
        const r = await db.execute(
            'SELECT COUNT(*) AS fails, MIN(created_at) AS first FROM login_attempts WHERE ip = ? AND success = 0 AND created_at > ?',
            [ip, since]
        );
        const fails = Number(r.rows[0]?.fails ?? 0);
        if (fails < RL_MAX_FAILS) return { allowed: true, resetIn: 0 };
        const first = Number(r.rows[0]?.first ?? Date.now());
        const resetIn = Math.max(1, Math.ceil((RL_WINDOW_MS - (Date.now() - first)) / 60000));
        return { allowed: false, resetIn };
    } catch (e) {
        console.error('[AUTH] Rate limit check error:', e);
        // Jangan mengunci diri sendiri kalau DB error — izinkan, verifikasi PIN tetap jalan.
        return { allowed: true, resetIn: 0 };
    }
}

/** Catat hasil percobaan login. Sukses -> reset (hapus semua catatan IP itu). */
export async function recordLoginResult(ip: string, success: boolean): Promise<void> {
    try {
        if (success) {
            await db.execute('DELETE FROM login_attempts WHERE ip = ?', [ip]);
            return;
        }
        const now = Date.now();
        await db.execute(
            'INSERT INTO login_attempts (ip, success, created_at) VALUES (?, 0, ?)',
            [ip, now]
        );
        // Bersihkan catatan lama di luar jendela.
        await db.execute('DELETE FROM login_attempts WHERE created_at < ?', [now - RL_WINDOW_MS]);
    } catch (e) {
        console.error('[AUTH] Record login attempt error:', e);
    }
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
