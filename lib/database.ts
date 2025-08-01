import sqlite3 from "sqlite3"
import { open, type Database } from "sqlite"
import path from "path"
import fs from "fs"

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
        // Implementar conexão PostgreSQL
        throw new Error("PostgreSQL será implementado em breve")

      case "mysql":
        // Implementar conexão MySQL
        throw new Error("MySQL será implementado em breve")

      case "mongodb":
        // Implementar conexão MongoDB
        throw new Error("MongoDB será implementado em breve")

      case "sqlserver":
        // Implementar conexão SQL Server
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

    // Create indexes
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_passwords_user_id ON passwords(user_id);
      CREATE INDEX IF NOT EXISTS idx_passwords_category ON passwords(category);
      CREATE INDEX IF NOT EXISTS idx_passwords_title ON passwords(title);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `)

    // Check if admin user exists
    const existingUser = await db.get("SELECT id FROM users WHERE email = ?", ["admin@example.com"])

    if (!existingUser) {
      // Insert admin user (password: admin123)
      await db.run(
        `
        INSERT INTO users (id, name, email, password_hash, created_at, updated_at) 
        VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
      `,
        [
          "user-1",
          "Administrador",
          "admin@example.com",
          "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
        ],
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

export async function closeDatabase() {
  if (db) {
    await db.close()
    db = null
    console.log("🔌 Conexão com banco fechada")
  }
}
