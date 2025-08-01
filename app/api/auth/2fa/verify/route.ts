import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { authenticator } from "otplib"
import { getQuery, runQuery } from "@/lib/database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: NextRequest) {
  try {
    const { token: otp } = await request.json()

    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token não encontrado" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    let decoded: any

    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (error) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const userId = decoded.userId

    // Buscar secret temporário
    const user = await getQuery("SELECT temp_two_factor_secret FROM users WHERE id = ?", [userId])

    if (!user || !user.temp_two_factor_secret) {
      return NextResponse.json({ error: "Secret não encontrado" }, { status: 400 })
    }

    // Verificar token
    const isValid = authenticator.verify({
      token: otp,
      secret: user.temp_two_factor_secret,
    })

    if (!isValid) {
      return NextResponse.json({ error: "Código inválido" }, { status: 400 })
    }

    // Mover secret temporário para permanente
    await runQuery(
      "UPDATE users SET two_factor_secret = ?, temp_two_factor_secret = NULL, two_factor_enabled = 1 WHERE id = ?",
      [user.temp_two_factor_secret, userId],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro na verificação 2FA:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
