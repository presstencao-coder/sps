import { Suspense } from "react"
import { PasswordManager } from "@/components/password-manager"
import { AuthWrapper } from "@/components/auth-wrapper"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">SecureVault</h1>
          <p className="text-slate-600 dark:text-slate-400">Gerenciador de senhas seguro com criptografia e 2FA</p>
        </div>

        <Suspense fallback={<div className="text-center">Carregando...</div>}>
          <AuthWrapper>
            <PasswordManager />
          </AuthWrapper>
        </Suspense>
      </div>
    </div>
  )
}
