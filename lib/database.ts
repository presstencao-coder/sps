import sqlite3 from "sqlite3"
import { open, type Database } from "sqlite"
import path from "path"
import fs from "fs"
import { hashPassword } from "./encryption"

let db: Database | null = null

export async function getDatabase(): Promise<Database> {
  if (db) {
    return db
  }

  const dbType = process.env.DB_TYPE || "sqlite"

  try {
    switch (dbType) {
      case "sqlite":
        // Use /tmp directory in serverless environments like Vercel
        const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
        const dbPath = isServerless
          ? "/tmp/password_manager.db"
          : process.env.SQLITE_PATH || "./data/password_manager.db"

        console.log(`🔗 Conectando ao SQLite: ${dbPath}`)

        // Ensure directory exists for local development
        if (!isServerless) {
          const dbDir = path.dirname(dbPath)
          if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true })
          }
        }

        db = await open({
          filename: dbPath,
          driver: sqlite3.Database,
        })

        // Habilitar foreign keys
        await db.exec("PRAGMA foreign_keys = ON")

        // Initialize tables and data
        await initializeDatabase()

        console.log("✅ Conectado ao SQLite com sucesso!")
        break

      case "postgres":
        throw new Error("PostgreSQL será implementado em breve")

      case "mysql":
        throw new Error("MySQL será implementado em breve")

      case "mongodb":
        throw new Error("MongoDB será implementado em breve")

      case "sqlserver":
        throw new Error("SQL Server será implementado em breve")

      default:
        throw new Error(`Tipo de banco não suportado: ${dbType}`)
    }

    return db
  } catch (error) {
    console.error("❌ Erro ao conectar com o banco:", error)
    throw error
  }
}

async function initializeDatabase() {
  if (!db) return

  try {
    // Create users table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        two_factor_secret TEXT,
        two_factor_enabled BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create passwords table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS passwords (
        id TEXT PRIMARY KEY,
        user_id TEXT DEFAULT 'user-1',
        title TEXT NOT NULL,
        username TEXT NOT NULL,
        encrypted_password TEXT NOT NULL,
        url TEXT,
        category TEXT NOT NULL DEFAULT 'other',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `)

    // Create sessions table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `)

    // Create indexes
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_passwords_user_id ON passwords(user_id);
      CREATE INDEX IF NOT EXISTS idx_passwords_category ON passwords(category);
      CREATE INDEX IF NOT EXISTS idx_passwords_title ON passwords(title);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
      CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
    `)

    // Check if admin user exists
    const existingUser = await db.get("SELECT id FROM users WHERE email = ?", ["admin@example.com"])

    if (!existingUser) {
      // Insert admin user (password: admin123)
      const adminPasswordHash = hashPassword("admin123")

      await db.run(
        `
        INSERT INTO users (id, name, email, password_hash, two_factor_enabled, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `,
        ["user-1", "Administrador", "admin@example.com", adminPasswordHash, 0],
      )

      // Insert sample passwords
      const samplePasswords = [
        {
          id: "pass-1",
          title: "Gmail",
          username: "admin@gmail.com",
          password: "MySecureGmailPass123!",
          url: "https://gmail.com",
          category: "email",
          notes: "Personal email account",
        },
        {
          id: "pass-2",
          title: "Facebook",
          username: "admin@example.com",
          password: "FacebookSecure456!",
          url: "https://facebook.com",
          category: "social",
          notes: "Social media account",
        },
        {
          id: "pass-3",
          title: "Banco do Brasil",
          username: "admin123",
          password: "BankSecure789!",
          url: "https://bb.com.br",
          category: "finance",
          notes: "Banking account - handle with care",
        },
      ]

      for (const pwd of samplePasswords) {
        // Simple base64 encoding for demo
        const encryptedPassword = Buffer.from(pwd.password).toString("base64")

        await db.run(
          `
          INSERT INTO passwords (id, user_id, title, username, encrypted_password, url, category, notes, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `,
          [pwd.id, "user-1", pwd.title, pwd.username, encryptedPassword, pwd.url, pwd.category, pwd.notes],
        )
      }

      console.log("✅ Dados iniciais criados com sucesso!")
    }

    console.log("✅ Banco de dados inicializado!")
  } catch (error) {
    console.error("❌ Erro ao inicializar banco:", error)
    throw error
  }
}

// User operations
export async function createUser(name: string, email: string, passwordHash: string): Promise<string> {
  const database = await getDatabase()
  const userId = `user-${Date.now()}`

  await database.run(
    "INSERT INTO users (id, name, email, password_hash, two_factor_enabled, created_at, updated_at) VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))",
    [userId, name, email, passwordHash, 0],
  )

  return userId
}

export async function getUserByEmail(email: string) {
  const database = await getDatabase()
  return await database.get("SELECT * FROM users WHERE email = ?", [email])
}

export async function getUserById(id: string) {
  const database = await getDatabase()
  return await database.get("SELECT * FROM users WHERE id = ?", [id])
}

export async function updateUser2FA(userId: string, secret: string, enabled: boolean) {
  const database = await getDatabase()
  return await database.run(
    "UPDATE users SET two_factor_secret = ?, two_factor_enabled = ?, updated_at = datetime('now') WHERE id = ?",
    [secret, enabled ? 1 : 0, userId],
  )
}

// Password operations
export async function createPassword(
  userId: string,
  title: string,
  username: string,
  encryptedPassword: string,
  url?: string,
  notes?: string,
  category = "other",
): Promise<string> {
  const database = await getDatabase()
  const passwordId = `pass-${Date.now()}`

  await database.run(
    "INSERT INTO passwords (id, user_id, title, username, encrypted_password, url, category, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))",
    [passwordId, userId, title, username, encryptedPassword, url || null, category, notes || null],
  )

  return passwordId
}

export async function getPasswordsByUserId(userId: string) {
  const database = await getDatabase()
  return await database.all("SELECT * FROM passwords WHERE user_id = ? ORDER BY created_at DESC", [userId])
}

export async function getPasswordById(id: string, userId: string) {
  const database = await getDatabase()
  return await database.get("SELECT * FROM passwords WHERE id = ? AND user_id = ?", [id, userId])
}

export async function updatePassword(
  id: string,
  userId: string,
  title: string,
  username: string,
  encryptedPassword: string,
  url?: string,
  notes?: string,
  category = "other",
) {
  const database = await getDatabase()
  return await database.run(
    "UPDATE passwords SET title = ?, username = ?, encrypted_password = ?, url = ?, category = ?, notes = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?",
    [title, username, encryptedPassword, url || null, category, notes || null, id, userId],
  )
}

export async function deletePassword(id: string, userId: string) {
  const database = await getDatabase()
  return await database.run("DELETE FROM passwords WHERE id = ? AND user_id = ?", [id, userId])
}

// Session operations
export async function createSession(userId: string, token: string, expiresAt: Date): Promise<string> {
  const database = await getDatabase()
  const sessionId = `session-${Date.now()}`

  await database.run(
    "INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES (?, ?, ?, ?, datetime('now'))",
    [sessionId, userId, token, expiresAt.toISOString()],
  )

  return sessionId
}

export async function getSessionByToken(token: string) {
  const database = await getDatabase()
  return await database.get("SELECT * FROM sessions WHERE token = ? AND expires_at > datetime('now')", [token])
}

export async function deleteSession(token: string) {
  const database = await getDatabase()
  return await database.run("DELETE FROM sessions WHERE token = ?", [token])
}

export async function deleteExpiredSessions() {
  const database = await getDatabase()
  return await database.run("DELETE FROM sessions WHERE expires_at <= datetime('now')")
}

export async function closeDatabase() {
  if (db) {
    await db.close()
    db = null
    console.log("🔌 Conexão com banco fechada")
  }
}
