import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { authenticator } from "otplib"
import QRCode from "qrcode"
import { getUserById, updateTempTwoFactorSecret } from "@/lib/database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: NextRequest) {
  try {
    console.log("=== 2FA SETUP POST ===")

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

    const userId = decoded.userId
    if (!userId) {
      console.log("ID do usuário não encontrado no token")
      return NextResponse.json({ error: "ID do usuário não encontrado no token" }, { status: 401 })
    }

    // Buscar usuário
    const user = await getUserById(userId)
    if (!user) {
      console.log("Usuário não encontrado:", userId)
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    console.log("Usuário encontrado:", user.email)

    // Gerar secret para 2FA
    const secret = authenticator.generateSecret()
    const serviceName = "SecureVault"
    const accountName = user.email

    console.log("Secret gerado:", secret.substring(0, 8) + "...")

    // Criar URL do OTP
    const otpUrl = authenticator.keyuri(accountName, serviceName, secret)
    console.log("OTP URL criado")

    // Gerar QR Code como SVG
    const qrCode = await QRCode.toString(otpUrl, {
      type: "svg",
      width: 200,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    })

    console.log("QR Code SVG gerado")

    // Salvar o secret temporariamente
    await updateTempTwoFactorSecret(userId, secret)
    console.log("Secret temporário salvo")

    return NextResponse.json({
      qrCode,
      secret,
      message: "QR Code gerado com sucesso",
    })
  } catch (error: any) {
    console.error("=== ERRO NO SETUP 2FA ===", error)
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
