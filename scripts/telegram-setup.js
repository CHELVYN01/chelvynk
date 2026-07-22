/**
 * Helper sekali pakai untuk setup notifikasi Telegram.
 *
 * Cara pakai:
 *   1. Buat bot: chat @BotFather di Telegram -> /newbot -> salin token
 *   2. Isi TELEGRAM_BOT_TOKEN di .env
 *   3. PENTING: chat dulu bot kamu (tekan Start / kirim "halo").
 *      Bot tidak bisa mengirim pesan duluan ke orang yang belum pernah chat.
 *   4. Jalankan:  node scripts/telegram-setup.js
 *
 * Skrip ini membaca update terakhir bot, menampilkan chat_id kamu,
 * lalu mengirim pesan tes untuk memastikan notifikasi benar-benar masuk HP.
 */

import { readFileSync } from 'node:fs';

function loadEnv() {
    try {
        return Object.fromEntries(
            readFileSync('.env', 'utf8')
                .split('\n')
                .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
                .map((l) => {
                    const i = l.indexOf('=');
                    return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
                })
        );
    } catch {
        console.error('Tidak bisa membaca .env — jalankan skrip ini dari root project.');
        process.exit(1);
    }
}

const env = loadEnv();
const token = env.TELEGRAM_BOT_TOKEN;

if (!token) {
    console.error('TELEGRAM_BOT_TOKEN belum ada di .env. Buat bot lewat @BotFather dulu.');
    process.exit(1);
}

// offset=-10 -> baca 10 update TERAKHIR tanpa menandainya sudah dikonsumsi.
// Tanpa ini, sekali dibaca update-nya hilang dan skrip berikutnya dapat kosong.
const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates?offset=-10`);
const data = await res.json();

if (!data.ok) {
    console.error('Token ditolak Telegram:', data.description);
    process.exit(1);
}

const chats = new Map();
for (const u of data.result) {
    const chat = u.message?.chat || u.channel_post?.chat;
    if (chat) chats.set(chat.id, chat);
}

if (chats.size === 0) {
    console.log('Belum ada chat terdeteksi.');
    console.log('Buka Telegram, cari bot kamu, tekan START atau kirim "halo", lalu jalankan skrip ini lagi.');
    process.exit(0);
}

console.log('\nChat yang terdeteksi:\n');
for (const chat of chats.values()) {
    const label = chat.username ? `@${chat.username}` : [chat.first_name, chat.last_name].filter(Boolean).join(' ');
    console.log(`  chat_id: ${chat.id}   (${chat.type}${label ? ' — ' + label : ''})`);
}

const chatId = env.TELEGRAM_CHAT_ID || [...chats.keys()][0];
console.log(`\nMengirim pesan tes ke chat_id ${chatId}...`);

const send = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        chat_id: chatId,
        text: '✅ Notifikasi portfolio aktif. Kalau kamu baca ini di HP, setup sudah benar.'
    })
});
const sendResult = await send.json();

if (sendResult.ok) {
    console.log('Terkirim! Cek HP kamu.');
    if (!env.TELEGRAM_CHAT_ID) {
        console.log(`\nTambahkan baris ini ke .env:\n  TELEGRAM_CHAT_ID=${chatId}\n`);
    }
} else {
    console.error('Gagal mengirim:', sendResult.description);
}
