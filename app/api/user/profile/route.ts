import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { getUserById, updateUser } from "@/lib/database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token de autorização necessário" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    let decoded: any

    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (error) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const user = await getUserById(decoded.userId)
    if (!user) {
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
    console.error("Erro ao buscar perfil:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token de autorização necessário" }, { status: 401 })
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

    await updateUser(decoded.userId, name, email)

    const updatedUser = await getUserById(decoded.userId)
    if (!updatedUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      twoFactorEnabled: updatedUser.two_factor_enabled,
      createdAt: updatedUser.created_at,
      updatedAt: updatedUser.updated_at,
    })
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
