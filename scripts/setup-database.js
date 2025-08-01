import fs from "fs"
import path from "path"
import sqlite3 from "sqlite3"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function setupDatabase() {
  try {
    const dbPath = process.env.SQLITE_PATH || path.join(process.cwd(), "database.sqlite")

    console.log("🔧 Configurando banco de dados SQLite...")
    console.log(`📁 Caminho do banco: ${dbPath}`)

    // Criar diretório se não existir
    const dbDir = path.dirname(dbPath)
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true })
      console.log(`📁 Diretório criado: ${dbDir}`)
    }

    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error("❌ Erro ao abrir banco:", err)
        return
      }
      console.log("✅ Banco SQLite aberto com sucesso!")
    })

    // SQL para criar tabelas
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

    // SQL para dados iniciais
    const seedDataSQL = `
      -- Inserir usuário de teste (senha: admin123)
      INSERT OR IGNORE INTO users (id, name, email, password_hash, created_at, updated_at) 
      VALUES (
          'user-1', 
          'Administrador', 
          'admin@example.com', 
          '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
          datetime('now'),
          datetime('now')
      );

      -- Inserir algumas senhas de exemplo
      INSERT OR IGNORE INTO passwords (id, user_id, title, username, encrypted_password, url, category, notes, created_at, updated_at)
      VALUES 
      ('pass-1', 'user-1', 'Gmail', 'admin@gmail.com', 'encrypted_password_here', 'https://gmail.com', 'email', 'Conta principal do Gmail', datetime('now'), datetime('now')),
      ('pass-2', 'user-1', 'Facebook', 'admin@example.com', 'encrypted_password_here', 'https://facebook.com', 'social', 'Rede social principal', datetime('now'), datetime('now')),
      ('pass-3', 'user-1', 'Banco do Brasil', 'admin123', 'encrypted_password_here', 'https://bb.com.br', 'finance', 'Conta bancária principal', datetime('now'), datetime('now'));
    `

    return new Promise((resolve, reject) => {
      db.serialize(() => {
        // Executar criação de tabelas
        db.exec(createTablesSQL, (err) => {
          if (err) {
            console.error("❌ Erro ao criar tabelas:", err)
            reject(err)
            return
          }
          console.log("✅ Tabelas criadas com sucesso!")

          // Executar dados iniciais
          db.exec(seedDataSQL, (err) => {
            if (err) {
              console.error("❌ Erro ao inserir dados iniciais:", err)
              reject(err)
              return
            }
            console.log("✅ Dados iniciais inseridos com sucesso!")

            db.close((err) => {
              if (err) {
                console.error("❌ Erro ao fechar banco:", err)
                reject(err)
              } else {
                console.log("🎉 Banco de dados configurado com sucesso!")
                console.log("")
                console.log("📧 Credenciais de teste:")
                console.log("   Email: admin@example.com")
                console.log("   Senha: admin123")
                console.log("")
                console.log("🚀 Execute 'npm run dev' para iniciar a aplicação")
                resolve()
              }
            })
          })
        })
      })
    })
  } catch (error) {
    console.error("❌ Erro no setup:", error)
    throw error
  }
}

// Executar setup
setupDatabase().catch(console.error)
