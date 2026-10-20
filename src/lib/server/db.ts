import { createClient } from '@libsql/client';
import { env } from '$env/dynamic/private';

let _client: any = null;
let _initialized = false;
let _initPromise: Promise<void> | null = null;

// NAIKKAN angka ini setiap kali menambah tabel/kolom/default di init().
// Kalau versi di DB sudah sama, init() cuma jalan 1 query (bukan ~20) di setiap
// cold start — penting karena tiap query = 1 round-trip ke Turso.
const SCHEMA_VERSION = '3';

// Fungsi untuk ambil client (Lazy Load ENV)
function getClient() {
    if (_client) return _client;

    const url = env.DATABASE_URL || 'file:portfolio.sqlite';
    const authToken = env.DATABASE_AUTH_TOKEN;

    console.log(`[DB] Connecting to: ${url.startsWith('libsql') ? 'Turso Cloud' : 'Local SQLite'}`);

    _client = createClient({
        url: url,
        authToken: authToken
    });
    return _client;
}

const TABLES = [
    `CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        tech TEXT NOT NULL,
        link TEXT NOT NULL,
        github TEXT,
        demo TEXT,
        featured INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
    )`,

    `CREATE TABLE IF NOT EXISTS experiences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        period TEXT NOT NULL,
        role TEXT NOT NULL,
        company TEXT NOT NULL,
        start_date TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS store_apps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        developer TEXT NOT NULL,
        description TEXT NOT NULL,
        icon_url TEXT NOT NULL,
        download_url TEXT NOT NULL,
        version TEXT,
        size TEXT,
        featured INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS traffic (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ip TEXT,
        ua TEXT,
        path TEXT,
        referrer TEXT,
        is_bot INTEGER DEFAULT 0,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // Link review unik per klien. token = string random unguessable (bukan angka urut, cegah IDOR).
    `CREATE TABLE IF NOT EXISTS review_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        token TEXT NOT NULL UNIQUE,
        client_name TEXT NOT NULL,
        project_name TEXT NOT NULL,
        used INTEGER DEFAULT 0,
        expires_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // Hasil review dari klien. status: pending -> approved/rejected (moderasi admin).
    `CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        token_id INTEGER NOT NULL,
        rating INTEGER NOT NULL,
        testimonial TEXT NOT NULL,
        reviewer_name TEXT NOT NULL,
        reviewer_role TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // Pesan masuk dari form kontak di halaman depan.
    // Email pribadi tidak ditampilkan di HTML -> tidak bisa di-scrape bot.
    `CREATE TABLE IF NOT EXISTS contact_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT,
        message TEXT NOT NULL,
        ip TEXT,
        is_read INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // Sertifikat untuk halaman /certificates. File tidak di-upload (filesystem
    // serverless read-only) — cukup link verifikasi & link gambar (opsional).
    // issued_at = 'YYYY-MM' dari <input type="month">, dipakai untuk urutan.
    `CREATE TABLE IF NOT EXISTS certificates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        issuer TEXT NOT NULL,
        issued_at TEXT,
        credential_id TEXT,
        credential_url TEXT,
        image_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // Produk buatan sendiri untuk /products dan /products/[slug].
    // features = satu poin per baris; tags = dipisah koma.
    `CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        tagline TEXT NOT NULL,
        problem TEXT,
        solution TEXT,
        description TEXT,
        features TEXT,
        tags TEXT,
        status TEXT,
        github_url TEXT,
        link_url TEXT,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
];

// Produk pertama. Hanya dimasukkan sekali (saat schema naik ke v3) dan
// tidak menimpa apa pun kalau slug 'kancil' sudah ada.
const SEED_PRODUCTS = [
    {
        sql: `INSERT INTO products (slug, name, tagline, problem, solution, tags, sort_order)
              SELECT ?, ?, ?, ?, ?, ?, ?
              WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = ?)`,
        args: [
            'kancil',
            'Kancil',
            'Aturan kerja (skill) yang membantu model AI kecil menyelesaikan tugas coding sungguhan.',
            'Model AI kecil biasanya tahu langkah yang benar, tapi gagal menuntaskannya.',
            'Kancil menutup celah itu tanpa mengganti modelnya.',
            'AI, Skill, Coding',
            1,
            'kancil'
        ]
    }
];

// Dijalankan satu per satu karena error "duplicate column" (kolom sudah ada) itu normal.
const MIGRATIONS = [
    'ALTER TABLE projects ADD COLUMN github TEXT',
    'ALTER TABLE projects ADD COLUMN demo TEXT',
    'ALTER TABLE experiences ADD COLUMN start_date TEXT',
    // Kaitkan link review ke project tertentu (opsional).
    // project_name tetap dipertahankan sebagai fallback: token lama tidak
    // punya project_id, dan admin masih boleh mengetik nama project manual
    // untuk pekerjaan yang belum terdaftar di tabel projects.
    'ALTER TABLE review_tokens ADD COLUMN project_id INTEGER'
];

async function schemaUpToDate(client: any) {
    try {
        const r = await client.execute("SELECT value FROM settings WHERE key = 'schema_version'");
        return r.rows[0]?.value === SCHEMA_VERSION;
    } catch {
        // Tabel settings belum ada (DB baru) -> perlu init penuh.
        return false;
    }
}

// Inisialisasi Tabel
async function init() {
    const client = getClient();
    try {
        if (await schemaUpToDate(client)) {
            _initialized = true;
            return;
        }

        console.log('[DB] Initializing tables...');
        // batch = semua statement dikirim dalam 1 request ke Turso.
        await client.batch(TABLES, 'write');

        console.log('[DB] Checking migrations...');
        for (const sql of MIGRATIONS) {
            try {
                await client.execute(sql);
                console.log(`[DB] Migration: ${sql}`);
            } catch (e) { }
        }

        // Default status & social links (INSERT OR IGNORE = tidak menimpa nilai yang sudah diisi admin),
        // lalu tandai schema sudah versi terbaru.
        await client.batch([
            "INSERT OR IGNORE INTO settings (key, value) VALUES ('status', 'Tersedia untuk Project Baru')",
            "INSERT OR IGNORE INTO settings (key, value) VALUES ('github', '#')",
            "INSERT OR IGNORE INTO settings (key, value) VALUES ('linkedin', '#')",
            "INSERT OR IGNORE INTO settings (key, value) VALUES ('twitter', '#')",
            ...SEED_PRODUCTS,
            { sql: "INSERT OR REPLACE INTO settings (key, value) VALUES ('schema_version', ?)", args: [SCHEMA_VERSION] }
        ], 'write');

        _initialized = true;
        console.log('[DB] Database initialized successfully');
    } catch (e) {
        console.error('[DB] Initialization error:', e);
        // Biarkan request berikutnya mencoba init lagi.
        _initPromise = null;
    }
}

export const db = {
    async execute(sql: string, args?: any[]) {
        const client = getClient();

        // Pastikan inisialisasi jalan sekali
        if (!_initialized) {
            if (!_initPromise) {
                _initPromise = init();
            }
            await _initPromise;
        }

        return await client.execute({ sql, args: args || [] });
    }
};

export default db;
