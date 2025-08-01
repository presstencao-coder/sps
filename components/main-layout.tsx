"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Shield, Key, Settings, LogOut, Menu, X } from "lucide-react"

interface MainLayoutProps {
  children: React.ReactNode
  currentPage: "passwords" | "profile" | "settings"
  onPageChange: (page: "passwords" | "profile" | "settings") => void
  onLogout: () => void
  userInfo: {
    id: number
    name: string
    email: string
    twoFactorEnabled: boolean
  }
}

export default function MainLayout({ children, currentPage, onPageChange, onLogout, userInfo }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const menuItems = [
    {
      id: "passwords" as const,
      label: "Senhas",
      icon: Key,
      description: "Gerenciar suas senhas",
    },
    {
      id: "profile" as const,
      label: "Perfil",
      icon: Menu,
      description: "Informações da conta",
    },
    {
      id: "settings" as const,
      label: "Configurações",
      icon: Settings,
      description: "Segurança e preferências",
    },
  ]

  const handlePageChange = (page: "passwords" | "profile" | "settings") => {
    onPageChange(page)
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-white/90 backdrop-blur-sm shadow-lg"
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-40 w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl border-r border-slate-200 dark:border-slate-700 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:inset-0
      `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  SecureVault
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Gerenciador de Senhas</p>
              </div>
            </div>

            {/* User Info */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-blue-600 text-white font-medium">
                      {userInfo.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{userInfo.name}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{userInfo.email}</p>
                    <div className="flex items-center mt-1">
                      <Badge variant={userInfo.twoFactorEnabled ? "default" : "secondary"} className="text-xs">
                        {userInfo.twoFactorEnabled ? "2FA Ativo" : "2FA Inativo"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = currentPage === item.id

              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  className={`
                    w-full justify-start h-auto p-4 text-left transition-all duration-200
                    ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:from-blue-700 hover:to-indigo-700"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }
                  `}
                  onClick={() => handlePageChange(item.id)}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5 shrink-0" />
                    <div>
                      <div className="font-medium">{item.label}</div>
                      <div className={`text-xs ${isActive ? "text-blue-100" : "text-slate-500 dark:text-slate-400"}`}>
                        {item.description}
                      </div>
                    </div>
                  </div>
                </Button>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <Button
              variant="outline"
              className="w-full justify-start bg-transparent hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:hover:bg-red-950 dark:hover:border-red-800 dark:hover:text-red-400 transition-colors"
              onClick={onLogout}
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sair da Conta
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="lg:ml-80 min-h-screen">
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
