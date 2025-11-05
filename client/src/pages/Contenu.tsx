import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'wouter'
import { useAuth } from '@/contexts/AuthContext'
import { LogOut, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { MeshGradient } from "@paper-design/shaders-react"
import { BentoCard } from '@/components/BentoCard'

const YoutubeIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
)

const TikTokIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
)

export default function Contenu() {
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
                  className="text-sm px-3 py-1 rounded-full transition-colors bg-slate-800 text-white border border-slate-300"
                >
                  Contenu
                </button>
                <button
                  onClick={() => setLocation('/calendrier')}
                  className="text-sm px-3 py-1 rounded-full transition-colors text-slate-600 hover:text-slate-800 cursor-pointer"
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
        {/* Content Card */}
        <div className="flex items-center justify-center h-screen px-4 pt-24 pb-8">
          <div className="relative w-[95vw] max-w-[1400px] h-full">
            <div className="relative backdrop-blur-xl bg-white/30 border border-slate-200/60 rounded-3xl p-8 shadow-2xl h-full overflow-hidden flex flex-col">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-slate-50/80 to-transparent pointer-events-none" />

              <div className="relative z-10 flex-1 overflow-auto">
                {/* Header */}
                <motion.div
                  className="border-b border-slate-200/60 pb-6 mb-6"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <h2 className="text-3xl font-light text-slate-800 mb-2">Contenu</h2>
                  <p className="text-slate-500 text-sm">Gérez vos contenus pour chaque plateforme</p>
                </motion.div>

                {/* BentoGrid avec les cartes Youtube et TikTok */}
                <motion.div
                  className="flex items-center justify-center gap-6"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <BentoCard
                    name="Youtube"
                    className="col-span-1 w-[340px] h-[260px]"
                    background={
                      <div className="w-full h-full bg-gradient-to-br from-red-500/20 via-red-600/20 to-red-700/20" />
                    }
                    Icon={() => <YoutubeIcon />}
                    description="Générez des scripts et idées de contenu pour YouTube"
                    href="/contenu/youtube"
                    cta="Ouvrir"
                  />
                  <BentoCard
                    name="TikTok"
                    className="col-span-1 w-[340px] h-[260px]"
                    background={
                      <div className="w-full h-full bg-gradient-to-br from-cyan-500/20 via-pink-500/20 to-purple-600/20" />
                    }
                    Icon={() => <TikTokIcon />}
                    description="Créez des scripts et concepts pour TikTok"
                    href="/contenu/tiktok"
                    cta="Ouvrir"
                  />
                </motion.div>
              </div>

              <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-transparent via-white/10 to-white/20 pointer-events-none" />
            </div>

            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-200/20 to-purple-200/20 blur-xl scale-110 -z-10" />
          </div>
        </div>
        </div>
      </motion.main>
    </>
  )
} 
