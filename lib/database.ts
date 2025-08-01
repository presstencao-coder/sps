import sqlite3 from "sqlite3"
import { open, type Database } from "sqlite"

let db: Database | null = null

export async function getDatabase(): Promise<Database> {
  if (db) {
    return db
  }

  const dbType = process.env.DB_TYPE || "sqlite"

  switch (dbType) {
    case "sqlite":
      db = await open({
        filename: process.env.SQLITE_PATH || "./database.sqlite",
        driver: sqlite3.Database,
      })
      break

    case "postgres":
      // Implementar conexão PostgreSQL
      throw new Error("PostgreSQL não implementado ainda")

    case "mysql":
      // Implementar conexão MySQL
      throw new Error("MySQL não implementado ainda")

    case "mongodb":
      // Implementar conexão MongoDB
      throw new Error("MongoDB não implementado ainda")

    case "sqlserver":
      // Implementar conexão SQL Server
      throw new Error("SQL Server não implementado ainda")

    default:
      throw new Error(`Tipo de banco não suportado: ${dbType}`)
  }

  return db
}

export async function closeDatabase() {
  if (db) {
    await db.close()
    db = null
  }
}
