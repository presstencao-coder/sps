import { type NextRequest, NextResponse } from "next/server"
import { createUser, getUserByEmail } from "@/lib/database"
import { hashPassword } from "@/lib/encryption"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, confirmPassword } = await request.json()

    // Validações
    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios" }, { status: 400 })
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "As senhas não coincidem" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "A senha deve ter pelo menos 6 caracteres" }, { status: 400 })
    }

    // Verificar se o email já existe
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: "Este email já está cadastrado" }, { status: 409 })
    }

    // Hash da senha
    const passwordHash = hashPassword(password)

    // Criar usuário
    const userId = await createUser(name, email, passwordHash)

    return NextResponse.json({
      success: true,
      message: "Usuário criado com sucesso",
      userId,
    })
  } catch (error) {
    console.error("Erro no registro:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
