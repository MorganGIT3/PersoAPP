import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'wouter'
import { useAuth } from '@/contexts/AuthContext'
import { LogOut, ArrowLeft } from 'lucide-react'
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
} from 'three'
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
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<Scene>()
  const rendererRef = useRef<WebGLRenderer>()
  const animationIdRef = useRef<number>()

  const { isConnected, logout } = useAuth()
  const [, setLocation] = useLocation()

  // Three.js background
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

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
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
                  onClick={() => {
                    localStorage.setItem('persom_navigate_to', 'calendrier')
                    setLocation('/')
                  }}
                  className="text-sm px-3 py-1 rounded-full transition-colors text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Calendrier
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

        {/* Content Card */}
        <div className="flex items-center justify-center min-h-screen px-4 pt-24">
          <div className="relative w-[95vw] max-w-[1400px] h-[85vh]">
            <div className="relative backdrop-blur-xl bg-white/30 border border-slate-200/60 rounded-3xl p-8 shadow-2xl h-full overflow-hidden">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-slate-50/80 to-transparent pointer-events-none" />

              <div className="relative z-10 h-full overflow-auto">
                {/* Header */}
                <div className="border-b border-slate-200/60 pb-6 mb-6">
                  <h2 className="text-3xl font-light text-slate-800 mb-2">Contenu</h2>
                  <p className="text-slate-500 text-sm">Gérez vos contenus pour chaque plateforme</p>
                </div>

                {/* BentoGrid avec les cartes Youtube et TikTok */}
                <div className="flex items-center justify-center gap-6">
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
                </div>
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
