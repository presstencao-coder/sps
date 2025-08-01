"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Shield } from "lucide-react"

interface LoginFormProps {
  onSuccess: (token: string, requiresTwoFactor: boolean) => void
  onShowRegister: () => void
}

export function LoginForm({ onSuccess, onShowRegister }: LoginFormProps) {
  const [email, setEmail] = useState("admin@example.com") // Pre-fill for demo
  const [password, setPassword] = useState("admin123") // Pre-fill for demo
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      console.log("=== INICIANDO LOGIN ===")
      console.log("Email:", email)

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      console.log("Response status:", response.status)
      console.log("Response headers:", Object.fromEntries(response.headers.entries()))

      // Check if response is JSON
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await response.text()
        console.error("Resposta não é JSON:", textResponse)
        throw new Error("Servidor retornou resposta inválida")
      }

      const data = await response.json()
      console.log("Response data:", data)

      if (response.ok && data.success) {
        console.log("Login bem-sucedido")
        onSuccess(data.token, data.requiresTwoFactor || false)
      } else {
        console.error("Login falhou:", data.error)
        setError(data.error || "Erro ao fazer login")
      }
    } catch (error: any) {
      console.error("=== ERRO NO LOGIN ===", error)

      if (error.message.includes("JSON")) {
        setError("Erro de comunicação com o servidor")
      } else if (error.message.includes("fetch")) {
        setError("Erro de conexão com o servidor")
      } else {
        setError(error.message || "Erro desconhecido")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl">SecureVault</CardTitle>
          <CardDescription>Acesse seu cofre de senhas seguro</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>
                  {error}
                  {process.env.NODE_ENV === "development" && (
                    <details className="mt-2 text-xs">
                      <summary>Debug Info</summary>
                      <p>Verifique o console do navegador para mais detalhes</p>
                    </details>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>

            <div className="text-center space-y-2">
              <button
                type="button"
                onClick={onShowRegister}
                className="text-sm text-blue-600 hover:text-blue-700 underline"
                disabled={isLoading}
              >
                Não tem uma conta? Criar conta
              </button>

              <div className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <p>
                  <strong>Demo:</strong>
                </p>
                <p>Email: admin@example.com</p>
                <p>Senha: admin123</p>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
