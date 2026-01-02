'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FileText, Plus, Download, Eye, CheckCircle2, XCircle, Clock, Search, Filter, X, Trash2, Wrench, FileDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Logo } from '@/components/Logo'
import { generateInvoicePDF } from '@/lib/pdf-generator'
import ClientSearchSelect from '@/components/ClientSearchSelect'
// Import dynamique pour éviter les problèmes de chargement
// import { exportInvoices } from '@/lib/export'

interface InvoiceItem {
  description: string
  quantity: number // Entier maintenant
  unitPrice: number
  total: number
}

interface Invoice {
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
  items: InvoiceItem[]
}

interface Client {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string
}

export default function FacturesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
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
  const [globalStats, setGlobalStats] = useState({
    total: 0,
    sent: 0,
    paid: 0,
    totalAmount: 0,
  })
  const [showForm, setShowForm] = useState(false)
  const [showDetails, setShowDetails] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    clientId: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    taxRate: '20', // Taux de TVA en pourcentage
    notes: '',
    items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }] as InvoiceItem[],
  })

  useEffect(() => {
    fetchInvoices(currentPage, searchTerm, statusFilter)
    fetchClients()
  }, [currentPage, searchTerm, statusFilter])

  // Fonctions utilitaires

  const fetchInvoices = async (page: number = 1, search: string = '', status: string = 'all') => {
    try {
      setLoading(true)
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : ''
      const statusParam = status !== 'all' ? `&status=${status}` : ''
      const res = await fetch(`/api/invoices?page=${page}&limit=10${searchParam}${statusParam}`)
      const data = await res.json()
      if (res.ok) {
        console.log('Factures reçues:', data.invoices?.length || 0, 'sur', data.pagination?.total || 0)
        setInvoices(data.invoices || [])
        setPagination(data.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 1,
        })
        // Mettre à jour les statistiques globales si elles sont fournies par l'API
        if (data.stats) {
          setGlobalStats(data.stats)
        }
      } else {
        console.error('Erreur API factures:', data)
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
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

  const calculateTotals = (items: InvoiceItem[], taxRate: number) => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0)
    const tax = subtotal * (taxRate / 100)
    const total = subtotal + tax
    return { subtotal, tax, total }
  }

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...formData.items]
    if (field === 'quantity') {
      // S'assurer que la quantité est un entier
      const intValue = Math.max(1, Math.floor(Number(value)))
      newItems[index] = {
        ...newItems[index],
        quantity: intValue,
      }
    } else if (field === 'unitPrice') {
      const numValue = parseFloat(String(value)) || 0
      newItems[index] = {
        ...newItems[index],
        unitPrice: numValue,
      }
    } else {
      newItems[index] = {
        ...newItems[index],
        [field]: value,
      }
    }
    // Toujours recalculer le total après modification de quantity ou unitPrice
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = Number(newItems[index].quantity) || 0
      const unitPrice = Number(newItems[index].unitPrice) || 0
      newItems[index].total = Math.round((quantity * unitPrice) * 100) / 100 // Arrondir à 2 décimales
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
    
    // Validation des items
    const validItems = formData.items.filter(item => item.description.trim() !== '')
    if (validItems.length === 0) {
      alert('Veuillez ajouter au moins un article avec une description')
      return
    }
    
    const { subtotal, tax, total } = calculateTotals(validItems, parseFloat(formData.taxRate))

    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: formData.clientId,
          date: formData.date,
          dueDate: formData.dueDate || null,
          subtotal,
          taxRate: parseFloat(formData.taxRate),
          tax,
          total,
          notes: formData.notes || null,
          items: validItems,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        fetchInvoices(currentPage)
        resetForm()
      } else {
        // Afficher l'erreur retournée par l'API
        alert(`Erreur: ${data.error || 'Impossible de créer la facture'}`)
        console.error('Error response:', data)
      }
    } catch (error) {
      console.error('Error creating invoice:', error)
      alert('Une erreur est survenue lors de la création de la facture. Vérifiez la console pour plus de détails.')
    }
  }

  const resetForm = () => {
    setFormData({
      clientId: '',
      date: new Date().toISOString().split('T')[0],
      dueDate: '',
      taxRate: '20', // Taux de TVA en pourcentage
      notes: '',
      items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
    })
    setShowForm(false)
  }

  const handleDownloadPDF = async (id: string) => {
    const invoice = invoices.find((inv) => inv.id === id)
    if (invoice) {
      try {
        // Récupérer les informations de l'artisan et la personnalisation
        const [artisanRes, customizationRes] = await Promise.all([
          fetch('/api/artisan'),
          fetch('/api/invoice-customization'),
        ])
        
        let artisan = null
        let customization = null
        
        if (artisanRes.ok) {
          artisan = await artisanRes.json()
        }
        
        if (customizationRes.ok) {
          customization = await customizationRes.json()
        }
        
        generateInvoicePDF({ ...invoice, artisan, customization })
      } catch (error) {
        console.error('Error fetching info:', error)
        // Générer quand même le PDF sans les infos
        generateInvoicePDF(invoice)
      }
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        fetchInvoices(currentPage)
      }
    } catch (error) {
      console.error('Error updating invoice status:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5"
    switch (status) {
      case 'paid':
        return (
          <span className={`${baseClasses} bg-success/20 text-success border border-success/30`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            Payée
          </span>
        )
      case 'sent':
        return (
          <span className={`${baseClasses} bg-accent/20 text-accent border border-accent/30`}>
            <Clock className="w-3.5 h-3.5" />
            Envoyée
          </span>
        )
      case 'overdue':
        return (
          <span className={`${baseClasses} bg-destructive/20 text-destructive border border-destructive/30`}>
            <XCircle className="w-3.5 h-3.5" />
            En retard
          </span>
        )
      default:
        return (
          <span className={`${baseClasses} bg-muted text-muted-foreground border border-border`}>
            Brouillon
          </span>
        )
    }
  }

  // Recherche côté serveur - pas besoin de filtrage côté client
  const filteredInvoices = invoices

  // Trouver la facture sélectionnée
  const selectedInvoice = showDetails ? invoices.find((inv) => inv.id === showDetails) : null

  // Calculer les totaux pour l'affichage dans le formulaire
  const { subtotal, tax, total } = calculateTotals(
    formData.items,
    parseFloat(formData.taxRate)
  )

  // Rendu principal
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold mb-2">Factures</h1>
          <p className="text-muted-foreground">
            Gérez vos factures et devis professionnels
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={() => {
              try {
                const { exportInvoices } = require('@/lib/export')
                exportInvoices(filteredInvoices, `factures-${new Date().toISOString().split('T')[0]}`)
              } catch (error) {
                console.error('Erreur lors de l\'export:', error)
                alert('Erreur lors de l\'export. Veuillez réessayer.')
              }
            }}
            className="w-full sm:w-auto"
          >
            <FileDown className="w-4 h-4 mr-2" />
            Exporter CSV
          </Button>
          <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle facture
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
            placeholder="Rechercher une facture..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1) // Réinitialiser à la page 1 lors d'une recherche
            }}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'draft', 'sent', 'paid', 'overdue'].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setStatusFilter(status)
                setCurrentPage(1) // Réinitialiser à la page 1 lors d'un changement de filtre
              }}
              className="capitalize"
            >
              {status === 'all' ? 'Toutes' : status === 'draft' ? 'Brouillons' : status === 'sent' ? 'Envoyées' : status === 'paid' ? 'Payées' : 'En retard'}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total factures', value: globalStats.total, color: 'primary' },
          { label: 'En attente', value: globalStats.sent, color: 'accent' },
          { label: 'Payées', value: globalStats.paid, color: 'success' },
          {
            label: 'Montant total',
            value: formatCurrency(globalStats.totalAmount),
            color: 'secondary',
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.05 }}
          >
            <Card className="border border-border">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Invoices List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredInvoices.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' ? 'Aucune facture trouvée' : 'Aucune facture pour le moment'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredInvoices.map((invoice, index) => (
            <motion.div
              key={invoice.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              whileHover={{ y: -2 }}
            >
              <Card className="border border-border hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => setShowDetails(invoice.id)}>
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-lg font-semibold">
                          Facture #{invoice.invoiceNumber}
                        </h3>
                        {getStatusBadge(invoice.status)}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span>
                          <strong>Client:</strong> {invoice.client.firstName} {invoice.client.lastName}
                        </span>
                        <span>
                          <strong>Date:</strong> {formatDate(invoice.date)}
                        </span>
                        {invoice.dueDate && (
                          <span>
                            <strong>Échéance:</strong> {formatDate(invoice.dueDate)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold">{formatCurrency(invoice.total)}</p>
                        <p className="text-xs text-muted-foreground">TTC</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={invoice.status}
                          onChange={(e) => {
                            e.stopPropagation()
                            handleStatusChange(invoice.id, e.target.value)
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs px-2 py-1.5 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="draft">Brouillon</option>
                          <option value="sent">Envoyée</option>
                          <option value="paid">Payée</option>
                          <option value="overdue">En retard</option>
                        </select>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowDetails(invoice.id)
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDownloadPDF(invoice.id)
                          }}
                          title="Télécharger PDF"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          
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
        </div>
      )}

      {/* Create Invoice Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={resetForm}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-border"
            >
              <Card className="border-0">
                <CardHeader className="border-b border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">Nouvelle facture</CardTitle>
                      <CardDescription>Créez une facture professionnelle</CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={resetForm}>
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <Label htmlFor="dueDate">Date d'échéance</Label>
                        <Input
                          id="dueDate"
                          type="date"
                          value={formData.dueDate}
                          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
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
                          <div key={index} className="grid grid-cols-12 gap-2 items-end p-3 border border-border rounded-lg">
                            <div className="col-span-5">
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
                            <div className="col-span-2">
                              <Label className="text-xs">Total</Label>
                              <Input
                                type="number"
                                value={item.total.toFixed(2)}
                                readOnly
                                className="h-9 bg-muted"
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
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        ))}
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

                    <div className="border-t border-border pt-4 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total HT:</span>
                        <span className="font-semibold">{formatCurrency(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">TVA ({formData.taxRate}%):</span>
                        <span className="font-semibold">{formatCurrency(tax)}</span>
                      </div>
                      <div className="flex justify-between text-xl font-bold pt-3 border-t-2 border-primary/30">
                        <span>Total TTC:</span>
                        <span className="text-primary">{formatCurrency(total)}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-4">
                      <Button type="button" variant="outline" onClick={resetForm}>
                        Annuler
                      </Button>
                      <Button type="submit" disabled={!formData.clientId || formData.items.length === 0}>
                        Créer la facture
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invoice Details Modal */}
      <AnimatePresence>
        {showDetails && selectedInvoice && (
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
                <CardHeader className="border-b border-border no-print">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">Facture #{selectedInvoice.invoiceNumber}</CardTitle>
                      <div className="flex items-center gap-3 mt-2">
                        {getStatusBadge(selectedInvoice.status)}
                        <select
                          value={selectedInvoice.status}
                          onChange={(e) => handleStatusChange(selectedInvoice.id, e.target.value)}
                          className="text-xs px-3 py-1.5 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="draft">Brouillon</option>
                          <option value="sent">Envoyée</option>
                          <option value="paid">Payée</option>
                          <option value="overdue">En retard</option>
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
                      <h2 className="text-2xl font-bold mb-1">FACTURE</h2>
                      <p className="text-sm text-muted-foreground">N° {selectedInvoice.invoiceNumber}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-2">Client</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedInvoice.client.firstName} {selectedInvoice.client.lastName}
                        <br />
                        {selectedInvoice.client.email && (
                          <>
                            {selectedInvoice.client.email}
                            <br />
                          </>
                        )}
                        {selectedInvoice.client.phone}
                        {selectedInvoice.client.address && (
                          <>
                            <br />
                            {selectedInvoice.client.address}
                          </>
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <h3 className="font-semibold mb-2">Informations</h3>
                      <p className="text-sm text-muted-foreground">
                        Date: {formatDate(selectedInvoice.date)}
                        <br />
                        {selectedInvoice.dueDate && (
                          <>
                            Échéance: {formatDate(selectedInvoice.dueDate)}
                            <br />
                          </>
                        )}
                        Numéro: {selectedInvoice.invoiceNumber}
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
                        {selectedInvoice.items.map((item, index) => (
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
                      <span className="font-semibold">{formatCurrency(selectedInvoice.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">TVA ({selectedInvoice.taxRate || 20}%):</span>
                      <span className="font-semibold">{formatCurrency(selectedInvoice.tax)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold pt-3 border-t-2 border-primary/30">
                      <span>Total TTC:</span>
                      <span className="text-primary">{formatCurrency(selectedInvoice.total)}</span>
                    </div>
                  </div>

                  {selectedInvoice.notes && (
                    <div className="border-t border-border pt-4">
                      <h3 className="font-semibold mb-2">Notes</h3>
                      <p className="text-sm text-muted-foreground">{selectedInvoice.notes}</p>
                    </div>
                  )}


                  <div className="flex gap-2 justify-end pt-4 border-t border-border no-print">
                    <Button variant="outline" onClick={() => window.print()}>
                      <FileText className="w-4 h-4 mr-2" />
                      Imprimer
                    </Button>
                    <Button onClick={() => handleDownloadPDF(selectedInvoice.id)}>
                      <Download className="w-4 h-4 mr-2" />
                      Télécharger PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Version imprimable cachée */}
      {showDetails && selectedInvoice && (
        <div className="hidden print:block fixed inset-0 bg-white p-8 z-50">
          <div className="max-w-4xl mx-auto">
            {/* En-tête avec logo */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-gray-300">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl" style={{ backgroundColor: 'rgb(30, 64, 175)' }}>
                  <div className="w-full h-full flex items-center justify-center">
                    <Wrench className="w-10 h-10 text-white" strokeWidth={2} />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">ArtisanPro</h1>
                  <p className="text-sm text-gray-600">Gestion professionnelle</p>
                </div>
              </div>
              <div className="text-right">
                <h1 className="text-3xl font-bold mb-1 text-gray-900">FACTURE</h1>
                <p className="text-gray-600">N° {selectedInvoice.invoiceNumber}</p>
              </div>
            </div>

            {/* Informations */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">Facturé à :</h3>
                <p className="text-gray-700">
                  {selectedInvoice.client.firstName} {selectedInvoice.client.lastName}
                  <br />
                  {selectedInvoice.client.email && (
                    <>
                      {selectedInvoice.client.email}
                      <br />
                    </>
                  )}
                  {selectedInvoice.client.phone}
                  {selectedInvoice.client.address && (
                    <>
                      <br />
                      {selectedInvoice.client.address}
                    </>
                  )}
                </p>
              </div>
              <div className="text-right">
                <h3 className="font-bold text-lg mb-2 text-gray-900">Informations :</h3>
                <p className="text-gray-700">
                  Date d'émission : {formatDate(selectedInvoice.date)}
                  <br />
                  {selectedInvoice.dueDate && (
                    <>
                      Date d'échéance : {formatDate(selectedInvoice.dueDate)}
                      <br />
                    </>
                  )}
                  Statut : {selectedInvoice.status === 'paid' ? 'Payée' : 
                           selectedInvoice.status === 'sent' ? 'Envoyée' : 
                           selectedInvoice.status === 'overdue' ? 'En retard' : 'Brouillon'}
                </p>
              </div>
            </div>

            {/* Tableau des articles */}
            <div className="mb-8">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-3 text-left font-bold text-gray-900">Description</th>
                    <th className="border border-gray-300 px-4 py-3 text-right font-bold text-gray-900">Quantité</th>
                    <th className="border border-gray-300 px-4 py-3 text-right font-bold text-gray-900">Prix unitaire</th>
                    <th className="border border-gray-300 px-4 py-3 text-right font-bold text-gray-900">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.items.map((item, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">{item.description}</td>
                      <td className="border border-gray-300 px-4 py-3 text-right text-gray-700">{item.quantity}</td>
                      <td className="border border-gray-300 px-4 py-3 text-right text-gray-700">{formatCurrency(item.unitPrice)}</td>
                      <td className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-900">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totaux */}
            <div className="flex justify-end mb-8">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>Sous-total HT :</span>
                  <span className="font-medium">{formatCurrency(selectedInvoice.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>TVA :</span>
                  <span className="font-medium">{formatCurrency(selectedInvoice.tax)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-2 border-t-2 border-gray-300 text-gray-900">
                  <span>Total TTC :</span>
                  <span>{formatCurrency(selectedInvoice.total)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {selectedInvoice.notes && (
              <div className="mt-8 pt-6 border-t border-gray-300">
                <h3 className="font-bold text-lg mb-2 text-gray-900">Notes :</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedInvoice.notes}</p>
              </div>
            )}

            {/* Pied de page */}
            <div className="mt-12 pt-6 border-t border-gray-300 text-center text-sm text-gray-500">
              <p>Merci de votre confiance !</p>
              <p className="mt-2">ArtisanPro - Gestion professionnelle pour artisans</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
