"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Shield, Key, Eye, EyeOff, AlertTriangle, CheckCircle, SettingsIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function SettingsPage() {
  const [userInfo, setUserInfo] = useState({
    twoFactorEnabled: false,
  })
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
  const [isLoading, setIsLoading] = useState(true)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isToggling2FA, setIsToggling2FA] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    loadUserSettings()
  }, [])

  const loadUserSettings = async () => {
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
        setUserInfo({
          twoFactorEnabled: data.twoFactorEnabled || false,
        })
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Erro ao carregar configurações")
      }
    } catch (error: any) {
      console.error("Erro ao carregar configurações:", error)
      setError("Erro ao carregar configurações")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setError("Todos os campos são obrigatórios")
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("Nova senha e confirmação não coincidem")
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setError("Nova senha deve ter pelo menos 6 caracteres")
      return
    }

    setIsChangingPassword(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Token não encontrado")
        return
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
        setError(errorData.error || "Erro ao alterar senha")
      }
    } catch (error: any) {
      console.error("Erro ao alterar senha:", error)
      setError("Erro ao alterar senha")
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleToggle2FA = async (enabled: boolean) => {
    setIsToggling2FA(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Token não encontrado")
        return
      }

      if (!enabled) {
        // Desabilitar 2FA
        const response = await fetch("/api/auth/2fa/disable", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          setUserInfo((prev) => ({ ...prev, twoFactorEnabled: false }))
          toast({
            title: "2FA Desabilitado",
            description: "Autenticação de dois fatores foi desabilitada.",
          })
        } else {
          const errorData = await response.json()
          setError(errorData.error || "Erro ao desabilitar 2FA")
        }
      } else {
        // Para habilitar 2FA, redirecionar para configuração
        toast({
          title: "Configuração 2FA",
          description: "Faça logout e login novamente para configurar 2FA.",
        })
      }
    } catch (error: any) {
      console.error("Erro ao alterar 2FA:", error)
      setError("Erro ao alterar configuração 2FA")
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <SettingsIcon className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Configurações de Segurança</h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Autenticação de Dois Fatores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Autenticação de Dois Fatores (2FA)
          </CardTitle>
          <CardDescription>Adicione uma camada extra de segurança à sua conta</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">Status do 2FA</span>
                <Badge variant={userInfo.twoFactorEnabled ? "default" : "secondary"}>
                  {userInfo.twoFactorEnabled ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Ativo
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Inativo
                    </>
                  )}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {userInfo.twoFactorEnabled
                  ? "Sua conta está protegida com 2FA"
                  : "Recomendamos ativar o 2FA para maior segurança"}
              </p>
            </div>
            <Switch checked={userInfo.twoFactorEnabled} onCheckedChange={handleToggle2FA} disabled={isToggling2FA} />
          </div>
        </CardContent>
      </Card>

      {/* Alterar Senha */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Alterar Senha
          </CardTitle>
          <CardDescription>Mantenha sua conta segura com uma senha forte</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Senha Atual</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showPasswords.current ? "text" : "password"}
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }))
                }
                placeholder="Digite sua senha atual"
                disabled={isChangingPassword}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("current")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                disabled={isChangingPassword}
              >
                {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova Senha</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPasswords.new ? "text" : "password"}
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
                placeholder="Digite sua nova senha (mín. 6 caracteres)"
                disabled={isChangingPassword}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("new")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
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
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                placeholder="Confirme sua nova senha"
                disabled={isChangingPassword}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("confirm")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                disabled={isChangingPassword}
              >
                {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <Button onClick={handleChangePassword} disabled={isChangingPassword} className="w-full">
            {isChangingPassword ? "Alterando..." : "Alterar Senha"}
          </Button>
        </CardContent>
      </Card>

      {/* Dicas de Segurança */}
      <Card>
        <CardHeader>
          <CardTitle>Dicas de Segurança</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              Use senhas únicas e complexas para cada conta
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              Ative a autenticação de dois fatores sempre que possível
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              Mantenha suas senhas atualizadas regularmente
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              Nunca compartilhe suas credenciais com terceiros
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
