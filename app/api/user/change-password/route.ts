import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { getDatabase } from "@/lib/database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: NextRequest) {
  try {
    console.log("=== CHANGE PASSWORD ===")

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

    const { currentPassword, newPassword } = await request.json()
    console.log("Dados recebidos para alteração de senha")

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Senha atual e nova senha são obrigatórias" }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Nova senha deve ter pelo menos 6 caracteres" }, { status: 400 })
    }

    const db = getDatabase()
    const user = db.prepare("SELECT id, password FROM users WHERE id = ?").get(decoded.userId)

    if (!user) {
      console.log("Usuário não encontrado")
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Verificar senha atual
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      console.log("Senha atual incorreta")
      return NextResponse.json({ error: "Senha atual incorreta" }, { status: 400 })
    }

    // Hash da nova senha
    const hashedNewPassword = await bcrypt.hash(newPassword, 10)

    // Atualizar senha no banco
    const updateResult = db.prepare("UPDATE users SET password = ? WHERE id = ?").run(hashedNewPassword, decoded.userId)

    if (updateResult.changes === 0) {
      return NextResponse.json({ error: "Erro ao atualizar senha" }, { status: 500 })
    }

    console.log("Senha alterada com sucesso")

    return NextResponse.json({
      success: true,
      message: "Senha alterada com sucesso",
    })
  } catch (error: any) {
    console.error("=== ERRO NO CHANGE PASSWORD ===", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
