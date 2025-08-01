# 🚀 Deploy Instructions

## Variáveis de Ambiente para Vercel

Configure estas variáveis no painel do Vercel:

### Obrigatórias:
\`\`\`bash
DB_TYPE=sqlite
ENCRYPTION_KEY=a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
JWT_SECRET=super-secret-jwt-key-for-production-change-this-to-something-secure
NODE_ENV=production
\`\`\`

### Como configurar:
1. Acesse seu projeto no Vercel
2. Vá em **Settings → Environment Variables**
3. Adicione cada variável acima

## 🔐 Credenciais de Teste

- **Email:** `admin@example.com`
- **Senha:** `admin123`

## ⚠️ Importante para Produção

1. **Mude a ENCRYPTION_KEY** para uma chave segura de 64 caracteres
2. **Mude o JWT_SECRET** para uma string longa e aleatória
3. **Use PostgreSQL** para dados persistentes em produção

## 🔧 Comandos Locais

\`\`\`bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar produção
npm start
\`\`\`

## 📱 Apps Recomendados para 2FA

- Google Authenticator
- Authy
- Microsoft Authenticator
- 1Password
