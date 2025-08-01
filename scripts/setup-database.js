import Database from "better-sqlite3"
import bcrypt from "bcryptjs"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dbPath = process.env.SQLITE_PATH || path.join(process.cwd(), "data", "passwords.db")

console.log("🚀 Setting up database...")
console.log("📍 Database path:", dbPath)

const db = new Database(dbPath)
db.pragma("journal_mode = WAL")

try {
  // Ensure data directory exists
  const dataDir = path.dirname(dbPath)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
    console.log("✅ Created data directory")
  }

  // Initialize database (this will create tables and seed data)
  console.log("📋 Creating users table...")
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

  console.log("📋 Creating passwords table...")
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

  console.log("📋 Creating indexes...")
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_passwords_user_id ON passwords(user_id);
  `)

  // Check if admin user exists
  const existingUser = db.prepare("SELECT id FROM users WHERE email = ?").get("admin@example.com")

  if (!existingUser) {
    console.log("👤 Creating admin user...")

    // Create admin user
    const hashedPassword = bcrypt.hashSync("admin123", 10)
    const insertUser = db.prepare(`
      INSERT INTO users (email, password_hash, two_factor_enabled)
      VALUES (?, ?, ?)
    `)

    const result = insertUser.run("admin@example.com", hashedPassword, false)
    const userId = result.lastInsertRowid

    console.log("✅ Admin user created with ID:", userId)

    // Add sample passwords
    console.log("📝 Adding sample passwords...")
    const insertPassword = db.prepare(`
      INSERT INTO passwords (user_id, title, username, password, url, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `)

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
      insertPassword.run(userId, pwd.title, pwd.username, pwd.password, pwd.url, pwd.notes)
    }

    console.log("✅ Sample passwords added")
  } else {
    console.log("👤 Admin user already exists")
  }

  console.log("✅ Database initialized successfully")
  console.log("✅ Tables created")

  // Test the connection
  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get()
  const passwordCount = db.prepare("SELECT COUNT(*) as count FROM passwords").get()

  console.log(`📊 Users in database: ${userCount.count}`)
  console.log(`📊 Passwords in database: ${passwordCount.count}`)

  console.log("🎉 Database setup completed successfully!")
  console.log("")
  console.log("🔐 Test credentials:")
  console.log("   Email: admin@example.com")
  console.log("   Password: admin123")
  console.log("")
  console.log('🚀 Run "npm run dev" to start the application')
} catch (error) {
  console.error("❌ Database setup failed:", error)
  process.exit(1)
} finally {
  db.close()
}
