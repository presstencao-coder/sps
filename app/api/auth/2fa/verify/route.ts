import { type NextRequest, NextResponse } from "next/server"
import { authenticator } from "otplib"
import { getUserByEmail, updateUser2FA } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json({ error: "Email e código são obrigatórios" }, { status: 400 })
    }

    // Buscar usuário no banco
    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Verificar se o usuário tem um secret configurado
    if (!user.two_factor_secret) {
      return NextResponse.json({ error: "2FA não configurado para este usuário" }, { status: 400 })
    }

    // Verificar código 2FA usando o secret do usuário
    const isValid = authenticator.verify({
      token: code,
      secret: user.two_factor_secret,
      window: 2, // Permite uma janela de tempo maior para compensar diferenças de relógio
    })

    if (!isValid) {
      return NextResponse.json({ error: "Código inválido ou expirado" }, { status: 401 })
    }

    // Ativar 2FA para o usuário após verificação bem-sucedida
    await updateUser2FA(user.id, user.two_factor_secret, true)

    return NextResponse.json({
      success: true,
      message: "2FA verificado e ativado com sucesso",
    })
  } catch (error) {
    console.error("Erro na verificação 2FA:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
