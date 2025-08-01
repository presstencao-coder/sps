"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Calendar, Shield, Edit, Save, X } from "lucide-react"

interface ProfilePageProps {
  user: {
    id: string
    email: string
    name: string
    twoFactorEnabled: boolean
  }
}

export function ProfilePage({ user }: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
  })

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  const handleSave = async () => {
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSuccess("Perfil atualizado com sucesso!")
        setIsEditing(false)
      } else {
        const data = await response.json()
        setError(data.error || "Erro ao atualizar perfil")
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error)
      setError("Erro de conexão")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: user.name || "",
      email: user.email || "",
    })
    setIsEditing(false)
    setError("")
    setSuccess("")
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-blue-600 text-white text-xl">
                  {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{user.name || "Usuário"}</CardTitle>
                <CardDescription className="text-base">{user.email}</CardDescription>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={user.twoFactorEnabled ? "default" : "secondary"}>
                    <Shield className="w-3 h-3 mr-1" />
                    2FA {user.twoFactorEnabled ? "Ativo" : "Inativo"}
                  </Badge>
                  <Badge variant="outline">
                    <User className="w-3 h-3 mr-1" />
                    Usuário Ativo
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              variant={isEditing ? "ghost" : "outline"}
              onClick={() => setIsEditing(!isEditing)}
              disabled={loading}
            >
              {isEditing ? (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
          <CardDescription>Gerencie suas informações de perfil</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription className="text-green-600">{success}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Seu nome completo"
                />
              ) : (
                <div className="flex items-center space-x-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <User className="w-4 h-4 text-slate-500" />
                  <span>{user.name || "Não informado"}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="seu@email.com"
                />
              ) : (
                <div className="flex items-center space-x-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <Mail className="w-4 h-4 text-slate-500" />
                  <span>{user.email}</span>
                </div>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleCancel} disabled={loading}>
                Cancelar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas da Conta</CardTitle>
          <CardDescription>Informações sobre sua atividade</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Senhas Salvas</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">0</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="p-2 bg-green-600 rounded-lg">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Conta Criada</p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">Hoje</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="p-2 bg-purple-600 rounded-lg">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Último Login</p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">Agora</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Visão Geral de Segurança</CardTitle>
          <CardDescription>Status das suas configurações de segurança</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium">Autenticação de Dois Fatores</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Proteção adicional para sua conta</p>
                </div>
              </div>
              <Badge variant={user.twoFactorEnabled ? "default" : "secondary"}>
                {user.twoFactorEnabled ? "Ativo" : "Inativo"}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium">Email Verificado</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Seu email foi verificado com sucesso</p>
                </div>
              </div>
              <Badge variant="default">Verificado</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ProfilePage
