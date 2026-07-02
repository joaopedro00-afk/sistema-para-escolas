import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { clearToken, getToken, login as loginRequest, setToken, type Usuario } from '../services/api'

type AuthContextValue = {
  usuario: Usuario | null
  isAuthenticated: boolean
  login: (cpf: string, senha: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const USUARIO_KEY = 'desafio_crud_usuario'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    const raw = localStorage.getItem(USUARIO_KEY)
    return raw ? JSON.parse(raw) : null
  })

  async function login(cpf: string, senha: string) {
    const { token, usuario: usuarioLogado } = await loginRequest(cpf, senha)
    setToken(token)
    localStorage.setItem(USUARIO_KEY, JSON.stringify(usuarioLogado))
    setUsuario(usuarioLogado)
  }

  function logout() {
    clearToken()
    localStorage.removeItem(USUARIO_KEY)
    setUsuario(null)
  }

  const value = useMemo<AuthContextValue>(
    () => ({ usuario, isAuthenticated: Boolean(getToken() && usuario), login, logout }),
    [usuario]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  return context
}
