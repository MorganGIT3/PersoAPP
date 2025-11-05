import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'wouter'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowLeft, Edit2, Trash2, Save, X } from 'lucide-react'
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

interface ContentNote {
  id: string
  title: string
  content: string
  platform: 'youtube' | 'tiktok'
  createdAt: string
  updatedAt: string
}

export default function ContentNotes() {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<Scene>()
  const rendererRef = useRef<WebGLRenderer>()
  const animationIdRef = useRef<number>()

  const { isConnected } = useAuth()
  const [, setLocation] = useLocation()
  const [notes, setNotes] = useState<ContentNote[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')

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

  useEffect(() => {
    if (!isConnected) {
      setLocation('/')
    }
  }, [isConnected, setLocation])

  useEffect(() => {
    const saved = localStorage.getItem('persom_content_notes')
    if (saved) {
      setNotes(JSON.parse(saved))
    }
  }, [])

  const handleEdit = (note: ContentNote) => {
    setEditingId(note.id)
    setEditTitle(note.title)
    setEditContent(note.content)
  }

  const handleSave = () => {
    if (!editingId || !editTitle.trim() || !editContent.trim()) return

    const updated = notes.map(note =>
      note.id === editingId
        ? {
            ...note,
            title: editTitle,
            content: editContent,
            updatedAt: new Date().toISOString()
          }
        : note
    )

    setNotes(updated)
    localStorage.setItem('persom_content_notes', JSON.stringify(updated))
    setEditingId(null)
    setEditTitle('')
    setEditContent('')
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditTitle('')
    setEditContent('')
  }

  const handleDelete = (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) return

    const updated = notes.filter(note => note.id !== id)
    setNotes(updated)
    localStorage.setItem('persom_content_notes', JSON.stringify(updated))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-full px-6 py-3 shadow-lg">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setLocation('/contenu')}
                className="p-2 rounded-full transition-colors text-slate-600 hover:text-slate-800 hover:bg-slate-100"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <span className="text-slate-800 font-medium">Content Notes</span>
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
                  <h2 className="text-3xl font-light text-slate-800 mb-2">Content Notes</h2>
                  <p className="text-slate-500 text-sm">Modifiez et gérez vos scripts sauvegardés</p>
                </div>

                {/* Notes List */}
                <div className="space-y-4">
                  {notes.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-slate-500">Aucune note de contenu pour le moment</p>
                    </div>
                  ) : (
                    notes.map((note) => (
                      <div
                        key={note.id}
                        className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60"
                      >
                        {editingId === note.id ? (
                          <div className="space-y-4">
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="w-full px-4 py-2 bg-white rounded-lg border border-slate-300 text-slate-800"
                              placeholder="Titre"
                            />
                            <textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              rows={8}
                              className="w-full px-4 py-2 bg-white rounded-lg border border-slate-300 text-slate-800 resize-none"
                              placeholder="Contenu"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={handleSave}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
                              >
                                <Save className="w-4 h-4" />
                                Sauvegarder
                              </button>
                              <button
                                onClick={handleCancel}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                              >
                                <X className="w-4 h-4" />
                                Annuler
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="text-lg font-medium text-slate-800">{note.title}</h3>
                                  <span
                                    className={`text-xs px-2 py-1 rounded-full ${
                                      note.platform === 'youtube'
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-cyan-100 text-cyan-700'
                                    }`}
                                  >
                                    {note.platform.toUpperCase()}
                                  </span>
                                </div>
                                <p className="text-slate-600 text-sm mb-4 whitespace-pre-wrap">
                                  {note.content}
                                </p>
                                <p className="text-xs text-slate-400">
                                  Créé le {formatDate(note.createdAt)}
                                  {note.updatedAt !== note.createdAt && (
                                    <> • Modifié le {formatDate(note.updatedAt)}</>
                                  )}
                                </p>
                              </div>
                              <div className="flex gap-2 ml-4">
                                <button
                                  onClick={() => handleEdit(note)}
                                  className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(note.id)}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  )}
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

