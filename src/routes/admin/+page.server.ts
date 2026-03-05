import db from '$lib/server/db';
import { fail, type Actions, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { PageServerLoad } from './$types';
import {
    checkRateLimit,
    recordLoginAttempt,
    sanitizeInput,
    sanitizeUrl,
    validatePin,
    generateToken
} from '$lib/server/security';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// PIN dari environment variable (WAJIB)
const getAdminPin = () => {
    const pin = env.ADMIN_PIN;
    if (!pin) {
        console.error('[SECURITY] ADMIN_PIN not set in environment variables!');
        return null;
    }
    return pin;
};

export const load: PageServerLoad = async ({ cookies, getClientAddress }) => {
    const auth = cookies.get('admin_auth');
    const authToken = cookies.get('admin_token');

    // Validate both cookie and token exist
    if (!auth || auth !== 'true' || !authToken) {
        return { projects: [], settings: {}, experiences: [], stats: { total: 0, human: 0, bot: 0, recent: [], topPages: [] }, authenticated: false };
    }

    const projectsResult = await db.execute('SELECT * FROM projects ORDER BY created_at DESC');
    const settingsResult = await db.execute('SELECT * FROM settings');
    const experienceResult = await db.execute('SELECT * FROM experiences ORDER BY start_date DESC');
    const appsResult = await db.execute('SELECT * FROM store_apps ORDER BY created_at DESC');

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
        apps: appsResult.rows,
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
    login: async ({ request, cookies, getClientAddress }) => {
        const ip = getClientAddress();
        const ua = request.headers.get('user-agent') || '';

        // Check rate limit
        const rateLimit = checkRateLimit(ip);
        if (!rateLimit.allowed) {
            console.warn(`[SECURITY] Rate limited IP: ${ip}`);
            return fail(429, {
                error: `Terlalu banyak percobaan. Coba lagi dalam ${rateLimit.resetIn} menit.`
            });
        }

        const formData = await request.formData();
        const pin = formData.get('pin') as string;
        const honeypot = formData.get('website') as string;

        // Honeypot check - bots will fill this hidden field
        if (honeypot) {
            console.warn(`[SECURITY] Bot detected via honeypot from IP: ${ip}`);
            recordLoginAttempt(ip, false, ua);
            // Return generic error to not reveal detection method
            return fail(401, { error: 'PIN Salah!' });
        }

        // Validate PIN format
        if (!validatePin(pin)) {
            recordLoginAttempt(ip, false, ua);
            return fail(400, { error: 'Format PIN tidak valid' });
        }

        const adminPin = getAdminPin();
        if (!adminPin) {
            console.error('[SECURITY] Admin PIN not configured!');
            return fail(500, { error: 'Konfigurasi server bermasalah' });
        }

        if (pin === adminPin) {
            // Success - reset rate limit and set secure cookies
            recordLoginAttempt(ip, true, ua);

            const sessionToken = generateToken(32);

            cookies.set('admin_auth', 'true', {
                path: '/',
                httpOnly: true,
                sameSite: 'strict',
                secure: true, // HTTPS aktif
                maxAge: 60 * 60 * 4 // 4 jam
            });

            cookies.set('admin_token', sessionToken, {
                path: '/',
                httpOnly: true,
                sameSite: 'strict',
                secure: true,
                maxAge: 60 * 60 * 4
            });

            console.log(`[SECURITY] Successful login from IP: ${ip}`);
            return { success: true };
        }

        // Failed login
        recordLoginAttempt(ip, false, ua);
        return fail(401, {
            error: `PIN Salah! Sisa percobaan: ${rateLimit.remaining - 1}`
        });
    },

    logout: async ({ cookies }) => {
        cookies.delete('admin_auth', { path: '/' });
        cookies.delete('admin_token', { path: '/' });
        throw redirect(303, '/admin');
    },

    addProject: async ({ request, cookies }) => {
        const auth = cookies.get('admin_auth');
        const token = cookies.get('admin_token');
        if (auth !== 'true' || !token) return fail(403, { error: 'Tidak diijinkan' });

        const formData = await request.formData();

        // Sanitize all inputs
        const title = sanitizeInput(formData.get('title') as string);
        const category = sanitizeInput(formData.get('category') as string);
        const description = sanitizeInput(formData.get('description') as string);
        const tech = sanitizeInput(formData.get('tech') as string);
        const link = sanitizeUrl(formData.get('link') as string);
        const github = sanitizeUrl(formData.get('github') as string);
        const demo = sanitizeUrl(formData.get('demo') as string);

        if (!title || !category || !description) {
            return fail(400, { error: 'Semua kolom wajib diisi' });
        }

        try {
            await db.execute(
                'INSERT INTO projects (title, category, description, tech, link, github, demo, featured) VALUES (?, ?, ?, ?, ?, ?, ?, 0)',
                [title, category, description, tech, link, github, demo]
            );
            return { success: true, message: 'Project berhasil ditambahkan' };
        } catch (e) {
            console.error('[DB Error] addProject:', e);
            return fail(500, { error: 'Gagal menyimpan ke database' });
        }
    },

    toggleFeatured: async ({ request, cookies }) => {
        const auth = cookies.get('admin_auth');
        const token = cookies.get('admin_token');
        if (auth !== 'true' || !token) return fail(403, { error: 'Tidak diijinkan' });

        const formData = await request.formData();
        const id = formData.get('id');
        const featured = formData.get('featured') === '1' ? 1 : 0;

        // Validate ID is a number
        if (!id || isNaN(Number(id))) return fail(400, { error: 'ID tidak valid' });

        try {
            await db.execute('UPDATE projects SET featured = ? WHERE id = ?', [featured, Number(id)]);
            return { success: true };
        } catch (e) {
            console.error('[DB Error] toggleFeatured:', e);
            return fail(500, { error: 'Gagal mengubah status' });
        }
    },

    updateProject: async ({ request, cookies }) => {
        const auth = cookies.get('admin_auth');
        const token = cookies.get('admin_token');
        if (auth !== 'true' || !token) return fail(403, { error: 'Tidak diijinkan' });

        const formData = await request.formData();
        const id = formData.get('id');

        // Sanitize all inputs
        const title = sanitizeInput(formData.get('title') as string);
        const category = sanitizeInput(formData.get('category') as string);
        const description = sanitizeInput(formData.get('description') as string);
        const tech = sanitizeInput(formData.get('tech') as string);
        const link = sanitizeUrl(formData.get('link') as string);
        const github = sanitizeUrl(formData.get('github') as string);
        const demo = sanitizeUrl(formData.get('demo') as string);

        if (!id || isNaN(Number(id)) || !title || !category || !description) {
            return fail(400, { error: 'Semua kolom wajib diisi' });
        }

        try {
            await db.execute(
                'UPDATE projects SET title = ?, category = ?, description = ?, tech = ?, link = ?, github = ?, demo = ? WHERE id = ?',
                [title, category, description, tech, link, github, demo, Number(id)]
            );
            return { success: true, message: 'Project berhasil diperbarui' };
        } catch (e) {
            console.error('[DB Error] updateProject:', e);
            return fail(500, { error: 'Gagal memperbarui project' });
        }
    },

    deleteProject: async ({ request, cookies }) => {
        const auth = cookies.get('admin_auth');
        const token = cookies.get('admin_token');
        if (auth !== 'true' || !token) return fail(403, { error: 'Tidak diijinkan' });

        const formData = await request.formData();
        const id = formData.get('id');

        // Validate ID is a number
        if (!id || isNaN(Number(id))) return fail(400, { error: 'ID tidak valid' });

        try {
            await db.execute('DELETE FROM projects WHERE id = ?', [Number(id)]);
            return { success: true, message: 'Project berhasil dihapus' };
        } catch (e) {
            console.error('[DB Error] deleteProject:', e);
            return fail(500, { error: 'Gagal menghapus project' });
        }
    },

    updateStatus: async ({ request, cookies }) => {
        const auth = cookies.get('admin_auth');
        const token = cookies.get('admin_token');
        if (auth !== 'true' || !token) return fail(403, { error: 'Tidak diijinkan' });

        const formData = await request.formData();
        const status = sanitizeInput(formData.get('status') as string);

        if (!status) return fail(400, { error: 'Status tidak boleh kosong' });

        try {
            await db.execute("UPDATE settings SET value = ? WHERE key = 'status'", [status]);
            return { success: true, message: 'Status berhasil diperbarui' };
        } catch (e) {
            console.error('[DB Error] updateStatus:', e);
            return fail(500, { error: 'Gagal memperbarui status' });
        }
    },

    addExperience: async ({ request, cookies }) => {
        const auth = cookies.get('admin_auth');
        const token = cookies.get('admin_token');
        if (auth !== 'true' || !token) return fail(403, { error: 'Tidak diijinkan' });

        const formData = await request.formData();
        const startDateRaw = formData.get('start_date') as string;
        const endDateRaw = formData.get('end_date') as string;
        const isPresent = formData.get('isPresent') === 'on';
        const role = sanitizeInput(formData.get('role') as string);
        const company = sanitizeInput(formData.get('company') as string);

        if (!startDateRaw || !role || !company) {
            return fail(400, { error: 'Semua kolom wajib diisi' });
        }

        // Validate date format (YYYY-MM)
        const dateRegex = /^\d{4}-\d{2}$/;
        if (!dateRegex.test(startDateRaw)) {
            return fail(400, { error: 'Format tanggal tidak valid' });
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
            console.error('[DB Error] addExperience:', e);
            return fail(500, { error: 'Gagal menambah pengalaman' });
        }
    },

    deleteExperience: async ({ request, cookies }) => {
        const auth = cookies.get('admin_auth');
        const token = cookies.get('admin_token');
        if (auth !== 'true' || !token) return fail(403, { error: 'Tidak diijinkan' });

        const formData = await request.formData();
        const id = formData.get('id');

        // Validate ID is a number
        if (!id || isNaN(Number(id))) return fail(400, { error: 'ID tidak valid' });

        try {
            await db.execute('DELETE FROM experiences WHERE id = ?', [Number(id)]);
            return { success: true, message: 'Pengalaman berhasil dihapus' };
        } catch (e) {
            console.error('[DB Error] deleteExperience:', e);
            return fail(500, { error: 'Gagal menghapus pengalaman' });
        }
    },

    updateSocialLinks: async ({ request, cookies }) => {
        const auth = cookies.get('admin_auth');
        const token = cookies.get('admin_token');
        if (auth !== 'true' || !token) return fail(403, { error: 'Tidak diijinkan' });

        const formData = await request.formData();

        // Sanitize URLs
        const github = sanitizeUrl(formData.get('github') as string);
        const linkedin = sanitizeUrl(formData.get('linkedin') as string);
        const twitter = sanitizeUrl(formData.get('twitter') as string);

        try {
            await db.execute("UPDATE settings SET value = ? WHERE key = 'github'", [github]);
            await db.execute("UPDATE settings SET value = ? WHERE key = 'linkedin'", [linkedin]);
            await db.execute("UPDATE settings SET value = ? WHERE key = 'twitter'", [twitter]);
            return { success: true, message: 'Social links berhasil diperbarui' };
        } catch (e) {
            console.error('[DB Error] updateSocialLinks:', e);
            return fail(500, { error: 'Gagal memperbarui social links' });
        }
    },

    addApp: async ({ request, cookies }) => {
        const auth = cookies.get('admin_auth');
        const token = cookies.get('admin_token');
        if (auth !== 'true' || !token) return fail(403, { error: 'Tidak diijinkan' });

        const formData = await request.formData();
        const title = sanitizeInput(formData.get('title') as string);
        const developer = sanitizeInput(formData.get('developer') as string);
        const description = sanitizeInput(formData.get('description') as string);
        let icon_url = sanitizeUrl(formData.get('icon_url') as string);
        let download_url = sanitizeUrl(formData.get('download_url') as string);
        const version = sanitizeInput(formData.get('version') as string);
        let size = sanitizeInput(formData.get('size') as string);

        const iconFile = formData.get('icon_file') as File | null;
        const appFile = formData.get('app_file') as File | null;

        const uploadDir = join(process.cwd(), 'static', 'uploads');
        if (!existsSync(uploadDir)) {
            mkdirSync(uploadDir, { recursive: true });
        }

        if (iconFile && iconFile.size > 0 && iconFile.name) {
            const buffer = Buffer.from(await iconFile.arrayBuffer());
            const fileName = `icon_${Date.now()}_${iconFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
            writeFileSync(join(uploadDir, fileName), buffer);
            icon_url = `/uploads/${fileName}`;
        }

        if (appFile && appFile.size > 0 && appFile.name) {
            const buffer = Buffer.from(await appFile.arrayBuffer());
            const fileName = `app_${Date.now()}_${appFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
            writeFileSync(join(uploadDir, fileName), buffer);
            download_url = `/uploads/${fileName}`;
            
            // Auto calculate size if empty
            if (!size) {
                const mb = (appFile.size / (1024 * 1024)).toFixed(1);
                size = `${mb} MB`;
            }
        }

        if (!title || !download_url) {
            return fail(400, { error: 'Judul dan File/URL Download wajib diisi' });
        }

        try {
            await db.execute(
                'INSERT INTO store_apps (title, developer, description, icon_url, download_url, version, size) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [title, developer || 'Unknown', description || '', icon_url || '', download_url, version || '1.0', size || 'Unknown']
            );
            return { success: true, message: 'App berhasil ditambahkan' };
        } catch (e) {
            console.error('[DB Error] addApp:', e);
            return fail(500, { error: 'Gagal menambah App' });
        }
    },

    deleteApp: async ({ request, cookies }) => {
        const auth = cookies.get('admin_auth');
        const token = cookies.get('admin_token');
        if (auth !== 'true' || !token) return fail(403, { error: 'Tidak diijinkan' });

        const formData = await request.formData();
        const id = formData.get('id');

        if (!id || isNaN(Number(id))) return fail(400, { error: 'ID tidak valid' });

        try {
            await db.execute('DELETE FROM store_apps WHERE id = ?', [Number(id)]);
            return { success: true, message: 'App berhasil dihapus' };
        } catch (e) {
            console.error('[DB Error] deleteApp:', e);
            return fail(500, { error: 'Gagal menghapus App' });
        }
    }
};

