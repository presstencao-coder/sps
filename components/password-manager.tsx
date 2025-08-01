"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Eye, EyeOff, Copy, Edit, Trash2, Search, Globe, Smartphone } from "lucide-react"

interface PasswordEntry {
  id: string
  title: string
  username: string
  password: string
  url?: string
  category: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export function PasswordManager() {
  const [passwords, setPasswords] = useState<PasswordEntry[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingPassword, setEditingPassword] = useState<PasswordEntry | null>(null)
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const categories = ["website", "app", "email", "social", "banking", "work", "other"]

  useEffect(() => {
    loadPasswords()
  }, [])

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  const loadPasswords = async () => {
    try {
      setLoading(true)
      setError("")

      console.log("Carregando senhas...")

      const response = await fetch("/api/passwords", {
        headers: getAuthHeaders(),
      })

      console.log("Response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("Senhas carregadas:", data.length)
        setPasswords(data)
      } else {
        const errorData = await response.json()
        console.error("Erro ao carregar senhas:", errorData)
        setError(errorData.error || "Erro ao carregar senhas")
      }
    } catch (error) {
      console.error("Erro ao carregar senhas:", error)
      setError("Erro de conexão")
    } finally {
      setLoading(false)
    }
  }

  const filteredPasswords = passwords.filter((password) => {
    const matchesSearch =
      password.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      password.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      password.url?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || password.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const togglePasswordVisibility = (id: string) => {
    const newVisible = new Set(visiblePasswords)
    if (newVisible.has(id)) {
      newVisible.delete(id)
    } else {
      newVisible.add(id)
    }
    setVisiblePasswords(newVisible)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // Aqui você pode adicionar uma notificação de sucesso
    } catch (error) {
      console.error("Erro ao copiar:", error)
    }
  }

  const deletePassword = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar esta senha?")) {
      return
    }

    try {
      const response = await fetch(`/api/passwords/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })

      if (response.ok) {
        await loadPasswords() // Recarregar lista
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Erro ao deletar senha")
      }
    } catch (error) {
      console.error("Erro ao deletar senha:", error)
      setError("Erro de conexão")
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "website":
        return <Globe className="w-4 h-4" />
      case "app":
        return <Smartphone className="w-4 h-4" />
      default:
        return null
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      website: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      app: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      email: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      social: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
      banking: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      work: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      other: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
    }
    return colors[category as keyof typeof colors] || colors.other
  }

  if (loading && passwords.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando senhas...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header com busca e filtros */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar senhas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border rounded-lg bg-background"
          >
            <option value="all">Todas as categorias</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>

          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova Senha
              </Button>
            </DialogTrigger>
            <DialogContent>
              <PasswordForm
                onSuccess={() => {
                  setShowAddDialog(false)
                  loadPasswords()
                }}
                onCancel={() => setShowAddDialog(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Mostrar erro se houver */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {error}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setError("")
                loadPasswords()
              }}
              className="ml-2"
            >
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Lista de senhas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredPasswords.map((password) => (
          <Card key={password.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getCategoryIcon(password.category)}
                    {password.title}
                  </CardTitle>
                  <CardDescription className="mt-1">{password.username}</CardDescription>
                </div>
                <Badge className={getCategoryColor(password.category)}>{password.category}</Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {password.url && <div className="text-sm text-gray-600 dark:text-gray-400 truncate">{password.url}</div>}

              <div className="flex items-center gap-2">
                <div className="flex-1 font-mono text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded">
                  {visiblePasswords.has(password.id) ? password.password : "••••••••"}
                </div>
                <Button size="sm" variant="outline" onClick={() => togglePasswordVisibility(password.id)}>
                  {visiblePasswords.has(password.id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button size="sm" variant="outline" onClick={() => copyToClipboard(password.password)}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>

              {password.notes && (
                <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                  {password.notes}
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-xs text-gray-500">
                  {new Date(password.updatedAt).toLocaleDateString("pt-BR")}
                </span>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => setEditingPassword(password)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => deletePassword(password.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPasswords.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm || selectedCategory !== "all"
              ? "Nenhuma senha encontrada com os filtros aplicados."
              : "Nenhuma senha cadastrada ainda."}
          </p>
        </div>
      )}

      {/* Dialog de edição */}
      {editingPassword && (
        <Dialog open={!!editingPassword} onOpenChange={() => setEditingPassword(null)}>
          <DialogContent>
            <PasswordForm
              password={editingPassword}
              onSuccess={() => {
                setEditingPassword(null)
                loadPasswords()
              }}
              onCancel={() => setEditingPassword(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

interface PasswordFormProps {
  password?: PasswordEntry
  onSuccess: () => void
  onCancel: () => void
}

function PasswordForm({ password, onSuccess, onCancel }: PasswordFormProps) {
  const [formData, setFormData] = useState({
    title: password?.title || "",
    username: password?.username || "",
    password: password?.password || "",
    url: password?.url || "",
    category: password?.category || "website",
    notes: password?.notes || "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
    let result = ""
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData((prev) => ({ ...prev, password: result }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      console.log("Salvando senha:", formData.title)

      const url = password ? `/api/passwords/${password.id}` : "/api/passwords"
      const method = password ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      })

      console.log("Response status:", response.status)

      if (response.ok) {
        console.log("Senha salva com sucesso")
        onSuccess()
      } else {
        const data = await response.json()
        console.error("Erro ao salvar:", data)
        setError(data.error || "Erro ao salvar senha")
      }
    } catch (error) {
      console.error("Erro de conexão:", error)
      setError("Erro de conexão")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{password ? "Editar Senha" : "Nova Senha"}</DialogTitle>
        <DialogDescription>
          {password ? "Edite as informações da senha." : "Adicione uma nova senha ao seu cofre."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Ex: Gmail, Facebook..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg bg-background"
            >
              {["website", "app", "email", "social", "banking", "work", "other"].map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Usuário/Email</Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
            placeholder="seu@email.com"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <div className="flex gap-2">
            <Input
              id="password"
              type="text"
              value={formData.password}
              onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
              placeholder="Sua senha"
              required
            />
            <Button type="button" variant="outline" onClick={generatePassword}>
              Gerar
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="url">URL (opcional)</Label>
          <Input
            id="url"
            type="url"
            value={formData.url}
            onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
            placeholder="https://exemplo.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notas (opcional)</Label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
            placeholder="Informações adicionais..."
            className="w-full px-3 py-2 border rounded-lg bg-background min-h-[80px]"
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </>
  )
}
