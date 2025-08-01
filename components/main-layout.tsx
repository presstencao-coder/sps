"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Shield, Key, User, Settings, LogOut, Menu, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

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
  const { theme, setTheme } = useTheme()

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

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`flex flex-col h-full ${mobile ? "p-4" : "p-6"}`}>
      {/* Logo */}
      <div className="flex items-center space-x-3 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">SecureVault</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Gerenciador de Senhas</p>
        </div>
      </div>

      {/* User Info */}
      {userInfo && (
        <Card className="p-4 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder-user.jpg" />
              <AvatarFallback className="bg-blue-600 text-white">
                {userInfo.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{userInfo.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{userInfo.email}</p>
              <div className="flex items-center mt-1">
                <Badge variant={userInfo.twoFactorEnabled ? "default" : "secondary"} className="text-xs">
                  {userInfo.twoFactorEnabled ? "2FA Ativo" : "2FA Inativo"}
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.id

          return (
            <button
              key={item.id}
              onClick={() => {
                onPageChange(item.id)
                if (mobile) setSidebarOpen(false)
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5" />
              <div>
                <p className="font-medium">{item.name}</p>
                <p className={`text-xs ${isActive ? "text-blue-100" : "text-slate-500 dark:text-slate-400"}`}>
                  {item.description}
                </p>
              </div>
            </button>
          )
        })}
      </nav>

      {/* Footer Actions */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-full justify-start"
        >
          {theme === "dark" ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
          {theme === "dark" ? "Modo Claro" : "Modo Escuro"}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-80 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200 dark:border-slate-700">
          <Sidebar />
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <div className="bg-white dark:bg-slate-900 h-full">
                  <Sidebar mobile />
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-blue-600" />
              <span className="font-bold text-slate-900 dark:text-white">SecureVault</span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-user.jpg" />
                  <AvatarFallback className="bg-blue-600 text-white text-sm">
                    {userInfo?.name.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
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

      {/* Main Content */}
      <div className="lg:pl-80">
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
