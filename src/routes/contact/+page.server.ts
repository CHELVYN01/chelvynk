import db from '$lib/server/db';
import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';
import { sanitizeInput, createFormToken, verifyFormToken, detectSpam } from '$lib/server/security';
import { sendContactEmail } from '$lib/server/mail';
import { sendTelegramNotif } from '$lib/server/notify';

// Kunci HMAC token form. Isi FORM_SECRET di .env; fallback ke token Turso (produksi).
const formSecret = () => env.FORM_SECRET || env.DATABASE_AUTH_TOKEN || 'dev-only-secret';

// Batas kirim, dihitung dari DB supaya tahan restart/serverless.
const IP_MAX = 3;    // per IP per 30 menit
const EMAIL_MAX = 2; // per email per 24 jam

export const load: PageServerLoad = async () => {
    const formToken = await createFormToken(formSecret());
    try {
        const settingsResult = await db.execute("SELECT value FROM settings WHERE key = 'status'");
        const siteStatus = (settingsResult.rows[0]?.value as string) || 'Tersedia untuk Project Baru';
        return { siteStatus, formToken };
    } catch (e) {
        console.error('[Contact Load Error]:', e);
        return { siteStatus: 'Tersedia untuk Project Baru', formToken };
    }
};

// Validasi email sederhana — cukup ketat untuk menolak input asal,
// tanpa jadi regex monster yang malah menolak alamat valid.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const actions: Actions = {
    contact: async ({ request, getClientAddress }) => {
        const ip = getClientAddress();
        const formData = await request.formData();

        // Honeypot: field tersembunyi yang hanya diisi bot.
        // Sengaja balas "sukses" supaya bot tidak tahu dia terdeteksi.
        if (formData.get('website')) {
            console.warn(`[SECURITY] Contact honeypot terisi dari IP: ${ip}`);
            return { success: true };
        }

        // Token waktu: tanpa token valid = bot yang POST langsung → diam-diam diabaikan.
        // Terlalu cepat / kedaluwarsa bisa terjadi pada manusia → beri pesan agar bisa coba lagi.
        const tokenStatus = await verifyFormToken(formSecret(), formData.get('_t') as string);
        if (tokenStatus === 'invalid') {
            console.warn(`[SECURITY] Contact tanpa token valid dari IP: ${ip}`);
            return { success: true };
        }

        const name = sanitizeInput(formData.get('name') as string);
        const email = sanitizeInput(formData.get('email') as string);
        const subject = sanitizeInput(formData.get('subject') as string);
        const message = sanitizeInput(formData.get('message') as string);

        if (tokenStatus === 'too-fast') {
            return fail(400, { error: 'Form terkirim terlalu cepat. Coba kirim sekali lagi.', name, email, subject, message });
        }
        if (tokenStatus === 'expired') {
            return fail(400, { error: 'Halaman sudah kedaluwarsa. Muat ulang halaman lalu kirim lagi.', name, email, subject, message });
        }

        if (!name || name.length < 2) {
            return fail(400, { error: 'Nama wajib diisi (minimal 2 karakter).', name, email, subject, message });
        }
        if (!email || !EMAIL_RE.test(email)) {
            return fail(400, { error: 'Format email tidak valid.', name, email, subject, message });
        }
        // Subjek WAJIB — mayoritas spam bot mengirim form tanpa subjek sama sekali.
        // Divalidasi di server, bukan cuma `required` di HTML, karena bot POST langsung
        // ke endpoint tanpa pernah merender form-nya.
        if (!subject || subject.length < 3) {
            return fail(400, { error: 'Subjek wajib diisi (minimal 3 karakter).', name, email, subject, message });
        }
        if (!message || message.length < 10) {
            return fail(400, { error: 'Pesan wajib diisi (minimal 10 karakter).', name, email, subject, message });
        }
        if (name.length > 100 || email.length > 150 || subject.length > 200 || message.length > 3000) {
            return fail(400, { error: 'Isian terlalu panjang.', name, email, subject, message });
        }

        // Filter isi pesan: spam dibalas "sukses" (bot tidak tahu) tapi tidak disimpan
        // dan tidak memicu notifikasi email/Telegram.
        const spamReason = detectSpam({ name, email, subject, message });
        if (spamReason) {
            console.warn(`[SECURITY] Contact spam (${spamReason}) dari IP: ${ip}, email: ${email}`);
            return { success: true };
        }

        // Rate limit dari DB. IP: balas error biasa. Email berulang: diam-diam diabaikan.
        try {
            const counts = await db.execute(
                `SELECT
                    SUM(CASE WHEN ip = ? AND created_at > datetime('now', '-30 minutes') THEN 1 ELSE 0 END) AS by_ip,
                    SUM(CASE WHEN lower(email) = ? AND created_at > datetime('now', '-1 day') THEN 1 ELSE 0 END) AS by_email
                 FROM contact_messages`,
                [ip, email.toLowerCase()]
            );
            const byIp = Number(counts.rows[0]?.by_ip ?? 0);
            const byEmail = Number(counts.rows[0]?.by_email ?? 0);
            if (byIp >= IP_MAX) {
                return fail(429, {
                    error: 'Terlalu banyak pesan terkirim. Coba lagi dalam beberapa menit.',
                    name, email, subject, message
                });
            }
            if (byEmail >= EMAIL_MAX) {
                console.warn(`[SECURITY] Contact email berulang: ${email}`);
                return { success: true };
            }
        } catch (e) {
            console.error('[DB Error] contact rate limit:', e);
        }

        // Simpan dulu ke DB — ini sumber kebenarannya. Email & Telegram cuma
        // notifikasi, jadi kalau layanannya mati pesan klien tetap tidak hilang.
        try {
            await db.execute(
                'INSERT INTO contact_messages (name, email, subject, message, ip) VALUES (?, ?, ?, ?, ?)',
                [name, email, subject, message, ip]
            );
        } catch (e) {
            console.error('[DB Error] contact:', e);
            return fail(500, { error: 'Gagal mengirim pesan. Coba lagi nanti.', name, email, subject, message });
        }

        // Non-fatal: kegagalan email/notifikasi tidak membatalkan submit.
        // Dijalankan paralel — allSettled supaya satu gagal tidak menggagalkan yang lain.
        await Promise.allSettled([
            sendContactEmail({ name, email, subject, message }),
            sendTelegramNotif({ name, email, subject, message })
        ]);

        return { success: true };
    }
};
