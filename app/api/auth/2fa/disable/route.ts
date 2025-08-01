import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { getDatabase } from "@/lib/database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/auth/2fa/disable - Desabilitando 2FA")

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

    // Disable 2FA
    db.prepare(`
      UPDATE users 
      SET two_factor_enabled = 0, two_factor_secret = NULL, updated_at = ?
      WHERE id = ?
    `).run(new Date().toISOString(), userId)

    console.log("2FA desabilitado com sucesso para usuário:", userId)

    return NextResponse.json({
      message: "2FA desabilitado com sucesso",
    })
  } catch (error) {
    console.error("Erro ao desabilitar 2FA:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
