import { type NextRequest, NextResponse } from "next/server"
import { authenticator } from "otplib"
import QRCode from "qrcode"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 })
    }

    // Gerar secret para 2FA
    const secret = authenticator.generateSecret()

    // Criar URL para o QR Code
    const otpauth = authenticator.keyuri(email, "SecureVault", secret)

    // Gerar QR Code
    const qrCode = await QRCode.toDataURL(otpauth)

    return NextResponse.json({
      secret,
      qrCode,
    })
  } catch (error) {
    console.error("Erro ao configurar 2FA:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
