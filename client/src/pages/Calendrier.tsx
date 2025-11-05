import { useEffect, useRef } from 'react'
import { useLocation } from 'wouter'
import { useAuth } from '@/contexts/AuthContext'
import { LogOut } from 'lucide-react'
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
import { FullScreenCalendar } from './CalendrierContent'

export default function Calendrier() {
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

        {/* Calendar Content */}
        <div className="pt-24 pb-8">
          <div className="relative backdrop-blur-xl bg-white/30 border border-slate-200/60 rounded-3xl mx-4 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-slate-50/80 to-transparent pointer-events-none" />
            <div className="relative z-10 min-h-[calc(100vh-8rem)]">
              <FullScreenCalendar />
            </div>
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-transparent via-white/10 to-white/20 pointer-events-none" />
          </div>
        </div>
      </div>
    </main>
  )
}

