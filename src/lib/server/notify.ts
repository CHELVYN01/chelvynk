import { env } from '$env/dynamic/private';

/**
 * Notifikasi instan ke Telegram lewat Bot API (cukup fetch, tanpa dependency).
 *
 * Sama seperti mail.ts: OPSIONAL. Kalau TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID
 * belum diisi di .env, fungsi ini cuma return false — tidak melempar error.
 * Pesan klien sudah tersimpan di DB sebelum ini dipanggil, jadi tidak ada
 * yang hilang walau notifikasi gagal.
 */

/**
 * Escape karakter khusus MarkdownV2 Telegram.
 * Wajib: kalau klien mengetik '_' atau '*', pesan bisa ditolak API (400)
 * atau merusak format — dan itu berarti notifikasi tidak masuk sama sekali.
 */
function escapeMdV2(value: string): string {
    return value.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, '\\$&');
}

/** Potong teks panjang — limit pesan Telegram 4096 karakter. */
function truncate(value: string, max: number): string {
    return value.length > max ? value.slice(0, max) + '…' : value;
}

export interface ContactNotifyPayload {
    name: string;
    email: string;
    subject: string;
    message: string;
}

export async function sendTelegramNotif(payload: ContactNotifyPayload): Promise<boolean> {
    const token = env.TELEGRAM_BOT_TOKEN;
    const chatId = env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
        console.warn('[Notify] TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID belum diset — notifikasi dilewati.');
        return false;
    }

    const name = escapeMdV2(payload.name);
    const email = escapeMdV2(payload.email);
    const subject = escapeMdV2(payload.subject || 'Tanpa subjek');
    const message = escapeMdV2(truncate(payload.message, 2500));

    const text = [
        '🔔 *Pesan Baru dari Portfolio*',
        '',
        `👤 *Nama:* ${name}`,
        `📧 *Email:* ${email}`,
        `📌 *Subjek:* ${subject}`,
        '',
        `💬 ${message}`
    ].join('\n');

    try {
        const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text,
                parse_mode: 'MarkdownV2',
                disable_web_page_preview: true
            })
        });

        if (!res.ok) {
            console.error('[Notify] Gagal kirim notifikasi Telegram:', res.status, await res.text());
            return false;
        }

        return true;
    } catch (e) {
        console.error('[Notify] Error saat kirim notifikasi Telegram:', e);
        return false;
    }
}
