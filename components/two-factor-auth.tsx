"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Smartphone, RefreshCw, CheckCircle } from "lucide-react"

interface TwoFactorAuthProps {
  email: string
  onSuccess: () => void
}

export function TwoFactorAuth({ email, onSuccess }: TwoFactorAuthProps) {
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [qrCode, setQrCode] = useState("")
  const [secret, setSecret] = useState("")
  const [isSetupComplete, setIsSetupComplete] = useState(false)

  useEffect(() => {
    generateTwoFactorSetup()
  }, [email])

  const generateTwoFactorSetup = async () => {
    try {
      setError("")
      const response = await fetch("/api/auth/2fa/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()
      if (response.ok) {
        setQrCode(data.qrCode)
        setSecret(data.secret)
        setIsSetupComplete(false)
      } else {
        setError(data.error || "Erro ao configurar 2FA")
      }
    } catch (error) {
      console.error("Erro ao configurar 2FA:", error)
      setError("Erro de conexão ao configurar 2FA")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSetupComplete(true)
        setTimeout(() => {
          onSuccess()
        }, 2000)
      } else {
        setError(data.error || "Código inválido")
      }
    } catch (error) {
      console.error("Erro na verificação 2FA:", error)
      setError("Erro de conexão")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSetupComplete) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl text-green-600">2FA Configurado!</CardTitle>
            <CardDescription>Autenticação de dois fatores ativada com sucesso</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Redirecionando para o gerenciador de senhas...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <Smartphone className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl">Configurar 2FA</CardTitle>
          <CardDescription>Configure a autenticação de dois fatores para maior segurança</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {qrCode && (
            <div className="text-center">
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">1. Escaneie o QR Code:</p>
                <div className="flex justify-center">
                  <img
                    src={qrCode || "/placeholder.svg"}
                    alt="QR Code 2FA"
                    className="border rounded-lg p-2 bg-white"
                    width={200}
                    height={200}
                  />
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium mb-2">2. Ou digite manualmente no seu app:</p>
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                  <code className="text-xs break-all font-mono">{secret}</code>
                </div>
              </div>

              <div className="text-xs text-gray-500 mb-4">
                <p>Use Google Authenticator, Authy ou similar</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">3. Digite o código de 6 dígitos:</Label>
              <Input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="123456"
                maxLength={6}
                className="text-center text-lg tracking-widest"
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading || code.length !== 6}>
              {isLoading ? "Verificando..." : "Verificar e Ativar 2FA"}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full bg-transparent"
              onClick={generateTwoFactorSetup}
              disabled={isLoading}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Gerar Novo QR Code
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
