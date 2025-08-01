import crypto from "crypto"

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "default-key-change-in-production-32-chars"
const ALGORITHM = "aes-256-gcm"

export function encrypt(text: string): string {
  try {
    // Derivar chave usando scrypt
    const salt = crypto.randomBytes(16)
    const key = crypto.scryptSync(ENCRYPTION_KEY, salt, 32)

    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipher(ALGORITHM, key)

    let encrypted = cipher.update(text, "utf8", "hex")
    encrypted += cipher.final("hex")

    const authTag = cipher.getAuthTag()

    // Combinar salt, iv, authTag e dados criptografados
    const combined = salt.toString("hex") + ":" + iv.toString("hex") + ":" + authTag.toString("hex") + ":" + encrypted

    return combined
  } catch (error) {
    console.error("Erro na criptografia:", error)
    throw new Error("Falha ao criptografar dados")
  }
}

export function decrypt(encryptedData: string): string {
  try {
    const parts = encryptedData.split(":")
    if (parts.length !== 4) {
      throw new Error("Formato de dados criptografados inválido")
    }

    const salt = Buffer.from(parts[0], "hex")
    const iv = Buffer.from(parts[1], "hex")
    const authTag = Buffer.from(parts[2], "hex")
    const encrypted = parts[3]

    // Derivar a mesma chave
    const key = crypto.scryptSync(ENCRYPTION_KEY, salt, 32)

    const decipher = crypto.createDecipher(ALGORITHM, key)
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(encrypted, "hex", "utf8")
    decrypted += decipher.final("utf8")

    return decrypted
  } catch (error) {
    console.error("Erro na descriptografia:", error)
    throw new Error("Falha ao descriptografar dados")
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
