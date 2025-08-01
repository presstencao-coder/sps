import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/database"
import { encrypt } from "@/lib/encryption"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { title, username, password, url, category, notes } = await request.json()
    const { id } = params

    if (!title || !username || !password) {
      return NextResponse.json({ error: "Título, usuário e senha são obrigatórios" }, { status: 400 })
    }

    const db = await getDatabase()
    const encryptedPassword = encrypt(password)
    const now = new Date().toISOString()

    await db.run(
      `
      UPDATE passwords 
      SET title = ?, username = ?, encrypted_password = ?, url = ?, category = ?, notes = ?, updated_at = ?
      WHERE id = ?
    `,
      [title, username, encryptedPassword, url || null, category, notes || null, now, id],
    )

    return NextResponse.json({
      id,
      title,
      username,
      password,
      url,
      category,
      notes,
      updatedAt: now,
    })
  } catch (error) {
    console.error("Erro ao atualizar senha:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const db = await getDatabase()

    await db.run("DELETE FROM passwords WHERE id = ?", [id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao deletar senha:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
