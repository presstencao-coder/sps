import crypto from "crypto"

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "default-key-change-this-in-production-32-chars"
const ALGORITHM = "aes-256-gcm"

export function encrypt(text: string): string {
  try {
    // Garantir que a chave tenha 32 bytes
    const key = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32)
    const iv = crypto.randomBytes(16)

    const cipher = crypto.createCipher(ALGORITHM, key)

    let encrypted = cipher.update(text, "utf8", "hex")
    encrypted += cipher.final("hex")

    const authTag = cipher.getAuthTag()

    // Retornar: iv:authTag:encrypted
    return iv.toString("hex") + ":" + authTag.toString("hex") + ":" + encrypted
  } catch (error) {
    console.error("❌ Erro ao criptografar:", error)
    // Fallback para base64 se a criptografia falhar
    return Buffer.from(text).toString("base64")
  }
}

export function decrypt(encryptedData: string): string {
  try {
    const parts = encryptedData.split(":")
    if (parts.length !== 3) {
      // Fallback: assumir que é base64
      return Buffer.from(encryptedData, "base64").toString("utf8")
    }

    const iv = Buffer.from(parts[0], "hex")
    const authTag = Buffer.from(parts[1], "hex")
    const encrypted = parts[2]

    // Garantir que a chave tenha 32 bytes
    const key = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32)

    const decipher = crypto.createDecipher(ALGORITHM, key)
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(encrypted, "hex", "utf8")
    decrypted += decipher.final("utf8")

    return decrypted
  } catch (error) {
    console.error("❌ Erro ao descriptografar:", error)
    // Fallback para base64 se a descriptografia falhar
    try {
      return Buffer.from(encryptedData, "base64").toString("utf8")
    } catch {
      return encryptedData
    }
  }
}

// Hash de senha usando bcrypt-like com crypto nativo
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex")
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex")
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, hashedPassword: string): boolean {
  try {
    const [salt, hash] = hashedPassword.split(":")
    const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex")
    return hash === verifyHash
  } catch (error) {
    console.error("❌ Erro na verificação de senha:", error)
    return false
  }
}

// Função para gerar uma chave segura
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString("hex")
}

// Gerar token JWT
export function generateJWTSecret(): string {
  return crypto.randomBytes(64).toString("hex")
}
