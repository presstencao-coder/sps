import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { getUserByEmail } from "@/lib/database"
import { verifyPassword } from "@/lib/encryption"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: NextRequest) {
  try {
    console.log("=== LOGIN API CHAMADA ===")

    let body
    try {
      body = await request.json()
    } catch (error) {
      console.error("Erro ao parsear JSON:", error)
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
    }

    const { email, password, twoFactorCode } = body
    console.log("Login attempt for:", email)

    if (!email || !password) {
      return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 })
    }

    // Find user by email
    let user
    try {
      user = await getUserByEmail(email)
      console.log("User found:", user ? "Yes" : "No")
    } catch (error) {
      console.error("Erro ao buscar usuário:", error)
      return NextResponse.json({ error: "Erro ao buscar usuário" }, { status: 500 })
    }

    if (!user) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 })
    }

    // Verify password
    let isPasswordValid = false
    try {
      isPasswordValid = verifyPassword(password, user.password_hash)
      console.log("Password valid:", isPasswordValid)
    } catch (error) {
      console.error("Erro ao verificar senha:", error)
      return NextResponse.json({ error: "Erro na verificação de senha" }, { status: 500 })
    }

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 })
    }

    // Generate JWT token
    let token
    try {
      token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          name: user.name,
          twoFactorVerified: false, // Will be updated after 2FA
        },
        JWT_SECRET,
        { expiresIn: "24h" },
      )
      console.log("Token generated successfully")
    } catch (error) {
      console.error("Erro ao gerar token:", error)
      return NextResponse.json({ error: "Erro ao gerar token" }, { status: 500 })
    }

    // Check if user needs to set up 2FA
    const needsTwoFactorSetup = !user.two_factor_enabled
    console.log("Needs 2FA setup:", needsTwoFactorSetup)

    return NextResponse.json({
      success: true,
      token,
      requiresTwoFactor: needsTwoFactorSetup,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        twoFactorEnabled: user.two_factor_enabled,
      },
    })
  } catch (error) {
    console.error("=== ERRO GERAL NO LOGIN ===", error)
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
