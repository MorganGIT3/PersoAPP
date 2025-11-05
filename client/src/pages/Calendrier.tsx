import { useEffect } from 'react'
import { useLocation } from 'wouter'
import { useAuth } from '@/contexts/AuthContext'
import { LogOut } from 'lucide-react'
import { motion } from 'framer-motion'
import { MeshGradient } from "@paper-design/shaders-react"
import { FullScreenCalendar } from './CalendrierContent'

export default function Calendrier() {
  const { isConnected, logout } = useAuth()
  const [, setLocation] = useLocation()

  // Masquer la scrollbar pendant l'animation
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const timer = setTimeout(() => {
      document.body.style.overflow = ''
    }, 500) // Masquer pendant 500ms (durée de l'animation + marge)
    return () => {
      clearTimeout(timer)
      document.body.style.overflow = ''
    }
  }, [])

  // Rediriger si non connecté
  useEffect(() => {
    if (!isConnected) {
      setLocation('/')
    }
  }, [isConnected, setLocation])

  if (!isConnected) {
    return null
  }

  return (
    <>
      {/* Top Navigation - Fixed position (no animation) */}
      <div className="fixed top-8 left-0 right-0 flex justify-center z-50">
        <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-full px-6 py-3 shadow-lg">
            <div className="flex items-center gap-6">
              <span className="text-slate-800 font-medium">PersoM</span>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setLocation('/')}
                  className="text-sm px-3 py-1 rounded-full transition-colors text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setLocation('/contenu')}
                  className="text-sm px-3 py-1 rounded-full transition-colors text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Contenu
                </button>
                <button
                  className="text-sm px-3 py-1 rounded-full transition-colors bg-slate-800 text-white border border-slate-300"
                >
                  Calendrier
                </button>
                <button
                  onClick={() => setLocation('/contenu/notes')}
                  className="text-sm px-3 py-1 rounded-full transition-colors text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Content Note
                </button>
                <button
                  onClick={() => {
                    logout()
                    setLocation('/')
                  }}
                  className="p-2 rounded-full transition-colors text-slate-600 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                  title="Déconnexion"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
      </div>

            <motion.main
              className="relative min-h-screen w-full overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {/* MeshGradient Background */}
              <div className="fixed inset-0 z-0">
                <MeshGradient
                  style={{ height: "100vh", width: "100vw" }}
                  distortion={0.8}
                  swirl={0.1}
                  offsetX={0}
                  offsetY={0}
                  scale={1}
                  rotation={0}
                  speed={1}
                  colors={["hsl(216, 90%, 27%)", "hsl(243, 68%, 36%)", "hsl(205, 91%, 64%)", "hsl(211, 61%, 57%)"]}
                />
              </div>

        {/* Content Layer */}
        <div className="relative z-10 min-h-screen overflow-hidden">
        {/* Calendar Content */}
        <div className="h-screen pt-24 pb-8">
          <div className="relative backdrop-blur-xl bg-white/30 border border-slate-200/60 rounded-3xl mx-4 shadow-2xl h-full overflow-hidden flex flex-col">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-slate-50/80 to-transparent pointer-events-none" />
            <motion.div
              className="relative z-10 flex-1 overflow-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <FullScreenCalendar />
            </motion.div>
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-transparent via-white/10 to-white/20 pointer-events-none" />
          </div>
        </div>
        </div>
      </motion.main>
    </>
  )
}

