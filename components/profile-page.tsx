"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { User, Mail, Calendar, Shield, Edit3, Save, X, CheckCircle, AlertCircle } from "lucide-react"

interface UserProfile {
  id: string
  name: string
  email: string
  twoFactorEnabled: boolean
  createdAt: string
  updatedAt: string
}

export function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    loadProfile()
  }, [])

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  const loadProfile = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await fetch("/api/user/profile", {
        headers: getAuthHeaders(),
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setEditForm({
          name: data.name,
          email: data.email,
        })
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Erro ao carregar perfil")
      }
    } catch (error) {
      console.error("Erro ao carregar perfil:", error)
      setError("Erro de conexão")
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async () => {
    try {
      setSaving(true)
      setError("")

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(editForm),
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setIsEditing(false)
        toast({
          title: "Perfil atualizado",
          description: "Suas informações foram salvas com sucesso.",
        })
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Erro ao salvar perfil")
      }
    } catch (error) {
      console.error("Erro ao salvar perfil:", error)
      setError("Erro de conexão")
    } finally {
      setSaving(false)
    }
  }

  const cancelEdit = () => {
    if (profile) {
      setEditForm({
        name: profile.name,
        email: profile.email,
      })
    }
    setIsEditing(false)
    setError("")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando perfil...</span>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-500">Erro ao carregar perfil do usuário</p>
        <Button onClick={loadProfile} className="mt-4">
          Tentar novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Meu Perfil</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Gerencie suas informações pessoais e configurações de conta
          </p>
        </div>

        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} className="gap-2">
            <Edit3 className="w-4 h-4" />
            Editar Perfil
          </Button>
        )}
      </div>

      {/* Profile Card */}
      <Card className="overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600"></div>
        <CardContent className="relative pt-0 pb-6">
          {/* Avatar */}
          <div className="flex items-start justify-between -mt-12 mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-24 h-24 bg-white dark:bg-slate-800 rounded-full border-4 border-white dark:border-slate-800 shadow-lg">
                <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full text-white font-bold text-2xl">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="pt-12">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{profile.name}</h2>
                <p className="text-slate-600 dark:text-slate-400">{profile.email}</p>
                <div className="flex items-center mt-2 space-x-2">
                  <Badge variant={profile.twoFactorEnabled ? "default" : "secondary"} className="gap-1">
                    <Shield className="w-3 h-3" />
                    2FA {profile.twoFactorEnabled ? "Ativo" : "Inativo"}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Conta Verificada
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Profile Form */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Nome Completo
                </Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={editForm.name}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Seu nome completo"
                    disabled={saving}
                  />
                ) : (
                  <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-md text-slate-900 dark:text-white">
                    {profile.name}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="seu@email.com"
                    disabled={saving}
                  />
                ) : (
                  <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-md text-slate-900 dark:text-white">
                    {profile.email}
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Account Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Conta criada em
                </Label>
                <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-md text-slate-600 dark:text-slate-400">
                  {new Date(profile.createdAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Última atualização
                </Label>
                <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-md text-slate-600 dark:text-slate-400">
                  {new Date(profile.updatedAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={cancelEdit} disabled={saving} className="gap-2 bg-transparent">
                  <X className="w-4 h-4" />
                  Cancelar
                </Button>
                <Button onClick={saveProfile} disabled={saving} className="gap-2">
                  <Save className="w-4 h-4" />
                  {saving ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
