import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { authenticator } from "otplib"
import { getUserById } from "@/lib/database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: NextRequest) {
  try {
    const { token, code } = await request.json()

    if (!token || !code) {
      return NextResponse.json({ error: "Token e código são obrigatórios" }, { status: 400 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    const user = getUserById(decoded.userId)

    if (!user || !user.two_factor_secret) {
      return NextResponse.json({ error: "2FA não configurado" }, { status: 400 })
    }

    const isValid = authenticator.verify({
      token: code,
      secret: user.two_factor_secret,
    })

    if (!isValid) {
      return NextResponse.json({ error: "Código inválido" }, { status: 400 })
    }

    // Generate final JWT token
    const finalToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        twoFactorVerified: true,
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    )

    return NextResponse.json({
      success: true,
      token: finalToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        twoFactorEnabled: !!user.two_factor_enabled,
      },
    })
  } catch (error) {
    console.error("2FA verification error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
