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
    console.log("Setting up database...")

    // Ensure the data directory exists
    const dataDir = path.join(process.cwd(), "data")
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
      console.log("Created data directory")
    }

    const dbPath = path.join(dataDir, "password_manager.db")

    // Open database connection
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    console.log("Database connected")

    // Enable foreign keys
    await db.exec("PRAGMA foreign_keys = ON")

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

    // Create indexes
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_passwords_user_id ON passwords(user_id);
    `)

    console.log("Tables created successfully")

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
      console.log("Admin user created with ID:", userId)

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
      ]

      for (const pwd of samplePasswords) {
        // Simple encryption for demo (in production, use proper encryption)
        const encryptedPassword = Buffer.from(pwd.password).toString("base64")

        await db.run(
          "INSERT INTO passwords (user_id, title, username, encrypted_password, url, notes) VALUES (?, ?, ?, ?, ?, ?)",
          [userId, pwd.title, pwd.username, encryptedPassword, pwd.url, pwd.notes],
        )
      }

      console.log("Sample passwords added")
    } else {
      console.log("Admin user already exists")
    }

    await db.close()
    console.log("Database setup completed successfully!")
    console.log("\nLogin credentials:")
    console.log("Email: admin@example.com")
    console.log("Password: admin123")
  } catch (error) {
    console.error("Database setup failed:", error)
    process.exit(1)
  }
}

setupDatabase()
