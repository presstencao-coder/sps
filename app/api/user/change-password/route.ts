import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { getDatabase } from "@/lib/database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/user/change-password - Alterando senha do usuário")

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

    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Senha atual e nova senha são obrigatórias" }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "A nova senha deve ter pelo menos 6 caracteres" }, { status: 400 })
    }

    const db = getDatabase()
    const user = db.prepare("SELECT password FROM users WHERE id = ?").get(userId)

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ error: "Senha atual incorreta" }, { status: 400 })
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    db.prepare(`
      UPDATE users 
      SET password = ?, updated_at = ?
      WHERE id = ?
    `).run(hashedNewPassword, new Date().toISOString(), userId)

    console.log("Senha alterada com sucesso para usuário:", userId)

    return NextResponse.json({
      message: "Senha alterada com sucesso",
    })
  } catch (error) {
    console.error("Erro ao alterar senha:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
