import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/database"
import { encrypt, decrypt } from "@/lib/encryption"
import { v4 as uuidv4 } from "uuid"

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()

    const passwords = await db.all(`
      SELECT id, title, username, encrypted_password, url, category, notes, created_at, updated_at
      FROM passwords
      ORDER BY updated_at DESC
    `)

    // Descriptografar senhas
    const decryptedPasswords = passwords.map((password) => ({
      id: password.id,
      title: password.title,
      username: password.username,
      password: decrypt(password.encrypted_password),
      url: password.url,
      category: password.category,
      notes: password.notes,
      createdAt: password.created_at,
      updatedAt: password.updated_at,
    }))

    return NextResponse.json(decryptedPasswords)
  } catch (error) {
    console.error("Erro ao buscar senhas:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, username, password, url, category, notes } = await request.json()

    if (!title || !username || !password) {
      return NextResponse.json({ error: "Título, usuário e senha são obrigatórios" }, { status: 400 })
    }

    const db = await getDatabase()
    const id = uuidv4()
    const encryptedPassword = encrypt(password)
    const now = new Date().toISOString()

    await db.run(
      `
      INSERT INTO passwords (id, title, username, encrypted_password, url, category, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [id, title, username, encryptedPassword, url || null, category, notes || null, now, now],
    )

    return NextResponse.json({
      id,
      title,
      username,
      password,
      url,
      category,
      notes,
      createdAt: now,
      updatedAt: now,
    })
  } catch (error) {
    console.error("Erro ao criar senha:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
