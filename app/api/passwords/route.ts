import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { getPasswordsByUserId, createPassword } from "@/lib/database"
import { encrypt, decrypt } from "@/lib/encryption"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Função para extrair userId do token JWT
function getUserIdFromToken(request: NextRequest): string | null {
  try {
    const token =
      request.headers.get("authorization")?.replace("Bearer ", "") ||
      request.cookies.get("token")?.value ||
      request.headers.get("x-auth-token")

    if (!token) {
      // Tentar pegar do localStorage via header customizado
      const authHeader = request.headers.get("authorization")
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const jwtToken = authHeader.substring(7)
        const decoded = jwt.verify(jwtToken, JWT_SECRET) as any
        return decoded.userId
      }
      return null
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    return decoded.userId
  } catch (error) {
    console.error("Erro ao decodificar token:", error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log("=== GET PASSWORDS API ===")

    // Para demo, vamos usar um userId fixo se não conseguir extrair do token
    let userId = getUserIdFromToken(request)

    if (!userId) {
      console.log("Token não encontrado, usando usuário demo")
      userId = "user-1" // Usuário demo
    }

    console.log("Buscando senhas para usuário:", userId)

    const passwords = await getPasswordsByUserId(userId)
    console.log("Senhas encontradas:", passwords.length)

    // Descriptografar senhas
    const decryptedPasswords = passwords.map((password) => ({
      id: password.id,
      title: password.title,
      username: password.username,
      password: decrypt(password.encrypted_password),
      url: password.url,
      category: password.category,
      notes: password.notes,
      createdAt: password.created_at,
      updatedAt: password.updated_at,
    }))

    return NextResponse.json(decryptedPasswords)
  } catch (error) {
    console.error("Erro ao buscar senhas:", error)
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("=== POST PASSWORD API ===")

    // Parse do body
    let body
    try {
      body = await request.json()
    } catch (error) {
      console.error("Erro ao parsear JSON:", error)
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
    }

    const { title, username, password, url, category, notes } = body
    console.log("Dados recebidos:", { title, username, category, url: !!url, notes: !!notes })

    if (!title || !username || !password) {
      return NextResponse.json({ error: "Título, usuário e senha são obrigatórios" }, { status: 400 })
    }

    // Para demo, vamos usar um userId fixo se não conseguir extrair do token
    let userId = getUserIdFromToken(request)

    if (!userId) {
      console.log("Token não encontrado, usando usuário demo")
      userId = "user-1" // Usuário demo
    }

    console.log("Criando senha para usuário:", userId)

    const encryptedPassword = encrypt(password)
    const now = new Date().toISOString()

    const passwordId = await createPassword(
      userId,
      title,
      username,
      encryptedPassword,
      url || undefined,
      notes || undefined,
      category || "other",
    )

    console.log("Senha criada com ID:", passwordId)

    return NextResponse.json({
      id: passwordId,
      title,
      username,
      password, // Retorna a senha descriptografada
      url,
      category: category || "other",
      notes,
      createdAt: now,
      updatedAt: now,
    })
  } catch (error) {
    console.error("Erro ao criar senha:", error)
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
