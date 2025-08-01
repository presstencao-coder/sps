"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Calendar, Shield, Edit, Save, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface UserProfile {
  name: string
  email: string
  createdAt: string
  twoFactorEnabled: boolean
}

export function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Token não encontrado")
      }

      const response = await fetch("/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Erro ao carregar perfil")
      }

      const data = await response.json()
      setProfile(data)
      setEditForm({
        name: data.name,
        email: data.email,
      })
    } catch (error: any) {
      console.error("Erro ao carregar perfil:", error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Token não encontrado")
      }

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao salvar perfil")
      }

      const updatedProfile = await response.json()
      setProfile(updatedProfile)
      setIsEditing(false)

      toast({
        title: "Perfil Atualizado",
        description: "Suas informações foram salvas com sucesso!",
      })
    } catch (error: any) {
      console.error("Erro ao salvar perfil:", error)
      setError(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setEditForm({
        name: profile.name,
        email: profile.email,
      })
    }
    setIsEditing(false)
    setError("")
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto">
        <Alert variant="destructive">
          <AlertDescription>Erro ao carregar perfil do usuário</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Meu Perfil</h1>
          <p className="text-slate-600 dark:text-slate-400">Gerencie suas informações pessoais</p>
        </div>

        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} className="flex items-center space-x-2">
            <Edit className="h-4 w-4" />
            <span>Editar Perfil</span>
          </Button>
        )}
      </div>

      {/* Profile Card */}
      <Card className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200 dark:border-slate-700">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src="/placeholder-user.jpg" />
              <AvatarFallback className="bg-blue-600 text-white text-2xl">
                {profile.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-2xl">{profile.name}</CardTitle>
              <CardDescription className="text-lg">{profile.email}</CardDescription>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant={profile.twoFactorEnabled ? "default" : "secondary"}>
                  {profile.twoFactorEnabled ? "2FA Ativo" : "2FA Inativo"}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isEditing ? (
            /* Edit Form */
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="Seu nome completo"
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    placeholder="seu@email.com"
                    disabled={isSaving}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-4">
                <Button onClick={handleSave} disabled={isSaving} className="flex items-center space-x-2">
                  <Save className="h-4 w-4" />
                  <span>{isSaving ? "Salvando..." : "Salvar Alterações"}</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="flex items-center space-x-2 bg-transparent"
                >
                  <X className="h-4 w-4" />
                  <span>Cancelar</span>
                </Button>
              </div>
            </div>
          ) : (
            /* View Mode */
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Nome</p>
                      <p className="text-lg text-slate-900 dark:text-white">{profile.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Email</p>
                      <p className="text-lg text-slate-900 dark:text-white">{profile.email}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Membro desde</p>
                      <p className="text-lg text-slate-900 dark:text-white">
                        {new Date(profile.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Autenticação 2FA</p>
                      <p className="text-lg text-slate-900 dark:text-white">
                        {profile.twoFactorEnabled ? "Ativada" : "Desativada"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Info */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-800 dark:text-green-200">
            <Shield className="h-5 w-5" />
            <span>Segurança da Conta</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-green-700 dark:text-green-300">Autenticação de Dois Fatores</span>
              <Badge variant={profile.twoFactorEnabled ? "default" : "secondary"}>
                {profile.twoFactorEnabled ? "Ativa" : "Inativa"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-green-700 dark:text-green-300">Criptografia de Senhas</span>
              <Badge variant="default">Ativa</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-green-700 dark:text-green-300">Sessão Segura</span>
              <Badge variant="default">Ativa</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
