import db from '$lib/server/db';
import { fail, type Actions, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const ADMIN_PIN = '0101'; // Ganti PIN bapak di sini

export const load: PageServerLoad = async ({ cookies }) => {
    const auth = cookies.get('admin_auth');

    if (!auth || auth !== 'true') {
        return { projects: [], authenticated: false };
    }

    const projects = db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all();
    return { projects, authenticated: true };
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
            db.prepare(
                'INSERT INTO projects (title, category, description, tech, link, featured) VALUES (?, ?, ?, ?, ?, 0)'
            ).run(title, category, description, tech, link);
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
            db.prepare('UPDATE projects SET featured = ? WHERE id = ?').run(featured, id as string);
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
            db.prepare(
                'UPDATE projects SET title = ?, category = ?, description = ?, tech = ?, link = ? WHERE id = ?'
            ).run(title, category, description, tech, link, id as string);
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
            db.prepare('DELETE FROM projects WHERE id = ?').run(id as string);
            return { success: true };
        } catch (e) {
            return fail(500, { error: 'Gagal menghapus project' });
        }
    }
};
