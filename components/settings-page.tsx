"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Shield, Key, Eye, EyeOff, Smartphone, AlertTriangle, CheckCircle, Lock, Unlock, RefreshCw } from "lucide-react"

interface UserSettings {
  twoFactorEnabled: boolean
  email: string
  name: string
}

export function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const { toast } = useToast()

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [changingPassword, setChangingPassword] = useState(false)

  // 2FA state
  const [twoFactorLoading, setTwoFactorLoading] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  const loadSettings = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await fetch("/api/user/profile", {
        headers: getAuthHeaders(),
      })

      if (response.ok) {
        const data = await response.json()
        setSettings({
          twoFactorEnabled: data.twoFactorEnabled || false,
          email: data.email,
          name: data.name,
        })
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Erro ao carregar configurações")
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error)
      setError("Erro de conexão")
    } finally {
      setLoading(false)
    }
  }

  const changePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      })
      return
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A nova senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      })
      return
    }

    try {
      setChangingPassword(true)

      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: getAuthHeaders(),
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
        const errorData = await response.json()
        toast({
          title: "Erro",
          description: errorData.error || "Erro ao alterar senha",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao alterar senha:", error)
      toast({
        title: "Erro",
        description: "Erro de conexão",
        variant: "destructive",
      })
    } finally {
      setChangingPassword(false)
    }
  }

  const toggle2FA = async () => {
    if (!settings) return

    try {
      setTwoFactorLoading(true)

      if (settings.twoFactorEnabled) {
        // Disable 2FA
        const response = await fetch("/api/auth/2fa/disable", {
          method: "POST",
          headers: getAuthHeaders(),
        })

        if (response.ok) {
          setSettings((prev) => (prev ? { ...prev, twoFactorEnabled: false } : null))
          toast({
            title: "2FA Desabilitado",
            description: "A autenticação de dois fatores foi desabilitada.",
          })
        } else {
          const errorData = await response.json()
          toast({
            title: "Erro",
            description: errorData.error || "Erro ao desabilitar 2FA",
            variant: "destructive",
          })
        }
      } else {
        // Enable 2FA - redirect to setup
        toast({
          title: "Configurar 2FA",
          description: "Você será redirecionado para configurar a autenticação de dois fatores.",
        })
        // Here you would typically redirect to 2FA setup
        window.location.reload() // For demo, just reload to trigger 2FA setup
      }
    } catch (error) {
      console.error("Erro ao alterar 2FA:", error)
      toast({
        title: "Erro",
        description: "Erro de conexão",
        variant: "destructive",
      })
    } finally {
      setTwoFactorLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando configurações...</span>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Configurações</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Gerencie sua segurança e preferências da conta</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Segurança da Conta
          </CardTitle>
          <CardDescription>Configure suas opções de segurança e autenticação</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 2FA Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-4">
              <div
                className={`p-3 rounded-full ${settings?.twoFactorEnabled ? "bg-green-100 dark:bg-green-900" : "bg-gray-100 dark:bg-gray-800"}`}
              >
                <Smartphone
                  className={`w-6 h-6 ${settings?.twoFactorEnabled ? "text-green-600 dark:text-green-400" : "text-gray-600 dark:text-gray-400"}`}
                />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Autenticação de Dois Fatores (2FA)</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Adicione uma camada extra de segurança à sua conta
                </p>
                <Badge variant={settings?.twoFactorEnabled ? "default" : "secondary"} className="mt-2">
                  {settings?.twoFactorEnabled ? (
                    <>
                      <Lock className="w-3 h-3 mr-1" />
                      Ativo
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3 h-3 mr-1" />
                      Inativo
                    </>
                  )}
                </Badge>
              </div>
            </div>
            <Switch
              checked={settings?.twoFactorEnabled || false}
              onCheckedChange={toggle2FA}
              disabled={twoFactorLoading}
            />
          </div>

          <Separator />

          {/* Change Password */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Alterar Senha</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Senha Atual</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Digite sua senha atual"
                    disabled={changingPassword}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPasswords((prev) => ({ ...prev, current: !prev.current }))}
                  >
                    {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Digite a nova senha"
                    disabled={changingPassword}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPasswords((prev) => ({ ...prev, new: !prev.new }))}
                  >
                    {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirme a nova senha"
                    disabled={changingPassword}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
                  >
                    {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <Button
              onClick={changePassword}
              disabled={
                changingPassword ||
                !passwordForm.currentPassword ||
                !passwordForm.newPassword ||
                !passwordForm.confirmPassword
              }
              className="gap-2"
            >
              {changingPassword ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Alterando...
                </>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  Alterar Senha
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Informações da Conta
          </CardTitle>
          <CardDescription>Detalhes sobre sua conta e configurações atuais</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Email da Conta</Label>
              <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-md text-slate-900 dark:text-white">
                {settings?.email}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Nome do Usuário</Label>
              <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-md text-slate-900 dark:text-white">
                {settings?.name}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
