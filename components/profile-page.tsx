"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Calendar, Shield, Save, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
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
      if (!token) return

      const response = await fetch("/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setFormData({
          name: data.name,
          email: data.email,
        })
      } else {
        setError("Erro ao carregar perfil")
      }
    } catch (error) {
      console.error("Erro ao carregar perfil:", error)
      setError("Erro ao carregar perfil")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const updatedProfile = await response.json()
        setProfile(updatedProfile)
        toast({
          title: "Perfil atualizado",
          description: "Suas informações foram salvas com sucesso.",
        })
      } else {
        const data = await response.json()
        setError(data.error || "Erro ao salvar perfil")
      }
    } catch (error) {
      console.error("Erro ao salvar perfil:", error)
      setError("Erro ao salvar perfil")
    } finally {
      setIsSaving(false)
    }
  }

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Erro ao carregar perfil</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Meu Perfil</h1>
        <p className="text-slate-600 dark:text-slate-400">Gerencie suas informações pessoais</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Overview */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <Avatar className="h-24 w-24 mx-auto mb-4">
              <AvatarImage src="/placeholder-user.jpg" />
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-xl">
                {getUserInitials(profile.name)}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-xl">{profile.name}</CardTitle>
            <CardDescription>{profile.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">2FA</span>
              <Badge variant={profile.twoFactorEnabled ? "default" : "secondary"}>
                {profile.twoFactorEnabled ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Criado em {formatDate(profile.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Shield className="h-4 w-4" />
                <span>Última atualização: {formatDate(profile.updatedAt)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Informações Pessoais</span>
            </CardTitle>
            <CardDescription>Atualize suas informações básicas</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                    required
                    disabled={isSaving}
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" disabled={isSaving} className="w-full">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
