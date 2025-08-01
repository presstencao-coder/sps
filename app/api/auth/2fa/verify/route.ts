import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { authenticator } from "otplib"
import { getDatabase } from "@/lib/database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token não fornecido" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    let decoded: any

    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (error) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const { code } = await request.json()
    if (!code || code.length !== 6) {
      return NextResponse.json({ error: "Código de verificação inválido" }, { status: 400 })
    }

    const userId = decoded.userId
    const db = getDatabase()

    // Buscar usuário e secret temporário
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as any
    if (!user || !user.temp_two_factor_secret) {
      return NextResponse.json({ error: "Secret 2FA não encontrado" }, { status: 400 })
    }

    // Verificar código
    const isValid = authenticator.verify({
      token: code,
      secret: user.temp_two_factor_secret,
      window: 2, // Permite uma janela de tempo maior
    })

    if (!isValid) {
      return NextResponse.json({ error: "Código de verificação inválido" }, { status: 400 })
    }

    // Ativar 2FA permanentemente
    db.prepare(`
      UPDATE users 
      SET two_factor_secret = ?, 
          two_factor_enabled = 1, 
          temp_two_factor_secret = NULL 
      WHERE id = ?
    `).run(user.temp_two_factor_secret, userId)

    // Gerar token final
    const finalToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        twoFactorVerified: true,
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    )

    // Buscar dados atualizados do usuário
    const updatedUser = db.prepare("SELECT id, name, email, two_factor_enabled FROM users WHERE id = ?").get(userId)

    return NextResponse.json({
      token: finalToken,
      user: updatedUser,
      message: "2FA configurado com sucesso",
    })
  } catch (error) {
    console.error("2FA verify error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
