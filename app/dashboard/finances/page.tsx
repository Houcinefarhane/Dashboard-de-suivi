'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight, 
  Plus, X, Edit, Trash2, Download, Calendar, Target, CheckCircle2,
  AlertCircle, Filter, RefreshCw
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts'
import { exportExpenses, exportInvoices } from '@/lib/export'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { Gauge } from '@/components/ui/gauge'

interface Expense {
  id: string
  description: string
  category: string
  amount: number
  date: string
  receipt: string | null
}

interface KeyResult {
  id: string
  title: string
  metric: string
  targetValue: number
  currentValue: number
  unit: string
}

interface FinancialObjective {
  id: string
  title: string
  description: string | null
  period: string
  year: number
  month: number | null
  status: string
  keyResults: KeyResult[]
}

type Granularity = 'week' | 'month' | 'year'

export default function FinancesPage() {
  const financesRef = useRef<HTMLDivElement>(null)
  const [granularity, setGranularity] = useState<Granularity>('month')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    profit: 0,
    chartData: [] as any[],
  })
  
  const [objectives, setObjectives] = useState<FinancialObjective[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [showObjectiveForm, setShowObjectiveForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  
  // Filtres du graphique
  const [chartFilters, setChartFilters] = useState({
    revenue: true,
    expenses: true,
    profit: true,
  })
  
  const toggleChartFilter = (filter: 'revenue' | 'expenses' | 'profit') => {
    setChartFilters(prev => ({ ...prev, [filter]: !prev[filter] }))
  }
  
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    category: 'matériel',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    receipt: '',
  })

  const [objectiveForm, setObjectiveForm] = useState({
    title: '',
    description: '',
    period: 'monthly' as 'monthly' | 'annual',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    keyResults: [
      { title: '', metric: 'revenue', targetValue: 0, unit: '€' }
    ]
  })

  useEffect(() => {
    fetchFinancialData()
    fetchExpenses()
    fetchObjectives()
  }, [granularity, selectedYear, selectedMonth])

  const fetchFinancialData = async () => {
    try {
      const params = new URLSearchParams({
        granularity,
        year: selectedYear.toString(),
        month: selectedMonth.toString(),
      })
      
      const res = await fetch(`/api/finances?${params}`)
      const data = await res.json()
      if (res.ok) {
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching financial data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchExpenses = async () => {
    try {
      const res = await fetch('/api/expenses')
      const data = await res.json()
      if (res.ok) {
        setExpenses(data.expenses || data)
      }
    } catch (error) {
      console.error('Error fetching expenses:', error)
    }
  }

  const fetchObjectives = async () => {
    try {
      const params = new URLSearchParams({
        period: granularity === 'year' ? 'annual' : 'monthly',
        year: selectedYear.toString(),
        ...(granularity !== 'year' && { month: selectedMonth.toString() })
      })
      
      const res = await fetch(`/api/financial-objectives?${params}`)
      const data = await res.json()
      if (res.ok) {
        setObjectives(data)
      }
    } catch (error) {
      console.error('Error fetching objectives:', error)
    }
  }

  const handleSyncObjective = async (objectiveId: string) => {
    try {
      const res = await fetch('/api/financial-objectives/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objectiveId }),
      })
      
      if (res.ok) {
        fetchObjectives()
      }
    } catch (error) {
      console.error('Error syncing objective:', error)
    }
  }

  const handleCreateObjective = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const res = await fetch('/api/financial-objectives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(objectiveForm),
      })
      
      const data = await res.json()
      
      if (res.ok) {
        alert('Objectif créé avec succès !')
        fetchObjectives()
        resetObjectiveForm()
      } else {
        // Message d'erreur détaillé avec instructions
        const errorMessage = data.error || 'Impossible de créer l\'objectif'
        
        if (errorMessage.includes('table') || errorMessage.includes('relation') || errorMessage.includes('does not exist')) {
          alert(`❌ Les tables OKR n'existent pas encore dans votre base de données !\n\n📋 ÉTAPES À SUIVRE :\n\n1. Ouvrez Supabase : https://supabase.com/dashboard\n2. Allez dans "SQL Editor"\n3. Cliquez sur "New query"\n4. Copiez le contenu du fichier "prisma/migrations/add_okr_tables.sql"\n5. Collez-le dans l'éditeur et cliquez sur "Run"\n\n📄 Consultez le fichier MIGRATION_OKR.md pour plus de détails.\n\nErreur technique : ${errorMessage}`)
        } else {
          alert(`Erreur lors de la création de l'objectif :\n\n${errorMessage}`)
        }
        console.error('Error response:', data)
      }
    } catch (error) {
      console.error('Error creating objective:', error)
      alert('Erreur réseau. Vérifiez votre connexion.')
    }
  }

  const handleDeleteObjective = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet objectif ?')) return
    
    try {
      const res = await fetch(`/api/financial-objectives?id=${id}`, {
        method: 'DELETE',
      })
      
      if (res.ok) {
        fetchObjectives()
      }
    } catch (error) {
      console.error('Error deleting objective:', error)
    }
  }

  const handleSubmitExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingExpense
        ? `/api/expenses?id=${editingExpense.id}`
        : '/api/expenses'
      
      const res = await fetch(url, {
        method: editingExpense ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...expenseForm,
          amount: parseFloat(expenseForm.amount),
        }),
      })
      
      if (res.ok) {
        fetchExpenses()
        fetchFinancialData()
        resetExpenseForm()
      }
    } catch (error) {
      console.error('Error saving expense:', error)
    }
  }

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) return
    
    try {
      const res = await fetch(`/api/expenses?id=${id}`, {
        method: 'DELETE',
      })
      
      if (res.ok) {
        fetchExpenses()
        fetchFinancialData()
      }
    } catch (error) {
      console.error('Error deleting expense:', error)
    }
  }

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense)
    setExpenseForm({
      description: expense.description,
      category: expense.category,
      amount: expense.amount.toString(),
      date: expense.date.split('T')[0],
      receipt: expense.receipt || '',
    })
    setShowExpenseForm(true)
  }

  const resetExpenseForm = () => {
    setExpenseForm({
      description: '',
      category: 'matériel',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      receipt: '',
    })
    setEditingExpense(null)
    setShowExpenseForm(false)
  }

  const resetObjectiveForm = () => {
    setObjectiveForm({
      title: '',
      description: '',
      period: 'monthly',
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      keyResults: [
        { title: '', metric: 'revenue', targetValue: 0, unit: '€' }
      ]
    })
    setShowObjectiveForm(false)
  }

  const addKeyResult = () => {
    setObjectiveForm({
      ...objectiveForm,
      keyResults: [
        ...objectiveForm.keyResults,
        { title: '', metric: 'revenue', targetValue: 0, unit: '€' }
      ]
    })
  }

  const removeKeyResult = (index: number) => {
    setObjectiveForm({
      ...objectiveForm,
      keyResults: objectiveForm.keyResults.filter((_, i) => i !== index)
    })
  }

  const updateKeyResult = (index: number, field: string, value: any) => {
    const newKeyResults = [...objectiveForm.keyResults]
    newKeyResults[index] = { ...newKeyResults[index], [field]: value }
    setObjectiveForm({ ...objectiveForm, keyResults: newKeyResults })
  }

  const getProgress = (current: number, target: number) => {
    if (target === 0) return 0
    return Math.min(Math.round((current / target) * 100), 100)
  }

  const handleExport = () => {
    const financialData = [
      {
        'Revenus totaux': formatCurrency(stats.totalRevenue),
        'Dépenses totales': formatCurrency(stats.totalExpenses),
        'Bénéfice brut': formatCurrency(stats.profit),
        'Date export': new Date().toLocaleDateString('fr-FR'),
      },
      ...stats.chartData.map((item) => ({
        Période: item.period,
        Revenus: formatCurrency(item.revenue),
        Dépenses: formatCurrency(item.expenses),
        Bénéfice: formatCurrency(item.profit),
      })),
    ]

    const csvContent = [
      Object.keys(financialData[0]).join(','),
      ...financialData.map((row) => Object.values(row).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `finances_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const handleExportPDF = async () => {
    if (!financesRef.current) return

    try {
      const canvas = await html2canvas(financesRef.current, {
        useCORS: true,
        allowTaint: true,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`finances_${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (error) {
      console.error('Error exporting PDF:', error)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'matériel':
        return 'bg-primary/20 text-primary border-primary/30'
      case 'transport':
        return 'bg-accent/20 text-accent border-accent/30'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  // Calculer la progression globale des objectifs
  const calculateOverallProgress = () => {
    if (objectives.length === 0) return 0
    
    let totalProgress = 0
    let totalKeyResults = 0
    
    objectives.forEach(objective => {
      objective.keyResults.forEach(kr => {
        totalKeyResults++
        const progress = kr.targetValue > 0 ? Math.min((kr.currentValue / kr.targetValue) * 100, 100) : 0
        totalProgress += progress
      })
    })
    
    return totalKeyResults > 0 ? Math.round(totalProgress / totalKeyResults) : 0
  }

  const overallProgress = calculateOverallProgress()
  const achievedObjectives = objectives.reduce((count, obj) => {
    const allAchieved = obj.keyResults.every(kr => kr.currentValue >= kr.targetValue)
    return allAchieved ? count + 1 : count
  }, 0)

  const statCards = [
    {
      title: 'Revenus',
      value: formatCurrency(stats.totalRevenue),
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Dépenses',
      value: formatCurrency(stats.totalExpenses),
      icon: TrendingDown,
      color: 'from-red-500 to-red-600',
    },
    {
      title: 'Bénéfice',
      value: formatCurrency(stats.profit),
      icon: DollarSign,
      color: 'from-blue-500 to-blue-600',
    },
  ]

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)
  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ]

  return (
    <div ref={financesRef} className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold mb-2">Finances</h1>
          <p className="text-muted-foreground">
            Suivez vos revenus, dépenses et objectifs OKR
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" onClick={() => setShowObjectiveForm(true)}>
            <Target className="w-4 h-4 mr-2" />
            Objectif
          </Button>
          <Button onClick={() => setShowExpenseForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Dépense
          </Button>
        </div>
      </motion.div>

      {/* Filtres de granularité */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtres temporels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {/* Sélection de granularité */}
            <div className="flex gap-2">
              <Button
                variant={granularity === 'week' ? 'default' : 'outline'}
                onClick={() => setGranularity('week')}
                size="sm"
              >
                Semaine
              </Button>
              <Button
                variant={granularity === 'month' ? 'default' : 'outline'}
                onClick={() => setGranularity('month')}
                size="sm"
              >
                Mois
              </Button>
              <Button
                variant={granularity === 'year' ? 'default' : 'outline'}
                onClick={() => setGranularity('year')}
                size="sm"
              >
                Année
              </Button>
            </div>

            {/* Sélection d'année */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-2 rounded-md border border-input bg-background text-sm"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            {/* Sélection de mois (si granularité semaine ou mois) */}
            {granularity !== 'year' && (
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-3 py-2 rounded-md border border-input bg-background text-sm"
              >
                {months.map((month, index) => (
                  <option key={index} value={index + 1}>
                    {month}
                  </option>
                ))}
              </select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <Card className="border-2 hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl mt-4">
                    {loading ? '...' : stat.value}
                  </CardTitle>
                  <CardDescription>{stat.title}</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Indicateur de progression des objectifs */}
      {objectives.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-2 border-primary/20">
            <CardHeader className="text-center pb-2">
              <CardTitle className="flex items-center justify-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Progression de vos objectifs
              </CardTitle>
              <CardDescription>
                État d'avancement global de tous vos objectifs financiers
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-6">
              <Gauge 
                value={overallProgress}
                title="Objectifs atteints"
                subtitle={`${achievedObjectives} sur ${objectives.length} objectif${objectives.length > 1 ? 's' : ''}`}
                size={280}
              />
              <div className="mt-6 grid grid-cols-3 gap-4 w-full max-w-md">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-500">0-33%</div>
                  <div className="text-xs text-muted-foreground">À améliorer</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-500">34-66%</div>
                  <div className="text-xs text-muted-foreground">En cours</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">67-100%</div>
                  <div className="text-xs text-muted-foreground">Excellent</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Graphique */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: objectives.length > 0 ? 0.4 : 0.3 }}
      >
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Évolution financière</CardTitle>
                <CardDescription>
                  Revenus, dépenses et bénéfices par {granularity === 'week' ? 'semaine' : granularity === 'month' ? 'mois' : 'année'}
                </CardDescription>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={chartFilters.revenue ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleChartFilter('revenue')}
                  className={chartFilters.revenue ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  <div className="w-3 h-3 rounded-full bg-green-600 mr-2"></div>
                  Revenus
                </Button>
                <Button
                  variant={chartFilters.expenses ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleChartFilter('expenses')}
                  className={chartFilters.expenses ? "bg-red-600 hover:bg-red-700" : ""}
                >
                  <div className="w-3 h-3 rounded-full bg-red-600 mr-2"></div>
                  Dépenses
                </Button>
                <Button
                  variant={chartFilters.profit ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleChartFilter('profit')}
                  className={chartFilters.profit ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  <div className="w-3 h-3 rounded-full bg-blue-600 mr-2"></div>
                  Bénéfice
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={stats.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(value: any) => formatCurrency(value)} />
                <Legend />
                {chartFilters.revenue && <Bar dataKey="revenue" name="Revenus" fill="#10b981" />}
                {chartFilters.expenses && <Bar dataKey="expenses" name="Dépenses" fill="#ef4444" />}
                {chartFilters.profit && <Bar dataKey="profit" name="Bénéfice" fill="#3b82f6" />}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Objectifs OKR */}
      {objectives.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Objectifs OKR
                  </CardTitle>
                  <CardDescription>
                    Suivez vos objectifs et résultats clés
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {objectives.map((objective) => (
                  <div key={objective.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{objective.title}</h3>
                        {objective.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {objective.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {objective.period === 'monthly' 
                            ? `${months[objective.month! - 1]} ${objective.year}`
                            : `Année ${objective.year}`
                          }
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSyncObjective(objective.id)}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteObjective(objective.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Key Results */}
                    <div className="space-y-3">
                      {objective.keyResults.map((kr) => {
                        const progress = getProgress(kr.currentValue, kr.targetValue)
                        const isCompleted = progress >= 100
                        
                        return (
                          <div key={kr.id} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium">{kr.title}</span>
                              <span className="text-muted-foreground">
                                {kr.currentValue.toFixed(0)} / {kr.targetValue.toFixed(0)} {kr.unit}
                              </span>
                            </div>
                            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                                  isCompleted ? 'bg-green-500' : 'bg-primary'
                                }`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className={isCompleted ? 'text-green-600 font-medium' : 'text-muted-foreground'}>
                                {progress}%
                              </span>
                              {isCompleted && (
                                <span className="flex items-center gap-1 text-green-600 font-medium">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Atteint
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Graphiques détaillés */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution des revenus */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Évolution des revenus</CardTitle>
              <CardDescription>
                Revenus par {granularity === 'week' ? 'semaine' : granularity === 'month' ? 'mois' : 'année'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="Revenus"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: '#10b981', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bénéfice brut */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Bénéfice brut</CardTitle>
              <CardDescription>
                Bénéfice (revenus - dépenses) par {granularity === 'week' ? 'semaine' : granularity === 'month' ? 'mois' : 'année'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="profit" name="Bénéfice">
                    {stats.chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.profit >= 0 ? '#3b82f6' : '#ef4444'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Modal Dépense */}
      <AnimatePresence>
        {showExpenseForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={resetExpenseForm}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background rounded-lg p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {editingExpense ? 'Modifier' : 'Ajouter'} une dépense
                </h2>
                <Button variant="ghost" size="sm" onClick={resetExpenseForm}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <form onSubmit={handleSubmitExpense} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Input
                    id="description"
                    value={expenseForm.description}
                    onChange={(e) =>
                      setExpenseForm({ ...expenseForm, description: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Catégorie *</Label>
                    <select
                      id="category"
                      value={expenseForm.category}
                      onChange={(e) =>
                        setExpenseForm({ ...expenseForm, category: e.target.value })
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      required
                    >
                      <option value="matériel">Matériel</option>
                      <option value="transport">Transport</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Montant (€) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={expenseForm.amount}
                      onChange={(e) =>
                        setExpenseForm({ ...expenseForm, amount: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={expenseForm.date}
                    onChange={(e) =>
                      setExpenseForm({ ...expenseForm, date: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={resetExpenseForm} className="flex-1">
                    Annuler
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingExpense ? 'Modifier' : 'Ajouter'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Objectif OKR */}
      <AnimatePresence>
        {showObjectiveForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={resetObjectiveForm}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background rounded-lg p-6 w-full max-w-2xl my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Nouvel objectif OKR</h2>
                <Button variant="ghost" size="sm" onClick={resetObjectiveForm}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <form onSubmit={handleCreateObjective} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre de l'objectif *</Label>
                  <Input
                    id="title"
                    value={objectiveForm.title}
                    onChange={(e) =>
                      setObjectiveForm({ ...objectiveForm, title: e.target.value })
                    }
                    placeholder="Ex: Augmenter la rentabilité"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={objectiveForm.description}
                    onChange={(e) =>
                      setObjectiveForm({ ...objectiveForm, description: e.target.value })
                    }
                    placeholder="Détails de l'objectif..."
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="period">Période *</Label>
                    <select
                      id="period"
                      value={objectiveForm.period}
                      onChange={(e) =>
                        setObjectiveForm({ ...objectiveForm, period: e.target.value as 'monthly' | 'annual' })
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="monthly">Mensuel</option>
                      <option value="annual">Annuel</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="year">Année *</Label>
                    <select
                      id="year"
                      value={objectiveForm.year}
                      onChange={(e) =>
                        setObjectiveForm({ ...objectiveForm, year: parseInt(e.target.value) })
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  {objectiveForm.period === 'monthly' && (
                    <div className="space-y-2">
                      <Label htmlFor="month">Mois *</Label>
                      <select
                        id="month"
                        value={objectiveForm.month}
                        onChange={(e) =>
                          setObjectiveForm({ ...objectiveForm, month: parseInt(e.target.value) })
                        }
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        {months.map((month, index) => (
                          <option key={index} value={index + 1}>
                            {month}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Résultats clés (Key Results)</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addKeyResult}>
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter
                    </Button>
                  </div>

                  {objectiveForm.keyResults.map((kr, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <span className="text-sm font-medium">KR {index + 1}</span>
                        {objectiveForm.keyResults.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeKeyResult(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <Input
                        value={kr.title}
                        onChange={(e) => updateKeyResult(index, 'title', e.target.value)}
                        placeholder="Ex: Atteindre 50 000€ de CA"
                        required
                      />

                      <div className="grid grid-cols-3 gap-3">
                        <select
                          value={kr.metric}
                          onChange={(e) => updateKeyResult(index, 'metric', e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="revenue">Revenus</option>
                          <option value="profit">Bénéfice</option>
                          <option value="expenses">Dépenses</option>
                          <option value="client_count">Nouveaux clients</option>
                          <option value="intervention_count">Interventions</option>
                        </select>

                        <Input
                          type="number"
                          value={kr.targetValue}
                          onChange={(e) => updateKeyResult(index, 'targetValue', parseFloat(e.target.value))}
                          placeholder="Cible"
                          required
                        />

                        <Input
                          value={kr.unit}
                          onChange={(e) => updateKeyResult(index, 'unit', e.target.value)}
                          placeholder="Unité"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={resetObjectiveForm} className="flex-1">
                    Annuler
                  </Button>
                  <Button type="submit" className="flex-1">
                    Créer l'objectif
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
