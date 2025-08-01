"use client"

import { useState, useEffect } from "react"
import { LoginForm } from "./login-form"
import { RegisterForm } from "./register-form"
import { TwoFactorAuth } from "./two-factor-auth"
import { MainLayout } from "./main-layout"

interface User {
  id: string
  name: string
  email: string
  twoFactorEnabled: boolean
}

export function AuthWrapper() {
  const [user, setUser] = useState<User | null>(null)
  const [showRegister, setShowRegister] = useState(false)
  const [showTwoFactor, setShowTwoFactor] = useState(false)
  const [tempUser, setTempUser] = useState<any>(null)
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

      const response = await fetch("/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
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
      setTempUser(userData)
      setShowTwoFactor(true)
    } else {
      localStorage.setItem("token", userData.token)
      setUser(userData.user)
    }
  }

  const handleRegisterSuccess = (userData: any) => {
    localStorage.setItem("token", userData.token)
    setUser(userData.user)
    setShowRegister(false)
  }

  const handleTwoFactorSuccess = (userData: any) => {
    localStorage.setItem("token", userData.token)
    setUser(userData.user)
    setShowTwoFactor(false)
    setTempUser(null)
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    setUser(null)
    setShowTwoFactor(false)
    setTempUser(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (user) {
    return <MainLayout user={user} onLogout={handleLogout} />
  }

  if (showTwoFactor) {
    return (
      <TwoFactorAuth
        tempUser={tempUser}
        onSuccess={handleTwoFactorSuccess}
        onBack={() => {
          setShowTwoFactor(false)
          setTempUser(null)
        }}
      />
    )
  }

  if (showRegister) {
    return <RegisterForm onRegisterSuccess={handleRegisterSuccess} onSwitchToLogin={() => setShowRegister(false)} />
  }

  return <LoginForm onLoginSuccess={handleLoginSuccess} onSwitchToRegister={() => setShowRegister(true)} />
}
