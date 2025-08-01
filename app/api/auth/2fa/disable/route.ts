import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { getDatabase } from "@/lib/database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: NextRequest) {
  try {
    console.log("=== DISABLE 2FA API ===")

    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token não fornecido" }, { status: 401 })
    }

    const token = authHeader.substring(7)

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any
      console.log("Token decodificado:", decoded)

      const db = getDatabase()
      const userIndex = db.users.findIndex((u) => u.id === decoded.userId)

      if (userIndex === -1) {
        return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
      }

      // Disable 2FA
      db.users[userIndex] = {
        ...db.users[userIndex],
        twoFactorEnabled: false,
        twoFactorSecret: undefined,
      }

      console.log("2FA desabilitado para usuário:", db.users[userIndex].email)

      return NextResponse.json({
        success: true,
        message: "2FA desabilitado com sucesso",
      })
    } catch (jwtError) {
      console.error("Erro ao verificar token:", jwtError)
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }
  } catch (error) {
    console.error("Erro na API de desabilitar 2FA:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
