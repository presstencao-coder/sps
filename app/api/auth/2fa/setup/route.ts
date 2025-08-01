import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { authenticator } from "otplib"
import QRCode from "qrcode"
import { runQuery } from "@/lib/database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: NextRequest) {
  try {
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

    // Gerar secret temporário
    const secret = authenticator.generateSecret()

    // Salvar secret temporário no banco
    await runQuery("UPDATE users SET temp_two_factor_secret = ? WHERE id = ?", [secret, userId])

    // Gerar QR Code
    const serviceName = "Secure Password Manager"
    const accountName = decoded.email || "user@example.com"
    const otpauth = authenticator.keyuri(accountName, serviceName, secret)

    const qrCodeDataURL = await QRCode.toDataURL(otpauth)

    return NextResponse.json({
      success: true,
      qrCode: qrCodeDataURL,
      secret: secret,
    })
  } catch (error) {
    console.error("Erro no setup 2FA:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
