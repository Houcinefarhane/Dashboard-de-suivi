'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, X, Edit, Trash2, Search, Filter, TrendingDown, FileDown, Info, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Expense {
  id: string
  description: string
  category: string
  amount: number
  date: string
  receipt: string | null
  createdAt: string
  invoiceId: string | null
  invoice?: {
    id: string
    invoiceNumber: string
    date: string
    dueDate: string | null
    status: string
    subtotal: number
    taxRate: number
    tax: number
    total: number
    notes: string | null
    client: {
      id: string
      firstName: string
      lastName: string
      email: string | null
      phone: string
      address: string | null
    }
    items: Array<{
      id: string
      description: string
      quantity: number
      unitPrice: number
      total: number
    }>
  } | null
}

export default function DepensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [hoveredExpense, setHoveredExpense] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  })
  const [totalAmount, setTotalAmount] = useState(0)
  const [formData, setFormData] = useState({
    description: '',
    category: 'matériel',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    receipt: '',
  })

  useEffect(() => {
    fetchExpenses(currentPage, searchTerm, categoryFilter)
  }, [currentPage, searchTerm, categoryFilter])

  const fetchExpenses = async (page: number = 1, search: string = '', category: string = 'all') => {
    try {
      setLoading(true)
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : ''
      const categoryParam = category !== 'all' ? `&category=${encodeURIComponent(category)}` : ''
      const res = await fetch(`/api/expenses?page=${page}&limit=10${searchParam}${categoryParam}`)
      const data = await res.json()
      if (res.ok) {
        setExpenses(data.expenses || [])
        setPagination(data.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 1,
        })
        setTotalAmount(data.totalAmount || 0)
      }
    } catch (error) {
      console.error('Error fetching expenses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = editingExpense ? `/api/expenses/${editingExpense.id}` : '/api/expenses'
    const method = editingExpense ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: formData.description,
          category: formData.category,
          amount: formData.amount,
          date: formData.date,
          receipt: formData.receipt || null,
        }),
      })

      if (res.ok) {
        fetchExpenses(currentPage)
        resetForm()
      }
    } catch (error) {
      console.error('Error saving expense:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) return

    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchExpenses(currentPage)
      }
    } catch (error) {
      console.error('Error deleting expense:', error)
    }
  }

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setFormData({
      description: expense.description,
      category: expense.category,
      amount: expense.amount.toString(),
      date: expense.date.split('T')[0],
      receipt: expense.receipt || '',
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      description: '',
      category: 'matériel',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      receipt: '',
    })
    setEditingExpense(null)
    setShowForm(false)
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

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'matériel':
        return 'Matériel'
      case 'transport':
        return 'Transport'
      default:
        return 'Autre'
    }
  }

  // Recherche côté serveur - pas besoin de filtrage côté client
  const filteredExpenses = expenses

  // Dépenses récentes (10 dernières) - depuis toutes les dépenses chargées
  const recentExpenses = expenses
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)

  const handleExpenseClick = (expense: Expense) => {
    setSelectedExpense(expense)
    setShowDetails(true)
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold mb-2">Dépenses</h1>
          <p className="text-muted-foreground">
            Gérez et suivez toutes vos dépenses professionnelles
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={async () => {
              try {
                const { exportExpenses } = require('@/lib/export')
                exportExpenses(expenses, `depenses-${new Date().toISOString().split('T')[0]}`)
              } catch (error) {
                console.error('Erreur lors de l\'export:', error)
                alert('Erreur lors de l\'export. Veuillez réessayer.')
              }
            }}
            className="w-full sm:w-auto"
          >
            <FileDown className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle dépense
          </Button>
        </div>
      </motion.div>

      {/* Filtres */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="Rechercher une dépense..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1) // Réinitialiser à la page 1 lors d'une recherche
            }}
            className="pl-10 h-11"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value)
              setCurrentPage(1) // Réinitialiser à la page 1 lors d'un changement de filtre
            }}
            className="flex h-11 w-full sm:w-48 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="all">Toutes les catégories</option>
            <option value="matériel">Matériel</option>
            <option value="transport">Transport</option>
            <option value="autre">Autre</option>
          </select>
        </div>
      </motion.div>

      {/* Dépenses récentes */}
      {recentExpenses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Dépenses récentes</CardTitle>
              <CardDescription>Les 10 dernières dépenses enregistrées</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentExpenses.map((expense) => (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-all cursor-pointer"
                    onClick={() => handleExpenseClick(expense)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-sm">{expense.description}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs border ${getCategoryColor(expense.category)}`}>
                          {getCategoryLabel(expense.category)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(expense.date)}
                      </p>
                    </div>
                    <div className="relative flex items-center gap-2">
                      <span 
                        className="text-lg font-bold text-destructive cursor-pointer hover:underline"
                        onClick={() => handleExpenseClick(expense)}
                      >
                        -{formatCurrency(expense.amount)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onMouseEnter={() => setHoveredExpense(expense.id)}
                        onMouseLeave={() => setHoveredExpense(null)}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleExpenseClick(expense)
                        }}
                      >
                        <Eye className="w-4 h-4 text-muted-foreground hover:text-primary" />
                      </Button>
                      {hoveredExpense === expense.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute right-0 top-8 z-50 w-80 bg-card border border-border rounded-lg shadow-xl p-4 max-h-96 overflow-y-auto"
                          onMouseEnter={() => setHoveredExpense(expense.id)}
                          onMouseLeave={() => setHoveredExpense(null)}
                        >
                          {expense.invoice ? (
                            <div className="space-y-3">
                              <div className="border-b border-border pb-2">
                                <p className="text-xs text-muted-foreground mb-1">Facture associée</p>
                                <p className="text-sm font-bold">Facture #{expense.invoice.invoiceNumber}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Client</p>
                                <p className="text-sm font-semibold">
                                  {expense.invoice.client.firstName} {expense.invoice.client.lastName}
                                </p>
                                {expense.invoice.client.email && (
                                  <p className="text-xs text-muted-foreground">{expense.invoice.client.email}</p>
                                )}
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Date facture</p>
                                <p className="text-sm">{formatDate(expense.invoice.date)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Articles</p>
                                <div className="space-y-1 mt-1">
                                  {expense.invoice.items.slice(0, 3).map((item, idx) => (
                                    <div key={idx} className="text-xs flex justify-between">
                                      <span className="truncate flex-1">{item.description}</span>
                                      <span className="ml-2">{formatCurrency(item.total)}</span>
                                    </div>
                                  ))}
                                  {expense.invoice.items.length > 3 && (
                                    <p className="text-xs text-muted-foreground">
                                      +{expense.invoice.items.length - 3} autre(s)
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="border-t border-border pt-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Total HT:</span>
                                  <span className="font-semibold">{formatCurrency(expense.invoice.subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">TVA ({expense.invoice.taxRate}%):</span>
                                  <span className="font-semibold">{formatCurrency(expense.invoice.tax)}</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold pt-1 border-t border-border mt-1">
                                  <span>Total TTC:</span>
                                  <span className="text-primary">{formatCurrency(expense.invoice.total)}</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div>
                                <p className="text-xs text-muted-foreground">Description</p>
                                <p className="text-sm font-semibold">{expense.description}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Catégorie</p>
                                <span className={`inline-block px-2 py-0.5 rounded-full text-xs border ${getCategoryColor(expense.category)}`}>
                                  {getCategoryLabel(expense.category)}
                                </span>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Date</p>
                                <p className="text-sm">{formatDate(expense.date)}</p>
                              </div>
                              {expense.receipt && (
                                <div>
                                  <p className="text-xs text-muted-foreground">Justificatif</p>
                                  <a
                                    href={expense.receipt}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:underline break-all"
                                  >
                                    Voir le justificatif
                                  </a>
                                </div>
                              )}
                              <p className="text-xs text-muted-foreground italic">Aucune facture associée</p>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-lg bg-destructive/20 flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-destructive" />
                </div>
              </div>
              <CardTitle className="text-2xl mt-4">
                {formatCurrency(totalAmount)}
              </CardTitle>
              <CardDescription>Total des dépenses</CardDescription>
            </CardHeader>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{pagination.total}</CardTitle>
              <CardDescription>Nombre de dépenses</CardDescription>
            </CardHeader>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                {formatCurrency(
                  pagination.total > 0 ? totalAmount / pagination.total : 0
                )}
              </CardTitle>
              <CardDescription>Moyenne par dépense</CardDescription>
            </CardHeader>
          </Card>
        </motion.div>
      </div>

      {/* Liste des dépenses avec pagination */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : expenses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <TrendingDown className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Aucune dépense enregistrée
            </p>
            <Button onClick={() => setShowForm(true)} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter votre première dépense
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {filteredExpenses.map((expense, index) => (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="flex items-center justify-between p-4 hover:bg-muted/50 transition-all"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold">{expense.description}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs border ${getCategoryColor(expense.category)}`}>
                          {getCategoryLabel(expense.category)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(expense.date)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="relative flex items-center gap-2">
                        <span 
                          className="text-lg font-bold text-destructive cursor-pointer hover:underline"
                          onClick={() => handleExpenseClick(expense)}
                        >
                          -{formatCurrency(expense.amount)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onMouseEnter={() => setHoveredExpense(expense.id)}
                          onMouseLeave={() => setHoveredExpense(null)}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleExpenseClick(expense)
                          }}
                        >
                          <Eye className="w-4 h-4 text-muted-foreground hover:text-primary" />
                        </Button>
                        {hoveredExpense === expense.id && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute right-0 top-8 z-50 w-80 bg-card border border-border rounded-lg shadow-xl p-4 max-h-96 overflow-y-auto"
                            onMouseEnter={() => setHoveredExpense(expense.id)}
                            onMouseLeave={() => setHoveredExpense(null)}
                          >
                            {expense.invoice ? (
                              <div className="space-y-3">
                                <div className="border-b border-border pb-2">
                                  <p className="text-xs text-muted-foreground mb-1">Facture associée</p>
                                  <p className="text-sm font-bold">Facture #{expense.invoice.invoiceNumber}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Client</p>
                                  <p className="text-sm font-semibold">
                                    {expense.invoice.client.firstName} {expense.invoice.client.lastName}
                                  </p>
                                  {expense.invoice.client.email && (
                                    <p className="text-xs text-muted-foreground">{expense.invoice.client.email}</p>
                                  )}
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Date facture</p>
                                  <p className="text-sm">{formatDate(expense.invoice.date)}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Articles</p>
                                  <div className="space-y-1 mt-1">
                                    {expense.invoice.items.slice(0, 3).map((item, idx) => (
                                      <div key={idx} className="text-xs flex justify-between">
                                        <span className="truncate flex-1">{item.description}</span>
                                        <span className="ml-2">{formatCurrency(item.total)}</span>
                                      </div>
                                    ))}
                                    {expense.invoice.items.length > 3 && (
                                      <p className="text-xs text-muted-foreground">
                                        +{expense.invoice.items.length - 3} autre(s)
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="border-t border-border pt-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Total HT:</span>
                                    <span className="font-semibold">{formatCurrency(expense.invoice.subtotal)}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">TVA ({expense.invoice.taxRate}%):</span>
                                    <span className="font-semibold">{formatCurrency(expense.invoice.tax)}</span>
                                  </div>
                                  <div className="flex justify-between text-sm font-bold pt-1 border-t border-border mt-1">
                                    <span>Total TTC:</span>
                                    <span className="text-primary">{formatCurrency(expense.invoice.total)}</span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div>
                                  <p className="text-xs text-muted-foreground">Description</p>
                                  <p className="text-sm font-semibold">{expense.description}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Catégorie</p>
                                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs border ${getCategoryColor(expense.category)}`}>
                                    {getCategoryLabel(expense.category)}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Date</p>
                                  <p className="text-sm">{formatDate(expense.date)}</p>
                                </div>
                                {expense.receipt && (
                                  <div>
                                    <p className="text-xs text-muted-foreground">Justificatif</p>
                                    <a
                                      href={expense.receipt}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-primary hover:underline break-all"
                                    >
                                      Voir le justificatif
                                    </a>
                                  </div>
                                )}
                                <p className="text-xs text-muted-foreground italic">Aucune facture associée</p>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEdit(expense)
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(expense.id)
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contrôles de pagination */}
          {pagination.totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between pt-4"
            >
              <div className="text-sm text-muted-foreground">
                Page {pagination.page} sur {pagination.totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                  disabled={currentPage === pagination.totalPages}
                >
                  Suivant
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* Formulaire d'ajout/modification */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => resetForm()}
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
                    <Button variant="ghost" size="icon" onClick={() => resetForm()}>
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Input
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Ex: Achat de matériel plomberie"
                        required
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Catégorie *</Label>
                      <select
                        id="category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
                          value={formData.amount}
                          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                          required
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="date">Date *</Label>
                        <Input
                          id="date"
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
                        value={formData.receipt}
                        onChange={(e) => setFormData({ ...formData, receipt: e.target.value })}
                        placeholder="https://..."
                        className="h-11"
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => resetForm()} className="flex-1">
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

      {/* Détails de la dépense */}
      <AnimatePresence>
        {showDetails && selectedExpense && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowDetails(false)
              setSelectedExpense(null)
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-xl shadow-2xl max-w-2xl w-full border border-border"
            >
              <Card className="border-0">
                <CardHeader className="border-b border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">Détails de la dépense</CardTitle>
                      <CardDescription className="mt-2">
                        {formatDate(selectedExpense.date)}
                      </CardDescription>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => {
                        setShowDetails(false)
                        setSelectedExpense(null)
                      }}
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Informations principales */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-2 text-sm text-muted-foreground">Description</h3>
                      <p className="text-lg font-semibold">{selectedExpense.description}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2 text-sm text-muted-foreground">Catégorie</h3>
                      <span className={`inline-block px-3 py-1.5 rounded-full text-sm border ${getCategoryColor(selectedExpense.category)}`}>
                        {getCategoryLabel(selectedExpense.category)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-2 text-sm text-muted-foreground">Montant</h3>
                      <p className="text-3xl font-bold text-destructive">
                        -{formatCurrency(selectedExpense.amount)}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2 text-sm text-muted-foreground">Date</h3>
                      <p className="text-lg">{formatDate(selectedExpense.date)}</p>
                    </div>
                  </div>

                  {selectedExpense.receipt && (
                    <div>
                      <h3 className="font-semibold mb-2 text-sm text-muted-foreground">Justificatif</h3>
                      <a
                        href={selectedExpense.receipt}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline break-all"
                      >
                        {selectedExpense.receipt}
                      </a>
                    </div>
                  )}

                  <div className="flex gap-2 justify-end pt-4 border-t border-border">
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleEdit(selectedExpense)
                        setShowDetails(false)
                        setSelectedExpense(null)
                      }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Modifier
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        if (confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) {
                          handleDelete(selectedExpense.id)
                          setShowDetails(false)
                          setSelectedExpense(null)
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}