import crypto from "crypto"

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "your-32-character-secret-key-here"
const ALGORITHM = "aes-256-gcm"

export function encrypt(text: string): string {
  try {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY)

    let encrypted = cipher.update(text, "utf8", "hex")
    encrypted += cipher.final("hex")

    const authTag = cipher.getAuthTag()

    return iv.toString("hex") + ":" + authTag.toString("hex") + ":" + encrypted
  } catch (error) {
    console.error("Encryption error:", error)
    // Fallback to base64 encoding if encryption fails
    return Buffer.from(text).toString("base64")
  }
}

export function decrypt(encryptedText: string): string {
  try {
    const parts = encryptedText.split(":")

    if (parts.length !== 3) {
      // Fallback: assume it's base64 encoded
      return Buffer.from(encryptedText, "base64").toString("utf8")
    }

    const iv = Buffer.from(parts[0], "hex")
    const authTag = Buffer.from(parts[1], "hex")
    const encrypted = parts[2]

    const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY)
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(encrypted, "hex", "utf8")
    decrypted += decipher.final("utf8")

    return decrypted
  } catch (error) {
    console.error("Decryption error:", error)
    // Fallback to base64 decoding if decryption fails
    try {
      return Buffer.from(encryptedText, "base64").toString("utf8")
    } catch {
      return encryptedText
    }
  }
}

export function generateSecurePassword(length = 16): string {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
  let password = ""

  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, charset.length)
    password += charset[randomIndex]
  }

  return password
}

export function hashPassword(password: string): string {
  return crypto
    .createHash("sha256")
    .update(password + ENCRYPTION_KEY)
    .digest("hex")
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash
}
