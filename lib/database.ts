import Database from "better-sqlite3"
import { join } from "path"
import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from "uuid"

interface User {
  id: number
  name: string
  email: string
  password: string
  two_factor_secret?: string
  two_factor_enabled: boolean
  created_at: string
  updated_at: string
}

interface Password {
  id: string
  user_id: number
  title: string
  username: string
  password: string
  url?: string
  category: string
  notes?: string
  created_at: string
  updated_at: string
}

interface Session {
  id: string
  user_id: number
  token: string
  expires_at: string
  created_at: string
}

const dbPath = process.env.SQLITE_PATH || join(process.cwd(), "database.sqlite")
let db: Database.Database | null = null

export function getDatabase() {
  if (!db) {
    db = new Database(dbPath)
    db.pragma("journal_mode = WAL")
  }
  return db
}

export function closeDatabase() {
  if (db) {
    db.close()
    db = null
  }
}

// Initialize with demo data
function initializeDatabase() {
  const db = getDatabase()
  db.serialize(() => {
    db.run(
      "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT, password TEXT, two_factor_secret TEXT, two_factor_enabled INTEGER, created_at TEXT, updated_at TEXT)",
    )
    db.run(
      "CREATE TABLE IF NOT EXISTS passwords (id TEXT PRIMARY KEY, user_id INTEGER, title TEXT, username TEXT, password TEXT, url TEXT, category TEXT, notes TEXT, created_at TEXT, updated_at TEXT)",
    )
    db.run(
      "CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, user_id INTEGER, token TEXT, expires_at TEXT, created_at TEXT)",
    )

    const adminUserStmt = db.prepare(
      "INSERT INTO users (name, email, password, two_factor_enabled, created_at, updated_at) VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))",
    )
    const adminUser = {
      name: "Administrador",
      email: "admin@example.com",
      password: bcrypt.hashSync("admin123", 10),
      two_factor_enabled: 0,
    }
    adminUserStmt.run(adminUser.name, adminUser.email, adminUser.password, adminUser.two_factor_enabled)
    adminUserStmt.finalize()
    console.log("Usuário admin criado:", adminUser.email)

    const samplePasswordsStmt = db.prepare(`
      INSERT INTO passwords (id, user_id, title, username, password, url, category, notes, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `)
    const samplePasswords: Password[] = [
      {
        id: "1",
        user_id: 1,
        title: "Gmail",
        username: "admin@gmail.com",
        password: Buffer.from("MySecureGmailPass123!").toString("base64"),
        url: "https://gmail.com",
        category: "email",
        notes: "Personal email account",
      },
      {
        id: "2",
        user_id: 1,
        title: "Facebook",
        username: "admin@example.com",
        password: Buffer.from("FacebookSecure456!").toString("base64"),
        url: "https://facebook.com",
        category: "social",
        notes: "Social media account",
      },
      {
        id: "3",
        user_id: 1,
        title: "Banco do Brasil",
        username: "admin123",
        password: Buffer.from("BankSecure789!").toString("base64"),
        url: "https://bb.com.br",
        category: "banking",
        notes: "Banking account - handle with care",
      },
      {
        id: "4",
        user_id: 1,
        title: "GitHub",
        username: "admin-dev",
        password: Buffer.from("GitHubDev2024!").toString("base64"),
        url: "https://github.com",
        category: "work",
        notes: "Development repositories",
      },
      {
        id: "5",
        user_id: 1,
        title: "AWS Console",
        username: "admin@company.com",
        password: Buffer.from("AWSSecure2024!").toString("base64"),
        url: "https://aws.amazon.com",
        category: "work",
        notes: "Cloud infrastructure management",
      },
    ]

    samplePasswords.forEach((password) => {
      samplePasswordsStmt.run(
        password.id,
        password.user_id,
        password.title,
        password.username,
        password.password,
        password.url,
        password.category,
        password.notes,
      )
    })
    samplePasswordsStmt.finalize()
    console.log(`${samplePasswords.length} senhas de exemplo criadas`)
  })
}

// Initialize database
initializeDatabase()

// User operations
export function getUserByEmail(email: string) {
  const db = getDatabase()
  return db.prepare("SELECT * FROM users WHERE email = ?").get(email)
}

export function getUserById(id: string) {
  const db = getDatabase()
  return db.prepare("SELECT * FROM users WHERE id = ?").get(id)
}

export function createUser(user: { id: string; name: string; email: string; password: string }) {
  const db = getDatabase()
  return db
    .prepare('INSERT INTO users (id, name, email, password, created_at) VALUES (?, ?, ?, ?, datetime("now"))')
    .run(user.id, user.name, user.email, user.password)
}

export function updateUser(
  id: string,
  updates: {
    name?: string
    email?: string
    two_factor_secret?: string
    two_factor_enabled?: boolean
    temp_two_factor_secret?: string
  },
) {
  const db = getDatabase()
  const fields = []
  const values = []

  if (updates.name !== undefined) {
    fields.push("name = ?")
    values.push(updates.name)
  }
  if (updates.email !== undefined) {
    fields.push("email = ?")
    values.push(updates.email)
  }
  if (updates.two_factor_secret !== undefined) {
    fields.push("two_factor_secret = ?")
    values.push(updates.two_factor_secret)
  }
  if (updates.two_factor_enabled !== undefined) {
    fields.push("two_factor_enabled = ?")
    values.push(updates.two_factor_enabled ? 1 : 0)
  }
  if (updates.temp_two_factor_secret !== undefined) {
    fields.push("temp_two_factor_secret = ?")
    values.push(updates.temp_two_factor_secret)
  }

  if (fields.length === 0) return

  values.push(id)
  return db.prepare(`UPDATE users SET ${fields.join(", ")}, updated_at = datetime("now") WHERE id = ?`).run(...values)
}

export function updateUserPassword(id: string, hashedPassword: string) {
  const db = getDatabase()
  return db.prepare('UPDATE users SET password = ?, updated_at = datetime("now") WHERE id = ?').run(hashedPassword, id)
}

// Password operations
export function getPasswordsByUserId(userId: string) {
  const db = getDatabase()
  return db.prepare("SELECT * FROM passwords WHERE user_id = ? ORDER BY updated_at DESC").all(userId)
}

export function getPasswordById(id: string, userId: string) {
  const db = getDatabase()
  return db.prepare("SELECT * FROM passwords WHERE id = ? AND user_id = ?").get(id, userId)
}

export function createPassword(password: {
  id: string
  user_id: string
  title: string
  username: string
  password: string
  url?: string
  category: string
  notes?: string
}) {
  const db = getDatabase()
  return db
    .prepare(`
    INSERT INTO passwords (id, user_id, title, username, password, url, category, notes, created_at, updated_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime("now"), datetime("now"))
  `)
    .run(
      password.id,
      password.user_id,
      password.title,
      password.username,
      password.password,
      password.url || null,
      password.category,
      password.notes || null,
    )
}

export function updatePassword(
  id: string,
  userId: string,
  updates: { title?: string; username?: string; password?: string; url?: string; category?: string; notes?: string },
) {
  const db = getDatabase()
  const fields = []
  const values = []

  if (updates.title !== undefined) {
    fields.push("title = ?")
    values.push(updates.title)
  }
  if (updates.username !== undefined) {
    fields.push("username = ?")
    values.push(updates.username)
  }
  if (updates.password !== undefined) {
    fields.push("password = ?")
    values.push(updates.password)
  }
  if (updates.url !== undefined) {
    fields.push("url = ?")
    values.push(updates.url || null)
  }
  if (updates.category !== undefined) {
    fields.push("category = ?")
    values.push(updates.category)
  }
  if (updates.notes !== undefined) {
    fields.push("notes = ?")
    values.push(updates.notes || null)
  }

  if (fields.length === 0) return

  values.push(id, userId)
  return db
    .prepare(`UPDATE passwords SET ${fields.join(", ")}, updated_at = datetime("now") WHERE id = ? AND user_id = ?`)
    .run(...values)
}

export function deletePassword(id: string, userId: string) {
  const db = getDatabase()
  return db.prepare("DELETE FROM passwords WHERE id = ? AND user_id = ?").run(id, userId)
}

// Session operations
export async function createSession(userId: number, token: string, expiresAt: Date): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const db = getDatabase()
    db.run(
      "INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES (?, ?, ?, ?, ?)",
      [uuidv4(), userId, token, expiresAt.toISOString(), new Date().toISOString()],
      function (err) {
        if (err) {
          reject(err)
        } else {
          resolve(this.lastID)
        }
      },
    )
  })
}

export async function getSessionByToken(token: string): Promise<any | null> {
  return new Promise(async (resolve, reject) => {
    const db = getDatabase()
    const now = new Date()
    db.get("SELECT * FROM sessions WHERE token = ? AND expires_at > ?", [token, now.toISOString()], (err, row) => {
      if (err) {
        reject(err)
      } else {
        resolve(row)
      }
    })
  })
}

export async function deleteSession(token: string): Promise<void> {
  return new Promise(async (resolve, reject) => {
    const db = getDatabase()
    db.run("DELETE FROM sessions WHERE token = ?", [token], (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

export async function deleteExpiredSessions(): Promise<void> {
  return new Promise(async (resolve, reject) => {
    const db = getDatabase()
    const now = new Date()
    db.run("DELETE FROM sessions WHERE expires_at <= ?", [now.toISOString()], (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}
