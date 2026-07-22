import db from '$lib/server/db';
import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { sanitizeInput, checkContactRateLimit } from '$lib/server/security';
import { sendContactEmail } from '$lib/server/mail';
import { sendTelegramNotif } from '$lib/server/notify';

export const load: PageServerLoad = async () => {
    try {
        // Fetch only featured projects for the home page
        const result = await db.execute('SELECT * FROM projects WHERE featured = 1 ORDER BY created_at DESC');
        const rawProjects = result.rows as any[];

        const projects = rawProjects.map(p => {
            // DEBUG LOG UNTUK KITA CEK PAK
            console.log(`[DEBUG] Project: ${p.title} | GitHub: ${p.github} | Demo: ${p.demo}`);

            return {
                ...p,
                tech: p.tech ? (p.tech as string).split(',').map((s: string) => s.trim()) : [],
                categories: p.category ? (p.category as string).split(',').map((s: string) => s.trim()) : []
            };
        });

        const settingsResult = await db.execute("SELECT value FROM settings WHERE key = 'status'");
        const siteStatus = settingsResult.rows[0]?.value as string || 'Tersedia untuk Project Baru';

        const expResult = await db.execute('SELECT * FROM experiences ORDER BY start_date DESC');

        // Testimoni klien yang sudah di-approve.
        const reviewsResult = await db.execute(
            "SELECT rating, testimonial, reviewer_name, reviewer_role FROM reviews WHERE status = 'approved' ORDER BY created_at DESC"
        );

        return { projects, siteStatus, experiences: expResult.rows, reviews: reviewsResult.rows };
    } catch (e) {
        console.error('[Home Load Error]:', e);
        return { projects: [], siteStatus: 'Tersedia untuk Project Baru', experiences: [], reviews: [] };
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

        const name = sanitizeInput(formData.get('name') as string);
        const email = sanitizeInput(formData.get('email') as string);
        const subject = sanitizeInput(formData.get('subject') as string);
        const message = sanitizeInput(formData.get('message') as string);

        const rateLimit = checkContactRateLimit(ip);
        if (!rateLimit.allowed) {
            return fail(429, {
                error: `Terlalu banyak pesan terkirim. Coba lagi dalam ${rateLimit.resetIn} menit.`,
                name, email, subject, message
            });
        }

        if (!name || name.length < 2) {
            return fail(400, { error: 'Nama wajib diisi (minimal 2 karakter).', name, email, subject, message });
        }
        if (!email || !EMAIL_RE.test(email)) {
            return fail(400, { error: 'Format email tidak valid.', name, email, subject, message });
        }
        if (!message || message.length < 10) {
            return fail(400, { error: 'Pesan wajib diisi (minimal 10 karakter).', name, email, subject, message });
        }
        if (name.length > 100 || email.length > 150 || subject.length > 200 || message.length > 3000) {
            return fail(400, { error: 'Isian terlalu panjang.', name, email, subject, message });
        }

        // Simpan dulu ke DB — ini sumber kebenarannya. Email cuma notifikasi,
        // jadi kalau layanan email mati pesan klien tetap tidak hilang.
        try {
            await db.execute(
                'INSERT INTO contact_messages (name, email, subject, message, ip) VALUES (?, ?, ?, ?, ?)',
                [name, email, subject || '', message, ip]
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
