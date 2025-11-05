import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Sidebar from '@/components/Sidebar';
import MetricCard from '@/components/MetricCard';
import ChartCard from '@/components/ChartCard';
import { 
  Building, 
  FileText, 
  Wand2, 
  BarChart3, 
  ArrowLeft,
  Users,
  Euro,
  TrendingUp,
  Clock,
  Star,
  MapPin,
  Wrench,
  Filter,
  Plus,
  LogOut
} from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { logout } = useAuth();
  const [, setLocation] = useLocation();
  // Mock data for charts
  const projectsData = [
    { month: 'Jan', value: 12 },
    { month: 'Fév', value: 15 },
    { month: 'Mar', value: 18 },
    { month: 'Avr', value: 22 },
    { month: 'Mai', value: 28 },
    { month: 'Jun', value: 35 },
  ];

  const revenueData = [
    { month: 'Jan', value: 85000 },
    { month: 'Fév', value: 92000 },
    { month: 'Mar', value: 108000 },
    { month: 'Avr', value: 125000 },
    { month: 'Mai', value: 142000 },
    { month: 'Jun', value: 165000 },
  ];

  const recentProjects = [
    {
      id: 1,
      title: "Piscine 8x4m - Famille Martin",
      location: "Neuilly-sur-Seine",
      price: "€45,000",
      status: "En cours",
      progress: 65,
      client: "Martin",
      time: "Début: 15 mai"
    },
    {
      id: 2,
      title: "Aménagement Paysager Complet",
      location: "Vincennes",
      price: "€28,500",
      status: "Planifié",
      progress: 0,
      client: "Dubois",
      time: "Début: 3 juillet"
    },
    {
      id: 3,
      title: "Menuiserie Cuisine Sur-Mesure",
      location: "Boulogne",
      price: "€15,800",
      status: "Terminé",
      progress: 100,
      client: "Leclerc",
      time: "Terminé: 12 juin"
    }
  ];

  return (
    <motion.div
      className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/30"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Top Navigation - Fixed position */}
      <div className="fixed top-8 left-0 right-0 flex justify-center z-50">
        <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-full px-6 py-3 shadow-lg">
            <div className="flex items-center gap-6">
              <span className="text-slate-800 font-medium">PersoM</span>
              <div className="flex items-center gap-4">
                <button
                  className="text-sm px-3 py-1 rounded-full transition-colors bg-slate-800 text-white border border-slate-300"
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
                  onClick={() => {
                    logout()
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

      <div className="flex min-h-screen">
        <Sidebar />
        
        <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" data-testid="button-back-home">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour Accueil
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Tableau de Bord
                </h1>
                <p className="text-sm text-muted-foreground">Bonne journée, voici l'état de vos chantiers et activités</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="gap-2" data-testid="button-filter">
                <Filter className="h-4 w-4" />
                Filtres
              </Button>
              <Button size="sm" className="gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700" data-testid="button-add">
                <Plus className="h-4 w-4" />
                Nouveau
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                data-testid="button-logout"
                onClick={() => {
                  logout()
                }}
                className="p-2"
                title="Déconnexion"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <motion.main
          className="flex-1 p-6 space-y-6 overflow-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        >
          {/* Metrics Row */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <MetricCard
              title="Chiffre d'Affaires"
              value="€165,000"
              change="+18.2%"
              trend="up"
              subtitle="ce mois"
              icon={<Euro className="h-5 w-5" />}
              gradient="from-green-500 to-emerald-600"
            />
            
            <MetricCard
              title="Chantiers Actifs"
              value="12"
              change="+3"
              trend="up"
              subtitle="en cours"
              icon={<Building className="h-5 w-5" />}
              gradient="from-blue-500 to-cyan-600"
            />
            
            <MetricCard
              title="Devis En Attente"
              value="8"
              change="+2"
              trend="up"
              subtitle="réponses attendues"
              icon={<FileText className="h-5 w-5" />}
              gradient="from-purple-500 to-pink-600"
            />
            
            <MetricCard
              title="Taux de Conversion"
              value="73%"
              change="+5.2%"
              trend="up"
              subtitle="devis → chantiers"
              icon={<TrendingUp className="h-5 w-5" />}
              gradient="from-orange-500 to-red-600"
            />
          </motion.div>

          {/* Charts Row */}
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <ChartCard
              title="Chantiers Réalisés"
              type="line"
              data={projectsData}
              dataKey="value"
              xAxisKey="month"
              color="#6366f1"
              height={250}
            />
            
            <ChartCard
              title="Évolution du CA"
              type="bar"
              data={revenueData}
              dataKey="value"
              xAxisKey="month"
              color="#8b5cf6"
              height={250}
            />
          </motion.div>

          {/* Recent Properties & Activity */}
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {/* Recent Projects */}
            <Card className="lg:col-span-2 hover-elevate">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-blue-500" />
                  Chantiers Récents
                </CardTitle>
                <Button variant="outline" size="sm" data-testid="button-view-all">
                  Voir tout
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentProjects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-slate-50 to-blue-50/50 hover:from-blue-50 to-purple-50/50 transition-all duration-200 hover-elevate cursor-pointer">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{project.title}</h4>
                        <Badge 
                          variant={project.status === 'En cours' ? 'default' : project.status === 'Terminé' ? 'secondary' : 'outline'}
                          className={project.status === 'En cours' ? 'bg-gradient-to-r from-blue-500 to-purple-600' : ''}
                        >
                          {project.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {project.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {project.time}
                        </span>
                      </div>
                      {project.status === 'En cours' && (
                        <div className="w-full bg-slate-200 rounded-full h-1.5">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-1.5 rounded-full" 
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <div className="font-semibold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {project.price}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {project.client}
                        </span>
                        {project.status === 'En cours' && (
                          <span className="text-blue-600 font-medium">
                            {project.progress}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Performance Tier */}
            <Card className="hover-elevate">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center mb-3">
                    <Wrench className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg">Artisan Expert</h3>
                  <p className="text-sm text-muted-foreground">Niveau professionnel</p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Chantiers</span>
                    <span className="font-medium">47</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Clients fidèles</span>
                    <span className="font-medium">23</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Satisfaction</span>
                    <span className="font-medium">4.8/5</span>
                  </div>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  Excellence atteinte - continuez !
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.main>
        </div>
      </div>
    </motion.div>
  );
}