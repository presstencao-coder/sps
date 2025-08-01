import { type NextRequest, NextResponse } from "next/server"
import { authenticator } from "otplib"

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json({ error: "Email e código são obrigatórios" }, { status: 400 })
    }

    // Para demonstração, vamos usar um secret fixo
    // Em produção, você deve armazenar o secret do usuário no banco
    const secret = "JBSWY3DPEHPK3PXP" // Secret de exemplo

    // Verificar código 2FA
    const isValid = authenticator.verify({
      token: code,
      secret: secret,
    })

    if (!isValid) {
      return NextResponse.json({ error: "Código inválido" }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      message: "2FA verificado com sucesso",
    })
  } catch (error) {
    console.error("Erro na verificação 2FA:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
