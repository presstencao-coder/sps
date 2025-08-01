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
  const [userEmail, setUserEmail] = useState("")
  const [showRegister, setShowRegister] = useState(false)

  useEffect(() => {
    // Verificar se já está autenticado
    const authToken = localStorage.getItem("auth_token")
    const twoFactorVerified = localStorage.getItem("2fa_verified")

    if (authToken && twoFactorVerified) {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLoginSuccess = (email: string) => {
    setUserEmail(email)
    setShowTwoFactor(true)
  }

  const handleTwoFactorSuccess = () => {
    setIsAuthenticated(true)
    setShowTwoFactor(false)
    localStorage.setItem("2fa_verified", "true")
  }

  const handleLogout = () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("2fa_verified")
    setIsAuthenticated(false)
    setShowTwoFactor(false)
  }

  if (!isAuthenticated) {
    if (showTwoFactor) {
      return <TwoFactorAuth email={userEmail} onSuccess={handleTwoFactorSuccess} />
    }

    if (showRegister) {
      return <RegisterForm onSuccess={handleLoginSuccess} onBackToLogin={() => setShowRegister(false)} />
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
