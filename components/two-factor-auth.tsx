"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Smartphone, Key, RefreshCw } from "lucide-react"
import Image from "next/image"

interface TwoFactorAuthProps {
  onComplete: () => void
}

export function TwoFactorAuth({ onComplete }: TwoFactorAuthProps) {
  const [step, setStep] = useState<"setup" | "verify" | "success">("setup")
  const [qrCode, setQrCode] = useState<string>("")
  const [secret, setSecret] = useState<string>("")
  const [code, setCode] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setupTwoFactor()
  }, [])

  const setupTwoFactor = async () => {
    try {
      setLoading(true)
      setError("")

      const token = localStorage.getItem("token")
      if (!token) {
        setError("Token de autenticação não encontrado")
        return
      }

      console.log("Configurando 2FA...")

      const response = await fetch("/api/auth/2fa/setup", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()
      console.log("Resposta do setup:", data)

      if (!response.ok) {
        throw new Error(data.error || `Erro HTTP: ${response.status}`)
      }

      if (data.success && data.qrCode && data.secret) {
        setQrCode(data.qrCode)
        setSecret(data.manualEntryKey || data.secret)
        console.log("2FA configurado com sucesso")
      } else {
        throw new Error("Resposta inválida do servidor")
      }
    } catch (error: any) {
      console.error("Erro no setup 2FA:", error)
      setError(error.message || "Erro ao configurar autenticação de dois fatores")
    } finally {
      setLoading(false)
    }
  }

  const verifyCode = async () => {
    if (code.length !== 6) {
      setError("Código deve ter 6 dígitos")
      return
    }

    try {
      setLoading(true)
      setError("")

      const token = localStorage.getItem("token")
      if (!token) {
        setError("Token de autenticação não encontrado")
        return
      }

      console.log("Verificando código 2FA:", code)

      const response = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: code }),
      })

      const data = await response.json()
      console.log("Resposta da verificação:", data)

      if (!response.ok) {
        throw new Error(data.error || "Código inválido")
      }

      if (data.success && data.token) {
        // Update token with 2FA verified
        localStorage.setItem("token", data.token)
        setStep("success")

        // Auto-complete after 2 seconds
        setTimeout(() => {
          onComplete()
        }, 2000)
      } else {
        throw new Error("Verificação falhou")
      }
    } catch (error: any) {
      console.error("Erro na verificação:", error)
      setError(error.message || "Código inválido")
      setCode("")
    } finally {
      setLoading(false)
    }
  }

  const handleCodeChange = (value: string) => {
    setCode(value)
    setError("")

    // Auto-verify when 6 digits are entered
    if (value.length === 6) {
      setTimeout(() => verifyCode(), 100)
    }
  }

  if (step === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-center mb-2">2FA Configurado!</h2>
            <p className="text-gray-600 text-center">Autenticação de dois fatores ativada com sucesso.</p>
            <p className="text-sm text-gray-500 text-center mt-2">Redirecionando...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === "setup") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Smartphone className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle>Configurar Autenticação 2FA</CardTitle>
            <CardDescription>Configure a autenticação de dois fatores para maior segurança</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-sm text-gray-600">Configurando 2FA...</p>
              </div>
            ) : (
              <>
                {qrCode && secret ? (
                  <div className="text-center space-y-4">
                    <p className="text-sm text-gray-600 font-medium">1. Escaneie o QR Code com seu app autenticador:</p>
                    <div className="flex justify-center">
                      <div className="bg-white p-4 rounded-lg border">
                        <Image
                          src={qrCode || "/placeholder.svg"}
                          alt="QR Code para 2FA"
                          width={200}
                          height={200}
                          className="rounded-lg"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 font-medium">2. Ou digite manualmente esta chave:</p>
                      <div className="bg-gray-100 p-3 rounded-lg">
                        <code className="text-sm font-mono break-all">{secret}</code>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
                      <p>
                        <strong>Apps recomendados:</strong>
                      </p>
                      <p>Google Authenticator, Authy, Microsoft Authenticator</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-600">Preparando configuração 2FA...</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={setupTwoFactor}
                    className="flex-1 bg-transparent"
                    disabled={loading}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Recarregar
                  </Button>
                  <Button onClick={() => setStep("verify")} className="flex-1" disabled={!qrCode || loading}>
                    Continuar
                  </Button>
                </div>
              </>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>
                  {error}
                  {error.includes("Token") && (
                    <div className="mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          localStorage.removeItem("token")
                          window.location.reload()
                        }}
                      >
                        Fazer login novamente
                      </Button>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Key className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle>Verificar Código 2FA</CardTitle>
          <CardDescription>Digite o código de 6 dígitos do seu app autenticador</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={code} onChange={handleCodeChange} disabled={loading}>
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

            {loading && (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep("setup")} className="flex-1" disabled={loading}>
              Voltar
            </Button>
            <Button onClick={verifyCode} className="flex-1" disabled={code.length !== 6 || loading}>
              Verificar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
