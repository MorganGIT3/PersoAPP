import { useState, useEffect } from 'react'
import { Plus, X } from 'lucide-react'
import { motion } from 'framer-motion'

interface Subscription {
  id: string
  name: string
  price: number
  endDate: string
  type: 'monthly' | 'yearly'
}

interface RevenueEntry {
  id: string
  amount: number
  title: string
  date: string
}

export default function DashboardContent() {
  const [revenueHistory, setRevenueHistory] = useState<RevenueEntry[]>(() => {
    const saved = localStorage.getItem('persom_revenue_history')
    return saved ? JSON.parse(saved) : []
  })

  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    const saved = localStorage.getItem('persom_subscriptions')
    const parsed = saved ? JSON.parse(saved) : []
    return parsed.sort((a: Subscription, b: Subscription) => 
      new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
    )
  })

  const [newSubscription, setNewSubscription] = useState({
    name: '',
    price: '',
    endDate: '',
    type: 'monthly' as 'monthly' | 'yearly'
  })

  const [showAddRevenueModal, setShowAddRevenueModal] = useState(false)
  const [showAddSubscriptionModal, setShowAddSubscriptionModal] = useState(false)
  const [newRevenueAmount, setNewRevenueAmount] = useState('')
  const [newRevenueTitle, setNewRevenueTitle] = useState('')

  const monthlyRevenue = revenueHistory
    .filter(entry => {
      const entryDate = new Date(entry.date)
      const now = new Date()
      return entryDate.getMonth() === now.getMonth() && 
             entryDate.getFullYear() === now.getFullYear()
    })
    .reduce((sum, entry) => sum + entry.amount, 0)

  const monthlySubscriptionsTotal = subscriptions
    .filter(sub => sub.type === 'monthly')
    .reduce((sum, sub) => sum + sub.price, 0)

  const netRevenue = monthlyRevenue - monthlySubscriptionsTotal

  useEffect(() => {
    localStorage.setItem('persom_revenue_history', JSON.stringify(revenueHistory))
  }, [revenueHistory])

  useEffect(() => {
    const sorted = [...subscriptions].sort((a, b) => 
      new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
    )
    localStorage.setItem('persom_subscriptions', JSON.stringify(sorted))
    setSubscriptions(sorted)
  }, [subscriptions.length])

  const handleAddRevenue = () => {
    if (!newRevenueTitle.trim() || !newRevenueAmount) {
      alert('Veuillez remplir le titre et le montant')
      return
    }

    const revenueEntry: RevenueEntry = {
      id: Date.now().toString(),
      amount: parseFloat(newRevenueAmount),
      title: newRevenueTitle.trim(),
      date: new Date().toISOString()
    }

    setRevenueHistory([...revenueHistory, revenueEntry])
    setNewRevenueAmount('')
    setNewRevenueTitle('')
    setShowAddRevenueModal(false)
  }

  const handleAddSubscription = () => {
    if (!newSubscription.name || !newSubscription.price || !newSubscription.endDate) {
      alert('Veuillez remplir tous les champs')
      return
    }

    const subscription: Subscription = {
      id: Date.now().toString(),
      name: newSubscription.name,
      price: parseFloat(newSubscription.price),
      endDate: newSubscription.endDate,
      type: newSubscription.type
    }

    setSubscriptions([...subscriptions, subscription])
    setNewSubscription({ name: '', price: '', endDate: '', type: 'monthly' })
    setShowAddSubscriptionModal(false)
  }

  const handleDeleteSubscription = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet abonnement ?')) {
      setSubscriptions(subscriptions.filter(sub => sub.id !== id))
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getDaysUntilExpiry = (endDate: string) => {
    const now = new Date()
    const end = new Date(endDate)
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  return (
    <motion.div
      className="p-8 space-y-6"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <h2 className="text-3xl font-light text-slate-800 mb-2">Tableau de bord</h2>
        <p className="text-slate-500 text-sm">Gérez vos revenus et abonnements</p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-medium text-slate-700">Revenus du mois</span>
            <div className="flex items-center gap-2">
              <span className="text-xl text-slate-500">€</span>
              <button
                onClick={() => setShowAddRevenueModal(true)}
                className="p-1 rounded-full hover:bg-slate-200/60 transition-colors"
              >
                <Plus className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>
          <div className="text-3xl font-light text-slate-800">{monthlyRevenue.toFixed(2)}</div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-medium text-slate-700">Revenus nets</span>
          </div>
          <div className="text-3xl font-light text-green-600">{netRevenue.toFixed(2)}</div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-medium text-slate-700">Abonnements mensuels</span>
          </div>
          <div className="text-3xl font-light text-slate-800">{monthlySubscriptionsTotal.toFixed(2)}</div>
        </div>
      </motion.div>

      {subscriptions.length > 0 && (
        <motion.div
          className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="text-lg font-medium text-slate-700 mb-4">Abonnements expirant</h3>
          <div className="space-y-2">
            {subscriptions.slice(0, 3).map(sub => {
              const daysLeft = getDaysUntilExpiry(sub.endDate)
              return (
                <div key={sub.id} className="flex items-center justify-between p-3 bg-white/60 rounded-lg border border-slate-200/60">
                  <div>
                    <div className="font-medium text-slate-800">{sub.name}</div>
                    <div className="text-sm text-slate-500">
                      {formatDate(sub.endDate)} • {daysLeft} jours restants
                    </div>
                  </div>
                  <div className="text-lg font-medium text-slate-700">{sub.price}€/{sub.type === 'monthly' ? 'mois' : 'an'}</div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {revenueHistory.length > 0 && (
        <motion.div
          className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="text-lg font-medium text-slate-700 mb-4">Historique des revenus</h3>
          <div className="space-y-2">
            {[...revenueHistory].reverse().map(entry => (
              <div key={entry.id} className="flex items-center justify-between p-3 bg-white/60 rounded-lg border border-slate-200/60">
                <div>
                  <div className="font-medium text-slate-800">{entry.title}</div>
                  <div className="text-sm text-slate-500">{new Date(entry.date).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</div>
                </div>
                <div className="text-lg font-medium text-green-600">+{entry.amount.toFixed(0)}€</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div
        className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-slate-700">Abonnements</h3>
          <button
            onClick={() => setShowAddSubscriptionModal(true)}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>
        <div className="space-y-2">
          {subscriptions.map(sub => {
            const daysLeft = getDaysUntilExpiry(sub.endDate)
            return (
              <div key={sub.id} className="flex items-center justify-between p-3 bg-white/60 rounded-lg border border-slate-200/60">
                <div>
                  <div className="font-medium text-slate-800">{sub.name}</div>
                  <div className="text-sm text-slate-500">
                    {formatDate(sub.endDate)} • {daysLeft} jours restants
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-lg font-medium text-slate-700">{sub.price}€/{sub.type === 'monthly' ? 'mois' : 'an'}</div>
                  <button
                    onClick={() => handleDeleteSubscription(sub.id)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Add Revenue Modal */}
      {showAddRevenueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-slate-800">Ajouter un revenu</h3>
              <button
                onClick={() => {
                  setShowAddRevenueModal(false)
                  setNewRevenueAmount('')
                  setNewRevenueTitle('')
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Titre (obligatoire)
                </label>
                <input
                  type="text"
                  value={newRevenueTitle}
                  onChange={(e) => setNewRevenueTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
                  placeholder="Ex: Client Yohan"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Montant
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newRevenueAmount}
                  onChange={(e) => setNewRevenueAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
                  placeholder="0.00"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => {
                    setShowAddRevenueModal(false)
                    setNewRevenueAmount('')
                    setNewRevenueTitle('')
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddRevenue}
                  className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
                  disabled={!newRevenueTitle.trim() || !newRevenueAmount}
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Subscription Modal */}
      {showAddSubscriptionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-slate-800">Ajouter un abonnement</h3>
              <button
                onClick={() => {
                  setShowAddSubscriptionModal(false)
                  setNewSubscription({ name: '', price: '', endDate: '', type: 'monthly' })
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nom de l'abonnement
                </label>
                <input
                  type="text"
                  placeholder="Nom de l'abonnement"
                  value={newSubscription.name}
                  onChange={(e) => setNewSubscription({ ...newSubscription, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Prix
                  </label>
                  <input
                    type="number"
                    placeholder="Prix"
                    value={newSubscription.price}
                    onChange={(e) => setNewSubscription({ ...newSubscription, price: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    value={newSubscription.endDate}
                    onChange={(e) => setNewSubscription({ ...newSubscription, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Type
                </label>
                <select
                  value={newSubscription.type}
                  onChange={(e) => setNewSubscription({ ...newSubscription, type: e.target.value as 'monthly' | 'yearly' })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  <option value="monthly">Mensuel</option>
                  <option value="yearly">Annuel</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => {
                    setShowAddSubscriptionModal(false)
                    setNewSubscription({ name: '', price: '', endDate: '', type: 'monthly' })
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddSubscription}
                  className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
                  disabled={!newSubscription.name || !newSubscription.price || !newSubscription.endDate}
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
