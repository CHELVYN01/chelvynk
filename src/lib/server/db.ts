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
        await client.execute(`
          CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            description TEXT NOT NULL,
            tech TEXT NOT NULL,
            link TEXT NOT NULL,
            featured INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);
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