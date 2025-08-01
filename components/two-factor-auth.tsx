"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Smartphone, RefreshCw } from "lucide-react"

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

  useEffect(() => {
    generateTwoFactorSetup()
  }, [])

  const generateTwoFactorSetup = async () => {
    try {
      const response = await fetch("/api/auth/2fa/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()
      if (response.ok) {
        setQrCode(data.qrCode)
        setSecret(data.secret)
      }
    } catch (error) {
      setError("Erro ao configurar 2FA")
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
        onSuccess()
      } else {
        setError(data.error || "Código inválido")
      }
    } catch (error) {
      setError("Erro de conexão")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <Smartphone className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl">Autenticação 2FA</CardTitle>
          <CardDescription>Escaneie o QR Code com seu app autenticador e digite o código</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {qrCode && (
            <div className="text-center">
              <img src={qrCode || "/placeholder.svg"} alt="QR Code 2FA" className="mx-auto mb-4" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Ou digite manualmente:</p>
              <code className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded break-all">{secret}</code>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Código de Verificação</Label>
              <Input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="123456"
                maxLength={6}
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading || code.length !== 6}>
              {isLoading ? "Verificando..." : "Verificar"}
            </Button>

            <Button type="button" variant="outline" className="w-full bg-transparent" onClick={generateTwoFactorSetup}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Gerar Novo QR Code
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
