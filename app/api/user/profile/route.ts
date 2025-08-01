import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { getUserById } from "@/lib/database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function GET(request: NextRequest) {
  try {
    console.log("=== GET PROFILE API ===")

    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Token não fornecido")
      return NextResponse.json({ error: "Token não fornecido" }, { status: 401 })
    }

    const token = authHeader.substring(7)

    let decoded: any
    try {
      decoded = jwt.verify(token, JWT_SECRET)
      console.log("Token decodificado:", decoded.userId)
    } catch (error) {
      console.error("Token inválido:", error)
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const user = await getUserById(decoded.userId)
    if (!user) {
      console.log("Usuário não encontrado")
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      twoFactorEnabled: user.two_factor_enabled,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    })
  } catch (error) {
    console.error("Erro no GET profile:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log("=== PUT PROFILE API ===")

    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token não fornecido" }, { status: 401 })
    }

    const token = authHeader.substring(7)

    let decoded: any
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (error) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const body = await request.json()
    const { name, email } = body

    if (!name || !email) {
      return NextResponse.json({ error: "Nome e email são obrigatórios" }, { status: 400 })
    }

    const { updateUser } = await import("@/lib/database")
    await updateUser(decoded.userId, name, email)

    return NextResponse.json({ success: true, message: "Perfil atualizado com sucesso" })
  } catch (error) {
    console.error("Erro no PUT profile:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
