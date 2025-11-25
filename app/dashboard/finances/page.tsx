'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight, Plus, X, Edit, Trash2, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, LabelList } from 'recharts'
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

export default function FinancesPage() {
  const financesRef = useRef<HTMLDivElement>(null)
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    profit: 0,
    monthlyData: [] as any[],
  })
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    category: 'matériel',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    receipt: '',
  })
  const [monthOffset, setMonthOffset] = useState(0) // Décalage en mois (0 = mois actuel, négatif = passé, positif = futur)

  useEffect(() => {
    fetchFinancialData()
    fetchExpenses()
    fetchInvoices()
  }, [])

  const fetchFinancialData = async () => {
    try {
      const res = await fetch('/api/finances')
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
        setExpenses(data)
      }
    } catch (error) {
      console.error('Error fetching expenses:', error)
    }
  }

  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/invoices')
      const data = await res.json()
      if (res.ok) {
        setInvoices(data)
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
    }
  }

  const handleExport = () => {
    // Exporter les données financières
    const financialData = [
      {
        'Revenus totaux': formatCurrency(stats.totalRevenue),
        'Dépenses totales': formatCurrency(stats.totalExpenses),
        'Bénéfice brut': formatCurrency(stats.profit),
        'Date export': new Date().toLocaleDateString('fr-FR'),
      },
      ...stats.monthlyData.map((month) => ({
        'Mois': month.month,
        'Revenus': formatCurrency(month.revenue),
        'Dépenses': formatCurrency(month.expenses),
        'Bénéfice brut': formatCurrency(month.profit),
      })),
    ]
    
    const { exportToCSV } = require('@/lib/export')
    exportToCSV(financialData, 'finances', ['Mois', 'Revenus', 'Dépenses', 'Bénéfice brut'])
  }

  const handleExportPDF = async () => {
    if (!financesRef.current) return

    try {
      // Masquer temporairement les boutons d'export pour la capture
      const exportButtons = financesRef.current.querySelectorAll('button')
      const buttonsToHide: Array<{ element: HTMLElement; originalDisplay: string }> = []
      
      exportButtons.forEach((btn) => {
        const text = btn.textContent || ''
        if (text.includes('Exporter')) {
          buttonsToHide.push({
            element: btn as HTMLElement,
            originalDisplay: (btn as HTMLElement).style.display || '',
          })
          ;(btn as HTMLElement).style.display = 'none'
        }
      })

      // Attendre un court délai pour que les changements visuels soient appliqués
      await new Promise(resolve => setTimeout(resolve, 100))

      // Capturer le DOM avec html2canvas
      const canvas = await html2canvas(financesRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: financesRef.current.scrollWidth,
        windowHeight: financesRef.current.scrollHeight,
      })

      // Restaurer l'affichage des boutons
      buttonsToHide.forEach(({ element, originalDisplay }) => {
        element.style.display = originalDisplay
      })

      // Convertir le canvas en image
      const imgData = canvas.toDataURL('image/png', 1.0)

      // Créer le PDF
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = Math.min((pdfWidth - 20) / imgWidth, (pdfHeight - 20) / imgHeight) // Marge de 10mm de chaque côté
      const imgX = (pdfWidth - imgWidth * ratio) / 2
      let imgY = 10

      // Calculer le nombre de pages nécessaires
      const pageHeight = imgHeight * ratio
      let heightLeft = pageHeight
      let position = imgY

      // Ajouter la première page
      pdf.addImage(imgData, 'PNG', imgX, position, imgWidth * ratio, imgHeight * ratio)
      heightLeft -= (pdfHeight - 20)

      // Ajouter les pages supplémentaires si nécessaire
      while (heightLeft > 0) {
        position = -(pageHeight - heightLeft - imgY)
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', imgX, position, imgWidth * ratio, imgHeight * ratio)
        heightLeft -= (pdfHeight - 20)
      }

      // Télécharger le PDF
      pdf.save(`rapport-financier-${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error)
      alert('Erreur lors de l\'export PDF. Veuillez réessayer.')
    }
  }

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = editingExpense ? `/api/expenses/${editingExpense.id}` : '/api/expenses'
    const method = editingExpense ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: expenseForm.description,
          category: expenseForm.category,
          amount: expenseForm.amount,
          date: expenseForm.date,
          receipt: expenseForm.receipt || null,
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
      const res = await fetch(`/api/expenses/${id}`, {
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

  // Calculer les données à afficher selon l'offset
  const getDisplayedData = () => {
    if (stats.monthlyData.length === 0) return []
    
    // Toujours afficher 6 mois
    // monthOffset négatif = passé, positif = futur
    // On part de la fin (mois récents) et on décale
    const baseIndex = stats.monthlyData.length - 6 // Index de base (6 derniers mois)
    const startIndex = Math.max(0, Math.min(baseIndex - monthOffset, stats.monthlyData.length - 6))
    const endIndex = startIndex + 6
    
    return stats.monthlyData.slice(startIndex, endIndex)
  }

  const statCards = [
    {
      title: 'Revenus totaux',
      value: formatCurrency(stats.totalRevenue),
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
      change: '+12%',
      trend: 'up',
    },
    {
      title: 'Dépenses totales',
      value: formatCurrency(stats.totalExpenses),
      icon: TrendingDown,
      color: 'from-red-500 to-red-600',
      change: '-5%',
      trend: 'down',
    },
    {
      title: 'Bénéfice brut',
      value: formatCurrency(stats.profit),
      icon: DollarSign,
      color: 'from-blue-500 to-blue-600',
      change: '+18%',
      trend: 'up',
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
            Suivez vos revenus, dépenses et bénéfices
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exporter CSV
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="w-4 h-4 mr-2" />
            Exporter PDF
          </Button>
          <Button onClick={() => setShowExpenseForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter une dépense
          </Button>
        </div>
      </motion.div>

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
                    <div className={`flex items-center gap-1 text-sm font-medium ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.trend === 'up' ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      {stat.change}
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Évolution des revenus</CardTitle>
              <CardDescription>Revenus sur les 6 derniers mois</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Revenus"
                  />
                  <Line
                    type="monotone"
                    dataKey="expenses"
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="Dépenses"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Bénéfices bruts mensuels</CardTitle>
                  <CardDescription>
                    Navigation dans le temps
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {(() => {
                    const maxOffset = Math.max(0, stats.monthlyData.length - 6)
                    const canGoLeft = monthOffset < maxOffset
                    const canGoRight = monthOffset > 0
                    
                    return (
                      <>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            const newOffset = Math.min(monthOffset + 1, maxOffset)
                            setMonthOffset(newOffset)
                          }}
                          disabled={!canGoLeft || stats.monthlyData.length === 0}
                          className="h-9 w-9"
                          title="Voir le passé"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-sm font-medium min-w-[120px] text-center">
                          {monthOffset === 0 
                            ? 'Période actuelle' 
                            : monthOffset > 0
                              ? `${monthOffset} mois ${monthOffset === 1 ? 'passé' : 'passés'}`
                              : 'Période actuelle'
                          }
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            const newOffset = Math.max(monthOffset - 1, 0)
                            setMonthOffset(newOffset)
                          }}
                          disabled={!canGoRight || stats.monthlyData.length === 0}
                          className="h-9 w-9"
                          title="Voir le futur"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </>
                    )
                  })()}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getDisplayedData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="profit" fill="#10b981" name="Bénéfice brut" radius={[8, 8, 0, 0]}>
                    {getDisplayedData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#10b981" />
                    ))}
                    <LabelList 
                      dataKey="profit" 
                      position="top" 
                      formatter={(value: number) => formatCurrency(value)}
                      className="text-xs font-semibold fill-foreground"
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>


      {/* Formulaire d'ajout/modification de dépense */}
      <AnimatePresence>
        {showExpenseForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => resetExpenseForm()}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-xl shadow-2xl max-w-md w-full border border-border"
            >
              <Card className="border-0">
                <CardHeader className="border-b border-border">
                  <div className="flex items-center justify-between">
                    <CardTitle>{editingExpense ? 'Modifier la dépense' : 'Nouvelle dépense'}</CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => resetExpenseForm()}>
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleExpenseSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Input
                        id="description"
                        value={expenseForm.description}
                        onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                        placeholder="Ex: Achat de matériel plomberie"
                        required
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Catégorie *</Label>
                      <select
                        id="category"
                        value={expenseForm.category}
                        onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                        required
                        className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="matériel">Matériel</option>
                        <option value="transport">Transport</option>
                        <option value="autre">Autre</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="amount">Montant (€) *</Label>
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          min="0"
                          value={expenseForm.amount}
                          onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                          required
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="date">Date *</Label>
                        <Input
                          id="date"
                          type="date"
                          value={expenseForm.date}
                          onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                          required
                          className="h-11"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="receipt">Justificatif (URL optionnel)</Label>
                      <Input
                        id="receipt"
                        type="url"
                        value={expenseForm.receipt}
                        onChange={(e) => setExpenseForm({ ...expenseForm, receipt: e.target.value })}
                        placeholder="https://..."
                        className="h-11"
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => resetExpenseForm()} className="flex-1">
                        Annuler
                      </Button>
                      <Button type="submit" className="flex-1">
                        {editingExpense ? 'Modifier' : 'Ajouter'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

