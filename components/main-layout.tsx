"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, Key, User, Settings, LogOut, Menu, X, Lock, Database } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface MainLayoutProps {
  children: React.ReactNode
  currentPage: "passwords" | "profile" | "settings"
  onPageChange: (page: "passwords" | "profile" | "settings") => void
  onLogout: () => void
  userInfo?: {
    name: string
    email: string
    twoFactorEnabled: boolean
  }
}

export function MainLayout({ children, currentPage, onPageChange, onLogout, userInfo }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { toast } = useToast()

  const menuItems = [
    {
      id: "passwords" as const,
      label: "Minhas Senhas",
      icon: Key,
      description: "Gerenciar senhas salvas",
    },
    {
      id: "profile" as const,
      label: "Perfil",
      icon: User,
      description: "Dados pessoais",
    },
    {
      id: "settings" as const,
      label: "Configurações",
      icon: Settings,
      description: "Segurança e preferências",
    },
  ]

  const handleLogout = () => {
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com segurança.",
    })
    onLogout()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200 dark:border-slate-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">SecureVault</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Gerenciador de Senhas</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* User Info */}
          {userInfo && (
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full text-white font-semibold text-lg">
                  {userInfo.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{userInfo.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{userInfo.email}</p>
                  <div className="flex items-center mt-1">
                    <Badge variant={userInfo.twoFactorEnabled ? "default" : "secondary"} className="text-xs">
                      <Lock className="w-3 h-3 mr-1" />
                      2FA {userInfo.twoFactorEnabled ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = currentPage === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onPageChange(item.id)
                    setSidebarOpen(false)
                  }}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200
                    ${
                      isActive
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-white" : ""}`} />
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${isActive ? "text-white" : ""}`}>{item.label}</p>
                    <p className={`text-xs ${isActive ? "text-blue-100" : "text-slate-400"}`}>{item.description}</p>
                  </div>
                </button>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sair da Conta
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                {menuItems.find((item) => item.id === currentPage)?.label}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {menuItems.find((item) => item.id === currentPage)?.description}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="hidden sm:flex">
              <Database className="w-3 h-3 mr-1" />
              Dados Seguros
            </Badge>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
