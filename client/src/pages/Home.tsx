import React from "react"
import type { ReactElement } from "react"
import { useState, useEffect, useRef } from "react"
import { useLocation } from "wouter"
import { useAuth } from "@/contexts/AuthContext"
import { LogOut } from "lucide-react"
import { MeshGradient } from "@paper-design/shaders-react"
import DashboardContent from "./DashboardContent"

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        ref={ref}
        {...props}
      />
    )
  },
)

Input.displayName = "Input"

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <button
        className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-primary-foreground h-10 px-4 py-2 ${className}`}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
  },
)

Button.displayName = "Button"

export default function Home(): ReactElement {
  const cardRef = useRef<HTMLDivElement>(null)

  const { isConnected, login, logout } = useAuth()
  const [, setLocation] = useLocation()
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [currentFeature, setCurrentFeature] = useState<"dashboard" | "contenu" | null>(null)
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })


  // Animation when connecting
  useEffect(() => {
    if (isConnected && cardRef.current) {
      setCurrentFeature("dashboard")
    }
  }, [isConnected])

  // Countdown timer to November 27
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const currentYear = now.getFullYear()
      let targetDate = new Date(currentYear, 10, 27)

      if (targetDate < now) {
        targetDate = new Date(currentYear + 1, 10, 27)
      }

      const difference = targetDate.getTime() - now.getTime()

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)

        return { days, hours, minutes, seconds }
      }

      return { days: 0, hours: 0, minutes: 0, seconds: 0 }
    }

    setTimeLeft(calculateTimeLeft())
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      const success = login(email.toLowerCase())
      if (success) {
        setIsSubmitted(true)
        setEmail("")
      } else {
        alert("Code incorrect. Veuillez entrer le bon code.")
        setEmail("")
      }
    }
  }

  const handleFeatureClick = (feature: string) => {
    if (feature === "Dashboard") {
      setCurrentFeature("dashboard")
    } else if (feature === "Contenu") {
      setLocation("/contenu")
    } else if (feature === "Calendrier") {
      setLocation("/calendrier")
    } else if (feature === "Content Note") {
      setLocation("/contenu/notes")
    }
  }

  const features = isConnected 
    ? ["Dashboard", "Contenu", "Calendrier", "Content Note"] 
    : ["Connection", "Features", "Pricing", "Beta", "Launch", "Updates", "Community"]

  return (
    <main className="relative min-h-screen w-full overflow-hidden">
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

      {/* Top Navigation - Fixed position */}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-full px-6 py-3 shadow-lg">
            <div className="flex items-center gap-6">
              <span className="text-slate-800 font-medium">PersoM</span>
              <div className="flex items-center gap-4">
                {features.map((feature, index) => {
                  const isConnection = feature === "Connection"
                  const isActive = (feature === "Dashboard" && currentFeature === "dashboard") || 
                                   (feature === "Contenu" && currentFeature === "contenu")
                  
                  return (
                    <button
                      key={feature}
                      className={`text-sm px-3 py-1 rounded-full transition-colors ${
                        isConnection
                          ? "bg-slate-800 text-white border border-slate-300"
                          : isActive
                          ? "bg-slate-800 text-white border border-slate-300"
                          : "text-slate-600 hover:text-slate-800 cursor-pointer"
                      }`}
                      onClick={() => handleFeatureClick(feature)}
                    >
                      {feature}
                    </button>
                  )
                })}
                {isConnected && (
                  <button
                    onClick={() => {
                      logout()
                      setCurrentFeature(null)
                      setLocation('/')
                    }}
                    className="p-2 rounded-full transition-colors text-slate-600 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                    title="Déconnexion"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

      {/* Content Layer */}
      <div className="relative z-10 min-h-screen">

        {/* Waitlist/Dashboard Card */}
        <div className="flex items-center justify-center min-h-screen px-4">
          <div
            ref={cardRef}
            className={`relative transition-all duration-700 ease-out ${
              isConnected 
                ? "w-[95vw] max-w-[1400px] h-[85vh]" 
                : "w-[420px]"
            }`}
          >
            <div className="relative backdrop-blur-xl bg-white/40 border border-slate-200/60 rounded-3xl p-8 shadow-2xl h-full overflow-hidden">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-slate-50/60 to-transparent pointer-events-none" />

              <div className="relative z-10 h-full">
                {!isConnected ? (
                  <>
                    <div className="mb-8 text-center">
                      <h1 className="text-4xl font-light text-slate-800 mb-4 tracking-wide">Bienvenue Morgan</h1>
                      <p className="text-slate-600 text-base leading-relaxed">
                        Bienvenue Morgan dans ton application personnnel
                        <br />
                        connecte toi boss
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="mb-6">
                      <div className="flex gap-3">
                        <Input
                          type="text"
                          placeholder="Code perso"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="flex-1 bg-white/60 border-slate-300 text-slate-800 placeholder:text-slate-500 focus:border-slate-400 focus:ring-slate-300 h-12 rounded-xl backdrop-blur-sm"
                        />
                        <Button
                          type="submit"
                          className="h-12 px-6 bg-slate-500 hover:bg-slate-700 text-white font-medium cursor-pointer rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl shadow-blue-500/25"
                        >
                          Se connecter
                        </Button>
                      </div>
                    </form>

                    <div className="flex items-center justify-center gap-3 mb-6">
                      <div className="flex -space-x-2">
                        <div className="w-8 h-8 rounded-full bg-blue-700 border-2 border-white flex items-center justify-center text-white text-xs font-medium">
                          M
                        </div>
                        <div className="w-8 h-8 rounded-full bg-emerald-700 border-2 border-white flex items-center justify-center text-white text-xs font-medium">
                          B
                    </div>
                        <div className="w-8 h-8 rounded-full bg-purple-700 border-2 border-white flex items-center justify-center text-white text-xs font-medium">
                          S
                        </div>
                      </div>
                      <span className="text-slate-600 text-sm">~ 20+ Teams already joined</span>
                    </div>

                    <div className="flex items-center justify-center gap-6 text-center">
                      <div>
                        <div className="text-2xl font-light text-slate-800">{timeLeft.days}</div>
                        <div className="text-xs text-slate-500 uppercase tracking-wide">days</div>
                      </div>
                      <div className="text-slate-400">|</div>
                      <div>
                        <div className="text-2xl font-light text-slate-800">{timeLeft.hours}</div>
                        <div className="text-xs text-slate-500 uppercase tracking-wide">hours</div>
                      </div>
                      <div className="text-slate-400">|</div>
                      <div>
                        <div className="text-2xl font-light text-slate-800">{timeLeft.minutes}</div>
                        <div className="text-xs text-slate-500 uppercase tracking-wide">minutes</div>
                      </div>
                      <div className="text-slate-400">|</div>
                      <div>
                        <div className="text-2xl font-light text-slate-800">{timeLeft.seconds}</div>
                        <div className="text-xs text-slate-500 uppercase tracking-wide">seconds</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-full overflow-auto">
                    {currentFeature === "dashboard" && <DashboardContent />}
                  </div>
                )}
              </div>

              <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-transparent via-white/10 to-white/20 pointer-events-none" />
            </div>

            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-200/20 to-purple-200/20 blur-xl scale-110 -z-10" />
              </div>
        </div>
      </div>
    </main>
  )
}