import { v4 as uuidv4 } from "uuid"
import sqlite3 from "sqlite3"
import path from "path"
import bcrypt from "bcryptjs"

interface User {
  id: number
  name: string
  email: string
  password_hash: string
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
  encrypted_password: string
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

const DB_PATH = process.env.SQLITE_PATH || path.join(process.cwd(), "database.sqlite")

let db: sqlite3.Database | null = null

export function getDatabase(): sqlite3.Database {
  if (!db) {
    db = new sqlite3.Database(DB_PATH)
  }
  return db
}

// Initialize with demo data
function initializeDatabase() {
  const db = getDatabase()
  db.serialize(() => {
    db.run(
      "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT, password TEXT, two_factor_secret TEXT, two_factor_enabled INTEGER, created_at TEXT, updated_at TEXT)",
    )
    db.run(
      "CREATE TABLE IF NOT EXISTS passwords (id TEXT PRIMARY KEY, user_id INTEGER, title TEXT, username TEXT, encrypted_password TEXT, url TEXT, category TEXT, notes TEXT, created_at TEXT, updated_at TEXT)",
    )
    db.run(
      "CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, user_id INTEGER, token TEXT, expires_at TEXT, created_at TEXT)",
    )

    const adminUserStmt = db.prepare(
      "INSERT INTO users (name, email, password, two_factor_enabled, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
    )
    const adminUser = {
      name: "Administrador",
      email: "admin@example.com",
      password: bcrypt.hashSync("admin123", 10),
      two_factor_enabled: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    adminUserStmt.run(
      adminUser.name,
      adminUser.email,
      adminUser.password,
      adminUser.two_factor_enabled,
      adminUser.created_at,
      adminUser.updated_at,
    )
    adminUserStmt.finalize()
    console.log("Usuário admin criado:", adminUser.email)

    const samplePasswordsStmt = db.prepare(
      "INSERT INTO passwords (id, user_id, title, username, encrypted_password, url, category, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
    const samplePasswords: Password[] = [
      {
        id: uuidv4(),
        user_id: 1,
        title: "Gmail",
        username: "admin@gmail.com",
        encrypted_password: Buffer.from("MySecureGmailPass123!").toString("base64"),
        url: "https://gmail.com",
        category: "email",
        notes: "Personal email account",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        user_id: 1,
        title: "Facebook",
        username: "admin@example.com",
        encrypted_password: Buffer.from("FacebookSecure456!").toString("base64"),
        url: "https://facebook.com",
        category: "social",
        notes: "Social media account",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        user_id: 1,
        title: "Banco do Brasil",
        username: "admin123",
        encrypted_password: Buffer.from("BankSecure789!").toString("base64"),
        url: "https://bb.com.br",
        category: "banking",
        notes: "Banking account - handle with care",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        user_id: 1,
        title: "GitHub",
        username: "admin-dev",
        encrypted_password: Buffer.from("GitHubDev2024!").toString("base64"),
        url: "https://github.com",
        category: "work",
        notes: "Development repositories",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        user_id: 1,
        title: "AWS Console",
        username: "admin@company.com",
        encrypted_password: Buffer.from("AWSSecure2024!").toString("base64"),
        url: "https://aws.amazon.com",
        category: "work",
        notes: "Cloud infrastructure management",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]

    samplePasswords.forEach((password) => {
      samplePasswordsStmt.run(
        password.id,
        password.user_id,
        password.title,
        password.username,
        password.encrypted_password,
        password.url,
        password.category,
        password.notes,
        password.created_at,
        password.updated_at,
      )
    })
    samplePasswordsStmt.finalize()
    console.log(`${samplePasswords.length} senhas de exemplo criadas`)
  })
}

// Initialize database
initializeDatabase()

// User operations
export async function createUser(name: string, email: string, password: string): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const hashedPassword = await bcrypt.hash(password, 10)
      const db = getDatabase()

      db.run(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        [name, email, hashedPassword],
        function (err) {
          if (err) {
            reject(err)
          } else {
            resolve({ id: this.lastID, name, email })
          }
        },
      )
    } catch (error) {
      reject(error)
    }
  })
}

export async function getUserByEmail(email: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const db = getDatabase()
    db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
      if (err) {
        reject(err)
      } else {
        resolve(row)
      }
    })
  })
}

export async function getUserById(id: number): Promise<any> {
  return new Promise((resolve, reject) => {
    const db = getDatabase()
    db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
      if (err) {
        reject(err)
      } else {
        resolve(row)
      }
    })
  })
}

export async function updateUser(userId: number, name: string, email: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const db = getDatabase()
    db.run(
      "UPDATE users SET name = ?, email = ?, updated_at = ? WHERE id = ?",
      [name, email, new Date().toISOString(), userId],
      (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      },
    )
  })
}

export async function updateUserPassword(userId: number, passwordHash: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const db = getDatabase()
    db.run(
      "UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?",
      [passwordHash, new Date().toISOString(), userId],
      (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      },
    )
  })
}

export async function updateUser2FA(userId: number, secret: string, enabled: boolean): Promise<void> {
  return new Promise((resolve, reject) => {
    const db = getDatabase()
    db.run(
      "UPDATE users SET two_factor_secret = ?, two_factor_enabled = ? WHERE id = ?",
      [secret, enabled ? 1 : 0, userId],
      (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      },
    )
  })
}

export async function updateTempTwoFactorSecret(userId: number, secret: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const db = getDatabase()
    db.run("UPDATE users SET temp_two_factor_secret = ? WHERE id = ?", [secret, userId], (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

// Password operations
export async function createPassword(
  userId: number,
  title: string,
  username: string,
  encryptedPassword: string,
  url?: string,
  notes?: string,
  category = "other",
): Promise<string> {
  return new Promise((resolve, reject) => {
    const db = getDatabase()
    db.run(
      "INSERT INTO passwords (id, user_id, title, username, encrypted_password, url, category, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        uuidv4(),
        userId,
        title,
        username,
        encryptedPassword,
        url,
        category,
        notes,
        new Date().toISOString(),
        new Date().toISOString(),
      ],
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

export async function getPasswordsByUserId(userId: number): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const db = getDatabase()
    db.all("SELECT * FROM passwords WHERE user_id = ? ORDER BY updated_at DESC", [userId], (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}

export async function getPasswordById(id: string, userId: number): Promise<any | null> {
  return new Promise((resolve, reject) => {
    const db = getDatabase()
    db.get("SELECT * FROM passwords WHERE id = ? AND user_id = ?", [id, userId], (err, row) => {
      if (err) {
        reject(err)
      } else {
        resolve(row)
      }
    })
  })
}

export async function updatePassword(
  id: string,
  userId: number,
  title: string,
  username: string,
  encryptedPassword: string,
  url?: string,
  notes?: string,
  category = "other",
): Promise<void> {
  return new Promise((resolve, reject) => {
    const db = getDatabase()
    db.run(
      "UPDATE passwords SET title = ?, username = ?, encrypted_password = ?, url = ?, category = ?, notes = ?, updated_at = ? WHERE id = ? AND user_id = ?",
      [title, username, encryptedPassword, url, category, notes, new Date().toISOString(), id, userId],
      (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      },
    )
  })
}

export async function deletePassword(id: string, userId: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const db = getDatabase()
    db.run("DELETE FROM passwords WHERE id = ? AND user_id = ?", [id, userId], (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

// Session operations
export async function createSession(userId: number, token: string, expiresAt: Date): Promise<string> {
  return new Promise((resolve, reject) => {
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
  return new Promise((resolve, reject) => {
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
  return new Promise((resolve, reject) => {
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
  return new Promise((resolve, reject) => {
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

// Utility functions
export async function closeDatabase() {
  if (db) {
    db.close()
    db = null
  }
}
