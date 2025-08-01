"use client"

import { useState, useEffect } from "react"
import { LoginForm } from "./login-form"
import { RegisterForm } from "./register-form"
import { TwoFactorAuth } from "./two-factor-auth"
import { PasswordManager } from "./password-manager"
import { ProfilePage } from "./profile-page"
import { SettingsPage } from "./settings-page"
import { MainLayout } from "./main-layout"
import { Toaster } from "@/components/ui/toaster"

type AuthState = "login" | "register" | "2fa" | "authenticated"
type Page = "passwords" | "profile" | "settings"

interface UserInfo {
  name: string
  email: string
  twoFactorEnabled: boolean
}

export function AuthWrapper() {
  const [authState, setAuthState] = useState<AuthState>("login")
  const [currentPage, setCurrentPage] = useState<Page>("passwords")
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setLoading(false)
        return
      }

      // Verify token and get user info
      const response = await fetch("/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const userData = await response.json()
        setUserInfo({
          name: userData.name,
          email: userData.email,
          twoFactorEnabled: userData.twoFactorEnabled,
        })
        setAuthState("authenticated")
      } else {
        localStorage.removeItem("token")
      }
    } catch (error) {
      console.error("Erro ao verificar autenticação:", error)
      localStorage.removeItem("token")
    } finally {
      setLoading(false)
    }
  }

  const handleLoginSuccess = (userData: any) => {
    if (userData.requiresTwoFactor) {
      setAuthState("2fa")
    } else {
      localStorage.setItem("token", userData.token)
      setUserInfo({
        name: userData.user.name,
        email: userData.user.email,
        twoFactorEnabled: userData.user.twoFactorEnabled,
      })
      setAuthState("authenticated")
    }
  }

  const handle2FASuccess = (userData: any) => {
    localStorage.setItem("token", userData.token)
    setUserInfo({
      name: userData.user.name,
      email: userData.user.email,
      twoFactorEnabled: userData.user.twoFactorEnabled,
    })
    setAuthState("authenticated")
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    setUserInfo(null)
    setAuthState("login")
    setCurrentPage("passwords")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-slate-600 dark:text-slate-400">Carregando...</span>
        </div>
      </div>
    )
  }

  if (authState === "login") {
    return (
      <>
        <LoginForm onLoginSuccess={handleLoginSuccess} onSwitchToRegister={() => setAuthState("register")} />
        <Toaster />
      </>
    )
  }

  if (authState === "register") {
    return (
      <>
        <RegisterForm onRegisterSuccess={() => setAuthState("login")} onSwitchToLogin={() => setAuthState("login")} />
        <Toaster />
      </>
    )
  }

  if (authState === "2fa") {
    return (
      <>
        <TwoFactorAuth onSuccess={handle2FASuccess} onBack={() => setAuthState("login")} />
        <Toaster />
      </>
    )
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

  return (
    <>
      <MainLayout
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onLogout={handleLogout}
        userInfo={userInfo || undefined}
      >
        {renderCurrentPage()}
      </MainLayout>
      <Toaster />
    </>
  )
}
