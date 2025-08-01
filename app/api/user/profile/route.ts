import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { getDatabase } from "@/lib/database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function GET(request: NextRequest) {
  try {
    console.log("=== GET USER PROFILE ===")

    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Token não fornecido")
      return NextResponse.json({ error: "Token não fornecido" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    let decoded: any

    try {
      decoded = jwt.verify(token, JWT_SECRET)
      console.log("Token decodificado:", decoded)
    } catch (error) {
      console.error("Token inválido:", error)
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const db = getDatabase()
    const user = db
      .prepare("SELECT id, name, email, two_factor_enabled, created_at FROM users WHERE id = ?")
      .get(decoded.userId)

    if (!user) {
      console.log("Usuário não encontrado")
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    console.log("Perfil do usuário carregado:", user)

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      twoFactorEnabled: Boolean(user.two_factor_enabled),
      createdAt: user.created_at,
    })
  } catch (error: any) {
    console.error("=== ERRO NO GET PROFILE ===", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log("=== UPDATE USER PROFILE ===")

    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Token não fornecido")
      return NextResponse.json({ error: "Token não fornecido" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    let decoded: any

    try {
      decoded = jwt.verify(token, JWT_SECRET)
      console.log("Token decodificado:", decoded)
    } catch (error) {
      console.error("Token inválido:", error)
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const { name, email } = await request.json()
    console.log("Dados para atualizar:", { name, email })

    if (!name || !email) {
      return NextResponse.json({ error: "Nome e email são obrigatórios" }, { status: 400 })
    }

    const db = getDatabase()

    // Verificar se o email já existe para outro usuário
    const existingUser = db.prepare("SELECT id FROM users WHERE email = ? AND id != ?").get(email, decoded.userId)
    if (existingUser) {
      return NextResponse.json({ error: "Email já está em uso" }, { status: 400 })
    }

    // Atualizar o usuário
    const updateResult = db
      .prepare("UPDATE users SET name = ?, email = ? WHERE id = ?")
      .run(name, email, decoded.userId)

    if (updateResult.changes === 0) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    console.log("Perfil atualizado com sucesso")

    return NextResponse.json({
      success: true,
      name,
      email,
    })
  } catch (error: any) {
    console.error("=== ERRO NO UPDATE PROFILE ===", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
