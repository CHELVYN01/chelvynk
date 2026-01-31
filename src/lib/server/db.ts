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