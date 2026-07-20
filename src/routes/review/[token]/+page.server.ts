import db from '$lib/server/db';
import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { sanitizeInput, checkRateLimit, recordLoginAttempt } from '$lib/server/security';

/**
 * Cari token yang valid: ada, belum dipakai, belum expired.
 * Return baris token atau null. Semua kondisi invalid -> null (pesan generik,
 * jangan bocorkan apakah token salah / sudah dipakai / expired -> cegah enumeration).
 */
async function findValidToken(token: string | undefined) {
    if (!token || token.length < 10) return null;

    const result = await db.execute(
        'SELECT * FROM review_tokens WHERE token = ? LIMIT 1',
        [token]
    );
    const row = result.rows[0] as any;
    if (!row) return null;
    if (row.used === 1) return null;
    if (row.expires_at && new Date(row.expires_at as string).getTime() < Date.now()) return null;

    return row;
}

export const load: PageServerLoad = async ({ params }) => {
    const row = await findValidToken(params.token);

    if (!row) {
        return { valid: false };
    }

    return {
        valid: true,
        clientName: row.client_name as string,
        projectName: row.project_name as string
    };
};

export const actions: Actions = {
    submit: async ({ request, params, getClientAddress }) => {
        const ip = getClientAddress();

        // Rate limit: cegah brute-force nebak token dari IP yang sama.
        const rateLimit = checkRateLimit(ip);
        if (!rateLimit.allowed) {
            return fail(429, { error: `Terlalu banyak percobaan. Coba lagi dalam ${rateLimit.resetIn} menit.` });
        }

        // Validasi ulang token di server (jangan percaya frontend).
        const row = await findValidToken(params.token);
        if (!row) {
            recordLoginAttempt(ip, false, request.headers.get('user-agent') || '');
            return fail(400, { error: 'Link tidak valid atau sudah pernah digunakan.' });
        }

        const formData = await request.formData();
        const ratingRaw = formData.get('rating');
        const testimonial = sanitizeInput(formData.get('testimonial') as string);
        const reviewerName = sanitizeInput(formData.get('reviewer_name') as string);
        const reviewerRole = sanitizeInput(formData.get('reviewer_role') as string);

        const rating = Number(ratingRaw);
        if (!rating || rating < 1 || rating > 5) {
            return fail(400, { error: 'Rating harus antara 1 sampai 5 bintang.' });
        }
        if (!testimonial || testimonial.length < 5) {
            return fail(400, { error: 'Testimoni wajib diisi (minimal 5 karakter).' });
        }
        if (!reviewerName) {
            return fail(400, { error: 'Nama wajib diisi.' });
        }
        if (testimonial.length > 2000) {
            return fail(400, { error: 'Testimoni terlalu panjang.' });
        }

        try {
            await db.execute(
                'INSERT INTO reviews (token_id, rating, testimonial, reviewer_name, reviewer_role, status) VALUES (?, ?, ?, ?, ?, ?)',
                [row.id, rating, testimonial, reviewerName, reviewerRole || '', 'pending']
            );
            // Tandai token terpakai (sekali pakai) — cegah double submit / link bocor dispam.
            await db.execute('UPDATE review_tokens SET used = 1 WHERE id = ?', [row.id]);

            // Sukses -> reset rate limit untuk IP ini.
            recordLoginAttempt(ip, true, '');
            return { success: true };
        } catch (e) {
            console.error('[DB Error] submitReview:', e);
            return fail(500, { error: 'Gagal menyimpan review. Coba lagi.' });
        }
    }
};
