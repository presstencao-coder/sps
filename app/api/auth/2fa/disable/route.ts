import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { getUserById, updateUser2FA } from "@/lib/database"

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

    const user = await getUserById(decoded.userId)
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Disable 2FA
    await updateUser2FA(decoded.userId, "", false)

    return NextResponse.json({
      success: true,
      message: "2FA desabilitado com sucesso",
    })
  } catch (error) {
    console.error("Erro ao desabilitar 2FA:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
