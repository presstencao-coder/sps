import { type NextRequest, NextResponse } from "next/server"
import { hash } from "bcryptjs"
import jwt from "jsonwebtoken"
import { getDatabase } from "@/lib/database"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Nome, email e senha são obrigatórios" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "A senha deve ter pelo menos 6 caracteres" }, { status: 400 })
    }

    const db = await getDatabase()

    // Verificar se o usuário já existe
    const existingUser = await db.get("SELECT * FROM users WHERE email = ?", [email])

    if (existingUser) {
      return NextResponse.json({ error: "Este email já está cadastrado" }, { status: 409 })
    }

    // Criptografar a senha
    const passwordHash = await hash(password, 12)

    // Criar novo usuário
    const userId = uuidv4()
    const now = new Date().toISOString()

    await db.run(
      `INSERT INTO users (id, name, email, password_hash, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, name, email, passwordHash, now, now],
    )

    // Gerar token JWT
    const token = jwt.sign({ userId, email, name }, process.env.JWT_SECRET || "fallback-secret", { expiresIn: "24h" })

    return NextResponse.json({
      token,
      user: {
        id: userId,
        name,
        email,
      },
      message: "Conta criada com sucesso!",
    })
  } catch (error) {
    console.error("Erro ao criar usuário:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
