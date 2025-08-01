import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { getDatabase } from "@/lib/database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function GET(request: NextRequest) {
  try {
    console.log("GET /api/user/profile - Carregando perfil do usuário")

    const authHeader = request.headers.get("authorization")
    let userId = "demo-user-id"

    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.substring(7)
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
        userId = decoded.userId
        console.log("Token válido, userId:", userId)
      } catch (error) {
        console.log("Token inválido, usando usuário demo")
      }
    }

    const db = getDatabase()
    const user = db
      .prepare("SELECT id, name, email, two_factor_enabled, created_at, updated_at FROM users WHERE id = ?")
      .get(userId)

    if (!user) {
      console.log("Usuário não encontrado, criando usuário demo")
      // Create demo user if not exists
      const hashedPassword = await bcrypt.hash("admin123", 10)
      db.prepare(`
        INSERT OR REPLACE INTO users (id, name, email, password, two_factor_enabled, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        userId,
        "Administrador",
        "admin@example.com",
        hashedPassword,
        0,
        new Date().toISOString(),
        new Date().toISOString(),
      )

      const newUser = db
        .prepare("SELECT id, name, email, two_factor_enabled, created_at, updated_at FROM users WHERE id = ?")
        .get(userId)

      return NextResponse.json({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        twoFactorEnabled: Boolean(newUser.two_factor_enabled),
        createdAt: newUser.created_at,
        updatedAt: newUser.updated_at,
      })
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      twoFactorEnabled: Boolean(user.two_factor_enabled),
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    })
  } catch (error) {
    console.error("Erro ao carregar perfil:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log("PUT /api/user/profile - Atualizando perfil do usuário")

    const authHeader = request.headers.get("authorization")
    let userId = "demo-user-id"

    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.substring(7)
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
        userId = decoded.userId
        console.log("Token válido, userId:", userId)
      } catch (error) {
        console.log("Token inválido, usando usuário demo")
      }
    }

    const { name, email } = await request.json()

    if (!name || !email) {
      return NextResponse.json({ error: "Nome e email são obrigatórios" }, { status: 400 })
    }

    const db = getDatabase()

    // Check if email is already taken by another user
    const existingUser = db.prepare("SELECT id FROM users WHERE email = ? AND id != ?").get(email, userId)
    if (existingUser) {
      return NextResponse.json({ error: "Este email já está em uso" }, { status: 400 })
    }

    // Update user
    db.prepare(`
      UPDATE users 
      SET name = ?, email = ?, updated_at = ?
      WHERE id = ?
    `).run(name, email, new Date().toISOString(), userId)

    // Get updated user
    const updatedUser = db
      .prepare("SELECT id, name, email, two_factor_enabled, created_at, updated_at FROM users WHERE id = ?")
      .get(userId)

    return NextResponse.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      twoFactorEnabled: Boolean(updatedUser.two_factor_enabled),
      createdAt: updatedUser.created_at,
      updatedAt: updatedUser.updated_at,
    })
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
