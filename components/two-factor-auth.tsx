"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Smartphone, QrCode } from "lucide-react"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"

interface TwoFactorAuthProps {
  onComplete: () => void
}

export function TwoFactorAuth({ onComplete }: TwoFactorAuthProps) {
  const [step, setStep] = useState<"setup" | "verify">("setup")
  const [qrCode, setQrCode] = useState("")
  const [secret, setSecret] = useState("")
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSetupLoading, setIsSetupLoading] = useState(true)

  useEffect(() => {
    setupTwoFactor()
  }, [])

  const setupTwoFactor = async () => {
    try {
      console.log("=== CONFIGURANDO 2FA ===")
      const token = localStorage.getItem("token")

      if (!token) {
        setError("Token não encontrado")
        return
      }

      const response = await fetch("/api/auth/2fa/setup", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("Setup 2FA response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Erro no setup 2FA:", errorData)
        setError(errorData.error || "Erro ao configurar 2FA")
        return
      }

      const data = await response.json()
      console.log("Setup 2FA data:", data)

      if (data.qrCode && data.secret) {
        setQrCode(data.qrCode)
        setSecret(data.secret)
        console.log("QR Code e secret configurados com sucesso")
      } else {
        console.error("Dados de 2FA incompletos:", data)
        setError("Dados de configuração incompletos")
      }
    } catch (error: any) {
      console.error("=== ERRO NO SETUP 2FA ===", error)
      setError("Erro ao configurar autenticação de dois fatores")
    } finally {
      setIsSetupLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      setError("Código deve ter 6 dígitos")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      console.log("=== VERIFICANDO CÓDIGO 2FA ===")
      console.log("Código:", code)

      const token = localStorage.getItem("token")
      if (!token) {
        setError("Token não encontrado")
        return
      }

      const response = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code }),
      })

      console.log("Verify 2FA response status:", response.status)

      const data = await response.json()
      console.log("Verify 2FA data:", data)

      if (response.ok && data.success) {
        console.log("2FA verificado com sucesso")
        // Atualizar token com 2FA verificado
        if (data.token) {
          localStorage.setItem("token", data.token)
        }
        onComplete()
      } else {
        console.error("Verificação 2FA falhou:", data.error)
        setError(data.error || "Código inválido")
        setCode("") // Limpar código
      }
    } catch (error: any) {
      console.error("=== ERRO NA VERIFICAÇÃO 2FA ===", error)
      setError("Erro ao verificar código")
      setCode("")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCodeChange = (value: string) => {
    setCode(value)
    setError("")
  }

  if (isSetupLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Configurando autenticação...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl">Autenticação de Dois Fatores</CardTitle>
          <CardDescription>
            {step === "setup" ? "Configure seu aplicativo autenticador" : "Digite o código do seu aplicativo"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "setup" ? (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <Smartphone size={16} />
                  <span>1. Abra seu app autenticador</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <QrCode size={16} />
                  <span>2. Escaneie o QR Code abaixo</span>
                </div>
              </div>

              {qrCode ? (
                <div className="flex justify-center">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <img
                      src={qrCode || "/placeholder.svg"}
                      alt="QR Code para configuração 2FA"
                      className="w-48 h-48"
                      onError={(e) => {
                        console.error("Erro ao carregar QR Code")
                        setError("Erro ao carregar QR Code")
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex justify-center">
                  <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500 text-sm">Carregando QR Code...</p>
                  </div>
                </div>
              )}

              {secret && (
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <Label className="text-xs text-gray-600">Código manual (se não conseguir escanear):</Label>
                  <p className="font-mono text-sm break-all mt-1">{secret}</p>
                </div>
              )}

              <Button onClick={() => setStep("verify")} className="w-full" disabled={!qrCode}>
                Continuar para Verificação
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Digite o código de 6 dígitos do seu aplicativo autenticador
                </p>

                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={code} onChange={handleCodeChange} disabled={isLoading}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                <Button onClick={handleVerifyCode} className="w-full" disabled={isLoading || code.length !== 6}>
                  {isLoading ? "Verificando..." : "Verificar Código"}
                </Button>

                <Button variant="outline" onClick={() => setStep("setup")} className="w-full" disabled={isLoading}>
                  Voltar para QR Code
                </Button>
              </div>
            </div>
          )}

          {error && step === "setup" && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
