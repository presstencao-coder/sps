"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Smartphone, ArrowLeft, RefreshCw } from "lucide-react"
import Image from "next/image"

interface TwoFactorAuthProps {
  onComplete: () => void
}

export function TwoFactorAuth({ onComplete }: TwoFactorAuthProps) {
  const [qrCode, setQrCode] = useState("")
  const [secret, setSecret] = useState("")
  const [token, setToken] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSetupLoading, setIsSetupLoading] = useState(true)
  const [step, setStep] = useState<"setup" | "verify">("setup")

  useEffect(() => {
    setup2FA()
  }, [])

  const setup2FA = async () => {
    try {
      setIsSetupLoading(true)
      setError("")

      const authToken = localStorage.getItem("token")
      if (!authToken) {
        setError("Token de autenticação não encontrado")
        return
      }

      console.log("Configurando 2FA...")

      const response = await fetch("/api/auth/2fa/setup", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()
      console.log("Resposta do setup 2FA:", data)

      if (response.ok && data.success) {
        setQrCode(data.qrCode)
        setSecret(data.secret || data.manualEntryKey)
        console.log("2FA configurado com sucesso")
      } else {
        throw new Error(data.error || "Erro ao configurar 2FA")
      }
    } catch (error: any) {
      console.error("Erro ao configurar 2FA:", error)
      setError(error.message || "Erro ao configurar 2FA")
    } finally {
      setIsSetupLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()

    if (token.length !== 6) {
      setError("O código deve ter 6 dígitos")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const authToken = localStorage.getItem("token")
      if (!authToken) {
        setError("Token de autenticação não encontrado")
        return
      }

      console.log("Verificando código 2FA:", token)

      const response = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()
      console.log("Resposta da verificação 2FA:", data)

      if (response.ok && data.success) {
        // Update token with 2FA verified
        localStorage.setItem("token", data.token)
        console.log("2FA verificado com sucesso")
        onComplete()
      } else {
        throw new Error(data.error || "Código inválido")
      }
    } catch (error: any) {
      console.error("Erro na verificação 2FA:", error)
      setError(error.message || "Erro na verificação")
      setToken("")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl">Configurar 2FA</CardTitle>
          <CardDescription>
            {step === "setup"
              ? "Configure a autenticação de dois fatores para maior segurança"
              : "Digite o código de 6 dígitos do seu aplicativo"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === "setup" && (
            <>
              {isSetupLoading ? (
                <div className="flex flex-col items-center space-y-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="text-sm text-gray-600">Gerando QR Code...</p>
                </div>
              ) : qrCode && secret ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700 mb-4">
                      1. Escaneie o QR Code com seu app autenticador:
                    </p>
                    <div className="flex justify-center mb-4">
                      <div className="bg-white p-4 rounded-lg border shadow-sm">
                        <Image
                          src={qrCode || "/placeholder.svg"}
                          alt="QR Code para 2FA"
                          width={200}
                          height={200}
                          className="rounded"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Smartphone className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium">Apps recomendados:</span>
                    </div>
                    <div className="text-sm text-gray-600 ml-7">
                      <p>• Google Authenticator</p>
                      <p>• Microsoft Authenticator</p>
                      <p>• Authy</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">2. Ou digite manualmente esta chave:</p>
                    <code className="text-xs bg-white px-3 py-2 rounded border font-mono break-all block">
                      {secret}
                    </code>
                  </div>

                  <Button onClick={() => setStep("verify")} className="w-full">
                    Continuar para Verificação
                  </Button>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <p className="text-red-600">Erro ao carregar QR Code</p>
                  <Button onClick={setup2FA} variant="outline" className="w-full bg-transparent">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Tentar Novamente
                  </Button>
                </div>
              )}
            </>
          )}

          {step === "verify" && (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token">Código de Verificação</Label>
                <Input
                  id="token"
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  required
                  disabled={isLoading}
                  className="text-center text-lg tracking-widest font-mono"
                />
                <p className="text-xs text-gray-500 text-center">
                  Digite o código de 6 dígitos do seu aplicativo autenticador
                </p>
              </div>

              <div className="space-y-2">
                <Button type="submit" className="w-full" disabled={isLoading || token.length !== 6}>
                  {isLoading ? "Verificando..." : "Verificar e Ativar 2FA"}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep("setup")}
                  className="w-full"
                  disabled={isLoading}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar ao QR Code
                </Button>
              </div>
            </form>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
