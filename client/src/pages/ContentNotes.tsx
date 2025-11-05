import { useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import { useAuth } from '@/contexts/AuthContext'
import { LogOut, Edit2, Trash2, Save, X, Plus, Search, Folder, Trash2 as TrashIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { MeshGradient } from "@paper-design/shaders-react"

interface ContentNote {
  id: string
  title: string
  content: string
  platform: 'youtube' | 'tiktok'
  createdAt: string
  updatedAt: string
  folderId?: string
  deletedAt?: string
}

interface Folder {
  id: string
  name: string
  createdAt: string
}

export default function ContentNotes() {
  const { isConnected, logout } = useAuth()
  const [, setLocation] = useLocation()
  const [notes, setNotes] = useState<ContentNote[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [selectedNote, setSelectedNote] = useState<ContentNote | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeView, setActiveView] = useState<'all' | 'notes' | 'trash' | string>('all')
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)

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

  useEffect(() => {
    if (!isConnected) {
      setLocation('/')
    }
  }, [isConnected, setLocation])

  useEffect(() => {
    const savedNotes = localStorage.getItem('persom_content_notes')
    const savedFolders = localStorage.getItem('persom_content_folders')
    
    if (savedNotes) {
      const parsedNotes = JSON.parse(savedNotes)
      setNotes(parsedNotes)
      const activeNotes = parsedNotes.filter((n: ContentNote) => !n.deletedAt)
      if (activeNotes.length > 0 && !selectedNote) {
        setSelectedNote(activeNotes[0])
      }
    }
    
    if (savedFolders) {
      const parsedFolders = JSON.parse(savedFolders)
      setFolders(parsedFolders)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-save when notes or folders change
  useEffect(() => {
    if (notes.length > 0 || folders.length > 0) {
      localStorage.setItem('persom_content_notes', JSON.stringify(notes))
      localStorage.setItem('persom_content_folders', JSON.stringify(folders))
    }
  }, [notes, folders])

  const getFilteredNotes = () => {
    let filtered = notes

    // Filter by view
    if (activeView === 'trash') {
      filtered = filtered.filter(note => note.deletedAt)
    } else if (activeView === 'notes') {
      filtered = filtered.filter(note => !note.deletedAt && !note.folderId)
    } else if (activeView === 'all') {
      filtered = filtered.filter(note => !note.deletedAt)
    } else if (selectedFolderId) {
      filtered = filtered.filter(note => !note.deletedAt && note.folderId === selectedFolderId)
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered
  }

  const filteredNotes = getFilteredNotes()

  const handleEdit = (note: ContentNote) => {
    setEditingId(note.id)
    setEditTitle(note.title)
    setEditContent(note.content)
    setSelectedNote(note)
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
    setEditingId(null)
    setEditTitle('')
    setEditContent('')
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditTitle('')
    setEditContent('')
  }

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) return

    const updated = notes.map(note =>
      note.id === id
        ? { ...note, deletedAt: new Date().toISOString() }
        : note
    )
    setNotes(updated)
    
    if (selectedNote?.id === id) {
      const activeNotes = updated.filter(n => !n.deletedAt)
      setSelectedNote(activeNotes.length > 0 ? activeNotes[0] : null)
    }
  }

  const handleRestoreNote = (id: string) => {
    const updated = notes.map(note =>
      note.id === id
        ? { ...note, deletedAt: undefined }
        : note
    )
    setNotes(updated)
    const restoredNote = updated.find(n => n.id === id)
    if (restoredNote) {
      setSelectedNote(restoredNote)
      setActiveView('all')
    }
  }

  const handlePermanentDelete = (id: string) => {
    if (!confirm('Cette action est irréversible. Supprimer définitivement cette note ?')) return

    const updated = notes.filter(note => note.id !== id)
    setNotes(updated)
    
    if (selectedNote?.id === id) {
      const activeNotes = updated.filter(n => !n.deletedAt)
      setSelectedNote(activeNotes.length > 0 ? activeNotes[0] : null)
    }
  }

  const handleNewFolder = () => {
    const folderName = prompt('Nom du nouveau dossier :')
    if (!folderName || !folderName.trim()) return

    const newFolder: Folder = {
      id: Date.now().toString(),
      name: folderName.trim(),
      createdAt: new Date().toISOString()
    }
    setFolders([...folders, newFolder])
  }

  const handleDeleteFolder = (folderId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    
    const folderNotes = notes.filter(note => note.folderId === folderId && !note.deletedAt)
    if (folderNotes.length > 0) {
      if (!confirm(`Ce dossier contient ${folderNotes.length} note(s). Voulez-vous vraiment le supprimer ? Les notes seront déplacées vers "Notes".`)) return
      
      // Move notes to root (no folder)
      const updated = notes.map(note =>
        note.folderId === folderId ? { ...note, folderId: undefined } : note
      )
      setNotes(updated)
    }
    
    setFolders(folders.filter(f => f.id !== folderId))
    
    if (selectedFolderId === folderId) {
      setSelectedFolderId(null)
      setActiveView('all')
    }
  }

  const handleFolderClick = (folderId: string) => {
    setSelectedFolderId(folderId)
    setActiveView(folderId)
  }

  const handleNewNote = () => {
    const newNote: ContentNote = {
      id: Date.now().toString(),
      title: 'Nouvelle note',
      content: '',
      platform: 'youtube',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      folderId: selectedFolderId || undefined
    }
    setNotes([newNote, ...notes])
    setSelectedNote(newNote)
    setEditingId(newNote.id)
    setEditTitle(newNote.title)
    setEditContent(newNote.content)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Aujourd'hui"
    if (diffDays === 1) return "Hier"
    if (diffDays < 7) {
      const days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
      return days[date.getDay()]
    }
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
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
                onClick={() => setLocation('/calendrier')}
                className="text-sm px-3 py-1 rounded-full transition-colors text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Calendrier
              </button>
              <button
                className="text-sm px-3 py-1 rounded-full transition-colors bg-slate-800 text-white border border-slate-300"
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
          {/* Main Container with white borders like Dashboard */}
          <div className="flex items-center justify-center h-screen px-4 pt-24 pb-8">
            <div className="relative w-[95vw] max-w-[1400px] h-full">
              <div className="relative backdrop-blur-xl bg-white/40 border border-slate-200/60 rounded-3xl p-0 shadow-2xl h-full overflow-hidden flex flex-col">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-slate-50/40 to-transparent pointer-events-none" />
                
                {/* Apple Notes Style Layout */}
                <div className="relative z-10 flex h-full">
                  {/* Left Sidebar */}
                  <div className="w-64 bg-white/40 backdrop-blur-md border-r border-slate-200/60 flex flex-col">
                    <div className="p-4 border-b border-slate-200/60">
                      <h2 className="text-lg font-semibold text-slate-800 mb-4">Content Notes</h2>
                      <div className="space-y-2">
                        <button 
                          onClick={() => { setActiveView('all'); setSelectedFolderId(null); }}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                            activeView === 'all' && !selectedFolderId
                              ? 'bg-slate-100/40 backdrop-blur-sm text-slate-800'
                              : 'text-slate-600 hover:bg-slate-50/40 backdrop-blur-sm'
                          }`}
                        >
                          <Folder className="w-4 h-4" />
                          <span>Tout</span>
                        </button>
                        <button 
                          onClick={() => { setActiveView('notes'); setSelectedFolderId(null); }}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                            activeView === 'notes'
                              ? 'bg-slate-100/40 backdrop-blur-sm text-slate-800'
                              : 'text-slate-600 hover:bg-slate-50/40 backdrop-blur-sm'
                          }`}
                        >
                          <Folder className="w-4 h-4" />
                          <span>Notes</span>
                        </button>
                        <button 
                          onClick={() => { setActiveView('trash'); setSelectedFolderId(null); }}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                            activeView === 'trash'
                              ? 'bg-slate-100/40 backdrop-blur-sm text-slate-800'
                              : 'text-slate-600 hover:bg-slate-50/40 backdrop-blur-sm'
                          }`}
                        >
                          <TrashIcon className="w-4 h-4" />
                          <span>Suppressions récentes</span>
                        </button>
                      </div>
                      
                      {/* Folders List */}
                      {folders.length > 0 && (
                        <div className="mt-4 space-y-1">
                          {folders.map((folder) => (
                            <div key={folder.id} className="group flex items-center gap-2">
                              <button
                                onClick={() => handleFolderClick(folder.id)}
                                className={`flex-1 flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                                  selectedFolderId === folder.id
                                    ? 'bg-slate-100/40 backdrop-blur-sm text-slate-800'
                                    : 'text-slate-600 hover:bg-slate-50/40 backdrop-blur-sm'
                                }`}
                              >
                                <Folder className="w-4 h-4" />
                                <span className="flex-1 text-left">{folder.name}</span>
                              </button>
                              <button
                                onClick={(e) => handleDeleteFolder(folder.id, e)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-red-600 hover:bg-red-50 rounded transition-all"
                                title="Supprimer le dossier"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <button 
                        onClick={handleNewFolder}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-yellow-600 hover:bg-yellow-50/40 backdrop-blur-sm text-sm mt-4"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Nouveau dossier</span>
                      </button>
                    </div>
                  </div>

                  {/* Middle Panel - Notes List */}
                  <div className="w-80 bg-white/40 backdrop-blur-md border-r border-slate-200/60 flex flex-col">
                    {/* Search Bar */}
                    <div className="p-4 border-b border-slate-200/60">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Rechercher dans toutes les notes"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-slate-50/40 backdrop-blur-sm rounded-lg border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
                        />
                      </div>
                    </div>

                    {/* Notes List */}
                    <div className="flex-1 overflow-y-auto">
                      {filteredNotes.length === 0 ? (
                        <div className="p-4 text-center text-slate-500 text-sm">
                          {searchQuery ? 'Aucune note trouvée' : 'Aucune note'}
                        </div>
                      ) : (
                        filteredNotes.map((note) => {
                          const folder = note.folderId ? folders.find(f => f.id === note.folderId) : null
                          return (
                            <div
                              key={note.id}
                              onClick={() => {
                                setSelectedNote(note)
                                setEditingId(null)
                              }}
                              className={`group p-4 border-b border-slate-100/60 cursor-pointer transition-colors ${
                                selectedNote?.id === note.id ? 'bg-slate-50/40 backdrop-blur-sm' : 'hover:bg-slate-50/30 backdrop-blur-sm'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <div className="font-medium text-slate-800 flex-1">{note.title}</div>
                                <button
                                  onClick={(e) => handleDelete(note.id, e)}
                                  className="opacity-0 group-hover:opacity-100 p-1 text-red-600 hover:bg-red-50 rounded transition-all"
                                  title="Supprimer la note"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="text-xs text-slate-500 mb-2">{formatDate(note.createdAt)}</div>
                              <div className="text-sm text-slate-600 line-clamp-2 mb-2">
                                {note.content || 'Aucun contenu'}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-400">
                                <Folder className="w-3 h-3" />
                                <span>{folder ? folder.name : 'Notes'}</span>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>

                    {/* New Note Button */}
                    <div className="p-4 border-t border-slate-200/60">
                      <button
                        onClick={handleNewNote}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Nouvelle note
                      </button>
                    </div>
                  </div>

                  {/* Right Panel - Note Content */}
                  <div className="flex-1 bg-white/40 backdrop-blur-md flex flex-col">
                    {selectedNote ? (
                      <>
                        {/* Toolbar */}
                        <div className="p-4 border-b border-slate-200/60 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                              <span className="text-sm font-medium">Aa</span>
                            </button>
                            <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                              <span className="text-sm">✓</span>
                            </button>
                            <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                              <span className="text-sm">⊞</span>
                            </button>
                          </div>
                          <div className="flex items-center gap-3">
                            <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                              <span className="text-sm">↗</span>
                            </button>
                            <button
                              onClick={handleNewNote}
                              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <span className="text-sm">□</span>
                            </button>
                          </div>
                        </div>

                        {/* Note Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                    {activeView === 'trash' && selectedNote ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h1 className="text-2xl font-bold text-slate-800">{selectedNote.title}</h1>
                        </div>
                        <div className="text-sm text-slate-500 mb-4">
                          Supprimé le {formatDate(selectedNote.deletedAt || selectedNote.updatedAt)}
                        </div>
                        <div className="text-base text-slate-800 whitespace-pre-wrap leading-relaxed mb-6">
                          {selectedNote.content || <span className="text-slate-400 italic">Aucun contenu</span>}
                        </div>
                        <div className="flex gap-2 pt-4 border-t border-slate-200">
                          <button
                            onClick={() => handleRestoreNote(selectedNote.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                          >
                            <Save className="w-4 h-4" />
                            Restaurer
                          </button>
                          <button
                            onClick={() => handlePermanentDelete(selectedNote.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-red-50 rounded-lg hover:bg-red-700 transition-colors text-sm ml-auto"
                          >
                            <Trash2 className="w-4 h-4" />
                            Supprimer définitivement
                          </button>
                        </div>
                      </div>
                    ) : editingId === selectedNote.id ? (
                      <div className="space-y-4">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full text-2xl font-bold text-slate-800 bg-transparent border-none outline-none"
                          placeholder="Titre"
                        />
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full text-base text-slate-800 bg-transparent border-none outline-none resize-none min-h-[500px]"
                          placeholder="Contenu de la note..."
                        />
                        <div className="flex gap-2 pt-4 border-t border-slate-200">
                          <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm"
                          >
                            <Save className="w-4 h-4" />
                            Sauvegarder
                          </button>
                          <button
                            onClick={handleCancel}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors text-sm"
                          >
                            <X className="w-4 h-4" />
                            Annuler
                          </button>
                          <button
                            onClick={() => handleDelete(selectedNote.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm ml-auto"
                          >
                            <Trash2 className="w-4 h-4" />
                            Supprimer
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h1 className="text-2xl font-bold text-slate-800">{selectedNote.title}</h1>
                          <button
                            onClick={() => handleEdit(selectedNote)}
                            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="text-sm text-slate-500 mb-4">
                          {formatDate(selectedNote.updatedAt)}
                        </div>
                        <div className="text-base text-slate-800 whitespace-pre-wrap leading-relaxed">
                          {selectedNote.content || <span className="text-slate-400 italic">Aucun contenu</span>}
                        </div>
                        </div>
                      )}
                    </div>
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-center text-slate-500">
                          <p className="text-lg mb-2">Sélectionnez une note</p>
                          <p className="text-sm">ou créez-en une nouvelle</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-transparent via-white/5 to-white/10 pointer-events-none" />
              </div>
              
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-200/20 to-purple-200/20 blur-xl scale-110 -z-10" />
            </div>
          </div>
        </div>
      </motion.main>
    </>
  )
}
