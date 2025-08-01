import sqlite3 from "sqlite3"
import { open } from "sqlite"
import bcrypt from "bcryptjs"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function setupDatabase() {
  try {
    console.log("🚀 Setting up database...")

    // Ensure the data directory exists
    const dataDir = path.join(process.cwd(), "data")
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
      console.log("📁 Created data directory")
    }

    const dbPath = path.join(dataDir, "password_manager.db")

    // Open database connection
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    console.log("📊 Database connected")

    // Enable foreign keys
    await db.exec("PRAGMA foreign_keys = ON")

    // Create users table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
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
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        username TEXT,
        password_encrypted TEXT NOT NULL,
        url TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `)

    // Create sessions table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `)

    // Create indexes
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_passwords_user_id ON passwords(user_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
      CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
    `)

    console.log("📋 Tables created successfully")

    // Check if admin user exists
    const existingUser = await db.get("SELECT id FROM users WHERE email = ?", ["admin@example.com"])

    if (!existingUser) {
      // Create admin user
      const hashedPassword = await bcrypt.hash("admin123", 12)
      const result = await db.run("INSERT INTO users (email, password_hash) VALUES (?, ?)", [
        "admin@example.com",
        hashedPassword,
      ])

      const userId = result.lastID
      console.log("👤 Admin user created with ID:", userId)

      // Add sample passwords
      const samplePasswords = [
        {
          title: "Gmail",
          username: "admin@gmail.com",
          password: "MySecureGmailPass123!",
          url: "https://gmail.com",
          notes: "Personal email account",
        },
        {
          title: "Facebook",
          username: "admin@example.com",
          password: "FacebookSecure456!",
          url: "https://facebook.com",
          notes: "Social media account",
        },
        {
          title: "Banco do Brasil",
          username: "admin123",
          password: "BankSecure789!",
          url: "https://bb.com.br",
          notes: "Banking account - handle with care",
        },
        {
          title: "GitHub",
          username: "admin-dev",
          password: "GitHubDev2024!",
          url: "https://github.com",
          notes: "Development repositories",
        },
        {
          title: "AWS Console",
          username: "admin@company.com",
          password: "AWSSecure2024!",
          url: "https://aws.amazon.com",
          notes: "Cloud infrastructure management",
        },
      ]

      // Simple encryption for demo (in production, use proper encryption)
      function simpleEncrypt(text) {
        return Buffer.from(text).toString("base64")
      }

      for (const pwd of samplePasswords) {
        await db.run(
          "INSERT INTO passwords (user_id, title, username, password_encrypted, url, notes) VALUES (?, ?, ?, ?, ?, ?)",
          [userId, pwd.title, pwd.username, simpleEncrypt(pwd.password), pwd.url, pwd.notes],
        )
      }

      console.log("🔐 Sample passwords created")
    } else {
      console.log("👤 Admin user already exists")
    }

    await db.close()
    console.log("✅ Database setup completed successfully!")
    console.log("")
    console.log("🔑 Login credentials:")
    console.log("   Email: admin@example.com")
    console.log("   Password: admin123")
    console.log("")
    console.log('🚀 Run "npm run dev" to start the application')
    console.log("")
    console.log("⚠️  Note: This demo uses in-memory storage.")
    console.log("   Data will be reset when the server restarts.")
    console.log("   For production, use a persistent database like PostgreSQL.")
  } catch (error) {
    console.error("❌ Database setup failed:", error)
    process.exit(1)
  }
}

setupDatabase()
