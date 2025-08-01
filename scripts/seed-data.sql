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
    ('pass-2', 'user-1', 'Facebook', 'admin@example.com', 'encrypted_password_here', 'https://facebook.com', 'social', 'Rede social pessoal', datetime('now'), datetime('now')),
    ('pass-3', 'user-1', 'Banco do Brasil', 'admin123', 'encrypted_password_here', 'https://bb.com.br', 'banking', 'Conta corrente principal', datetime('now'), datetime('now'));
