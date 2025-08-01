const fs = require("fs")
const path = require("path")
const sqlite3 = require("sqlite3").verbose()

async function setupDatabase() {
  const dbPath = process.env.SQLITE_PATH || "./database.sqlite"

  // Criar diretório se não existir
  const dbDir = path.dirname(dbPath)
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true })
  }

  const db = new sqlite3.Database(dbPath)

  // Ler e executar script de criação de tabelas
  const createTablesSQL = fs.readFileSync(path.join(__dirname, "create-tables.sql"), "utf8")

  // Ler e executar script de dados iniciais
  const seedDataSQL = fs.readFileSync(path.join(__dirname, "seed-data.sql"), "utf8")

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Executar criação de tabelas
      db.exec(createTablesSQL, (err) => {
        if (err) {
          console.error("Erro ao criar tabelas:", err)
          reject(err)
          return
        }
        console.log("✅ Tabelas criadas com sucesso!")

        // Executar dados iniciais
        db.exec(seedDataSQL, (err) => {
          if (err) {
            console.error("Erro ao inserir dados iniciais:", err)
            reject(err)
            return
          }
          console.log("✅ Dados iniciais inseridos com sucesso!")

          db.close((err) => {
            if (err) {
              console.error("Erro ao fechar banco:", err)
              reject(err)
            } else {
              console.log("✅ Banco de dados configurado com sucesso!")
              resolve()
            }
          })
        })
      })
    })
  })
}

// Executar setup se chamado diretamente
if (require.main === module) {
  setupDatabase().catch(console.error)
}

module.exports = { setupDatabase }
