import { type NextRequest, NextResponse } from "next/server"
import { compare } from "bcryptjs"
import jwt from "jsonwebtoken"
import { getDatabase } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 })
    }

    const db = await getDatabase()

    // Buscar usuário
    const user = await db.get("SELECT * FROM users WHERE email = ?", [email])

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 401 })
    }

    // Verificar senha
    const isValidPassword = await compare(password, user.password_hash)

    if (!isValidPassword) {
      return NextResponse.json({ error: "Senha inválida" }, { status: 401 })
    }

    // Gerar token JWT
    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || "fallback-secret", {
      expiresIn: "24h",
    })

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    })
  } catch (error) {
    console.error("Erro no login:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
