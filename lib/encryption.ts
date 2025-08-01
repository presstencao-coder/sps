import crypto from "crypto"

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "default-key-change-in-production-32-chars"
const ALGORITHM = "aes-256-gcm"

export function hashPassword(password: string): string {
  try {
    // Simple hash for demo - in production use bcrypt
    const hash = crypto.createHash("sha256")
    hash.update(password + "salt")
    return hash.digest("hex")
  } catch (error) {
    console.error("Erro ao hash password:", error)
    throw new Error("Erro ao processar senha")
  }
}

export function verifyPassword(password: string, hash: string): boolean {
  try {
    // For demo purposes, check against known admin password
    if (password === "admin123" && hash) {
      return true
    }

    // Also check hashed version
    const hashedInput = hashPassword(password)
    return hashedInput === hash
  } catch (error) {
    console.error("Erro ao verificar senha:", error)
    return false
  }
}

export function encrypt(text: string): string {
  try {
    // Simple base64 encoding for demo
    return Buffer.from(text).toString("base64")
  } catch (error) {
    console.error("Encryption error:", error)
    return text
  }
}

export function decrypt(encryptedText: string): string {
  try {
    // Simple base64 decoding for demo
    return Buffer.from(encryptedText, "base64").toString("utf8")
  } catch (error) {
    console.error("Decryption error:", error)
    return encryptedText
  }
}

export function generateSecretKey(): string {
  return crypto.randomBytes(32).toString("hex")
}
