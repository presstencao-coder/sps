import sqlite3 from "sqlite3"
import { open, type Database } from "sqlite"
import path from "path"
import fs from "fs"

let db: Database | null = null

export async function getDatabase(): Promise<Database> {
  if (db) {
    return db
  }

  // Ensure the data directory exists
  const dataDir = path.join(process.cwd(), "data")
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  const dbPath = process.env.SQLITE_PATH || path.join(dataDir, "password_manager.db")

  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    // Enable foreign keys
    await db.exec("PRAGMA foreign_keys = ON")

    // Create tables if they don't exist
    await createTables()

    console.log("Database connected successfully")
    return db
  } catch (error) {
    console.error("Database connection error:", error)
    throw error
  }
}

async function createTables() {
  if (!db) return

  try {
    // Create users table
    await db.exec(`
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
    await db.exec(`
      CREATE TABLE IF NOT EXISTS passwords (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        username TEXT,
        encrypted_password TEXT NOT NULL,
        url TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `)

    // Create indexes for better performance
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_passwords_user_id ON passwords(user_id);
    `)

    console.log("Database tables created successfully")
  } catch (error) {
    console.error("Error creating tables:", error)
    throw error
  }
}

export async function closeDatabase() {
  if (db) {
    await db.close()
    db = null
  }
}

// Initialize database on module load
if (typeof window === "undefined") {
  getDatabase().catch(console.error)
}
