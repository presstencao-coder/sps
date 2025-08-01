import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { getDatabase } from "@/lib/database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function GET(request: NextRequest) {
  try {
    console.log("=== GET PROFILE API ===")

    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token não fornecido" }, { status: 401 })
    }

    const token = authHeader.substring(7)

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any
      console.log("Token decodificado:", decoded)

      const db = getDatabase()
      const user = db.users.find((u) => u.id === decoded.userId)

      if (!user) {
        return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
      }

      return NextResponse.json({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        twoFactorEnabled: user.twoFactorEnabled || false,
      })
    } catch (jwtError) {
      console.error("Erro ao verificar token:", jwtError)
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }
  } catch (error) {
    console.error("Erro na API de perfil:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log("=== UPDATE PROFILE API ===")

    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token não fornecido" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const { name, email } = await request.json()

    if (!name || !email) {
      return NextResponse.json({ error: "Nome e email são obrigatórios" }, { status: 400 })
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any
      console.log("Token decodificado:", decoded)

      const db = getDatabase()
      const userIndex = db.users.findIndex((u) => u.id === decoded.userId)

      if (userIndex === -1) {
        return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
      }

      // Check if email is already taken by another user
      const existingUser = db.users.find((u) => u.email === email && u.id !== decoded.userId)
      if (existingUser) {
        return NextResponse.json({ error: "Email já está em uso" }, { status: 400 })
      }

      // Update user
      db.users[userIndex] = {
        ...db.users[userIndex],
        name,
        email,
      }

      const updatedUser = db.users[userIndex]

      return NextResponse.json({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        createdAt: updatedUser.createdAt,
        twoFactorEnabled: updatedUser.twoFactorEnabled || false,
      })
    } catch (jwtError) {
      console.error("Erro ao verificar token:", jwtError)
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }
  } catch (error) {
    console.error("Erro na API de atualização de perfil:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
