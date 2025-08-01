import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { getDatabase } from "@/lib/database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: NextRequest) {
  try {
    console.log("=== CHANGE PASSWORD API ===")

    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token não fornecido" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Senha atual e nova senha são obrigatórias" }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "A nova senha deve ter pelo menos 6 caracteres" }, { status: 400 })
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any
      console.log("Token decodificado:", decoded)

      const db = getDatabase()
      const userIndex = db.users.findIndex((u) => u.id === decoded.userId)

      if (userIndex === -1) {
        return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
      }

      const user = db.users[userIndex]

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
      if (!isCurrentPasswordValid) {
        return NextResponse.json({ error: "Senha atual incorreta" }, { status: 400 })
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12)

      // Update password
      db.users[userIndex] = {
        ...user,
        password: hashedNewPassword,
      }

      console.log("Senha alterada com sucesso para usuário:", user.email)

      return NextResponse.json({
        success: true,
        message: "Senha alterada com sucesso",
      })
    } catch (jwtError) {
      console.error("Erro ao verificar token:", jwtError)
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }
  } catch (error) {
    console.error("Erro na API de alteração de senha:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
