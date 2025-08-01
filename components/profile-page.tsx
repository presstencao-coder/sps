"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Shield, Edit2, Save, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function ProfilePage() {
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    twoFactorEnabled: false,
    createdAt: "",
  })
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Token não encontrado")
        return
      }

      const response = await fetch("/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUserInfo(data)
        setEditForm({
          name: data.name,
          email: data.email,
        })
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Erro ao carregar perfil")
      }
    } catch (error: any) {
      console.error("Erro ao carregar perfil:", error)
      setError("Erro ao carregar perfil")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!editForm.name.trim() || !editForm.email.trim()) {
      setError("Nome e email são obrigatórios")
      return
    }

    setIsSaving(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Token não encontrado")
        return
      }

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      })

      if (response.ok) {
        const data = await response.json()
        setUserInfo((prev) => ({
          ...prev,
          name: data.name,
          email: data.email,
        }))
        setIsEditing(false)
        toast({
          title: "Perfil atualizado",
          description: "Suas informações foram salvas com sucesso.",
        })
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Erro ao salvar perfil")
      }
    } catch (error: any) {
      console.error("Erro ao salvar perfil:", error)
      setError("Erro ao salvar perfil")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setEditForm({
      name: userInfo.name,
      email: userInfo.email,
    })
    setIsEditing(false)
    setError("")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src="/placeholder-user.jpg" />
          <AvatarFallback className="text-2xl">{userInfo.name?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{userInfo.name || "Usuário"}</h1>
          <p className="text-muted-foreground">{userInfo.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={userInfo.twoFactorEnabled ? "default" : "secondary"}>
              <Shield className="h-3 w-3 mr-1" />
              2FA {userInfo.twoFactorEnabled ? "Ativo" : "Inativo"}
            </Badge>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>Gerencie suas informações de perfil</CardDescription>
            </div>
            {!isEditing && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Seu nome completo"
                  disabled={isSaving}
                />
              ) : (
                <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{userInfo.name || "Não informado"}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="seu@email.com"
                  disabled={isSaving}
                />
              ) : (
                <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{userInfo.email || "Não informado"}</span>
                </div>
              )}
            </div>

            {!isEditing && userInfo.createdAt && (
              <div className="space-y-2">
                <Label>Membro desde</Label>
                <div className="p-2 bg-muted rounded-md">
                  <span>{new Date(userInfo.createdAt).toLocaleDateString("pt-BR")}</span>
                </div>
              </div>
            )}
          </div>

          {isEditing && (
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSaveProfile} disabled={isSaving} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Salvando..." : "Salvar"}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="flex-1 bg-transparent"
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estatísticas da Conta</CardTitle>
          <CardDescription>Informações sobre o uso da sua conta</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-blue-600">-</div>
              <div className="text-sm text-muted-foreground">Senhas Salvas</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-600">{userInfo.twoFactorEnabled ? "Sim" : "Não"}</div>
              <div className="text-sm text-muted-foreground">2FA Ativo</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-purple-600">-</div>
              <div className="text-sm text-muted-foreground">Último Acesso</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
