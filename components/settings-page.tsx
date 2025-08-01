"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Shield, Key, Lock, AlertTriangle, CheckCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface UserSettings {
  twoFactorEnabled: boolean
}

export function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isToggling2FA, setIsToggling2FA] = useState(false)
  const [error, setError] = useState("")
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
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
        setSettings({
          twoFactorEnabled: data.twoFactorEnabled,
        })
      } else {
        setError("Erro ao carregar configurações")
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error)
      setError("Erro ao carregar configurações")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("As senhas não coincidem")
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setError("A nova senha deve ter pelo menos 6 caracteres")
      return
    }

    setIsChangingPassword(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })

      if (response.ok) {
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
        toast({
          title: "Senha alterada",
          description: "Sua senha foi alterada com sucesso.",
        })
      } else {
        const data = await response.json()
        setError(data.error || "Erro ao alterar senha")
      }
    } catch (error) {
      console.error("Erro ao alterar senha:", error)
      setError("Erro ao alterar senha")
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleToggle2FA = async () => {
    if (!settings) return

    setIsToggling2FA(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const endpoint = settings.twoFactorEnabled ? "/api/auth/2fa/disable" : "/api/auth/2fa/setup"

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const newStatus = !settings.twoFactorEnabled
        setSettings({ ...settings, twoFactorEnabled: newStatus })

        toast({
          title: newStatus ? "2FA Ativado" : "2FA Desativado",
          description: newStatus
            ? "Autenticação de dois fatores foi ativada."
            : "Autenticação de dois fatores foi desativada.",
        })
      } else {
        const data = await response.json()
        setError(data.error || "Erro ao alterar 2FA")
      }
    } catch (error) {
      console.error("Erro ao alterar 2FA:", error)
      setError("Erro ao alterar 2FA")
    } finally {
      setIsToggling2FA(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Configurações</h1>
        <p className="text-slate-600 dark:text-slate-400">Gerencie sua segurança e preferências</p>
      </div>

      <div className="grid gap-6">
        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Segurança</span>
            </CardTitle>
            <CardDescription>Configure suas opções de segurança</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 2FA Toggle */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium">Autenticação de Dois Fatores</h3>
                  <Badge variant={settings?.twoFactorEnabled ? "default" : "secondary"}>
                    {settings?.twoFactorEnabled ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">Adicione uma camada extra de segurança à sua conta</p>
              </div>
              <div className="flex items-center space-x-2">
                {settings?.twoFactorEnabled ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                )}
                <Switch
                  checked={settings?.twoFactorEnabled || false}
                  onCheckedChange={handleToggle2FA}
                  disabled={isToggling2FA}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Key className="h-5 w-5" />
              <span>Alterar Senha</span>
            </CardTitle>
            <CardDescription>Mantenha sua conta segura com uma senha forte</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Senha Atual</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="pl-10"
                    required
                    disabled={isChangingPassword}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="pl-10"
                    required
                    disabled={isChangingPassword}
                    minLength={6}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="pl-10"
                    required
                    disabled={isChangingPassword}
                    minLength={6}
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" disabled={isChangingPassword}>
                {isChangingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Alterando...
                  </>
                ) : (
                  "Alterar Senha"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
