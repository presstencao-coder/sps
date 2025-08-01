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
    throw new Error("Falha na criptografia")
  }
}

export function decrypt(encryptedData: string): string {
  try {
    const parts = encryptedData.split(":")
    if (parts.length !== 3) {
      throw new Error("Formato de dados criptografados inválido")
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
    throw new Error("Falha na descriptografia")
  }
}

// Função para gerar uma chave segura
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString("hex")
}
