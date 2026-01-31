import db from '$lib/server/db';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ request, url }) => {
    try {
        const settingsResult = await db.execute('SELECT * FROM settings');
        const settings = settingsResult.rows.reduce((acc: any, row: any) => {
            acc[row.key] = row.value;
            return acc;
        }, {});

        // TRAFFIC TRACKING
        const pathname = url.pathname;
        const isNotAdmin = !pathname.startsWith('/admin');
        const isNotStatic = !pathname.includes('.') && !pathname.startsWith('/_');

        if (isNotAdmin && isNotStatic) {
            const ua = request.headers.get('user-agent') || '';
            const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
            const referrer = request.headers.get('referer') || 'direct';

            // Simple bot detection
            const bots = ['googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider', 'yandexbot', 'ahrefsbot', 'semrushbot', 'bot', 'crawler', 'spider'];
            const isBot = bots.some(bot => ua.toLowerCase().includes(bot)) ? 1 : 0;

            // Log visit asynchronously
            db.execute(
                'INSERT INTO traffic (ip, ua, path, referrer, is_bot) VALUES (?, ?, ?, ?, ?)',
                [ip, ua, pathname, referrer, isBot]
            ).catch(e => console.error('[Traffic Log Error]:', e));
        }

        return { settings };
    } catch (e) {
        console.error('[Layout Load Error]:', e);
        return { settings: {} };
    }
};
