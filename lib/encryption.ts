import crypto from "crypto"
import bcrypt from "bcryptjs"

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "default-key-change-in-production-32-chars"
const ALGORITHM = "aes-256-gcm"

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 12)
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash)
}

export function encrypt(text: string): string {
  try {
    // Ensure key is 32 bytes
    const key = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32)
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipher(ALGORITHM, key)

    let encrypted = cipher.update(text, "utf8", "hex")
    encrypted += cipher.final("hex")

    const authTag = cipher.getAuthTag()

    return iv.toString("hex") + ":" + authTag.toString("hex") + ":" + encrypted
  } catch (error) {
    console.error("Encryption error:", error)
    // Fallback to base64 encoding
    return Buffer.from(text).toString("base64")
  }
}

export function decrypt(encryptedText: string): string {
  try {
    const parts = encryptedText.split(":")

    if (parts.length !== 3) {
      // Try base64 decoding as fallback
      return Buffer.from(encryptedText, "base64").toString("utf8")
    }

    const key = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32)
    const iv = Buffer.from(parts[0], "hex")
    const authTag = Buffer.from(parts[1], "hex")
    const encrypted = parts[2]

    const decipher = crypto.createDecipher(ALGORITHM, key)
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(encrypted, "hex", "utf8")
    decrypted += decipher.final("utf8")

    return decrypted
  } catch (error) {
    console.error("Decryption error:", error)
    // Fallback to base64 decoding
    try {
      return Buffer.from(encryptedText, "base64").toString("utf8")
    } catch {
      return encryptedText
    }
  }
}

export function generateSecretKey(): string {
  return crypto.randomBytes(32).toString("hex")
}
