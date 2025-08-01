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
import { Shield, Key, Eye, EyeOff, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function SettingsPage() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isToggling2FA, setIsToggling2FA] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
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
        throw new Error("Erro ao carregar configurações")
      }

      const data = await response.json()
      setTwoFactorEnabled(data.twoFactorEnabled)
    } catch (error: any) {
      console.error("Erro ao carregar configurações:", error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsChangingPassword(true)
    setError("")

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("As senhas não coincidem")
      setIsChangingPassword(false)
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setError("A nova senha deve ter pelo menos 6 caracteres")
      setIsChangingPassword(false)
      return
    }

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Token não encontrado")
      }

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

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao alterar senha")
      }

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      toast({
        title: "Senha Alterada",
        description: "Sua senha foi alterada com sucesso!",
      })
    } catch (error: any) {
      console.error("Erro ao alterar senha:", error)
      setError(error.message)
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleToggle2FA = async () => {
    setIsToggling2FA(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Token não encontrado")
      }

      if (twoFactorEnabled) {
        // Disable 2FA
        const response = await fetch("/api/auth/2fa/disable", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Erro ao desabilitar 2FA")
        }

        setTwoFactorEnabled(false)
        toast({
          title: "2FA Desabilitado",
          description: "A autenticação de dois fatores foi desabilitada",
        })
      } else {
        // Enable 2FA - redirect to setup
        toast({
          title: "Configurar 2FA",
          description: "Faça logout e login novamente para configurar o 2FA",
        })
      }
    } catch (error: any) {
      console.error("Erro ao alterar 2FA:", error)
      setError(error.message)
    } finally {
      setIsToggling2FA(false)
    }
  }

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Configurações</h1>
        <p className="text-slate-600 dark:text-slate-400">Gerencie sua segurança e preferências</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Security Settings */}
      <Card className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Segurança</span>
          </CardTitle>
          <CardDescription>Configure suas opções de segurança</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 2FA Toggle */}
          <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-medium text-slate-900 dark:text-white">Autenticação de Dois Fatores</h3>
                <Badge variant={twoFactorEnabled ? "default" : "secondary"}>
                  {twoFactorEnabled ? "Ativa" : "Inativa"}
                </Badge>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Adicione uma camada extra de segurança à sua conta
              </p>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Switch checked={twoFactorEnabled} disabled={isToggling2FA} />
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {twoFactorEnabled ? "Desabilitar" : "Habilitar"} Autenticação 2FA?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {twoFactorEnabled
                      ? "Isso tornará sua conta menos segura. Você tem certeza que deseja desabilitar a autenticação de dois fatores?"
                      : "Para habilitar o 2FA, você precisará fazer logout e login novamente para configurar seu app autenticador."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleToggle2FA} disabled={isToggling2FA}>
                    {isToggling2FA ? "Processando..." : "Confirmar"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200 dark:border-slate-700">
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
                <Input
                  id="currentPassword"
                  type={showPasswords.current ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="Digite sua senha atual"
                  required
                  disabled={isChangingPassword}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("current")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  disabled={isChangingPassword}
                >
                  {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="Digite a nova senha"
                    required
                    disabled={isChangingPassword}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("new")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                    disabled={isChangingPassword}
                  >
                    {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="Confirme a nova senha"
                    required
                    disabled={isChangingPassword}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("confirm")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                    disabled={isChangingPassword}
                  >
                    {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-4">
              <Button type="submit" disabled={isChangingPassword}>
                {isChangingPassword ? "Alterando..." : "Alterar Senha"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Security Tips */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-800 dark:text-blue-200">Dicas de Segurança</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-blue-700 dark:text-blue-300">
            <li>• Use senhas únicas e complexas para cada conta</li>
            <li>• Habilite a autenticação de dois fatores sempre que possível</li>
            <li>• Mantenha seus apps autenticadores atualizados</li>
            <li>• Nunca compartilhe suas senhas ou códigos 2FA</li>
            <li>• Faça backup dos seus códigos de recuperação</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
