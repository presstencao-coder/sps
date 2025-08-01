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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Eye, EyeOff, Plus, Edit, Trash2, Copy, Search } from "lucide-react"
import { toast } from "sonner"

interface Password {
  id: number
  title: string
  username: string
  password: string
  url?: string
  notes?: string
  created_at: string
  updated_at: string
}

export function PasswordManager() {
  const [passwords, setPasswords] = useState<Password[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPassword, setEditingPassword] = useState<Password | null>(null)
  const [showPasswords, setShowPasswords] = useState<{ [key: number]: boolean }>({})
  const [formData, setFormData] = useState({
    title: "",
    username: "",
    password: "",
    url: "",
    notes: "",
  })

  useEffect(() => {
    fetchPasswords()
  }, [])

  const fetchPasswords = async () => {
    try {
      const response = await fetch("/api/passwords")
      if (response.ok) {
        const data = await response.json()
        setPasswords(data)
      }
    } catch (error) {
      toast.error("Erro ao carregar senhas")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingPassword ? `/api/passwords/${editingPassword.id}` : "/api/passwords"
      const method = editingPassword ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success(editingPassword ? "Senha atualizada!" : "Senha salva!")
        setIsDialogOpen(false)
        setEditingPassword(null)
        setFormData({ title: "", username: "", password: "", url: "", notes: "" })
        fetchPasswords()
      } else {
        toast.error("Erro ao salvar senha")
      }
    } catch (error) {
      toast.error("Erro de conexão")
    }
  }

  const handleEdit = (password: Password) => {
    setEditingPassword(password)
    setFormData({
      title: password.title,
      username: password.username,
      password: password.password,
      url: password.url || "",
      notes: password.notes || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/passwords/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Senha excluída!")
        fetchPasswords()
      } else {
        toast.error("Erro ao excluir senha")
      }
    } catch (error) {
      toast.error("Erro de conexão")
    }
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${type} copiado!`)
  }

  const togglePasswordVisibility = (id: number) => {
    setShowPasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const generatePassword = () => {
    const length = 16
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
    let password = ""
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    setFormData({ ...formData, password })
  }

  const filteredPasswords = passwords.filter(
    (password) =>
      password.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      password.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      password.url?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gerenciador de Senhas</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingPassword(null)
                setFormData({ title: "", username: "", password: "", url: "", notes: "" })
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova Senha
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingPassword ? "Editar Senha" : "Nova Senha"}</DialogTitle>
              <DialogDescription>
                {editingPassword ? "Atualize os dados da senha" : "Adicione uma nova senha ao seu cofre"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Usuário/Email</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="flex space-x-2">
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notas (opcional)</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full">
                {editingPassword ? "Atualizar" : "Salvar"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Buscar senhas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredPasswords.map((password) => (
          <Card key={password.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span className="truncate">{password.title}</span>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(password)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir senha?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. A senha será permanentemente excluída.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(password.id)}>Excluir</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardTitle>
              <CardDescription>{password.username}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Input
                  type={showPasswords[password.id] ? "text" : "password"}
                  value={password.password}
                  readOnly
                  className="flex-1"
                />
                <Button variant="ghost" size="sm" onClick={() => togglePasswordVisibility(password.id)}>
                  {showPasswords[password.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(password.password, "Senha")}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              {password.url && (
                <div className="flex items-center space-x-2">
                  <Input value={password.url} readOnly className="flex-1 text-sm" />
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(password.url!, "URL")}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {password.notes && <p className="text-sm text-gray-600 dark:text-gray-400">{password.notes}</p>}

              <p className="text-xs text-gray-500">Criado em: {new Date(password.created_at).toLocaleDateString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPasswords.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm ? "Nenhuma senha encontrada" : "Nenhuma senha salva ainda"}
          </p>
        </div>
      )}
    </div>
  )
}

export default PasswordManager
