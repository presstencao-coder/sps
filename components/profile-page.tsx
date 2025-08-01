"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { User, Mail, Calendar, Shield, Save, Loader2 } from "lucide-react"

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
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
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
        setName(data.name)
        setEmail(data.email)
      } else {
        setError("Erro ao carregar perfil")
      }
    } catch (error) {
      console.error("Erro ao carregar perfil:", error)
      setError("Erro ao carregar perfil")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      setError("Nome e email são obrigatórios")
      return
    }

    setSaving(true)
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
        body: JSON.stringify({ name, email }),
      })

      if (response.ok) {
        toast({
          title: "Perfil atualizado",
          description: "Suas informações foram salvas com sucesso.",
        })
        await loadProfile()
      } else {
        const data = await response.json()
        setError(data.error || "Erro ao salvar perfil")
      }
    } catch (error) {
      console.error("Erro ao salvar perfil:", error)
      setError("Erro ao salvar perfil")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Carregando perfil...</span>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <Alert>
          <AlertDescription>Erro ao carregar perfil do usuário.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-8 text-white">
        <div className="flex items-center space-x-6">
          <div className="flex items-center justify-center w-20 h-20 bg-white/20 rounded-full text-2xl font-bold">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{profile.name}</h1>
            <p className="text-blue-100 text-lg">{profile.email}</p>
            <div className="flex items-center space-x-4 mt-3">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                <Shield className="w-3 h-3 mr-1" />
                2FA {profile.twoFactorEnabled ? "Ativo" : "Inativo"}
              </Badge>
              <span className="text-blue-100 text-sm">
                Membro desde {new Date(profile.createdAt).toLocaleDateString("pt-BR")}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Edit Profile Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Informações Pessoais</span>
              </CardTitle>
              <CardDescription>Atualize suas informações básicas de perfil.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome completo"
                    disabled={saving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    disabled={saving}
                  />
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="w-5 h-5" />
                <span>Informações da Conta</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">ID da Conta</span>
                <span className="text-sm font-mono">{profile.id.slice(0, 8)}...</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status 2FA</span>
                <Badge variant={profile.twoFactorEnabled ? "default" : "secondary"}>
                  {profile.twoFactorEnabled ? "Ativo" : "Inativo"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Criado em</span>
                <span className="text-sm">{new Date(profile.createdAt).toLocaleDateString("pt-BR")}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Atualizado em</span>
                <span className="text-sm">{new Date(profile.updatedAt).toLocaleDateString("pt-BR")}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Atividade Recente</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">Login realizado</p>
                    <p className="text-xs text-muted-foreground">Hoje</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">Perfil visualizado</p>
                    <p className="text-xs text-muted-foreground">Agora</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
