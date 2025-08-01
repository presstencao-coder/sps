"use client"

import { useState, useEffect } from "react"
import { LoginForm } from "./login-form"
import { RegisterForm } from "./register-form"
import { TwoFactorAuth } from "./two-factor-auth"
import MainLayout from "./main-layout"
import { PasswordManager } from "./password-manager"
import { ProfilePage } from "./profile-page"
import { SettingsPage } from "./settings-page"
import { toast } from "sonner"

type AuthState = "login" | "register" | "2fa" | "authenticated"
type Page = "passwords" | "profile" | "settings"

interface User {
  id: number
  name: string
  email: string
  twoFactorEnabled: boolean
}

export function AuthWrapper() {
  const [authState, setAuthState] = useState<AuthState>("login")
  const [currentPage, setCurrentPage] = useState<Page>("passwords")
  const [user, setUser] = useState<User | null>(null)
  const [tempToken, setTempToken] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      validateToken(token)
    }
  }, [])

  const validateToken = async (token: string) => {
    try {
      const response = await fetch("/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        setAuthState("authenticated")
      } else {
        localStorage.removeItem("token")
        setAuthState("login")
      }
    } catch (error) {
      console.error("Token validation error:", error)
      localStorage.removeItem("token")
      setAuthState("login")
    }
  }

  const handleLoginSuccess = (token: string, requiresTwoFactor: boolean, userData?: User) => {
    if (requiresTwoFactor) {
      setTempToken(token)
      setAuthState("2fa")
    } else {
      localStorage.setItem("token", token)
      if (userData) {
        setUser(userData)
      }
      setAuthState("authenticated")
      toast.success("Login realizado com sucesso!")
    }
  }

  const handleRegisterSuccess = () => {
    setAuthState("login")
    toast.success("Conta criada com sucesso! Faça login para continuar.")
  }

  const handle2FASuccess = (token: string, userData: User) => {
    localStorage.setItem("token", token)
    setUser(userData)
    setTempToken(null)
    setAuthState("authenticated")
    toast.success("Autenticação de dois fatores concluída!")
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    setUser(null)
    setTempToken(null)
    setAuthState("login")
    setCurrentPage("passwords")
    toast.success("Logout realizado com sucesso!")
  }

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser)
  }

  if (authState === "login") {
    return <LoginForm onLoginSuccess={handleLoginSuccess} onSwitchToRegister={() => setAuthState("register")} />
  }

  if (authState === "register") {
    return <RegisterForm onRegisterSuccess={handleRegisterSuccess} onSwitchToLogin={() => setAuthState("login")} />
  }

  if (authState === "2fa") {
    return <TwoFactorAuth tempToken={tempToken} onSuccess={handle2FASuccess} onBack={() => setAuthState("login")} />
  }

  if (authState === "authenticated" && user) {
    return (
      <MainLayout currentPage={currentPage} onPageChange={setCurrentPage} onLogout={handleLogout} userInfo={user}>
        {currentPage === "passwords" && <PasswordManager />}
        {currentPage === "profile" && <ProfilePage user={user} onUserUpdate={handleUserUpdate} />}
        {currentPage === "settings" && <SettingsPage user={user} onUserUpdate={handleUserUpdate} />}
      </MainLayout>
    )
  }

  return null
}
