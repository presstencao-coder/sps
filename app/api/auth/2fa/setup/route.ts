import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { authenticator } from "otplib"
import QRCode from "qrcode"
import { getUserById, updateUser } from "@/lib/database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token não encontrado" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

    const user = getUserById(decoded.userId)
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Generate a temporary secret
    const secret = authenticator.generateSecret()
    const serviceName = "SecureVault"
    const accountName = user.email
    const otpauth = authenticator.keyuri(accountName, serviceName, secret)

    // Generate QR code
    const qrCodeDataURL = await QRCode.toDataURL(otpauth)

    // Store temporary secret
    updateUser(decoded.userId, { temp_two_factor_secret: secret })

    return NextResponse.json({
      secret,
      qrCode: qrCodeDataURL,
      manualEntryKey: secret,
    })
  } catch (error) {
    console.error("Setup 2FA error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token não encontrado" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

    const { code } = await request.json()

    const user = getUserById(decoded.userId)
    if (!user || !user.temp_two_factor_secret) {
      return NextResponse.json({ error: "Configuração 2FA não encontrada" }, { status: 400 })
    }

    // Verify the code
    const isValid = authenticator.verify({
      token: code,
      secret: user.temp_two_factor_secret,
    })

    if (!isValid) {
      return NextResponse.json({ error: "Código inválido" }, { status: 400 })
    }

    // Enable 2FA and move temp secret to permanent
    updateUser(decoded.userId, {
      two_factor_secret: user.temp_two_factor_secret,
      two_factor_enabled: true,
      temp_two_factor_secret: null,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Verify 2FA setup error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
