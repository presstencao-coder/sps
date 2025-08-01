import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { getUserById, updateUserPassword } from "@/lib/database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: NextRequest) {
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
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Senha atual e nova senha são obrigatórias" }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "A nova senha deve ter pelo menos 6 caracteres" }, { status: 400 })
    }

    const user = await getUserById(decoded.userId)
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Verify current password (for demo, we're using simple comparison)
    if (user.password_hash !== currentPassword) {
      return NextResponse.json({ error: "Senha atual incorreta" }, { status: 400 })
    }

    // Update password (for demo, storing directly)
    await updateUserPassword(decoded.userId, newPassword)

    return NextResponse.json({ success: true, message: "Senha alterada com sucesso" })
  } catch (error) {
    console.error("Erro ao alterar senha:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
