import db from '$lib/server/db';
import { fail, type Actions, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const ADMIN_PIN = '0101'; // Ganti PIN bapak di sini

export const load: PageServerLoad = async ({ cookies }) => {
    const auth = cookies.get('admin_auth');

    if (!auth || auth !== 'true') {
        return { projects: [], settings: {}, authenticated: false };
    }

    const projectsResult = await db.execute('SELECT * FROM projects ORDER BY created_at DESC');
    const settingsResult = await db.execute('SELECT * FROM settings');
    const experienceResult = await db.execute('SELECT * FROM experiences ORDER BY start_date DESC');

    // Fetch Traffic Stats
    const totalVisits = await db.execute('SELECT COUNT(*) as count FROM traffic');
    const humanVisits = await db.execute('SELECT COUNT(*) as count FROM traffic WHERE is_bot = 0');
    const botVisits = await db.execute('SELECT COUNT(*) as count FROM traffic WHERE is_bot = 1');
    const recentTraffic = await db.execute('SELECT * FROM traffic ORDER BY timestamp DESC LIMIT 50');
    const topPages = await db.execute('SELECT path, COUNT(*) as count FROM traffic WHERE is_bot = 0 GROUP BY path ORDER BY count DESC LIMIT 5');

    const settings = settingsResult.rows.reduce((acc: any, row: any) => {
        acc[row.key] = row.value;
        return acc;
    }, {});

    return {
        projects: projectsResult.rows,
        settings,
        experiences: experienceResult.rows,
        stats: {
            total: totalVisits.rows[0].count,
            human: humanVisits.rows[0].count,
            bot: botVisits.rows[0].count,
            recent: recentTraffic.rows,
            topPages: topPages.rows
        },
        authenticated: true
    };
};

export const actions: Actions = {
    login: async ({ request, cookies }) => {
        const formData = await request.formData();
        const pin = formData.get('pin');

        if (pin === ADMIN_PIN) {
            cookies.set('admin_auth', 'true', {
                path: '/',
                httpOnly: true,
                sameSite: 'lax'
            });
            return { success: true };
        }

        return fail(401, { error: 'PIN Salah!' });
    },

    logout: async ({ cookies }) => {
        cookies.delete('admin_auth', { path: '/' });
        throw redirect(303, '/admin');
    },

    addProject: async ({ request, cookies }) => {
        const auth = cookies.get('admin_auth');
        if (auth !== 'true') return fail(403, { error: 'Tidak diijinkan' });
        const formData = await request.formData();
        const title = formData.get('title') as string;
        const category = formData.get('category') as string;
        const description = formData.get('description') as string;
        const tech = formData.get('tech') as string;
        const link = formData.get('link') as string;

        if (!title || !category || !description) {
            return fail(400, { error: 'Semua kolom wajib diisi' });
        }

        try {
            await db.execute(
                'INSERT INTO projects (title, category, description, tech, link, featured) VALUES (?, ?, ?, ?, ?, 0)',
                [title, category, description, tech, link]
            );
            return { success: true };
        } catch (e) {
            return fail(500, { error: 'Gagal menyimpan ke database' });
        }
    },

    toggleFeatured: async ({ request, cookies }) => {
        const auth = cookies.get('admin_auth');
        if (auth !== 'true') return fail(403, { error: 'Tidak diijinkan' });

        const formData = await request.formData();
        const id = formData.get('id');
        const featured = formData.get('featured') === 'true' ? 1 : 0;

        if (!id) return fail(400, { error: 'ID tidak ditemukan' });

        try {
            await db.execute('UPDATE projects SET featured = ? WHERE id = ?', [featured, id as string]);
            return { success: true };
        } catch (e) {
            return fail(500, { error: 'Gagal mengubah status' });
        }
    },

    updateProject: async ({ request, cookies }) => {
        const auth = cookies.get('admin_auth');
        if (auth !== 'true') return fail(403, { error: 'Tidak diijinkan' });

        const formData = await request.formData();
        const id = formData.get('id');
        const title = formData.get('title') as string;
        const category = formData.get('category') as string;
        const description = formData.get('description') as string;
        const tech = formData.get('tech') as string;
        const link = formData.get('link') as string;

        if (!id || !title || !category || !description) {
            return fail(400, { error: 'Semua kolom wajib diisi' });
        }

        try {
            await db.execute(
                'UPDATE projects SET title = ?, category = ?, description = ?, tech = ?, link = ? WHERE id = ?',
                [title, category, description, tech, link, id as string]
            );
            return { success: true };
        } catch (e) {
            return fail(500, { error: 'Gagal memperbarui project' });
        }
    },

    deleteProject: async ({ request, cookies }) => {
        const auth = cookies.get('admin_auth');
        if (auth !== 'true') return fail(403, { error: 'Tidak diijinkan' });

        const formData = await request.formData();
        const id = formData.get('id');

        if (!id) return fail(400, { error: 'ID tidak ditemukan' });

        try {
            await db.execute('DELETE FROM projects WHERE id = ?', [id as string]);
            return { success: true };
        } catch (e) {
            return fail(500, { error: 'Gagal menghapus project' });
        }
    },

    updateStatus: async ({ request, cookies }) => {
        const auth = cookies.get('admin_auth');
        if (auth !== 'true') return fail(403, { error: 'Tidak diijinkan' });

        const formData = await request.formData();
        const status = formData.get('status') as string;

        if (!status) return fail(400, { error: 'Status tidak boleh kosong' });

        try {
            await db.execute("UPDATE settings SET value = ? WHERE key = 'status'", [status]);
            return { success: true, message: 'Status berhasil diperbarui' };
        } catch (e) {
            return fail(500, { error: 'Gagal memperbarui status' });
        }
    },

    addExperience: async ({ request, cookies }) => {
        const auth = cookies.get('admin_auth');
        if (auth !== 'true') return fail(403, { error: 'Tidak diijinkan' });

        const formData = await request.formData();
        const startDateRaw = formData.get('start_date') as string;
        const endDateRaw = formData.get('end_date') as string;
        const isPresent = formData.get('isPresent') === 'on';
        const role = formData.get('role') as string;
        const company = formData.get('company') as string;

        if (!startDateRaw || !role || !company) {
            return fail(400, { error: 'Semua kolom wajib diisi' });
        }

        const formatMonth = (dateStr: string) => {
            if (!dateStr) return '';
            const [year, month] = dateStr.split('-');
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
            return `${months[parseInt(month) - 1]} ${year}`;
        }

        const period = isPresent
            ? `${formatMonth(startDateRaw)} — Sekarang`
            : `${formatMonth(startDateRaw)} — ${formatMonth(endDateRaw)}`;

        try {
            await db.execute(
                'INSERT INTO experiences (period, role, company, start_date) VALUES (?, ?, ?, ?)',
                [period, role, company, startDateRaw]
            );
            return { success: true, message: 'Pengalaman berhasil ditambahkan' };
        } catch (e) {
            return fail(500, { error: 'Gagal menambah pengalaman' });
        }
    },

    deleteExperience: async ({ request, cookies }) => {
        const auth = cookies.get('admin_auth');
        if (auth !== 'true') return fail(403, { error: 'Tidak diijinkan' });

        const formData = await request.formData();
        const id = formData.get('id');

        if (!id) return fail(400, { error: 'ID tidak ditemukan' });

        try {
            await db.execute('DELETE FROM experiences WHERE id = ?', [id as string]);
            return { success: true, message: 'Pengalaman berhasil dihapus' };
        } catch (e) {
            return fail(500, { error: 'Gagal menghapus pengalaman' });
        }
    },

    updateSocialLinks: async ({ request, cookies }) => {
        const auth = cookies.get('admin_auth');
        if (auth !== 'true') return fail(403, { error: 'Tidak diijinkan' });

        const formData = await request.formData();
        const github = formData.get('github') as string;
        const linkedin = formData.get('linkedin') as string;
        const twitter = formData.get('twitter') as string;

        try {
            await db.execute("UPDATE settings SET value = ? WHERE key = 'github'", [github]);
            await db.execute("UPDATE settings SET value = ? WHERE key = 'linkedin'", [linkedin]);
            await db.execute("UPDATE settings SET value = ? WHERE key = 'twitter'", [twitter]);
            return { success: true, message: 'Social links berhasil diperbarui' };
        } catch (e) {
            return fail(500, { error: 'Gagal memperbarui social links' });
        }
    }
};
