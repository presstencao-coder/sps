"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Smartphone, ArrowLeft } from "lucide-react"

interface TwoFactorAuthProps {
  onSuccess: (userData: any) => void
  onBack: () => void
}

export function TwoFactorAuth({ onSuccess, onBack }: TwoFactorAuthProps) {
  const [qrCode, setQrCode] = useState("")
  const [secret, setSecret] = useState("")
  const [token, setToken] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<"setup" | "verify">("setup")

  useEffect(() => {
    setup2FA()
  }, [])

  const setup2FA = async () => {
    try {
      const authToken = localStorage.getItem("token")
      if (!authToken) return

      const response = await fetch("/api/auth/2fa/setup", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setQrCode(data.qrCode)
        setSecret(data.secret)
      } else {
        setError("Erro ao configurar 2FA")
      }
    } catch (error) {
      console.error("Erro ao configurar 2FA:", error)
      setError("Erro ao configurar 2FA")
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const authToken = localStorage.getItem("token")
      if (!authToken) return

      const response = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Update token with 2FA verified
        localStorage.setItem("token", data.token)
        onSuccess(data)
      } else {
        setError(data.error || "Código inválido")
      }
    } catch (error) {
      console.error("Erro na verificação 2FA:", error)
      setError("Erro na verificação")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl">Autenticação 2FA</CardTitle>
          <CardDescription>
            {step === "setup" ? "Configure a autenticação de dois fatores" : "Digite o código do seu aplicativo"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "setup" && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="bg-white p-4 rounded-lg inline-block">
                  {qrCode && <img src={qrCode || "/placeholder.svg"} alt="QR Code 2FA" className="w-48 h-48 mx-auto" />}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Smartphone className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium">Como configurar:</span>
                </div>
                <ol className="text-sm text-gray-600 space-y-1 ml-7">
                  <li>1. Baixe um app como Google Authenticator</li>
                  <li>2. Escaneie o QR Code acima</li>
                  <li>3. Digite o código de 6 dígitos abaixo</li>
                </ol>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-500 mb-2">Código manual:</p>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">{secret}</code>
              </div>

              <Button onClick={() => setStep("verify")} className="w-full">
                Continuar para Verificação
              </Button>
            </div>
          )}

          {step === "verify" && (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token">Código de Verificação</Label>
                <Input
                  id="token"
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  required
                  disabled={isLoading}
                  className="text-center text-lg tracking-widest"
                />
                <p className="text-xs text-gray-500 text-center">Digite o código de 6 dígitos do seu aplicativo</p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Verificando..." : "Verificar e Ativar 2FA"}
                </Button>

                <Button type="button" variant="ghost" onClick={() => setStep("setup")} className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar ao QR Code
                </Button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <button type="button" onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700 underline">
              Voltar ao login
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
