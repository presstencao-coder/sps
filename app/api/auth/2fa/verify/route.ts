import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { authenticator } from "otplib"
import { getUserById, updateUser2FA } from "@/lib/database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: NextRequest) {
  try {
    console.log("=== 2FA VERIFY POST ===")

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
      console.error("JWT verification error:", error)
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const { code } = await request.json()
    console.log("Código recebido:", code)

    if (!code || code.length !== 6) {
      console.log("Código inválido")
      return NextResponse.json({ error: "Código de verificação inválido" }, { status: 400 })
    }

    const userId = decoded.userId

    // Buscar usuário e secret temporário
    const user = await getUserById(userId)
    if (!user || !user.temp_two_factor_secret) {
      console.log("Secret 2FA temporário não encontrado")
      return NextResponse.json({ error: "Secret 2FA não encontrado" }, { status: 400 })
    }

    console.log("Verificando código com secret temporário")

    // Verificar código
    const isValid = authenticator.verify({
      token: code,
      secret: user.temp_two_factor_secret,
      window: 2, // Permite uma janela de tempo maior
    })

    if (!isValid) {
      console.log("Código de verificação inválido")
      return NextResponse.json({ error: "Código de verificação inválido" }, { status: 400 })
    }

    console.log("Código válido! Ativando 2FA permanentemente")

    // Ativar 2FA permanentemente
    await updateUser2FA(userId, user.temp_two_factor_secret, true)

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

    console.log("Token final gerado")

    // Buscar dados atualizados do usuário
    const updatedUser = await getUserById(userId)

    return NextResponse.json({
      token: finalToken,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        twoFactorEnabled: updatedUser.two_factor_enabled === 1,
      },
      message: "2FA configurado com sucesso",
    })
  } catch (error: any) {
    console.error("=== ERRO NO 2FA VERIFY ===", error)
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
