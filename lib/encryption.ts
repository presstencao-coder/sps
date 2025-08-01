import crypto from "crypto"

const ALGORITHM = "aes-256-gcm"
const KEY_LENGTH = 32
const IV_LENGTH = 16
const SALT_LENGTH = 32
const TAG_LENGTH = 16

// Get encryption key from environment or generate a default one
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY
  if (key) {
    return Buffer.from(key, "hex")
  }

  // Generate a default key for development (not secure for production)
  console.warn("Using default encryption key. Set ENCRYPTION_KEY environment variable for production.")
  return crypto.scryptSync("default-password", "salt", KEY_LENGTH)
}

export function encrypt(text: string): string {
  try {
    const key = getEncryptionKey()
    const iv = crypto.randomBytes(IV_LENGTH)
    const salt = crypto.randomBytes(SALT_LENGTH)

    // Derive key using scrypt
    const derivedKey = crypto.scryptSync(key, salt, KEY_LENGTH)

    const cipher = crypto.createCipher(ALGORITHM, derivedKey)
    cipher.setAAD(salt)

    let encrypted = cipher.update(text, "utf8", "hex")
    encrypted += cipher.final("hex")

    const tag = cipher.getAuthTag()

    // Combine salt + iv + tag + encrypted data
    const result = salt.toString("hex") + ":" + iv.toString("hex") + ":" + tag.toString("hex") + ":" + encrypted
    return result
  } catch (error) {
    console.error("Encryption error:", error)
    throw new Error("Failed to encrypt data")
  }
}

export function decrypt(encryptedData: string): string {
  try {
    const parts = encryptedData.split(":")
    if (parts.length !== 4) {
      throw new Error("Invalid encrypted data format")
    }

    const salt = Buffer.from(parts[0], "hex")
    const iv = Buffer.from(parts[1], "hex")
    const tag = Buffer.from(parts[2], "hex")
    const encrypted = parts[3]

    const key = getEncryptionKey()
    const derivedKey = crypto.scryptSync(key, salt, KEY_LENGTH)

    const decipher = crypto.createDecipher(ALGORITHM, derivedKey)
    decipher.setAAD(salt)
    decipher.setAuthTag(tag)

    let decrypted = decipher.update(encrypted, "hex", "utf8")
    decrypted += decipher.final("utf8")

    return decrypted
  } catch (error) {
    console.error("Decryption error:", error)
    throw new Error("Failed to decrypt data")
  }
}

export function generateSecurePassword(length = 16): string {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?"
  let password = ""

  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, charset.length)
    password += charset[randomIndex]
  }

  return password
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex")
  const hash = crypto.scryptSync(password, salt, 64).toString("hex")
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, hashedPassword: string): boolean {
  try {
    const [salt, hash] = hashedPassword.split(":")
    const hashBuffer = crypto.scryptSync(password, salt, 64)
    const hashToCompare = Buffer.from(hash, "hex")
    return crypto.timingSafeEqual(hashBuffer, hashToCompare)
  } catch (error) {
    console.error("Password verification error:", error)
    return false
  }
}
