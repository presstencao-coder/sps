import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { authenticator } from "otplib"
import QRCode from "qrcode"
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
      console.error("JWT verification error:", error)
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const userId = decoded.userId
    if (!userId) {
      return NextResponse.json({ error: "ID do usuário não encontrado no token" }, { status: 401 })
    }

    const db = getDatabase()

    // Buscar usuário
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as any
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Gerar secret para 2FA
    const secret = authenticator.generateSecret()
    const serviceName = "SecureVault"
    const accountName = user.email

    // Criar URL do OTP
    const otpUrl = authenticator.keyuri(accountName, serviceName, secret)

    // Gerar QR Code
    const qrCode = await QRCode.toString(otpUrl, {
      type: "svg",
      width: 200,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    })

    // Salvar o secret temporariamente (será confirmado na verificação)
    db.prepare("UPDATE users SET temp_two_factor_secret = ? WHERE id = ?").run(secret, userId)

    console.log("=== 2FA SETUP SUCCESS ===")
    console.log("User ID:", userId)
    console.log("Secret generated:", secret.substring(0, 8) + "...")
    console.log("QR Code generated successfully")

    return NextResponse.json({
      qrCode,
      secret,
      message: "QR Code gerado com sucesso",
    })
  } catch (error) {
    console.error("=== 2FA SETUP ERROR ===", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
