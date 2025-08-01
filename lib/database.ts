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
        const dbPath = process.env.SQLITE_PATH || path.join(process.cwd(), "database.sqlite")
        console.log(`🔗 Conectando ao SQLite: ${dbPath}`)

        // Criar diretório se não existir
        const dbDir = path.dirname(dbPath)
        if (!fs.existsSync(dbDir)) {
          fs.mkdirSync(dbDir, { recursive: true })
          console.log(`📁 Diretório criado: ${dbDir}`)
        }

        db = await open({
          filename: dbPath,
          driver: sqlite3.Database,
        })

        // Habilitar foreign keys
        await db.exec("PRAGMA foreign_keys = ON")

        // Criar tabelas se não existirem
        await createTables(db)

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

async function createTables(database: Database) {
  const createTablesSQL = `
    -- Criar tabela de usuários
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        two_factor_secret TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Criar tabela de senhas
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
    );

    -- Criar índices para melhor performance
    CREATE INDEX IF NOT EXISTS idx_passwords_user_id ON passwords(user_id);
    CREATE INDEX IF NOT EXISTS idx_passwords_category ON passwords(category);
    CREATE INDEX IF NOT EXISTS idx_passwords_title ON passwords(title);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `

  await database.exec(createTablesSQL)

  // Inserir usuário de teste se não existir
  const existingUser = await database.get("SELECT id FROM users WHERE email = ?", ["admin@example.com"])

  if (!existingUser) {
    const seedDataSQL = `
      INSERT INTO users (id, name, email, password_hash, created_at, updated_at) 
      VALUES (
          'user-1', 
          'Administrador', 
          'admin@example.com', 
          '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
          datetime('now'),
          datetime('now')
      );
    `
    await database.exec(seedDataSQL)
    console.log("✅ Usuário de teste criado!")
  }
}

export async function closeDatabase() {
  if (db) {
    await db.close()
    db = null
    console.log("🔌 Conexão com banco fechada")
  }
}
