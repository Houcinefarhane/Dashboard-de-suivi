'use client'

import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { toast } from '@/lib/toast'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Calendar, TrendingUp, Package, AlertCircle, ArrowUpRight, ArrowDownRight, FileText, Clock, CheckCircle2, MapPin, AlertTriangle, Loader } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts'

interface RecentActivity {
  type: 'invoice' | 'intervention' | 'client'
  title: string
  date: string
  amount?: number
  status?: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalClients: 0,
    upcomingInterventions: 0,
    monthlyRevenue: 0,
    lowStockItems: 0,
    pendingInvoices: 0,
    totalRevenue: 0,
    monthlyGrowth: 0,
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [operations, setOperations] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
    // Désactivé pour éviter trop de notifications
    // checkOverdueInvoices()
    // checkInterventionReminders()
  }, [])

  const checkOverdueInvoices = async () => {
    try {
      await fetch('/api/notifications/check-overdue', { method: 'POST' })
    } catch (error) {
      console.error('Error checking overdue invoices:', error)
    }
  }

  const checkInterventionReminders = async () => {
    try {
      await fetch('/api/notifications/check-reminders', { method: 'POST' })
    } catch (error) {
      console.error('Error checking intervention reminders:', error)
    }
  }

  const fetchDashboardData = async () => {
    try {
      const [statsRes, activityRes, revenueRes, operationsRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/dashboard/recent-activity'),
        fetch('/api/dashboard/revenue-chart'),
        fetch('/api/dashboard/operations'),
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (activityRes.ok) {
        const activityData = await activityRes.json()
        setRecentActivity(activityData)
      }

      if (revenueRes.ok) {
        const revenueData = await revenueRes.json()
        setRevenueData(revenueData)
      }

      if (operationsRes.ok) {
        const operationsData = await operationsRes.json()
        setOperations(operationsData)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Clients',
      value: stats.totalClients,
      icon: Users,
      color: 'bg-primary',
      description: 'Clients actifs',
      change: '+12%',
      trend: 'up' as const,
      link: '/dashboard/clients',
    },
    {
      title: 'Interventions',
      value: stats.upcomingInterventions,
      icon: Calendar,
      color: 'bg-accent',
      description: 'À venir cette semaine',
      change: '+5',
      trend: 'up' as const,
      link: '/dashboard/planning',
    },
    {
      title: 'Revenus mensuels',
      value: formatCurrency(stats.monthlyRevenue),
      icon: TrendingUp,
      color: 'bg-success',
      description: 'Ce mois-ci',
      change: `${stats.monthlyGrowth > 0 ? '+' : ''}${stats.monthlyGrowth}%`,
      trend: stats.monthlyGrowth > 0 ? 'up' as const : 'down' as const,
      link: '/dashboard/finances',
    },
    {
      title: 'Factures en attente',
      value: stats.pendingInvoices,
      icon: FileText,
      color: 'bg-secondary',
      description: 'En attente de paiement',
      change: stats.pendingInvoices > 0 ? `${stats.pendingInvoices} en attente` : 'À jour',
      trend: stats.pendingInvoices > 0 ? 'down' as const : 'up' as const,
      link: '/dashboard/factures',
    },
  ]

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
      >
        <div>
          <h1 className="text-3xl font-bold mb-1">Tableau de bord</h1>
          <p className="text-sm text-muted-foreground">
            Vue d'ensemble de votre activité
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/factures">
              <FileText className="w-4 h-4 mr-2" />
              Facture
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/dashboard/planning">
              <Calendar className="w-4 h-4 mr-2" />
              Intervention
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards - Compact */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <Link href={stat.link}>
                <Card className="border border-border hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer group p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-medium ${
                      stat.trend === 'up' ? 'text-success' : 'text-destructive'
                    }`}>
                      {stat.trend === 'up' ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3" />
                      )}
                      <span className="text-xs">{stat.change}</span>
                    </div>
                  </div>
                  <CardTitle className="text-xl mb-1">
                    {loading ? (
                      <div className="h-6 w-20 bg-muted animate-pulse rounded"></div>
                    ) : (
                      stat.value
                    )}
                  </CardTitle>
                  <CardDescription className="text-xs">{stat.description}</CardDescription>
                </Card>
              </Link>
            </motion.div>
          )
        })}
      </div>

      {/* Main Content Grid - 5 columns pour plus de flexibilité */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Opérations en cours - Colonne réduite */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card className="border border-border h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Opérations en cours</CardTitle>
                  <CardDescription className="text-xs">Vue d'ensemble</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard/planning">
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded-lg"></div>
                  ))}
                </div>
              ) : operations ? (
                <>
                  {/* En cours maintenant */}
                  {operations.inProgress && operations.inProgress.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Loader className="w-4 h-4 text-accent" />
                        <h3 className="text-sm font-semibold">En cours ({operations.inProgress.length})</h3>
                      </div>
                      <div className="space-y-2">
                        {operations.inProgress.map((intervention: any) => (
                          <div key={intervention.id} className="p-2 rounded-lg border border-accent/30 bg-accent/5">
                            <p className="text-sm font-medium truncate">{intervention.title}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {intervention.client.firstName} {intervention.client.lastName}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Aujourd'hui */}
                  {operations.today && operations.today.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <h3 className="text-sm font-semibold">Aujourd'hui ({operations.today.length})</h3>
                      </div>
                      <div className="space-y-2">
                        {operations.today.slice(0, 3).map((intervention: any) => (
                          <div key={intervention.id} className="p-2 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{intervention.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(intervention.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} • {intervention.client.firstName} {intervention.client.lastName}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Urgent - Demain */}
                  {operations.urgent && operations.urgent.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                        <h3 className="text-sm font-semibold">Urgent - Demain ({operations.urgent.length})</h3>
                      </div>
                      <div className="space-y-2">
                        {operations.urgent.map((intervention: any) => (
                          <div key={intervention.id} className="p-2 rounded-lg border border-destructive/30 bg-destructive/5">
                            <p className="text-sm font-medium truncate">{intervention.title}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {new Date(intervention.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} • {intervention.client.firstName} {intervention.client.lastName}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Zones géographiques */}
                  {operations.byZone && operations.byZone.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-secondary" />
                        <h3 className="text-sm font-semibold">Zones ({operations.byZone.length})</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {operations.byZone.map((zone: any) => (
                          <div key={zone.zone} className="p-2 rounded-lg border border-border bg-muted/30">
                            <p className="text-xs font-medium truncate">{zone.zone}</p>
                            <p className="text-xs text-muted-foreground">{zone.count} intervention{zone.count > 1 ? 's' : ''}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Factures en retard */}
                  {operations.overdueInvoices && operations.overdueInvoices.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-destructive" />
                        <h3 className="text-sm font-semibold">Factures en retard ({operations.overdueInvoices.length})</h3>
                      </div>
                      <div className="space-y-2">
                        {operations.overdueInvoices.slice(0, 2).map((invoice: any) => (
                          <div key={invoice.id} className="p-2 rounded-lg border border-destructive/30 bg-destructive/5">
                            <p className="text-sm font-medium truncate">#{invoice.invoiceNumber}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {invoice.client.firstName} {invoice.client.lastName} • {formatCurrency(invoice.total)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(!operations.today || operations.today.length === 0) && 
                   (!operations.urgent || operations.urgent.length === 0) && 
                   (!operations.inProgress || operations.inProgress.length === 0) && (
                    <div className="text-center py-6 text-muted-foreground">
                      <Calendar className="w-6 h-6 mx-auto mb-2 opacity-50" />
                      <p className="text-xs">Aucune opération</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Calendar className="w-6 h-6 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">Chargement...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Colonne droite - Graphique Revenus (agrandi) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-3"
        >
          <Card className="border border-border h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Revenus</CardTitle>
                  <CardDescription className="text-sm">Évolution sur 6 derniers mois</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard/finances">
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={revenueData.length > 0 ? revenueData : [
                  { month: 'Jan', revenue: 0 },
                  { month: 'Fév', revenue: 0 },
                  { month: 'Mar', revenue: 0 },
                  { month: 'Avr', revenue: 0 },
                  { month: 'Mai', revenue: 0 },
                  { month: 'Juin', revenue: 0 },
                ]}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="rgb(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="rgb(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" />
                  <XAxis dataKey="month" stroke="rgb(var(--muted-foreground))" />
                  <YAxis stroke="rgb(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgb(var(--card))',
                      border: '1px solid rgb(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: any) => formatCurrency(value)}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="rgb(var(--primary))"
                    strokeWidth={2}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Activité récente - Pleine largeur */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Activité récente</CardTitle>
                <CardDescription className="text-xs">Dernières actions</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-12 bg-muted animate-pulse rounded-lg"></div>
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Clock className="w-6 h-6 mx-auto mb-2 opacity-50" />
                <p className="text-xs">Aucune activité</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {recentActivity.slice(0, 4).map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.05 }}
                    className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      activity.type === 'invoice' ? 'bg-primary/20 text-primary' :
                      activity.type === 'intervention' ? 'bg-accent/20 text-accent' :
                      'bg-success/20 text-success'
                    }`}>
                      {activity.type === 'invoice' ? <FileText className="w-4 h-4" /> :
                       activity.type === 'intervention' ? <Calendar className="w-4 h-4" /> :
                       <Users className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{activity.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{activity.date}</p>
                    </div>
                    {activity.amount && (
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-semibold">{formatCurrency(activity.amount)}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
