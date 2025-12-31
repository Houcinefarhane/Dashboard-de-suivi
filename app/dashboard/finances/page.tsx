'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight, 
  Plus, X, Edit, Trash2, Download, Calendar, Filter
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts'
import { exportExpenses, exportInvoices } from '@/lib/export'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

interface Expense {
  id: string
  description: string
  category: string
  amount: number
  date: string
  receipt: string | null
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
  
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [showExpenseForm, setShowExpenseForm] = useState(false)
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

  useEffect(() => {
    fetchFinancialData()
    fetchExpenses()
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
            Suivez vos revenus et dépenses
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

      {/* Graphique */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
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
    </div>
  )
}
