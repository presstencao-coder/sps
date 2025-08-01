import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { authenticator } from "otplib"
import { getUserByEmail } from "@/lib/database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: NextRequest) {
  try {
    const { email, password, twoFactorCode } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 })
    }

    // Find user by email
    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 })
    }

    // Verify password
    const isPasswordValid = bcrypt.compareSync(password, user.password_hash)
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 })
    }

    // Check if 2FA is enabled
    if (user.two_factor_enabled && user.two_factor_secret) {
      if (!twoFactorCode) {
        return NextResponse.json(
          {
            error: "Código 2FA necessário",
            requiresTwoFactor: true,
          },
          { status: 200 },
        )
      }

      // Verify 2FA code
      authenticator.options = {
        window: 2,
        step: 30,
      }

      const isValidTwoFactor = authenticator.verify({
        token: twoFactorCode,
        secret: user.two_factor_secret,
      })

      if (!isValidTwoFactor) {
        return NextResponse.json({ error: "Código 2FA inválido" }, { status: 401 })
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        twoFactorVerified: user.two_factor_enabled ? true : false,
      },
      JWT_SECRET,
      { expiresIn: "24h" },
    )

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        twoFactorEnabled: user.two_factor_enabled,
      },
    })
  } catch (error) {
    console.error("Erro no login:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
