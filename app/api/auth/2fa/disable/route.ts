import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { getDatabase } from "@/lib/database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: NextRequest) {
  try {
    console.log("=== DISABLE 2FA ===")

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

    // Desabilitar 2FA para o usuário
    const updateResult = db
      .prepare(`
      UPDATE users 
      SET two_factor_enabled = 0, two_factor_secret = NULL 
      WHERE id = ?
    `)
      .run(decoded.userId)

    if (updateResult.changes === 0) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    console.log("2FA desabilitado com sucesso")

    return NextResponse.json({
      success: true,
      message: "Autenticação de dois fatores desabilitada",
    })
  } catch (error: any) {
    console.error("=== ERRO NO DISABLE 2FA ===", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
