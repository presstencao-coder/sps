"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Key, User, Settings, LogOut, Menu, X, Shield } from "lucide-react"

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

  const navigation = [
    {
      name: "Senhas",
      id: "passwords" as const,
      icon: Key,
      description: "Gerencie suas senhas",
    },
    {
      name: "Perfil",
      id: "profile" as const,
      icon: User,
      description: "Informações da conta",
    },
    {
      name: "Configurações",
      id: "settings" as const,
      icon: Settings,
      description: "Segurança e preferências",
    },
  ]

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200 dark:border-slate-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">SecureVault</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Gerenciador de Senhas</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
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
                    w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200
                    ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-slate-500"}`} />
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className={`text-xs ${isActive ? "text-blue-100" : "text-slate-500"}`}>{item.description}</div>
                  </div>
                </button>
              )
            })}
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start p-3 h-auto">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src="/placeholder-user.jpg" />
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                      {userInfo ? getUserInitials(userInfo.name) : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-slate-900 dark:text-white">{userInfo?.name || "Usuário"}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {userInfo?.email || "email@exemplo.com"}
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => onPageChange("profile")}>
                  <User className="mr-2 h-4 w-4" />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onPageChange("settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700">
          <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white">SecureVault</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
