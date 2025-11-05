import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'wouter'
import { useAuth } from '@/contexts/AuthContext'
import { LogOut, ArrowLeft, Lightbulb, FolderOpen } from 'lucide-react'
import { motion } from 'framer-motion'
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

const TikTokIcon = () => (
  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
)

const IdeeIcon = () => (
  <Lightbulb className="w-full h-full text-slate-700" />
)

const ContenusIcon = () => (
  <FolderOpen className="w-full h-full text-slate-700" />
)

export default function TikTokHub() {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<Scene>()
  const rendererRef = useRef<WebGLRenderer>()
  const animationIdRef = useRef<number>()

  const { isConnected, logout } = useAuth()
  const [, setLocation] = useLocation()

  // Three.js background with TikTok cyan/pink theme
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
    ]

    const meshes: Mesh[] = []

    curves.forEach((curve, index) => {
      const geometry = new TubeGeometry(curve, 20, 0.05, 8, false)
      const material = new ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          color: { value: new Color(0x00f2ea) }, // TikTok cyan
        },
        vertexShader: `
          uniform float time;
          varying vec2 vUv;
          void main() {
            vUv = uv;
            vec3 pos = position;
            pos.y += sin(time + pos.x * 0.1) * 0.1;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 color;
          uniform float time;
          varying vec2 vUv;
          void main() {
            float alpha = 0.3 + sin(time * 2.0 + vUv.x * 10.0) * 0.1;
            gl_FragColor = vec4(color, alpha);
          }
        `,
        transparent: true,
        blending: AdditiveBlending,
        side: DoubleSide,
      })

      const mesh = new Mesh(geometry, material)
      mesh.position.z = index * 0.5
      scene.add(mesh)
      meshes.push(mesh)
    })

    camera.position.z = 5

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate)
      const time = Date.now() * 0.001

      meshes.forEach((mesh, index) => {
        if (mesh.material instanceof ShaderMaterial) {
          mesh.material.uniforms.time.value = time + index * 0.5
        }
        mesh.rotation.z += 0.001
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

  // Masquer la scrollbar pendant l'animation
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const timer = setTimeout(() => {
      document.body.style.overflow = ''
    }, 500)
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
            <button
              onClick={() => setLocation('/contenu')}
              className="p-2 rounded-full transition-colors text-slate-600 hover:text-slate-800 hover:bg-slate-100"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="text-slate-800 font-medium">TikTok</span>
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

      <motion.main
        className="relative min-h-screen w-full overflow-hidden bg-slate-50"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {/* Three.js Background */}
        <div ref={mountRef} className="fixed inset-0 w-full h-screen" style={{ zIndex: 0 }} />

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
                    <h2 className="text-3xl font-light text-slate-800 mb-2">TikTok</h2>
                    <p className="text-slate-500 text-sm">Gérez vos contenus et idées pour TikTok</p>
                  </motion.div>

                  {/* BentoGrid avec les deux options */}
                  <motion.div
                    className="flex items-center justify-center gap-6"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    <BentoCard
                      name="Créer des idées"
                      className="col-span-1 w-[340px] h-[260px]"
                      background={
                        <div className="w-full h-full bg-gradient-to-br from-yellow-400/20 via-yellow-500/20 to-yellow-600/20" />
                      }
                      Icon={() => <IdeeIcon />}
                      description="Générez des scripts et idées de contenu avec l'IA"
                      href="/contenu/tiktok/idees"
                      cta="Ouvrir"
                    />
                    <BentoCard
                      name="Mes contenus"
                      className="col-span-1 w-[340px] h-[260px]"
                      background={
                        <div className="w-full h-full bg-gradient-to-br from-pink-400/20 via-pink-500/20 to-pink-600/20" />
                      }
                      Icon={() => <ContenusIcon />}
                      description="Organisez et gérez vos contenus TikTok"
                      href="/contenu/tiktok/contenus"
                      cta="Ouvrir"
                    />
                  </motion.div>
                </div>

                <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-transparent via-white/10 to-white/20 pointer-events-none" />
              </div>

              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-200/20 to-pink-300/20 blur-xl scale-110 -z-10" />
            </div>
          </div>
        </div>
      </motion.main>
    </>
  )
}

