import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { authenticator } from "otplib"
import { getUserById, updateUser2FA } from "@/lib/database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: NextRequest) {
  try {
    console.log("=== 2FA VERIFY API CHAMADA ===")

    // Get token from Authorization header
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token de autorização necessário" }, { status: 401 })
    }

    const authToken = authHeader.substring(7)
    let decoded: any

    try {
      decoded = jwt.verify(authToken, JWT_SECRET)
      console.log("Token decodificado:", { userId: decoded.userId, email: decoded.email })
    } catch (error) {
      console.error("Token inválido:", error)
      return NextResponse.json({ error: "Token inválido ou expirado" }, { status: 401 })
    }

    // Get request body
    const body = await request.json()
    const { token } = body

    if (!token || token.length !== 6) {
      return NextResponse.json({ error: "Código de 6 dígitos é obrigatório" }, { status: 400 })
    }

    console.log("Verificando código:", token)

    // Get user from database
    const user = await getUserById(decoded.userId)
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    if (!user.two_factor_secret) {
      return NextResponse.json({ error: "2FA não configurado" }, { status: 400 })
    }

    // Verify the token
    const isValid = authenticator.verify({
      token,
      secret: user.two_factor_secret,
    })

    console.log("Código válido:", isValid)

    if (!isValid) {
      return NextResponse.json({ error: "Código inválido ou expirado" }, { status: 400 })
    }

    // Enable 2FA for the user
    await updateUser2FA(user.id, user.two_factor_secret, true)
    console.log("2FA habilitado para usuário:", user.email)

    // Generate new token with 2FA verified
    const newToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        twoFactorVerified: true,
      },
      JWT_SECRET,
      { expiresIn: "24h" },
    )

    return NextResponse.json({
      success: true,
      token: newToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        twoFactorEnabled: true,
      },
    })
  } catch (error) {
    console.error("=== ERRO NA VERIFICAÇÃO 2FA ===", error)
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
