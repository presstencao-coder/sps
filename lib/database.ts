import { v4 as uuidv4 } from "uuid"

// In-memory database for demo purposes
interface User {
  id: string
  name: string
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
  encrypted_password: string
  url?: string
  category: string
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
    console.log("Inicializando banco de dados...")

    // Create admin user with simple password
    const adminUser: User = {
      id: "user-1",
      name: "Administrador",
      email: "admin@example.com",
      password_hash: "admin123", // Simple password for demo
      two_factor_enabled: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    users.push(adminUser)
    console.log("Usuário admin criado:", adminUser.email)

    // Create sample passwords
    const samplePasswords: Password[] = [
      {
        id: "pass-1",
        user_id: "user-1",
        title: "Gmail",
        username: "admin@gmail.com",
        encrypted_password: Buffer.from("MySecureGmailPass123!").toString("base64"),
        url: "https://gmail.com",
        category: "email",
        notes: "Personal email account",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "pass-2",
        user_id: "user-1",
        title: "Facebook",
        username: "admin@example.com",
        encrypted_password: Buffer.from("FacebookSecure456!").toString("base64"),
        url: "https://facebook.com",
        category: "social",
        notes: "Social media account",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "pass-3",
        user_id: "user-1",
        title: "Banco do Brasil",
        username: "admin123",
        encrypted_password: Buffer.from("BankSecure789!").toString("base64"),
        url: "https://bb.com.br",
        category: "banking",
        notes: "Banking account - handle with care",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "pass-4",
        user_id: "user-1",
        title: "GitHub",
        username: "admin-dev",
        encrypted_password: Buffer.from("GitHubDev2024!").toString("base64"),
        url: "https://github.com",
        category: "work",
        notes: "Development repositories",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "pass-5",
        user_id: "user-1",
        title: "AWS Console",
        username: "admin@company.com",
        encrypted_password: Buffer.from("AWSSecure2024!").toString("base64"),
        url: "https://aws.amazon.com",
        category: "work",
        notes: "Cloud infrastructure management",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]

    passwords.push(...samplePasswords)
    console.log(`${samplePasswords.length} senhas de exemplo criadas`)
  }
}

// Initialize database
initializeDatabase()

// User operations
export async function createUser(name: string, email: string, password: string): Promise<string> {
  try {
    const user: User = {
      id: uuidv4(),
      name,
      email,
      password_hash: password, // Store password directly for demo
      two_factor_enabled: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    users.push(user)
    console.log("Usuário criado:", email)
    return user.id
  } catch (error) {
    console.error("Erro ao criar usuário:", error)
    throw error
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const user = users.find((user) => user.email === email) || null
    console.log("Busca por email:", email, "Encontrado:", !!user)
    return user
  } catch (error) {
    console.error("Erro ao buscar usuário por email:", error)
    throw error
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const user = users.find((user) => user.id === id) || null
    console.log("Busca por ID:", id, "Encontrado:", !!user)
    return user
  } catch (error) {
    console.error("Erro ao buscar usuário por ID:", error)
    throw error
  }
}

export async function updateUser2FA(userId: string, secret: string, enabled: boolean): Promise<void> {
  try {
    const userIndex = users.findIndex((user) => user.id === userId)
    if (userIndex !== -1) {
      users[userIndex].two_factor_secret = secret
      users[userIndex].two_factor_enabled = enabled
      users[userIndex].updated_at = new Date().toISOString()
      console.log("2FA atualizado para usuário:", userId, "Habilitado:", enabled)
    } else {
      throw new Error("Usuário não encontrado")
    }
  } catch (error) {
    console.error("Erro ao atualizar 2FA:", error)
    throw error
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
  category = "other",
): Promise<string> {
  try {
    const password: Password = {
      id: uuidv4(),
      user_id: userId,
      title,
      username,
      encrypted_password: encryptedPassword,
      url,
      category,
      notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    passwords.push(password)
    console.log("Senha criada:", title)
    return password.id
  } catch (error) {
    console.error("Erro ao criar senha:", error)
    throw error
  }
}

export async function getPasswordsByUserId(userId: string): Promise<Password[]> {
  try {
    const userPasswords = passwords
      .filter((password) => password.user_id === userId)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())

    console.log("Senhas encontradas para usuário:", userId, "Quantidade:", userPasswords.length)
    return userPasswords
  } catch (error) {
    console.error("Erro ao buscar senhas:", error)
    throw error
  }
}

export async function getPasswordById(id: string, userId: string): Promise<Password | null> {
  try {
    return passwords.find((password) => password.id === id && password.user_id === userId) || null
  } catch (error) {
    console.error("Erro ao buscar senha por ID:", error)
    throw error
  }
}

export async function updatePassword(
  id: string,
  userId: string,
  title: string,
  username: string,
  encryptedPassword: string,
  url?: string,
  notes?: string,
  category = "other",
): Promise<void> {
  try {
    const passwordIndex = passwords.findIndex((password) => password.id === id && password.user_id === userId)
    if (passwordIndex !== -1) {
      passwords[passwordIndex] = {
        ...passwords[passwordIndex],
        title,
        username,
        encrypted_password: encryptedPassword,
        url,
        category,
        notes,
        updated_at: new Date().toISOString(),
      }
      console.log("Senha atualizada:", title)
    } else {
      throw new Error("Senha não encontrada")
    }
  } catch (error) {
    console.error("Erro ao atualizar senha:", error)
    throw error
  }
}

export async function deletePassword(id: string, userId: string): Promise<void> {
  try {
    const passwordIndex = passwords.findIndex((password) => password.id === id && password.user_id === userId)
    if (passwordIndex !== -1) {
      const deletedPassword = passwords.splice(passwordIndex, 1)[0]
      console.log("Senha deletada:", deletedPassword.title)
    } else {
      throw new Error("Senha não encontrada")
    }
  } catch (error) {
    console.error("Erro ao deletar senha:", error)
    throw error
  }
}

// Session operations
export async function createSession(userId: string, token: string, expiresAt: Date): Promise<string> {
  try {
    const session: Session = {
      id: uuidv4(),
      user_id: userId,
      token,
      expires_at: expiresAt.toISOString(),
      created_at: new Date().toISOString(),
    }
    sessions.push(session)
    return session.id
  } catch (error) {
    console.error("Erro ao criar sessão:", error)
    throw error
  }
}

export async function getSessionByToken(token: string): Promise<Session | null> {
  try {
    const now = new Date()
    return sessions.find((session) => session.token === token && new Date(session.expires_at) > now) || null
  } catch (error) {
    console.error("Erro ao buscar sessão:", error)
    throw error
  }
}

export async function deleteSession(token: string): Promise<void> {
  try {
    const sessionIndex = sessions.findIndex((session) => session.token === token)
    if (sessionIndex !== -1) {
      sessions.splice(sessionIndex, 1)
    }
  } catch (error) {
    console.error("Erro ao deletar sessão:", error)
    throw error
  }
}

export async function deleteExpiredSessions(): Promise<void> {
  try {
    const now = new Date()
    const beforeCount = sessions.length
    sessions = sessions.filter((session) => new Date(session.expires_at) > now)
    const afterCount = sessions.length
    if (beforeCount !== afterCount) {
      console.log("Sessões expiradas removidas:", beforeCount - afterCount)
    }
  } catch (error) {
    console.error("Erro ao limpar sessões expiradas:", error)
    throw error
  }
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
