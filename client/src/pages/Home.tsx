import React from "react"
import type { ReactElement } from "react"
import { useState, useEffect, useRef } from "react"
import { useLocation } from "wouter"
import { useAuth } from "@/contexts/AuthContext"
import { LogOut } from "lucide-react"
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  QuadraticBezierCurve3,
  Vector3,
  TubeGeometry,
  ShaderMaterial,
  Mesh,
  AdditiveBlending,
  DoubleSide,
  Color,
} from "three"
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
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<Scene>()
  const rendererRef = useRef<WebGLRenderer>()
  const animationIdRef = useRef<number>()
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

  // Three.js background effect
  useEffect(() => {
    if (!mountRef.current) return

    const scene = new Scene()
    sceneRef.current = scene

    const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
    })
    rendererRef.current = renderer

    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0xf8fafc, 0)
    mountRef.current.appendChild(renderer.domElement)

    const curves = [
      new QuadraticBezierCurve3(
        new Vector3(-15, -3, 0),
        new Vector3(0, 1, 0),
        new Vector3(12, -2, 0)
      ),
      new QuadraticBezierCurve3(
        new Vector3(-14, -2, 0),
        new Vector3(1, 2, 0),
        new Vector3(10, -1, 0)
      ),
      new QuadraticBezierCurve3(
        new Vector3(-16, -4, 0),
        new Vector3(-1, 0.5, 0),
        new Vector3(11, -3, 0)
      )
    ]

    const colors = [
      new Color(0x88C1FF),
      new Color(0xA0D2FF),
      new Color(0x78B6FF),
    ]

    curves.forEach((curve, index) => {
      const geometry = new TubeGeometry(curve, 64, 0.05, 8, false)
      
      const material = new ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          color: { value: colors[index] },
        },
        vertexShader: `
          varying vec3 vPosition;
          varying vec3 vNormal;
          void main() {
            vPosition = position;
            vNormal = normal;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float time;
          uniform vec3 color;
          varying vec3 vPosition;
          varying vec3 vNormal;
          void main() {
            float intensity = pow(dot(vNormal, vec3(0.0, 0.0, 1.0)), 1.5);
            float glow = sin(vPosition.y * 2.0 + time * 2.0) * 0.5 + 0.5;
            vec3 finalColor = color * intensity * (0.6 + glow * 0.4);
            gl_FragColor = vec4(finalColor, intensity * 0.4);
          }
        `,
        transparent: true,
        blending: AdditiveBlending,
        side: DoubleSide,
      })

      const mesh = new Mesh(geometry, material)
      scene.add(mesh)
    })

    camera.position.z = 7
    camera.position.y = -0.8
    camera.position.x = -1

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate)

      const time = Date.now() * 0.001
      
      scene.traverse((object) => {
        if (object instanceof Mesh && object.material instanceof ShaderMaterial) {
          if (object.material.uniforms.time) {
            object.material.uniforms.time.value = time
          }
        }
      })

      scene.children.forEach((child, index) => {
        if (child instanceof Mesh && index < curves.length) {
          child.rotation.z = Math.sin(time * 0.1 + index * 0.5) * 0.05
        }
      })

      renderer.render(scene, camera)
    }

    animate()

    const handleResize = () => {
      if (!camera || !renderer) return
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
      scene.traverse((object) => {
        if (object instanceof Mesh) {
          object.geometry.dispose()
          if (object.material instanceof ShaderMaterial) {
            object.material.dispose()
          }
        }
      })
    }
  }, [])

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
    }
  }

  const features = isConnected 
    ? ["Dashboard", "Contenu", "Calendrier"] 
    : ["Connection", "Features", "Pricing", "Beta", "Launch", "Updates", "Community"]

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-50">
      {/* Three.js Background */}
      <div ref={mountRef} className="fixed inset-0 w-full h-screen" style={{ zIndex: 0 }} />

      {/* Content Layer */}
      <div className="relative z-10 min-h-screen">
        {/* Top Navigation */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20">
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
            <div className="relative backdrop-blur-xl bg-white/30 border border-slate-200/60 rounded-3xl p-8 shadow-2xl h-full overflow-hidden">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-slate-50/80 to-transparent pointer-events-none" />

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