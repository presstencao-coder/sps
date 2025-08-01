# Deploy Instructions

## Environment Variables for Vercel

Copy these environment variables to your Vercel project settings:

### Required Variables:

\`\`\`bash
DB_TYPE=sqlite
SQLITE_PATH=./data/password_manager.db
ENCRYPTION_KEY=a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
JWT_SECRET=super-secret-jwt-key-for-production-change-this-to-something-secure
NODE_ENV=production
\`\`\`

### How to set up in Vercel:

1. Go to your Vercel project dashboard
2. Click on "Settings" tab
3. Click on "Environment Variables" in the sidebar
4. Add each variable with its value:

**DB_TYPE**
- Value: `sqlite`

**SQLITE_PATH** 
- Value: `./data/password_manager.db`

**ENCRYPTION_KEY**
- Value: `a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456`
- (Generate your own 64-character hex string for security)

**JWT_SECRET**
- Value: `super-secret-jwt-key-for-production-change-this-to-something-secure`
- (Use a long, random string for security)

**NODE_ENV**
- Value: `production`

### Login Credentials:

After deployment, use these credentials to login:

- **Email:** `admin@example.com`
- **Password:** `admin123`

### Security Notes:

⚠️ **Important for Production:**
1. Change the ENCRYPTION_KEY to a secure 64-character hex string
2. Change the JWT_SECRET to a long, random string
3. Consider using a persistent database like PostgreSQL for production
4. The current setup uses in-memory/file-based storage which resets on deployment

### Generate Secure Keys:

You can generate secure keys using Node.js:

\`\`\`javascript
// Generate ENCRYPTION_KEY (64 characters)
console.log(require('crypto').randomBytes(32).toString('hex'))

// Generate JWT_SECRET (random string)
console.log(require('crypto').randomBytes(64).toString('base64'))
