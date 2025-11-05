import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'wouter'
import { useAuth } from '@/contexts/AuthContext'
import { LogOut, ArrowLeft, Plus, X, Edit2, Trash2, Image as ImageIcon, Link2, FileText } from 'lucide-react'
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

interface YoutubeContent {
  id: string
  title: string
  thumbnail: string
  script: string
  miroLink: string
  createdAt: string
  updatedAt: string
}

export default function YoutubeContenus() {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<Scene>()
  const rendererRef = useRef<WebGLRenderer>()
  const animationIdRef = useRef<number>()

  const { isConnected, logout } = useAuth()
  const [, setLocation] = useLocation()

  const [contents, setContents] = useState<YoutubeContent[]>(() => {
    const saved = localStorage.getItem('persom_youtube_contents')
    return saved ? JSON.parse(saved) : []
  })

  const [showModal, setShowModal] = useState(false)
  const [editingContent, setEditingContent] = useState<YoutubeContent | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    thumbnail: '',
    script: '',
    miroLink: ''
  })

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
    ]

    curves.forEach((curve, index) => {
      const geometry = new TubeGeometry(curve, 20, 0.05, 8, false)
      const material = new ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          color: { value: new Color(0xff0000) },
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
      scene.add(mesh)
    })

    camera.position.z = 5

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate)
      const time = Date.now() * 0.001

      scene.traverse((object) => {
        if (object instanceof Mesh && object.material instanceof ShaderMaterial) {
          object.material.uniforms.time.value = time
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
    localStorage.setItem('persom_youtube_contents', JSON.stringify(contents))
  }, [contents])

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

  const handleOpenModal = (content?: YoutubeContent) => {
    if (content) {
      setEditingContent(content)
      setFormData({
        title: content.title,
        thumbnail: content.thumbnail,
        script: content.script,
        miroLink: content.miroLink
      })
    } else {
      setEditingContent(null)
      setFormData({
        title: '',
        thumbnail: '',
        script: '',
        miroLink: ''
      })
    }
    setShowModal(true)
  }

  const handleSave = () => {
    if (!formData.title.trim()) {
      alert('Veuillez remplir au moins le titre')
      return
    }

    if (editingContent) {
      setContents(contents.map(c => 
        c.id === editingContent.id 
          ? { ...c, ...formData, updatedAt: new Date().toISOString() }
          : c
      ))
    } else {
      const newContent: YoutubeContent = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setContents([...contents, newContent])
    }

    setShowModal(false)
    setFormData({ title: '', thumbnail: '', script: '', miroLink: '' })
    setEditingContent(null)
  }

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce contenu ?')) {
      setContents(contents.filter(c => c.id !== id))
    }
  }

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
              onClick={() => setLocation('/contenu/youtube')}
              className="p-2 rounded-full transition-colors text-slate-600 hover:text-slate-800 hover:bg-slate-100"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="text-slate-800 font-medium">Mes contenus YouTube</span>
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
          <div className="flex items-center justify-center h-screen px-4 pt-24 pb-8">
            <div className="relative w-[95vw] max-w-[1400px] h-full">
              <div className="relative backdrop-blur-xl bg-white/30 border border-slate-200/60 rounded-3xl p-8 shadow-2xl h-full overflow-hidden flex flex-col">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-slate-50/80 to-transparent pointer-events-none" />

                <div className="relative z-10 flex-1 overflow-auto">
                  {/* Header */}
                  <motion.div
                    className="flex items-center justify-between mb-6 pb-6 border-b border-slate-200/60"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  >
                    <div>
                      <h2 className="text-3xl font-light text-slate-800 mb-2">Mes contenus YouTube</h2>
                      <p className="text-slate-500 text-sm">Organisez et gérez vos contenus YouTube</p>
                    </div>
                    <button
                      onClick={() => handleOpenModal()}
                      className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Ajouter un contenu
                    </button>
                  </motion.div>

                  {/* Contents Grid */}
                  <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    {contents.length === 0 ? (
                      <div className="col-span-full text-center py-12">
                        <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-500">Aucun contenu pour le moment</p>
                        <p className="text-slate-400 text-sm mt-2">Cliquez sur "Ajouter un contenu" pour commencer</p>
                      </div>
                    ) : (
                      contents.map((content) => (
                        <div
                          key={content.id}
                          className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 hover:shadow-lg transition-shadow"
                        >
                          {content.thumbnail && (
                            <div className="mb-4 rounded-lg overflow-hidden">
                              <img
                                src={content.thumbnail}
                                alt={content.title}
                                className="w-full h-32 object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="225"%3E%3Crect fill="%23ddd" width="400" height="225"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="18" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EImage%3C/text%3E%3C/svg%3E'
                                }}
                              />
                            </div>
                          )}
                          <h3 className="font-medium text-slate-800 mb-2 line-clamp-2">{content.title}</h3>
                          {content.script && (
                            <p className="text-sm text-slate-600 mb-3 line-clamp-3">{content.script}</p>
                          )}
                          {content.miroLink && (
                            <a
                              href={content.miroLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 mb-3"
                            >
                              <Link2 className="w-3 h-3" />
                              Lien Miro
                            </a>
                          )}
                          <div className="flex items-center gap-2 mt-4">
                            <button
                              onClick={() => handleOpenModal(content)}
                              className="flex-1 px-3 py-2 text-sm bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors flex items-center justify-center gap-2"
                            >
                              <Edit2 className="w-3 h-3" />
                              Modifier
                            </button>
                            <button
                              onClick={() => handleDelete(content.id)}
                              className="px-3 py-2 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </motion.div>
                </div>

                <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-transparent via-white/10 to-white/20 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </motion.main>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-slate-800">
                {editingContent ? 'Modifier le contenu' : 'Nouveau contenu YouTube'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false)
                  setFormData({ title: '', thumbnail: '', script: '', miroLink: '' })
                  setEditingContent(null)
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Titre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
                  placeholder="Titre de la vidéo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Miniature (URL)
                </label>
                <input
                  type="url"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Script
                </label>
                <textarea
                  value={formData.script}
                  onChange={(e) => setFormData({ ...formData, script: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
                  rows={6}
                  placeholder="Votre script ici..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Lien Miro
                </label>
                <input
                  type="url"
                  value={formData.miroLink}
                  onChange={(e) => setFormData({ ...formData, miroLink: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
                  placeholder="https://miro.com/..."
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => {
                    setShowModal(false)
                    setFormData({ title: '', thumbnail: '', script: '', miroLink: '' })
                    setEditingContent(null)
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
                  disabled={!formData.title.trim()}
                >
                  {editingContent ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
}

