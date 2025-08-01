"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { LoginForm } from "./login-form"
import { TwoFactorAuth } from "./two-factor-auth"
import { RegisterForm } from "./register-form"
import { MainLayout } from "./main-layout"
import { PasswordManager } from "./password-manager"
import { ProfilePage } from "./profile-page"
import { SettingsPage } from "./settings-page"
import { Toaster } from "@/components/ui/toaster"

interface AuthWrapperProps {
  children: React.ReactNode
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showTwoFactor, setShowTwoFactor] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [userToken, setUserToken] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState<"passwords" | "profile" | "settings">("passwords")
  const [userInfo, setUserInfo] = useState<
    | {
        name: string
        email: string
        twoFactorEnabled: boolean
      }
    | undefined
  >()

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
      console.log("Token payload:", payload)

      if (payload.twoFactorVerified === true) {
        setIsAuthenticated(true)
        setUserToken(token)
        // Load user info
        await loadUserInfo(token)
      } else {
        // Token válido mas sem 2FA verificado
        setUserToken(token)
        setShowTwoFactor(true)
      }
    } catch (error) {
      console.error("Erro ao verificar token:", error)
      // Token inválido, remover
      localStorage.removeItem("token")
    } finally {
      setIsLoading(false)
    }
  }

  const loadUserInfo = async (token: string) => {
    try {
      const response = await fetch("/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUserInfo({
          name: data.name,
          email: data.email,
          twoFactorEnabled: data.twoFactorEnabled,
        })
      }
    } catch (error) {
      console.error("Erro ao carregar info do usuário:", error)
    }
  }

  const handleLoginSuccess = (userData: any) => {
    console.log("Login success:", userData)
    const token = userData.token
    setUserToken(token)
    localStorage.setItem("token", token)

    if (userData.requiresTwoFactor) {
      setShowTwoFactor(true)
    } else {
      setIsAuthenticated(true)
      loadUserInfo(token)
    }
  }

  const handleTwoFactorComplete = () => {
    console.log("2FA complete")
    setShowTwoFactor(false)
    setIsAuthenticated(true)
    const token = localStorage.getItem("token")
    if (token) {
      loadUserInfo(token)
    }
  }

  const handleRegisterSuccess = (userData: any) => {
    const token = userData.token
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
    setUserInfo(undefined)
    setCurrentPage("passwords")
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "passwords":
        return <PasswordManager />
      case "profile":
        return <ProfilePage />
      case "settings":
        return <SettingsPage />
      default:
        return <PasswordManager />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando SecureVault...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    if (showTwoFactor) {
      return (
        <>
          <TwoFactorAuth onComplete={handleTwoFactorComplete} />
          <Toaster />
        </>
      )
    }

    if (showRegister) {
      return (
        <>
          <RegisterForm onRegisterSuccess={handleRegisterSuccess} onSwitchToLogin={() => setShowRegister(false)} />
          <Toaster />
        </>
      )
    }

    return (
      <>
        <LoginForm onLoginSuccess={handleLoginSuccess} onSwitchToRegister={() => setShowRegister(true)} />
        <Toaster />
      </>
    )
  }

  return (
    <>
      <MainLayout currentPage={currentPage} onPageChange={setCurrentPage} onLogout={handleLogout} userInfo={userInfo}>
        {renderCurrentPage()}
      </MainLayout>
      <Toaster />
    </>
  )
}
