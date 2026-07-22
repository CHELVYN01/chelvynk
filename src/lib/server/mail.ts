import { env } from '$env/dynamic/private';

/**
 * Pengirim email via Resend HTTP API (tanpa dependency tambahan, cukup fetch).
 *
 * Bersifat OPSIONAL: kalau RESEND_API_KEY / CONTACT_TO_EMAIL belum diisi di .env,
 * fungsi ini tidak error — cuma return false. Pemanggilnya tetap menyimpan pesan
 * ke database, jadi pesan klien tidak pernah hilang walau email gagal terkirim.
 */

/** Escape HTML supaya isi pesan klien tidak bisa inject markup ke email kita. */
function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export interface ContactMailPayload {
    name: string;
    email: string;
    subject: string;
    message: string;
}

export async function sendContactEmail(payload: ContactMailPayload): Promise<boolean> {
    const apiKey = env.RESEND_API_KEY;
    const to = env.CONTACT_TO_EMAIL;
    // Domain pengirim harus terverifikasi di Resend. Default 'onboarding@resend.dev'
    // hanya bisa mengirim ke email pemilik akun Resend (cukup untuk testing).
    const from = env.CONTACT_FROM_EMAIL || 'Portfolio <onboarding@resend.dev>';

    if (!apiKey || !to) {
        console.warn('[Mail] RESEND_API_KEY / CONTACT_TO_EMAIL belum diset — email dilewati, pesan tetap tersimpan di DB.');
        return false;
    }

    const name = escapeHtml(payload.name);
    const email = escapeHtml(payload.email);
    const subject = escapeHtml(payload.subject || 'Tanpa subjek');
    const message = escapeHtml(payload.message).replace(/\n/g, '<br>');

    const html = `
        <div style="font-family: system-ui, sans-serif; line-height: 1.6; color: #1f2937;">
          <h2 style="color:#f97316; margin-bottom: 4px;">Pesan Baru dari Portfolio</h2>
          <p style="margin-top:0; color:#6b7280;">Dikirim lewat form kontak chelvynkleden.com</p>
          <table style="border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding:4px 12px 4px 0;"><b>Nama</b></td><td>${name}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;"><b>Email</b></td><td>${email}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;"><b>Subjek</b></td><td>${subject}</td></tr>
          </table>
          <div style="background:#f9fafb; border-left:3px solid #f97316; padding:12px 16px; border-radius:4px;">
            ${message}
          </div>
        </div>
    `;

    try {
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from,
                to: [to],
                // reply_to diisi email pengirim -> tinggal tekan "Reply" untuk balas klien.
                reply_to: payload.email,
                subject: `[Portfolio] ${payload.subject || 'Pesan baru'} — ${payload.name}`,
                html
            })
        });

        if (!res.ok) {
            console.error('[Mail] Gagal kirim email:', res.status, await res.text());
            return false;
        }

        return true;
    } catch (e) {
        console.error('[Mail] Error saat kirim email:', e);
        return false;
    }
}
