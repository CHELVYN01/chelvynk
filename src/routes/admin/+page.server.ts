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

// Bentuk stats kosong dipakai saat belum login supaya tipe di UI tetap konsisten.
const emptyStats = {
    total: 0,
    human: 0,
    bot: 0,
    today: 0,
    yesterday: 0,
    last7: 0,
    prev7: 0,
    uniqueVisitors: 0,
    recent: [] as any[],
    topPages: [] as any[],
    daily: [] as { date: string; human: number; bot: number }[],
    hourly: [] as { hour: number; count: number }[],
    referrers: [] as { source: string; count: number }[],
    devices: [] as { device: string; count: number }[]
};

export const load: PageServerLoad = async ({ cookies, getClientAddress }) => {
    const auth = cookies.get('admin_auth');
    const authToken = cookies.get('admin_token');

    // Validate both cookie and token exist
    if (!auth || auth !== 'true' || !authToken) {
        return { projects: [], settings: {}, experiences: [], stats: emptyStats, authenticated: false };
    }

    // Semua query dijalankan paralel — sebelumnya berurutan (await satu-satu),
    // yang bikin load dashboard terasa lemot karena latensi Turso menumpuk.
    const [
        projectsResult,
        settingsResult,
        experienceResult,
        appsResult,
        tokensResult,
        reviewsResult,
        messagesResult,
        summary,
        recentTraffic,
        topPages,
        dailyRaw,
        hourlyRaw,
        referrersRaw,
        devicesRaw
    ] = await Promise.all([
        db.execute('SELECT * FROM projects ORDER BY created_at DESC'),
        db.execute('SELECT * FROM settings'),
        db.execute('SELECT * FROM experiences ORDER BY start_date DESC'),
        db.execute('SELECT * FROM store_apps ORDER BY created_at DESC'),

        // Review: daftar link yang dibuat + review yang masuk (join biar tahu klien mana).
        db.execute('SELECT * FROM review_tokens ORDER BY created_at DESC'),
        db.execute(`
            SELECT r.*, t.client_name, t.project_name
            FROM reviews r
            LEFT JOIN review_tokens t ON r.token_id = t.id
            ORDER BY r.created_at DESC
        `),

        // Pesan masuk dari form kontak di halaman depan.
        db.execute('SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 200'),

        // Semua angka ringkasan dihitung dalam satu query agregat (dulu 3 query terpisah).
        db.execute(`
            SELECT
                COUNT(*) AS total,
                SUM(CASE WHEN is_bot = 0 THEN 1 ELSE 0 END) AS human,
                SUM(CASE WHEN is_bot = 1 THEN 1 ELSE 0 END) AS bot,
                COUNT(DISTINCT CASE WHEN is_bot = 0 THEN ip END) AS unique_visitors,
                SUM(CASE WHEN is_bot = 0 AND date(timestamp) = date('now', 'localtime') THEN 1 ELSE 0 END) AS today,
                SUM(CASE WHEN is_bot = 0 AND date(timestamp) = date('now', 'localtime', '-1 day') THEN 1 ELSE 0 END) AS yesterday,
                SUM(CASE WHEN is_bot = 0 AND date(timestamp) >= date('now', 'localtime', '-6 day') THEN 1 ELSE 0 END) AS last7,
                SUM(CASE WHEN is_bot = 0 AND date(timestamp) >= date('now', 'localtime', '-13 day')
                         AND date(timestamp) < date('now', 'localtime', '-6 day') THEN 1 ELSE 0 END) AS prev7
            FROM traffic
        `),
        db.execute('SELECT * FROM traffic ORDER BY timestamp DESC LIMIT 50'),
        db.execute('SELECT path, COUNT(*) as count FROM traffic WHERE is_bot = 0 GROUP BY path ORDER BY count DESC LIMIT 6'),

        // Time-series 14 hari terakhir untuk grafik area.
        db.execute(`
            SELECT date(timestamp, 'localtime') AS day,
                   SUM(CASE WHEN is_bot = 0 THEN 1 ELSE 0 END) AS human,
                   SUM(CASE WHEN is_bot = 1 THEN 1 ELSE 0 END) AS bot
            FROM traffic
            WHERE date(timestamp, 'localtime') >= date('now', 'localtime', '-13 day')
            GROUP BY day
        `),

        // Distribusi jam kunjungan (7 hari terakhir) untuk grafik bar.
        db.execute(`
            SELECT CAST(strftime('%H', timestamp, 'localtime') AS INTEGER) AS hour, COUNT(*) AS count
            FROM traffic
            WHERE is_bot = 0 AND date(timestamp, 'localtime') >= date('now', 'localtime', '-6 day')
            GROUP BY hour
        `),

        db.execute(`
            SELECT referrer, COUNT(*) AS count
            FROM traffic
            WHERE is_bot = 0
            GROUP BY referrer
            ORDER BY count DESC
            LIMIT 30
        `),

        db.execute(`SELECT ua, COUNT(*) AS count FROM traffic WHERE is_bot = 0 GROUP BY ua`)
    ]);

    const settings = settingsResult.rows.reduce((acc: any, row: any) => {
        acc[row.key] = row.value;
        return acc;
    }, {});

    const num = (v: any) => Number(v ?? 0);
    const s: any = summary.rows[0] ?? {};

    // Isi hari yang kosong dengan 0 supaya garis grafik tidak "loncat".
    const dailyMap = new Map<string, { human: number; bot: number }>();
    for (const row of dailyRaw.rows as any[]) {
        dailyMap.set(String(row.day), { human: num(row.human), bot: num(row.bot) });
    }
    const daily: { date: string; human: number; bot: number }[] = [];
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const hit = dailyMap.get(key);
        daily.push({ date: key, human: hit?.human ?? 0, bot: hit?.bot ?? 0 });
    }

    // 24 slot jam, jam tanpa kunjungan tetap ada sebagai 0.
    const hourMap = new Map<number, number>();
    for (const row of hourlyRaw.rows as any[]) hourMap.set(num(row.hour), num(row.count));
    const hourly = Array.from({ length: 24 }, (_, hour) => ({ hour, count: hourMap.get(hour) ?? 0 }));

    // Referrer dikelompokkan per host supaya donut-nya tidak penuh URL panjang.
    const refMap = new Map<string, number>();
    for (const row of referrersRaw.rows as any[]) {
        const raw = String(row.referrer ?? '').trim();
        let source = 'Langsung';
        if (raw && raw !== 'direct') {
            try {
                source = new URL(raw).hostname.replace(/^www\./, '');
            } catch {
                source = raw.slice(0, 30);
            }
        }
        refMap.set(source, (refMap.get(source) ?? 0) + num(row.count));
    }
    const referrers = [...refMap.entries()]
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    // Deteksi device sederhana dari user-agent.
    const deviceMap = new Map<string, number>([['Desktop', 0], ['Mobile', 0], ['Tablet', 0]]);
    for (const row of devicesRaw.rows as any[]) {
        const ua = String(row.ua ?? '');
        const device = /tablet|ipad/i.test(ua)
            ? 'Tablet'
            : /mobi|android|iphone|ipod/i.test(ua)
                ? 'Mobile'
                : 'Desktop';
        deviceMap.set(device, (deviceMap.get(device) ?? 0) + num(row.count));
    }
    const devices = [...deviceMap.entries()]
        .map(([device, count]) => ({ device, count }))
        .filter((d) => d.count > 0);

    return {
        projects: projectsResult.rows,
        settings,
        experiences: experienceResult.rows,
        apps: appsResult.rows,
        reviewTokens: tokensResult.rows,
        reviews: reviewsResult.rows,
        messages: messagesResult.rows,
        stats: {
            total: num(s.total),
            human: num(s.human),
            bot: num(s.bot),
            today: num(s.today),
            yesterday: num(s.yesterday),
            last7: num(s.last7),
            prev7: num(s.prev7),
            uniqueVisitors: num(s.unique_visitors),
            recent: recentTraffic.rows,
            topPages: topPages.rows,
            daily,
            hourly,
            referrers,
            devices
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

    updateApp: async ({ request, cookies }) => {
        const auth = cookies.get('admin_auth');
        const token = cookies.get('admin_token');
        if (auth !== 'true' || !token) return fail(403, { error: 'Tidak diijinkan' });

        const formData = await request.formData();
        const id = formData.get('id');
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
            try {
                mkdirSync(uploadDir, { recursive: true });
            } catch (e) {
                console.error('[Storage Error]', e);
            }
        }

        try {
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
        } catch (e) {
            console.error('[Upload Error]', e);
            // Non-fatal, let it pass if upload fails (e.g. Vercel read-only system)
        }

        if (!id || isNaN(Number(id)) || !title || !download_url) {
            return fail(400, { error: 'ID, Judul dan URL Download wajib diisi' });
        }

        try {
            await db.execute(
                'UPDATE store_apps SET title = ?, developer = ?, description = ?, icon_url = ?, download_url = ?, version = ?, size = ? WHERE id = ?',
                [title, developer || 'Unknown', description || '', icon_url || '', download_url, version || '1.0', size || 'Unknown', Number(id)]
            );
            return { success: true, message: 'App berhasil diperbarui' };
        } catch (e) {
            console.error('[DB Error] updateApp:', e);
            return fail(500, { error: 'Gagal memperbarui App' });
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
    },

    // ==================== REVIEW KLIEN ====================

    generateReviewLink: async ({ request, cookies }) => {
        const auth = cookies.get('admin_auth');
        const token = cookies.get('admin_token');
        if (auth !== 'true' || !token) return fail(403, { error: 'Tidak diijinkan' });

        const formData = await request.formData();
        const clientName = sanitizeInput(formData.get('client_name') as string);
        const projectIdRaw = formData.get('project_id') as string;
        let projectName = sanitizeInput(formData.get('project_name') as string);
        let projectId: number | null = null;

        // Kalau admin memilih project dari dropdown, ambil judulnya dari DB —
        // jangan percaya judul yang dikirim form (bisa dimanipulasi).
        if (projectIdRaw && projectIdRaw !== 'manual') {
            if (isNaN(Number(projectIdRaw))) {
                return fail(400, { error: 'Project tidak valid' });
            }
            const p = await db.execute('SELECT title FROM projects WHERE id = ?', [Number(projectIdRaw)]);
            if (p.rows.length === 0) {
                return fail(400, { error: 'Project tidak ditemukan' });
            }
            projectId = Number(projectIdRaw);
            projectName = p.rows[0].title as string;
        }

        if (!clientName || !projectName) {
            return fail(400, { error: 'Nama klien dan project wajib diisi' });
        }

        // Token random unguessable (32 char, crypto.getRandomValues) — bukan angka urut.
        const reviewToken = generateToken(32);
        // Expiry 30 hari.
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        try {
            await db.execute(
                'INSERT INTO review_tokens (token, client_name, project_name, project_id, expires_at) VALUES (?, ?, ?, ?, ?)',
                [reviewToken, clientName, projectName, projectId, expiresAt]
            );
            // clientName dikembalikan untuk mengisi template pesan WA di UI.
            return { success: true, message: 'Link review berhasil dibuat', reviewToken, clientName };
        } catch (e) {
            console.error('[DB Error] generateReviewLink:', e);
            return fail(500, { error: 'Gagal membuat link review' });
        }
    },

    // Tautkan (atau lepas) link review lama ke sebuah project.
    // Berguna kalau klien sudah review duluan sebelum project-nya didaftarkan.
    linkTokenProject: async ({ request, cookies }) => {
        const auth = cookies.get('admin_auth');
        const token = cookies.get('admin_token');
        if (auth !== 'true' || !token) return fail(403, { error: 'Tidak diijinkan' });

        const formData = await request.formData();
        const id = formData.get('id');
        const projectIdRaw = formData.get('project_id') as string;
        if (!id || isNaN(Number(id))) return fail(400, { error: 'ID tidak valid' });

        try {
            // Kosong = lepas tautan, project_name yang lama tetap dipertahankan.
            if (!projectIdRaw) {
                await db.execute('UPDATE review_tokens SET project_id = NULL WHERE id = ?', [Number(id)]);
                return { success: true, message: 'Tautan project dilepas' };
            }

            if (isNaN(Number(projectIdRaw))) return fail(400, { error: 'Project tidak valid' });

            // Judul diambil dari DB, bukan dari form — jangan percaya input client.
            const p = await db.execute('SELECT title FROM projects WHERE id = ?', [Number(projectIdRaw)]);
            if (p.rows.length === 0) return fail(400, { error: 'Project tidak ditemukan' });

            await db.execute(
                'UPDATE review_tokens SET project_id = ?, project_name = ? WHERE id = ?',
                [Number(projectIdRaw), p.rows[0].title as string, Number(id)]
            );
            return { success: true, message: 'Link review berhasil ditautkan ke project' };
        } catch (e) {
            console.error('[DB Error] linkTokenProject:', e);
            return fail(500, { error: 'Gagal menautkan project' });
        }
    },

    approveReview: async ({ request, cookies }) => {
        const auth = cookies.get('admin_auth');
        const token = cookies.get('admin_token');
        if (auth !== 'true' || !token) return fail(403, { error: 'Tidak diijinkan' });

        const formData = await request.formData();
        const id = formData.get('id');
        if (!id || isNaN(Number(id))) return fail(400, { error: 'ID tidak valid' });

        try {
            await db.execute("UPDATE reviews SET status = 'approved' WHERE id = ?", [Number(id)]);
            return { success: true, message: 'Review disetujui' };
        } catch (e) {
            console.error('[DB Error] approveReview:', e);
            return fail(500, { error: 'Gagal menyetujui review' });
        }
    },

    rejectReview: async ({ request, cookies }) => {
        const auth = cookies.get('admin_auth');
        const token = cookies.get('admin_token');
        if (auth !== 'true' || !token) return fail(403, { error: 'Tidak diijinkan' });

        const formData = await request.formData();
        const id = formData.get('id');
        if (!id || isNaN(Number(id))) return fail(400, { error: 'ID tidak valid' });

        try {
            await db.execute("UPDATE reviews SET status = 'rejected' WHERE id = ?", [Number(id)]);
            return { success: true, message: 'Review ditolak' };
        } catch (e) {
            console.error('[DB Error] rejectReview:', e);
            return fail(500, { error: 'Gagal menolak review' });
        }
    },

    deleteReviewToken: async ({ request, cookies }) => {
        const auth = cookies.get('admin_auth');
        const token = cookies.get('admin_token');
        if (auth !== 'true' || !token) return fail(403, { error: 'Tidak diijinkan' });

        const formData = await request.formData();
        const id = formData.get('id');
        if (!id || isNaN(Number(id))) return fail(400, { error: 'ID tidak valid' });

        try {
            // Hapus review terkait dulu, baru token-nya.
            await db.execute('DELETE FROM reviews WHERE token_id = ?', [Number(id)]);
            await db.execute('DELETE FROM review_tokens WHERE id = ?', [Number(id)]);
            return { success: true, message: 'Link review dihapus' };
        } catch (e) {
            console.error('[DB Error] deleteReviewToken:', e);
            return fail(500, { error: 'Gagal menghapus link review' });
        }
    },

    markMessageRead: async ({ request, cookies }) => {
        const auth = cookies.get('admin_auth');
        const token = cookies.get('admin_token');
        if (auth !== 'true' || !token) return fail(403, { error: 'Tidak diijinkan' });

        const formData = await request.formData();
        const id = formData.get('id');
        if (!id || isNaN(Number(id))) return fail(400, { error: 'ID tidak valid' });

        try {
            await db.execute('UPDATE contact_messages SET is_read = 1 WHERE id = ?', [Number(id)]);
            return { success: true, message: 'Pesan ditandai sudah dibaca' };
        } catch (e) {
            console.error('[DB Error] markMessageRead:', e);
            return fail(500, { error: 'Gagal menandai pesan' });
        }
    },

    deleteMessage: async ({ request, cookies }) => {
        const auth = cookies.get('admin_auth');
        const token = cookies.get('admin_token');
        if (auth !== 'true' || !token) return fail(403, { error: 'Tidak diijinkan' });

        const formData = await request.formData();
        const id = formData.get('id');
        if (!id || isNaN(Number(id))) return fail(400, { error: 'ID tidak valid' });

        try {
            await db.execute('DELETE FROM contact_messages WHERE id = ?', [Number(id)]);
            return { success: true, message: 'Pesan dihapus' };
        } catch (e) {
            console.error('[DB Error] deleteMessage:', e);
            return fail(500, { error: 'Gagal menghapus pesan' });
        }
    }
};

