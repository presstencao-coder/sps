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
    user_id TEXT,
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
