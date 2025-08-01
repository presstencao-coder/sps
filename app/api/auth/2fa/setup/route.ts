import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { authenticator } from "otplib"
import QRCode from "qrcode"
import { getUserById, updateUser2FA } from "@/lib/database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: NextRequest) {
  try {
    console.log("=== 2FA SETUP API CHAMADA ===")

    // Get token from Authorization header
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Token de autorização ausente")
      return NextResponse.json({ error: "Token de autorização necessário" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    let decoded: any

    try {
      decoded = jwt.verify(token, JWT_SECRET)
      console.log("Token decodificado:", { userId: decoded.userId, email: decoded.email })
    } catch (error) {
      console.error("Token inválido:", error)
      return NextResponse.json({ error: "Token inválido ou expirado" }, { status: 401 })
    }

    if (!decoded.userId) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    // Get user from database
    const user = await getUserById(decoded.userId)
    if (!user) {
      console.log("Usuário não encontrado:", decoded.userId)
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    console.log("Usuário encontrado:", user.email)

    // Generate a new secret for 2FA
    const secret = authenticator.generateSecret()
    console.log("Secret gerado:", secret.substring(0, 8) + "...")

    // Create the service name and account name for the QR code
    const serviceName = "SecureVault"
    const accountName = user.email

    // Generate the otpauth URL
    const otpauthUrl = authenticator.keyuri(accountName, serviceName, secret)
    console.log("OTPAuth URL gerado")

    // Generate QR code
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl)
    console.log("QR Code gerado, tamanho:", qrCodeDataUrl.length)

    // Save the secret to the user (but don't enable 2FA yet)
    await updateUser2FA(user.id, secret, false)
    console.log("Secret salvo no usuário")

    return NextResponse.json({
      success: true,
      secret,
      qrCode: qrCodeDataUrl,
      manualEntryKey: secret,
      serviceName,
      accountName,
    })
  } catch (error) {
    console.error("=== ERRO NO SETUP 2FA ===", error)
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
