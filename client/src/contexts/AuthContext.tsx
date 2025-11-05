import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AuthContextType {
  isConnected: boolean
  login: (code: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState<boolean>(() => {
    const saved = localStorage.getItem('persom_is_connected')
    return saved === 'true'
  })

  useEffect(() => {
    localStorage.setItem('persom_is_connected', String(isConnected))
  }, [isConnected])

  const login = (code: string): boolean => {
    if (code.toLowerCase() === 'beurpine') {
      setIsConnected(true)
      return true
    }
    return false
  }

  const logout = () => {
    setIsConnected(false)
  }

  return (
    <AuthContext.Provider value={{ isConnected, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

