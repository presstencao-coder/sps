import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { authenticator } from "otplib"
import { getUserById, updateUser2FA } from "@/lib/database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: NextRequest) {
  try {
    const { token: otpToken } = await request.json()

    if (!otpToken) {
      return NextResponse.json({ error: "Código não fornecido" }, { status: 400 })
    }

    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token de autorização não fornecido" }, { status: 401 })
    }

    const jwtToken = authHeader.substring(7)
    let decoded: any

    try {
      decoded = jwt.verify(jwtToken, JWT_SECRET)
    } catch (error) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const user = await getUserById(decoded.userId)
    if (!user || !user.two_factor_secret) {
      return NextResponse.json({ error: "Usuário não encontrado ou 2FA não configurado" }, { status: 404 })
    }

    // Set options for token verification with time window
    authenticator.options = {
      window: 2, // Allow 2 time steps before and after current time
      step: 30, // 30 second time step
    }

    // Verify the token
    const isValid = authenticator.verify({
      token: otpToken,
      secret: user.two_factor_secret,
    })

    if (!isValid) {
      return NextResponse.json({ error: "Código inválido" }, { status: 400 })
    }

    // Enable 2FA for the user
    await updateUser2FA(user.id, user.two_factor_secret, true)

    // Generate a new JWT token with 2FA verified
    const newToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        twoFactorVerified: true,
      },
      JWT_SECRET,
      { expiresIn: "24h" },
    )

    return NextResponse.json({
      success: true,
      message: "2FA verificado com sucesso",
      token: newToken,
    })
  } catch (error) {
    console.error("Erro na verificação 2FA:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
