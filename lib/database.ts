import Database from "better-sqlite3"
import path from "path"
import fs from "fs"

const dbPath = process.env.SQLITE_PATH || path.join(process.cwd(), "data", "passwords.db")

// Ensure the data directory exists
const dataDir = path.dirname(dbPath)
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

let db: Database.Database

export function getDatabase() {
  if (!db) {
    db = new Database(dbPath)
    db.pragma("journal_mode = WAL")

    // Create tables if they don't exist
    createTables()
  }
  return db
}

function createTables() {
  const db = getDatabase()

  // Create users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      two_factor_secret TEXT,
      two_factor_enabled BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create passwords table
  db.exec(`
    CREATE TABLE IF NOT EXISTS passwords (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      username TEXT,
      password TEXT NOT NULL,
      url TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `)

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_passwords_user_id ON passwords(user_id);
  `)
}

export function closeDatabase() {
  if (db) {
    db.close()
  }
}

// Initialize database on import
getDatabase()
