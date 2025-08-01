"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Smartphone } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TwoFactorAuthProps {
  onComplete: () => void
}

export function TwoFactorAuth({ onComplete }: TwoFactorAuthProps) {
  const [qrCode, setQrCode] = useState("")
  const [secret, setSecret] = useState("")
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSetupLoading, setIsSetupLoading] = useState(true)
  const [error, setError] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    setupTwoFactor()
  }, [])

  const setupTwoFactor = async () => {
    try {
      console.log("=== CONFIGURANDO 2FA ===")
      const token = localStorage.getItem("token")

      if (!token) {
        throw new Error("Token não encontrado")
      }

      const response = await fetch("/api/auth/2fa/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("Setup 2FA response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao configurar 2FA")
      }

      const data = await response.json()
      console.log("Setup 2FA data:", data)

      if (data.success) {
        setQrCode(data.qrCode)
        setSecret(data.secret)
        toast({
          title: "2FA Configurado",
          description: "Escaneie o QR Code com seu app autenticador",
        })
      } else {
        throw new Error(data.error || "Erro ao configurar 2FA")
      }
    } catch (error: any) {
      console.error("Erro ao configurar 2FA:", error)
      setError(error.message || "Erro ao configurar autenticação de dois fatores")
    } finally {
      setIsSetupLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      console.log("=== VERIFICANDO CÓDIGO 2FA ===")
      const token = localStorage.getItem("token")

      if (!token) {
        throw new Error("Token não encontrado")
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
        // Atualizar token com 2FA verificado
        localStorage.setItem("token", data.token)

        toast({
          title: "2FA Verificado",
          description: "Autenticação de dois fatores configurada com sucesso!",
        })

        onComplete()
      } else {
        throw new Error(data.error || "Código inválido")
      }
    } catch (error: any) {
      console.error("Erro ao verificar 2FA:", error)
      setError(error.message || "Erro ao verificar código")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSetupLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">Configurando autenticação...</p>
          </CardContent>
        </Card>
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
          <CardDescription>Configure seu app autenticador para maior segurança</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QR Code Section */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
              <Smartphone className="h-4 w-4" />
              <span>Escaneie com Google Authenticator ou similar</span>
            </div>

            {qrCode && (
              <div className="flex justify-center p-4 bg-white dark:bg-slate-800 rounded-lg border">
                <div dangerouslySetInnerHTML={{ __html: qrCode }} />
              </div>
            )}

            {secret && (
              <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                <p className="font-medium mb-1">Chave manual (se não conseguir escanear):</p>
                <code className="break-all">{secret}</code>
              </div>
            )}
          </div>

          {/* Verification Form */}
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Código de Verificação</Label>
              <Input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="text-center text-lg tracking-widest"
                required
                disabled={isLoading}
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                Digite o código de 6 dígitos do seu app autenticador
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading || code.length !== 6}>
              {isLoading ? "Verificando..." : "Verificar e Continuar"}
            </Button>
          </form>

          {/* Instructions */}
          <div className="text-xs text-slate-500 dark:text-slate-400 space-y-2">
            <p className="font-medium">Como configurar:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Baixe o Google Authenticator ou similar</li>
              <li>Escaneie o QR Code acima</li>
              <li>Digite o código de 6 dígitos gerado</li>
              <li>Clique em "Verificar e Continuar"</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
