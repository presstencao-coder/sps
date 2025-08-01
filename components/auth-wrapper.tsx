"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { LoginForm } from "./login-form"
import { TwoFactorAuth } from "./two-factor-auth"
import { RegisterForm } from "./register-form"

interface AuthWrapperProps {
  children: React.ReactNode
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showTwoFactor, setShowTwoFactor] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [userToken, setUserToken] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar se já está autenticado
    const token = localStorage.getItem("token")
    if (token) {
      // Verificar se o token é válido
      verifyToken(token)
    } else {
      setIsLoading(false)
    }
  }, [])

  const verifyToken = async (token: string) => {
    try {
      // Decodificar o token para verificar se tem 2FA
      const payload = JSON.parse(atob(token.split(".")[1]))

      if (payload.twoFactorVerified === true) {
        setIsAuthenticated(true)
      } else {
        // Token válido mas sem 2FA verificado
        setUserToken(token)
        setShowTwoFactor(true)
      }
    } catch (error) {
      // Token inválido, remover
      localStorage.removeItem("token")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoginSuccess = (token: string, requiresTwoFactor: boolean) => {
    setUserToken(token)
    localStorage.setItem("token", token)

    if (requiresTwoFactor) {
      setShowTwoFactor(true)
    } else {
      setIsAuthenticated(true)
    }
  }

  const handleTwoFactorComplete = () => {
    setShowTwoFactor(false)
    setIsAuthenticated(true)
  }

  const handleRegisterSuccess = (token: string) => {
    setUserToken(token)
    localStorage.setItem("token", token)
    setShowRegister(false)
    setShowTwoFactor(true) // Sempre mostrar 2FA após registro
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    setIsAuthenticated(false)
    setShowTwoFactor(false)
    setShowRegister(false)
    setUserToken("")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    if (showTwoFactor) {
      return <TwoFactorAuth onComplete={handleTwoFactorComplete} />
    }

    if (showRegister) {
      return <RegisterForm onSuccess={handleRegisterSuccess} onBackToLogin={() => setShowRegister(false)} />
    }

    return <LoginForm onSuccess={handleLoginSuccess} onShowRegister={() => setShowRegister(true)} />
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Sair
        </button>
      </div>
      {children}
    </div>
  )
}
