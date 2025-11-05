import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'wouter'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowLeft, Send, Bot, Save } from 'lucide-react'
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

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function TikTokContent() {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<Scene>()
  const rendererRef = useRef<WebGLRenderer>()
  const animationIdRef = useRef<number>()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { isConnected } = useAuth()
  const [, setLocation] = useLocation()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')

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
      new QuadraticBezierCurve3(
        new Vector3(-16, -4, 0),
        new Vector3(-1, 0.5, 0),
        new Vector3(11, -3, 0)
      )
    ]

    const colors = [
      new Color(0x00F2EA), // TikTok cyan
      new Color(0xFF0050), // TikTok pink
      new Color(0x00D4FF),
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

  useEffect(() => {
    if (!isConnected) {
      setLocation('/')
    }
  }, [isConnected, setLocation])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')

    // Simulate assistant response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Voici une idée de script TikTok basée sur votre demande : "${input}".\n\n**Hook (0-3s)** : Commencez par quelque chose de choquant ou intriguant pour retenir l'attention.\n\n**Valeur (3-15s)** : Donnez une astuce, un fait intéressant ou une valeur ajoutée rapide.\n\n**Call to Action (15-20s)** : Demandez un like, partage ou suivi.`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
    }, 1000)
  }

  const handleSaveToNotes = (content: string) => {
    const saved = localStorage.getItem('persom_content_notes')
    const notes = saved ? JSON.parse(saved) : []
    
    const newNote = {
      id: Date.now().toString(),
      title: `Script TikTok - ${new Date().toLocaleDateString('fr-FR')}`,
      content,
      platform: 'tiktok',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    notes.push(newNote)
    localStorage.setItem('persom_content_notes', JSON.stringify(notes))
    alert('Script sauvegardé dans Content Notes !')
  }

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
              <button
                onClick={() => setLocation('/contenu')}
                className="p-2 rounded-full transition-colors text-slate-600 hover:text-slate-800 hover:bg-slate-100"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <span className="text-slate-800 font-medium">TikTok Content</span>
              <button
                onClick={() => setLocation('/contenu/notes')}
                className="text-sm px-3 py-1 rounded-full transition-colors text-slate-600 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
              >
                Content Notes
              </button>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="flex items-center justify-center min-h-screen px-4 pt-24 pb-32">
          <div className="relative w-full max-w-4xl h-[80vh]">
            <div className="relative backdrop-blur-xl bg-white/30 border border-slate-200/60 rounded-3xl p-8 shadow-2xl h-full overflow-hidden flex flex-col">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-slate-50/80 to-transparent pointer-events-none" />

              <div className="relative z-10 flex-1 overflow-y-auto mb-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <Bot className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500">Commencez à discuter pour générer des scripts TikTok</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl p-4 ${
                          message.role === 'user'
                            ? 'bg-slate-800 text-white'
                            : 'bg-white/80 text-slate-800'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        {message.role === 'assistant' && (
                          <button
                            onClick={() => handleSaveToNotes(message.content)}
                            className="mt-2 flex items-center gap-2 text-xs text-slate-600 hover:text-slate-800 transition-colors"
                          >
                            <Save className="w-3 h-3" />
                            Enregistrer en content note
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="relative z-10 flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Demandez un script TikTok..."
                  className="flex-1 px-4 py-3 bg-white/80 rounded-xl border border-slate-300 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
                <button
                  onClick={handleSend}
                  className="px-6 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Envoyer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

