import Database from 'better-sqlite3';

const db = new Database('portfolio.sqlite');

// Initialise the table if it doesn't exist
db.exec(`
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

try {
    db.exec('ALTER TABLE projects ADD COLUMN featured INTEGER DEFAULT 0');
} catch (e) {
    // Column already exists
}

export default db;
