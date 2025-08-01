-- Atualizar a tabela de usuários para garantir que está correta
-- Este script pode ser executado para verificar/atualizar a estrutura

-- Verificar se a tabela existe e tem a estrutura correta
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    two_factor_secret TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Verificar se o usuário admin existe
INSERT OR IGNORE INTO users (id, name, email, password_hash, created_at, updated_at) 
VALUES (
    'user-1', 
    'Administrador', 
    'admin@example.com', 
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    datetime('now'),
    datetime('now')
);
