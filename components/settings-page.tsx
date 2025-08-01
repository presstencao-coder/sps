"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Shield, Key, Lock, Unlock, Save, Loader2, AlertTriangle } from "lucide-react"

export function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    loadUserSettings()
  }, [])

  const loadUserSettings = async () => {
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
        setTwoFactorEnabled(data.twoFactorEnabled)
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error)
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Todos os campos de senha são obrigatórios")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Nova senha e confirmação não coincidem")
      return
    }

    if (newPassword.length < 6) {
      setError("Nova senha deve ter pelo menos 6 caracteres")
      return
    }

    setLoading(true)
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
          currentPassword,
          newPassword,
        }),
      })

      if (response.ok) {
        toast({
          title: "Senha alterada",
          description: "Sua senha foi alterada com sucesso.",
        })
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        const data = await response.json()
        setError(data.error || "Erro ao alterar senha")
      }
    } catch (error) {
      console.error("Erro ao alterar senha:", error)
      setError("Erro ao alterar senha")
    } finally {
      setLoading(false)
    }
  }

  const handleToggle2FA = async (enabled: boolean) => {
    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) return

      if (enabled) {
        // Redirect to 2FA setup
        toast({
          title: "Configurar 2FA",
          description: "Redirecionando para configuração do 2FA...",
        })
        // Here you would typically redirect to 2FA setup
      } else {
        // Disable 2FA
        const response = await fetch("/api/auth/2fa/disable", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          setTwoFactorEnabled(false)
          toast({
            title: "2FA desabilitado",
            description: "Autenticação de dois fatores foi desabilitada.",
          })
        } else {
          toast({
            title: "Erro",
            description: "Erro ao desabilitar 2FA.",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("Erro ao alterar 2FA:", error)
      toast({
        title: "Erro",
        description: "Erro ao alterar configuração de 2FA.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Security Overview */}
      <Card className="border-2 border-blue-200 dark:border-blue-800">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-blue-600" />
            <span>Configurações de Segurança</span>
          </CardTitle>
          <CardDescription>Gerencie a segurança da sua conta e proteção de dados.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Key className="w-5 h-5" />
              <span>Alterar Senha</span>
            </CardTitle>
            <CardDescription>Atualize sua senha para manter sua conta segura.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="current-password">Senha Atual</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Digite sua senha atual"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">Nova Senha</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite sua nova senha"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme sua nova senha"
                disabled={loading}
              />
            </div>

            <Separator />

            <Button onClick={handleChangePassword} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Alterando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Alterar Senha
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Two-Factor Authentication */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lock className="w-5 h-5" />
              <span>Autenticação de Dois Fatores</span>
            </CardTitle>
            <CardDescription>Adicione uma camada extra de segurança à sua conta com autenticação 2FA.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Status do 2FA</p>
                <p className="text-xs text-muted-foreground">
                  {twoFactorEnabled ? "Sua conta está protegida com 2FA" : "2FA não está configurado"}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {twoFactorEnabled ? (
                  <Lock className="w-4 h-4 text-green-600" />
                ) : (
                  <Unlock className="w-4 h-4 text-red-600" />
                )}
                <Switch checked={twoFactorEnabled} onCheckedChange={handleToggle2FA} disabled={loading} />
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Como funciona o 2FA:</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Adiciona uma camada extra de segurança</li>
                <li>• Requer um código do seu celular para fazer login</li>
                <li>• Protege contra acesso não autorizado</li>
                <li>• Compatível com Google Authenticator e similares</li>
              </ul>
            </div>

            {!twoFactorEnabled && (
              <Alert>
                <Shield className="w-4 h-4" />
                <AlertDescription>Recomendamos fortemente habilitar o 2FA para proteger sua conta.</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Security Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>Dicas de Segurança</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-green-600">✓ Boas Práticas</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Use senhas únicas e complexas</li>
                <li>• Habilite autenticação de dois fatores</li>
                <li>• Mantenha seu email seguro</li>
                <li>• Faça logout em dispositivos públicos</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-red-600">✗ Evite</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Compartilhar suas credenciais</li>
                <li>• Usar a mesma senha em vários sites</li>
                <li>• Acessar de redes públicas não seguras</li>
                <li>• Ignorar notificações de segurança</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
