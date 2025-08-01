import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from "uuid"

// In-memory database for demo purposes
// In production, you would use a real database like PostgreSQL, MySQL, or MongoDB

interface User {
  id: string
  email: string
  password_hash: string
  two_factor_secret?: string
  two_factor_enabled: boolean
  created_at: string
  updated_at: string
}

interface Password {
  id: string
  user_id: string
  title: string
  username: string
  password_encrypted: string
  url?: string
  notes?: string
  created_at: string
  updated_at: string
}

interface Session {
  id: string
  user_id: string
  token: string
  expires_at: string
  created_at: string
}

// In-memory storage
const users: User[] = []
const passwords: Password[] = []
let sessions: Session[] = []

// Initialize with demo data
function initializeDatabase() {
  if (users.length === 0) {
    // Create admin user
    const adminUser: User = {
      id: "user-1",
      email: "admin@example.com",
      password_hash: bcrypt.hashSync("admin123", 12),
      two_factor_enabled: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    users.push(adminUser)

    // Create sample passwords
    const samplePasswords: Password[] = [
      {
        id: "pass-1",
        user_id: "user-1",
        title: "Gmail",
        username: "admin@gmail.com",
        password_encrypted: Buffer.from("MySecureGmailPass123!").toString("base64"),
        url: "https://gmail.com",
        notes: "Personal email account",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "pass-2",
        user_id: "user-1",
        title: "Facebook",
        username: "admin@example.com",
        password_encrypted: Buffer.from("FacebookSecure456!").toString("base64"),
        url: "https://facebook.com",
        notes: "Social media account",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "pass-3",
        user_id: "user-1",
        title: "Banco do Brasil",
        username: "admin123",
        password_encrypted: Buffer.from("BankSecure789!").toString("base64"),
        url: "https://bb.com.br",
        notes: "Banking account - handle with care",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "pass-4",
        user_id: "user-1",
        title: "GitHub",
        username: "admin-dev",
        password_encrypted: Buffer.from("GitHubDev2024!").toString("base64"),
        url: "https://github.com",
        notes: "Development repositories",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "pass-5",
        user_id: "user-1",
        title: "AWS Console",
        username: "admin@company.com",
        password_encrypted: Buffer.from("AWSSecure2024!").toString("base64"),
        url: "https://aws.amazon.com",
        notes: "Cloud infrastructure management",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]

    passwords.push(...samplePasswords)
  }
}

// Initialize database
initializeDatabase()

// User operations
export async function createUser(email: string, passwordHash: string): Promise<string> {
  const user: User = {
    id: uuidv4(),
    email,
    password_hash: passwordHash,
    two_factor_enabled: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  users.push(user)
  return user.id
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return users.find((user) => user.email === email) || null
}

export async function getUserById(id: string): Promise<User | null> {
  return users.find((user) => user.id === id) || null
}

export async function updateUser2FA(userId: string, secret: string, enabled: boolean): Promise<void> {
  const userIndex = users.findIndex((user) => user.id === userId)
  if (userIndex !== -1) {
    users[userIndex].two_factor_secret = secret
    users[userIndex].two_factor_enabled = enabled
    users[userIndex].updated_at = new Date().toISOString()
  }
}

// Password operations
export async function createPassword(
  userId: string,
  title: string,
  username: string,
  encryptedPassword: string,
  url?: string,
  notes?: string,
): Promise<string> {
  const password: Password = {
    id: uuidv4(),
    user_id: userId,
    title,
    username,
    password_encrypted: encryptedPassword,
    url,
    notes,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  passwords.push(password)
  return password.id
}

export async function getPasswordsByUserId(userId: string): Promise<Password[]> {
  return passwords
    .filter((password) => password.user_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export async function getPasswordById(id: string, userId: string): Promise<Password | null> {
  return passwords.find((password) => password.id === id && password.user_id === userId) || null
}

export async function updatePassword(
  id: string,
  userId: string,
  title: string,
  username: string,
  encryptedPassword: string,
  url?: string,
  notes?: string,
): Promise<void> {
  const passwordIndex = passwords.findIndex((password) => password.id === id && password.user_id === userId)
  if (passwordIndex !== -1) {
    passwords[passwordIndex] = {
      ...passwords[passwordIndex],
      title,
      username,
      password_encrypted: encryptedPassword,
      url,
      notes,
      updated_at: new Date().toISOString(),
    }
  }
}

export async function deletePassword(id: string, userId: string): Promise<void> {
  const passwordIndex = passwords.findIndex((password) => password.id === id && password.user_id === userId)
  if (passwordIndex !== -1) {
    passwords.splice(passwordIndex, 1)
  }
}

// Session operations
export async function createSession(userId: string, token: string, expiresAt: Date): Promise<string> {
  const session: Session = {
    id: uuidv4(),
    user_id: userId,
    token,
    expires_at: expiresAt.toISOString(),
    created_at: new Date().toISOString(),
  }
  sessions.push(session)
  return session.id
}

export async function getSessionByToken(token: string): Promise<Session | null> {
  const now = new Date()
  return sessions.find((session) => session.token === token && new Date(session.expires_at) > now) || null
}

export async function deleteSession(token: string): Promise<void> {
  const sessionIndex = sessions.findIndex((session) => session.token === token)
  if (sessionIndex !== -1) {
    sessions.splice(sessionIndex, 1)
  }
}

export async function deleteExpiredSessions(): Promise<void> {
  const now = new Date()
  sessions = sessions.filter((session) => new Date(session.expires_at) > now)
}

// Utility functions
export async function getDatabase() {
  initializeDatabase()
  return {
    users,
    passwords,
    sessions,
  }
}

export async function closeDatabase() {
  // No-op for in-memory database
}
