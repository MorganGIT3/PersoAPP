import { useEffect } from 'react'
import { useLocation } from 'wouter'
import { useAuth } from '@/contexts/AuthContext'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isConnected } = useAuth()
  const [, setLocation] = useLocation()

  useEffect(() => {
    if (!isConnected) {
      setLocation('/')
    }
  }, [isConnected, setLocation])

  if (!isConnected) {
    return null
  }

  return <>{children}</>
}

