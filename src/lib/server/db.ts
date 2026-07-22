import { createClient } from '@libsql/client';
import { env } from '$env/dynamic/private';

let _client: any = null;
let _initialized = false;
let _initPromise: Promise<void> | null = null;

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

// Inisialisasi Tabel
async function init() {
    const client = getClient();
    try {
        console.log('[DB] Initializing tables...');

        await client.execute(`
          CREATE TABLE IF NOT EXISTS projects (
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
          )
        `);

        await client.execute(`
          CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
          )
        `);

        await client.execute(`
          CREATE TABLE IF NOT EXISTS experiences (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            period TEXT NOT NULL,
            role TEXT NOT NULL,
            company TEXT NOT NULL,
            start_date TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        await client.execute(`
          CREATE TABLE IF NOT EXISTS store_apps (
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
          )
        `);

        await client.execute(`
          CREATE TABLE IF NOT EXISTS traffic (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ip TEXT,
            ua TEXT,
            path TEXT,
            referrer TEXT,
            is_bot INTEGER DEFAULT 0,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Link review unik per klien. token = string random unguessable (bukan angka urut, cegah IDOR).
        await client.execute(`
          CREATE TABLE IF NOT EXISTS review_tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            token TEXT NOT NULL UNIQUE,
            client_name TEXT NOT NULL,
            project_name TEXT NOT NULL,
            used INTEGER DEFAULT 0,
            expires_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Hasil review dari klien. status: pending -> approved/rejected (moderasi admin).
        await client.execute(`
          CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            token_id INTEGER NOT NULL,
            rating INTEGER NOT NULL,
            testimonial TEXT NOT NULL,
            reviewer_name TEXT NOT NULL,
            reviewer_role TEXT,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Pesan masuk dari form kontak di halaman depan.
        // Email pribadi tidak ditampilkan di HTML -> tidak bisa di-scrape bot.
        await client.execute(`
          CREATE TABLE IF NOT EXISTS contact_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            subject TEXT,
            message TEXT NOT NULL,
            ip TEXT,
            is_read INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Migrations
        console.log('[DB] Checking migrations...');
        try {
            await client.execute("ALTER TABLE projects ADD COLUMN github TEXT");
            console.log('[DB] Migration: Added github column');
        } catch (e) { }

        try {
            await client.execute("ALTER TABLE projects ADD COLUMN demo TEXT");
            console.log('[DB] Migration: Added demo column');
        } catch (e) { }

        try {
            await client.execute("ALTER TABLE experiences ADD COLUMN start_date TEXT");
        } catch (e) { }

        // Kaitkan link review ke project tertentu (opsional).
        // project_name tetap dipertahankan sebagai fallback: token lama tidak
        // punya project_id, dan admin masih boleh mengetik nama project manual
        // untuk pekerjaan yang belum terdaftar di tabel projects.
        try {
            await client.execute("ALTER TABLE review_tokens ADD COLUMN project_id INTEGER");
            console.log('[DB] Migration: Added project_id column to review_tokens');
        } catch (e) { }

        // Insert default status if not exists
        const checkStatus = await client.execute("SELECT key FROM settings WHERE key = 'status'");
        if (checkStatus.rows.length === 0) {
            await client.execute("INSERT INTO settings (key, value) VALUES ('status', 'Tersedia untuk Project Baru')");
        }

        // Default Social Links
        const socialKeys = ['github', 'linkedin', 'twitter'];
        for (const key of socialKeys) {
            const check = await client.execute("SELECT key FROM settings WHERE key = ?", [key]);
            if (check.rows.length === 0) {
                await client.execute("INSERT INTO settings (key, value) VALUES (?, ?)", [key, '#']);
            }
        }

        _initialized = true;
        console.log('[DB] Database initialized successfully');
    } catch (e) {
        console.error('[DB] Initialization error:', e);
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