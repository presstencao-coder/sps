import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { updatePassword, deletePassword } from "@/lib/database"
import { encrypt } from "@/lib/encryption"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Função para extrair userId do token JWT
function getUserIdFromToken(request: NextRequest): string | null {
  try {
    const authHeader = request.headers.get("authorization")
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7)
      const decoded = jwt.verify(token, JWT_SECRET) as any
      return decoded.userId
    }
    return null
  } catch (error) {
    console.error("Erro ao decodificar token:", error)
    return null
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("=== PUT PASSWORD API ===")

    const { id } = params
    console.log("Atualizando senha ID:", id)

    let body
    try {
      body = await request.json()
    } catch (error) {
      console.error("Erro ao parsear JSON:", error)
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
    }

    const { title, username, password, url, category, notes } = body

    if (!title || !username || !password) {
      return NextResponse.json({ error: "Título, usuário e senha são obrigatórios" }, { status: 400 })
    }

    // Para demo, usar usuário fixo se não conseguir extrair do token
    let userId = getUserIdFromToken(request)
    if (!userId) {
      userId = "user-1"
    }

    console.log("Atualizando para usuário:", userId)

    const encryptedPassword = encrypt(password)
    const now = new Date().toISOString()

    await updatePassword(
      id,
      userId,
      title,
      username,
      encryptedPassword,
      url || undefined,
      notes || undefined,
      category || "other",
    )

    console.log("Senha atualizada com sucesso")

    return NextResponse.json({
      id,
      title,
      username,
      password,
      url,
      category: category || "other",
      notes,
      updatedAt: now,
    })
  } catch (error) {
    console.error("Erro ao atualizar senha:", error)
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("=== DELETE PASSWORD API ===")

    const { id } = params
    console.log("Deletando senha ID:", id)

    // Para demo, usar usuário fixo se não conseguir extrair do token
    let userId = getUserIdFromToken(request)
    if (!userId) {
      userId = "user-1"
    }

    console.log("Deletando para usuário:", userId)

    await deletePassword(id, userId)

    console.log("Senha deletada com sucesso")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao deletar senha:", error)
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
