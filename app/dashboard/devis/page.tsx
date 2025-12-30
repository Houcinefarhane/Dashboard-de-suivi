'use client'
import { useEffect, useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FileText, Plus, Download, Eye, Search, Filter, X, Trash2, CheckCircle2, XCircle, Clock, AlertCircle, ArrowRight, FileDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Logo } from '@/components/Logo'
import { generateInvoicePDF } from '@/lib/pdf-generator'
import ClientSearchSelect from '@/components/ClientSearchSelect'

interface QuoteItem {
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface Quote {
  id: string
  quoteNumber: string
  date: string
  validUntil: string | null
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
  items: QuoteItem[]
}

interface Client {
  id: string
  firstName: string
  lastName: string
}

export default function DevisPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  })
  const [showForm, setShowForm] = useState(false)
  const [showDetails, setShowDetails] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    clientId: '',
    date: new Date().toISOString().split('T')[0],
    validUntil: '',
    taxRate: '20', // Taux de TVA en pourcentage
    notes: '',
    items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }] as QuoteItem[],
  })

  const fetchQuotes = async (page: number = 1, search: string = '', status: string = 'all') => {
    try {
      setLoading(true)
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : ''
      const statusParam = status !== 'all' ? `&status=${status}` : ''
      const res = await fetch(`/api/quotes?page=${page}&limit=10${searchParam}${statusParam}`)
      const data = await res.json()
      if (res.ok) {
        console.log('Devis reçus:', data.quotes?.length || 0, 'sur', data.pagination?.total || 0)
        setQuotes(data.quotes || [])
        setPagination(data.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 1,
        })
      } else {
        console.error('Erreur API devis:', data)
      }
    } catch (error) {
      console.error('Error fetching quotes:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients?page=1&limit=1000')
      const data = await res.json()
      if (res.ok) {
        setClients(data.clients || [])
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    }
  }

  useEffect(() => {
    fetchQuotes(currentPage, searchTerm, statusFilter)
    fetchClients()
  }, [currentPage, searchTerm, statusFilter])

  const calculateTotals = (items: QuoteItem[], taxRate: number) => {
    const subtotal = items.reduce((sum, item) => {
      const itemTotal = Number(item.total) || 0
      return sum + itemTotal
    }, 0)
    const tax = subtotal * ((Number(taxRate) || 20) / 100)
    const total = subtotal + tax
    return { 
      subtotal: Math.round(subtotal * 100) / 100, 
      tax: Math.round(tax * 100) / 100, 
      total: Math.round(total * 100) / 100 
    }
  }

  const updateItem = (index: number, field: keyof QuoteItem, value: string | number) => {
    const newItems = [...formData.items]
    if (field === 'quantity') {
      const intValue = Math.max(1, Math.floor(Number(value)))
      newItems[index] = {
        ...newItems[index],
        quantity: intValue,
      }
    } else {
      newItems[index] = {
        ...newItems[index],
        [field]: value,
      }
    }
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice
    }
    setFormData({ ...formData, items: newItems })
  }

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, unitPrice: 0, total: 0 }],
    })
  }

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.clientId) {
      alert('Veuillez sélectionner un client')
      return
    }
    
    const validItems = formData.items.filter(item => item.description.trim() !== '')
    if (validItems.length === 0) {
      alert('Veuillez ajouter au moins un article avec une description')
      return
    }
    
    const { subtotal, tax, total } = calculateTotals(validItems, parseFloat(formData.taxRate))

    // Préparer les données à envoyer
    const payload = {
      clientId: formData.clientId,
      date: formData.date,
      validUntil: formData.validUntil || null,
      subtotal,
      taxRate: parseFloat(formData.taxRate),
      tax,
      total,
      notes: formData.notes || null,
      items: validItems.map(item => ({
        description: item.description.trim(),
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
      })),
    }

    console.log('Creating quote with payload:', payload)

    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        fetchQuotes(currentPage)
        resetForm()
      } else {
        const errorData = await res.json()
        console.error('Error response:', errorData)
        alert(errorData.details || errorData.error || 'Erreur lors de la création du devis')
      }
    } catch (error: any) {
      console.error('Error creating quote:', error)
      alert(`Erreur lors de la création du devis: ${error?.message || 'Erreur inconnue'}`)
    }
  }

  const resetForm = () => {
    setFormData({
      clientId: '',
      date: new Date().toISOString().split('T')[0],
      validUntil: '',
      taxRate: '20',
      notes: '',
      items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
    })
    setShowForm(false)
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/quotes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        fetchQuotes(currentPage)
      }
    } catch (error) {
      console.error('Error updating quote status:', error)
    }
  }

  const handleConvertToInvoice = async (id: string) => {
    if (!confirm('Convertir ce devis en facture ?')) return

    try {
      const res = await fetch(`/api/quotes/${id}/convert`, {
        method: 'POST',
      })

      if (res.ok) {
        const invoice = await res.json()
        window.location.href = `/dashboard/factures?invoice=${invoice.id}`
      }
    } catch (error) {
      console.error('Error converting quote:', error)
    }
  }

  const getStatusBadge = useCallback((status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5"
    switch (status) {
      case 'accepted':
        return (
          <span className={`${baseClasses} bg-success/20 text-success border border-success/30`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            Accepté
          </span>
        )
      case 'sent':
        return (
          <span className={`${baseClasses} bg-accent/20 text-accent border border-accent/30`}>
            <Clock className="w-3.5 h-3.5" />
            Envoyé
          </span>
        )
      case 'rejected':
        return (
          <span className={`${baseClasses} bg-destructive/20 text-destructive border border-destructive/30`}>
            <XCircle className="w-3.5 h-3.5" />
            Refusé
          </span>
        )
      case 'expired':
        return (
          <span className={`${baseClasses} bg-muted text-muted-foreground border border-border`}>
            <AlertCircle className="w-3.5 h-3.5" />
            Expiré
          </span>
        )
      default:
        return (
          <span className={`${baseClasses} bg-muted text-muted-foreground border border-border`}>
            Brouillon
          </span>
        )
    }
  }, [])

  // Recherche côté serveur - pas besoin de filtrage côté client
  const filteredQuotes = useMemo(() => quotes, [quotes])

  const selectedQuote = useMemo(() => {
    return showDetails ? quotes.find((q) => q.id === showDetails) : null
  }, [quotes, showDetails])

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
          >
            <div>
              <h1 className="text-4xl font-bold mb-2">Devis</h1>
              <p className="text-muted-foreground">
                Créez et suivez vos devis professionnels
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    const { exportQuotes } = require('@/lib/export')
                    exportQuotes(quotes, `devis-${new Date().toISOString().split('T')[0]}`)
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
              <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Nouveau devis
              </Button>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Rechercher un devis..."
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
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setCurrentPage(1) // Réinitialiser à la page 1 lors d'un changement de filtre
                }}
                className="flex h-11 w-full sm:w-48 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">Tous les statuts</option>
                <option value="draft">Brouillon</option>
                <option value="sent">Envoyé</option>
                <option value="accepted">Accepté</option>
                <option value="rejected">Refusé</option>
                <option value="expired">Expiré</option>
              </select>
            </div>
          </motion.div>

          {/* Quotes List */}
          {filteredQuotes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== 'all' ? 'Aucun devis trouvé' : 'Aucun devis pour le moment'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredQuotes.map((quote, index) => (
                <motion.div
                  key={quote.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ y: -2 }}
                >
                  <Card className="border border-border hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => setShowDetails(quote.id)}>
                    <CardContent className="p-5">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-lg font-semibold">
                              Devis #{quote.quoteNumber}
                            </h3>
                            {getStatusBadge(quote.status)}
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span>
                              <strong>Client:</strong> {quote.client.firstName} {quote.client.lastName}
                            </span>
                            <span>
                              <strong>Date:</strong> {formatDate(quote.date)}
                            </span>
                            {quote.validUntil && (
                              <span>
                                <strong>Valide jusqu'au:</strong> {formatDate(quote.validUntil)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-2xl font-bold">{formatCurrency(quote.total)}</p>
                            <p className="text-xs text-muted-foreground">TTC</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              value={quote.status}
                              onChange={(e) => {
                                e.stopPropagation()
                                handleStatusChange(quote.id, e.target.value)
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs px-2 py-1.5 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                              <option value="draft">Brouillon</option>
                              <option value="sent">Envoyé</option>
                              <option value="accepted">Accepté</option>
                              <option value="rejected">Refusé</option>
                              <option value="expired">Expiré</option>
                            </select>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowDetails(quote.id)
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {quote.status === 'accepted' && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleConvertToInvoice(quote.id)
                                }}
                                title="Convertir en facture"
                              >
                                <ArrowRight className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
          
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

          {/* Formulaire de création */}
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
                  className="bg-card rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-border"
                >
                  <Card className="border-0">
                    <CardHeader className="border-b border-border">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl">Nouveau devis</CardTitle>
                        <Button variant="ghost" size="icon" onClick={() => resetForm()}>
                          <X className="w-5 h-5" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <ClientSearchSelect
                            value={formData.clientId}
                            onChange={(clientId) => setFormData({ ...formData, clientId })}
                            label="Client"
                            required
                          />
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
                          <div className="space-y-2">
                            <Label htmlFor="validUntil">Valide jusqu'au</Label>
                            <Input
                              id="validUntil"
                              type="date"
                              value={formData.validUntil}
                              onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                              className="h-11"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="taxRate">Taux de TVA</Label>
                            <select
                              id="taxRate"
                              value={formData.taxRate}
                              onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                              <option value="5">5%</option>
                              <option value="10">10%</option>
                              <option value="20">20%</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label>Articles</Label>
                            <Button type="button" variant="outline" size="sm" onClick={addItem}>
                              <Plus className="w-4 h-4 mr-2" />
                              Ajouter un article
                            </Button>
                          </div>
                          <div className="space-y-3">
                            {formData.items.map((item, index) => (
                              <div key={index} className="grid grid-cols-12 gap-2 items-end p-3 rounded-lg border border-border">
                                <div className="col-span-6">
                                  <Label className="text-xs">Description</Label>
                                  <Input
                                    value={item.description}
                                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                                    placeholder="Description de l'article"
                                    className="h-9"
                                  />
                                </div>
                                <div className="col-span-2">
                                  <Label className="text-xs">Quantité</Label>
                                  <Input
                                    type="number"
                                    step="1"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value) || 1
                                      updateItem(index, 'quantity', val)
                                    }}
                                    className="h-9"
                                  />
                                </div>
                                <div className="col-span-2">
                                  <Label className="text-xs">Prix unitaire</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={item.unitPrice}
                                    onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                    className="h-9"
                                  />
                                </div>
                                <div className="col-span-1">
                                  <Label className="text-xs">Total</Label>
                                  <Input
                                    type="number"
                                    value={item.total.toFixed(2)}
                                    disabled
                                    className="h-9"
                                  />
                                </div>
                                <div className="col-span-1">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeItem(index)}
                                    className="h-9 w-9"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="border-t border-border pt-4 space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Total HT:</span>
                            <span className="font-semibold">{formatCurrency(calculateTotals(formData.items, parseFloat(formData.taxRate)).subtotal)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">TVA ({formData.taxRate}%):</span>
                            <span className="font-semibold">{formatCurrency(calculateTotals(formData.items, parseFloat(formData.taxRate)).tax)}</span>
                          </div>
                          <div className="flex justify-between text-xl font-bold pt-3 border-t-2 border-primary/30">
                            <span>Total TTC:</span>
                            <span className="text-primary">{formatCurrency(calculateTotals(formData.items, parseFloat(formData.taxRate)).total)}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="notes">Notes (optionnel)</Label>
                          <textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            placeholder="Notes additionnelles..."
                          />
                        </div>

                        <div className="flex gap-2 justify-end pt-4 border-t border-border">
                          <Button type="button" variant="outline" onClick={() => resetForm()}>
                            Annuler
                          </Button>
                          <Button type="submit">
                            Créer le devis
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Vue détaillée du devis */}
          <AnimatePresence>
            {showDetails && selectedQuote && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setShowDetails(null)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-card rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-border"
                >
                  <Card className="border-0">
                    <CardHeader className="border-b border-border">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-2xl">Devis #{selectedQuote.quoteNumber}</CardTitle>
                          <div className="flex items-center gap-3 mt-2">
                            {getStatusBadge(selectedQuote.status)}
                            <select
                              value={selectedQuote.status}
                              onChange={(e) => handleStatusChange(selectedQuote.id, e.target.value)}
                              className="text-xs px-3 py-1.5 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                              <option value="draft">Brouillon</option>
                              <option value="sent">Envoyé</option>
                              <option value="accepted">Accepté</option>
                              <option value="rejected">Refusé</option>
                              <option value="expired">Expiré</option>
                            </select>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setShowDetails(null)}>
                          <X className="w-5 h-5" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      {/* Logo et en-tête */}
                      <div className="flex items-center justify-between pb-6 border-b border-border">
                        <Logo size="lg" />
                        <div className="text-right">
                          <h2 className="text-2xl font-bold mb-1">DEVIS</h2>
                          <p className="text-sm text-muted-foreground">N° {selectedQuote.quoteNumber}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-semibold mb-2">Client</h3>
                          <p className="text-sm text-muted-foreground">
                            {selectedQuote.client.firstName} {selectedQuote.client.lastName}
                            <br />
                            {selectedQuote.client.email && (
                              <>
                                {selectedQuote.client.email}
                                <br />
                              </>
                            )}
                            {selectedQuote.client.phone}
                            {selectedQuote.client.address && (
                              <>
                                <br />
                                {selectedQuote.client.address}
                              </>
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          <h3 className="font-semibold mb-2">Informations</h3>
                          <p className="text-sm text-muted-foreground">
                            Date: {formatDate(selectedQuote.date)}
                            <br />
                            {selectedQuote.validUntil && (
                              <>
                                Valide jusqu'au: {formatDate(selectedQuote.validUntil)}
                                <br />
                              </>
                            )}
                            Numéro: {selectedQuote.quoteNumber}
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-border pt-4">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left py-2 text-sm font-semibold">Description</th>
                              <th className="text-right py-2 text-sm font-semibold">Qté</th>
                              <th className="text-right py-2 text-sm font-semibold">Prix unit.</th>
                              <th className="text-right py-2 text-sm font-semibold">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedQuote.items.map((item, index) => (
                              <tr key={index} className="border-b border-border">
                                <td className="py-3 text-sm">{item.description}</td>
                                <td className="py-3 text-sm text-right">{item.quantity}</td>
                                <td className="py-3 text-sm text-right">{formatCurrency(item.unitPrice)}</td>
                                <td className="py-3 text-sm text-right font-medium">{formatCurrency(item.total)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="border-t border-border pt-4 space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total HT:</span>
                          <span className="font-semibold">{formatCurrency(selectedQuote.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">TVA ({selectedQuote.taxRate || 20}%):</span>
                          <span className="font-semibold">{formatCurrency(selectedQuote.tax)}</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold pt-3 border-t-2 border-primary/30">
                          <span>Total TTC:</span>
                          <span className="text-primary">{formatCurrency(selectedQuote.total)}</span>
                        </div>
                      </div>

                      {selectedQuote.notes && (
                        <div className="border-t border-border pt-4">
                          <h3 className="font-semibold mb-2">Notes</h3>
                          <p className="text-sm text-muted-foreground">{selectedQuote.notes}</p>
                        </div>
                      )}

                      <div className="flex gap-2 justify-end pt-4 border-t border-border">
                        {selectedQuote.status === 'accepted' && (
                          <Button onClick={() => handleConvertToInvoice(selectedQuote.id)}>
                            <ArrowRight className="w-4 h-4 mr-2" />
                            Convertir en facture
                          </Button>
                        )}
                        <Button variant="outline" onClick={() => window.print()}>
                          <Download className="w-4 h-4 mr-2" />
                          Imprimer
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  )
}