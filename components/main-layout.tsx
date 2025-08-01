"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Shield, Key, User, Settings, LogOut, Menu, X, Sun, Moon, Lock } from "lucide-react"
import PasswordManager from "./password-manager"
import ProfilePage from "./profile-page"
import SettingsPage from "./settings-page"

interface MainLayoutProps {
  user: {
    id: string
    email: string
    name: string
    twoFactorEnabled: boolean
  }
  onLogout: () => void
}

export default function MainLayout({ user, onLogout }: MainLayoutProps) {
  const [activeTab, setActiveTab] = useState("passwords")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle("dark")
  }

  const menuItems = [
    {
      id: "passwords",
      label: "Senhas",
      icon: Key,
      description: "Gerencie suas senhas",
    },
    {
      id: "profile",
      label: "Perfil",
      icon: User,
      description: "Informações pessoais",
    },
    {
      id: "settings",
      label: "Configurações",
      icon: Settings,
      description: "Segurança e preferências",
    },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case "passwords":
        return <PasswordManager />
      case "profile":
        return <ProfilePage user={user} />
      case "settings":
        return <SettingsPage user={user} />
      default:
        return <PasswordManager />
    }
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 ${darkMode ? "dark" : ""}`}
    >
      {/* Mobile Header */}
      <div className="lg:hidden bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-600" />
              <span className="font-bold text-slate-900 dark:text-slate-100">SecureVault</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={toggleDarkMode}>
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div
          className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        >
          {/* Desktop Header */}
          <div className="hidden lg:flex items-center gap-3 p-6 border-b border-slate-200 dark:border-slate-700">
            <Shield className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="font-bold text-xl text-slate-900 dark:text-slate-100">SecureVault</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Gerenciador de Senhas</p>
            </div>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 dark:text-slate-100 truncate">{user.name || "Usuário"}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Badge variant={user.twoFactorEnabled ? "default" : "secondary"} className="text-xs">
                <Lock className="w-3 h-3 mr-1" />
                2FA {user.twoFactorEnabled ? "Ativo" : "Inativo"}
              </Badge>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id)
                    setSidebarOpen(false)
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors
                    ${
                      isActive
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <div>
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{item.description}</div>
                  </div>
                </button>
              )
            })}
          </nav>

          <Separator className="mx-4" />

          {/* Stats */}
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Senhas Salvas</span>
              <Badge variant="outline">0</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Última Atividade</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Agora</span>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={toggleDarkMode} className="flex-1">
                {darkMode ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                {darkMode ? "Claro" : "Escuro"}
              </Button>
              <Button variant="ghost" size="sm" onClick={onLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          <div className="p-6">
            {/* Page Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {menuItems.find((item) => item.id === activeTab)?.label}
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    {menuItems.find((item) => item.id === activeTab)?.description}
                  </p>
                </div>

                {/* Desktop Actions */}
                <div className="hidden lg:flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={toggleDarkMode}>
                    {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={onLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </Button>
                </div>
              </div>
            </div>

            {/* Page Content */}
            <div className="max-w-7xl">{renderContent()}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
