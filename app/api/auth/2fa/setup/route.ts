import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { authenticator } from "otplib"
import QRCode from "qrcode"
import { getUserById, updateUser2FA } from "@/lib/database"

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

    const user = await getUserById(decoded.userId)
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Generate a new secret for 2FA
    const secret = authenticator.generateSecret()

    // Create the service name and account name for the QR code
    const serviceName = "Password Manager"
    const accountName = user.email

    // Generate the otpauth URL
    const otpauthUrl = authenticator.keyuri(accountName, serviceName, secret)

    // Generate QR code
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl)

    // Save the secret to the user (but don't enable 2FA yet)
    await updateUser2FA(user.id, secret, false)

    return NextResponse.json({
      secret,
      qrCode: qrCodeDataUrl,
      manualEntryKey: secret,
    })
  } catch (error) {
    console.error("Erro no setup 2FA:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
