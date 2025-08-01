"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Shield, Key, User, Settings, LogOut, Menu, X, Sun, Moon, Home } from "lucide-react"
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
    { id: "passwords", label: "Senhas", icon: Key },
    { id: "profile", label: "Perfil", icon: User },
    { id: "settings", label: "Configurações", icon: Settings },
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
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-900 ${darkMode ? "dark" : ""}`}>
      {/* Mobile Header */}
      <div className="lg:hidden bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-blue-600" />
              <span className="font-bold text-lg">SecureVault</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={toggleDarkMode}>
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div
          className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transform transition-transform duration-200 ease-in-out
          lg:translate-x-0 lg:static lg:inset-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="hidden lg:flex items-center space-x-2 p-6 border-b border-slate-200 dark:border-slate-700">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="font-bold text-xl text-slate-900 dark:text-white">SecureVault</span>
            </div>

            {/* User Info */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-blue-600 text-white">
                    {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {user.name || "Usuário"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                </div>
              </div>
              <div className="mt-3">
                <Badge variant={user.twoFactorEnabled ? "default" : "secondary"} className="text-xs">
                  <Shield className="w-3 h-3 mr-1" />
                  2FA {user.twoFactorEnabled ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => {
                      setActiveTab(item.id)
                      setSidebarOpen(false)
                    }}
                  >
                    <Icon className="mr-3 h-4 w-4" />
                    {item.label}
                  </Button>
                )
              })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
              <Button variant="ghost" className="w-full justify-start hidden lg:flex" onClick={toggleDarkMode}>
                {darkMode ? <Sun className="mr-3 h-4 w-4" /> : <Moon className="mr-3 h-4 w-4" />}
                {darkMode ? "Modo Claro" : "Modo Escuro"}
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={onLogout}
              >
                <LogOut className="mr-3 h-4 w-4" />
                Sair
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
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                    {menuItems.find((item) => item.id === activeTab)?.label || "Dashboard"}
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    {activeTab === "passwords" && "Gerencie suas senhas com segurança"}
                    {activeTab === "profile" && "Visualize e edite suas informações pessoais"}
                    {activeTab === "settings" && "Configure suas preferências de segurança"}
                  </p>
                </div>
                <div className="hidden lg:flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    <Home className="w-3 h-3 mr-1" />
                    Online
                  </Badge>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto">{renderContent()}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
