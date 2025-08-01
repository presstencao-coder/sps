"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, ArrowLeft, Loader2, Smartphone } from "lucide-react"
import { toast } from "sonner"

interface TwoFactorAuthProps {
  tempToken: string | null
  onSuccess: (token: string, userData: any) => void
  onBack: () => void
}

export function TwoFactorAuth({ tempToken, onSuccess, onBack }: TwoFactorAuthProps) {
  const [qrCode, setQrCode] = useState("")
  const [secret, setSecret] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSettingUp, setIsSettingUp] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (tempToken) {
      setupTwoFactor()
    }
  }, [tempToken])

  const setupTwoFactor = async () => {
    if (!tempToken) {
      setError("Token temporário não encontrado")
      return
    }

    try {
      console.log("=== INICIANDO SETUP 2FA ===")
      const response = await fetch("/api/auth/2fa/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tempToken}`,
        },
      })

      console.log("Response status:", response.status)
      console.log("Response headers:", Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Setup 2FA error response:", errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        console.error("Response não é JSON:", text)
        throw new Error("Resposta inválida do servidor")
      }

      const data = await response.json()
      console.log("Setup 2FA success:", data)

      if (data.qrCode && data.secret) {
        setQrCode(data.qrCode)
        setSecret(data.secret)
        setIsSettingUp(false)
        toast.success("QR Code gerado! Escaneie com seu app autenticador.")
      } else {
        throw new Error("Dados de 2FA inválidos recebidos")
      }
    } catch (error) {
      console.error("=== ERRO NO SETUP 2FA ===", error)
      setError(error instanceof Error ? error.message : "Erro ao configurar 2FA")
      toast.error("Erro ao gerar QR Code")
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tempToken) {
      setError("Token temporário não encontrado")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tempToken}`,
        },
        body: JSON.stringify({ code: verificationCode }),
      })

      const data = await response.json()

      if (response.ok) {
        onSuccess(data.token, data.user)
        toast.success("2FA configurado com sucesso!")
      } else {
        setError(data.error || "Código inválido")
        toast.error("Código de verificação inválido")
      }
    } catch (error) {
      console.error("Verify 2FA error:", error)
      setError("Erro de conexão. Tente novamente.")
      toast.error("Erro de conexão")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Autenticação 2FA
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Configure a autenticação de dois fatores
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {isSettingUp ? (
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
              <p className="text-slate-600 dark:text-slate-400">Gerando QR Code...</p>
            </div>
          ) : (
            <>
              {/* QR Code */}
              {qrCode && (
                <div className="text-center space-y-4">
                  <div className="bg-white p-4 rounded-lg inline-block shadow-sm">
                    <img
                      src={`data:image/svg+xml;utf8,${encodeURIComponent(qrCode)}`}
                      alt="QR Code para 2FA"
                      className="w-48 h-48 mx-auto"
                    />
                  </div>
                  <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                    <Smartphone className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800 dark:text-blue-200">
                      <strong>Escaneie o QR Code</strong> com seu app autenticador (Google Authenticator, Authy, etc.)
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Secret Key */}
              {secret && (
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300">
                    Chave secreta (caso não consiga escanear):
                  </Label>
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <code className="text-sm font-mono break-all text-slate-800 dark:text-slate-200">{secret}</code>
                  </div>
                </div>
              )}

              {/* Verification Form */}
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code" className="text-slate-700 dark:text-slate-300">
                    Código de verificação (6 dígitos)
                  </Label>
                  <Input
                    id="code"
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="123456"
                    maxLength={6}
                    required
                    className="h-11 text-center text-lg font-mono tracking-widest border-slate-300 dark:border-slate-600 focus:border-green-500 dark:focus:border-green-400"
                  />
                </div>

                {error && (
                  <Alert className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
                    <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex space-x-3">
                  <Button type="button" variant="outline" onClick={onBack} className="flex-1 h-11 bg-transparent">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={isLoading || verificationCode.length !== 6}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verificando...
                      </>
                    ) : (
                      "Verificar"
                    )}
                  </Button>
                </div>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
