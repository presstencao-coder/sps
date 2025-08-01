import sqlite3 from "sqlite3"
import { open, type Database } from "sqlite"

let db: Database | null = null

export async function getDatabase(): Promise<Database> {
  if (db) {
    return db
  }

  const dbType = process.env.DB_TYPE || "sqlite"

  try {
    switch (dbType) {
      case "sqlite":
        const dbPath = process.env.SQLITE_PATH || "./database.sqlite"
        console.log(`🔗 Conectando ao SQLite: ${dbPath}`)

        db = await open({
          filename: dbPath,
          driver: sqlite3.Database,
        })

        // Habilitar foreign keys
        await db.exec("PRAGMA foreign_keys = ON")
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

export async function closeDatabase() {
  if (db) {
    await db.close()
    db = null
    console.log("🔌 Conexão com banco fechada")
  }
}
