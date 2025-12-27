'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Package, Plus, AlertTriangle, Edit, Trash2, Search, Filter, X, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface StockItem {
  id: string
  name: string
  description: string | null
  category: string | null
  quantity: number
  unit: string
  unitPrice: number | null
  minQuantity: number | null
  supplier: string | null
}

// Catégories prédéfinies pour les artisans
const STOCK_CATEGORIES = [
  'Vis',
  'Boulons',
  'Clés',
  'Écrous',
  'Rondelles',
  'Tuyaux',
  'Raccords',
  'Colliers',
  'Joint',
  'Robinet',
  'Vanne',
  'Serrure',
  'Cylindre',
  'Gond',
  'Pêne',
  'Autre',
]

export default function StockPage() {
  const [items, setItems] = useState<StockItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<StockItem | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [showLowStock, setShowLowStock] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  })
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    quantity: '',
    unit: 'unité',
    unitPrice: '',
    minQuantity: '',
    supplier: '',
  })

  useEffect(() => {
    fetchItems(currentPage)
  }, [currentPage])

  const fetchItems = async (page: number = 1) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/stock?page=${page}&limit=10`)
      const data = await res.json()
      if (res.ok) {
        setItems(data.items || [])
        setPagination(data.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 1,
        })
      }
    } catch (error) {
      console.error('Error fetching stock items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = editingItem ? `/api/stock/${editingItem.id}` : '/api/stock'
    const method = editingItem ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          category: formData.category || null,
          quantity: parseFloat(formData.quantity),
          unit: formData.unit,
          unitPrice: formData.unitPrice ? parseFloat(formData.unitPrice) : null,
          minQuantity: formData.minQuantity ? parseFloat(formData.minQuantity) : null,
          supplier: formData.supplier || null,
        }),
      })

      if (res.ok) {
        fetchItems(currentPage)
        resetForm()
      }
    } catch (error) {
      console.error('Error saving stock item:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return

    try {
      const res = await fetch(`/api/stock/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchItems(currentPage)
      }
    } catch (error) {
      console.error('Error deleting stock item:', error)
    }
  }

  const handleEdit = (item: StockItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      description: item.description || '',
      category: item.category || '',
      quantity: item.quantity.toString(),
      unit: item.unit,
      unitPrice: item.unitPrice?.toString() || '',
      minQuantity: item.minQuantity?.toString() || '',
      supplier: item.supplier || '',
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      quantity: '',
      unit: 'unité',
      unitPrice: '',
      minQuantity: '',
      supplier: '',
    })
    setEditingItem(null)
    setShowForm(false)
  }

  // Filtrer les articles
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [items, searchTerm, categoryFilter])

  // Articles en stock faible
  const lowStockItems = useMemo(() => {
    return filteredItems.filter(
      (item) => item.minQuantity !== null && item.quantity <= item.minQuantity
    )
  }, [filteredItems])

  // Articles normaux (pas en stock faible)
  const normalStockItems = useMemo(() => {
    return filteredItems.filter(
      (item) => item.minQuantity === null || item.quantity > item.minQuantity
    )
  }, [filteredItems])

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold mb-2">Stock</h1>
          <p className="text-muted-foreground">
            Gérez votre matériel et inventaire
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Nouvel article
        </Button>
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
            placeholder="Rechercher un article..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="flex h-11 w-full sm:w-48 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="all">Toutes les catégories</option>
            {STOCK_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Stock faible - Affichage pliable */}
      {lowStockItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-orange-500 bg-orange-50 dark:bg-orange-950/20">
            <CardHeader 
              className="cursor-pointer hover:bg-orange-100/50 dark:hover:bg-orange-900/30 transition-colors"
              onClick={() => setShowLowStock(!showLowStock)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  <CardTitle>Stock faible</CardTitle>
                  <span className="px-2 py-1 rounded-full text-xs bg-orange-500 text-white font-semibold">
                    {lowStockItems.length}
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: showLowStock ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-5 h-5 text-orange-500" />
                </motion.div>
              </div>
              <CardDescription>
                {lowStockItems.length} article(s) nécessitant un réapprovisionnement
              </CardDescription>
            </CardHeader>
            <AnimatePresence>
              {showLowStock && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-orange-200 dark:border-orange-800">
                            <th className="text-left p-4 text-sm font-semibold">Article</th>
                            <th className="text-left p-4 text-sm font-semibold">Catégorie</th>
                            <th className="text-right p-4 text-sm font-semibold">Quantité actuelle</th>
                            <th className="text-right p-4 text-sm font-semibold">Stock minimum</th>
                            <th className="text-right p-4 text-sm font-semibold">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {lowStockItems.map((item) => (
                            <motion.tr
                              key={item.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="border-b border-orange-100 dark:border-orange-900/50 hover:bg-orange-100/50 dark:hover:bg-orange-900/20 transition-colors"
                            >
                              <td className="p-4">
                                <div>
                                  <p className="font-semibold">{item.name}</p>
                                  {item.description && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {item.description}
                                    </p>
                                  )}
                                </div>
                              </td>
                              <td className="p-4">
                                {item.category && (
                                  <span className="px-2 py-1 rounded-full text-xs bg-primary/20 text-primary border border-primary/30">
                                    {item.category}
                                  </span>
                                )}
                              </td>
                              <td className="p-4 text-right">
                                <span className="font-bold text-orange-600 dark:text-orange-400">
                                  {item.quantity}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <span className="font-semibold">{item.minQuantity}</span>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleEdit(item)
                                    }}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDelete(item.id)
                                    }}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      )}

      {/* Liste complète en format linéaire */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredItems.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchTerm || categoryFilter !== 'all' ? 'Aucun article trouvé' : 'Aucun article en stock'}
            </p>
            {!searchTerm && categoryFilter === 'all' && (
              <Button onClick={() => setShowForm(true)} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter votre premier article
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Tous les articles</CardTitle>
              <CardDescription>
                {filteredItems.length} article(s) au total
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 text-sm font-semibold">Article</th>
                      <th className="text-left p-4 text-sm font-semibold">Catégorie</th>
                      <th className="text-right p-4 text-sm font-semibold">Quantité</th>
                      <th className="text-right p-4 text-sm font-semibold">Stock min</th>
                      <th className="text-right p-4 text-sm font-semibold">Prix unitaire</th>
                      <th className="text-left p-4 text-sm font-semibold">Fournisseur</th>
                      <th className="text-right p-4 text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {normalStockItems.map((item, index) => (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="border-b border-border hover:bg-muted/50 transition-colors"
                      >
                        <td className="p-4">
                          <div>
                            <p className="font-semibold">{item.name}</p>
                            {item.description && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          {item.category && (
                            <span className="px-2 py-1 rounded-full text-xs bg-primary/20 text-primary border border-primary/30">
                              {item.category}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <span className="font-semibold">
                            {item.quantity}
                          </span>
                        </td>
                        <td className="p-4 text-right text-sm text-muted-foreground">
                          {item.minQuantity !== null ? item.minQuantity : '-'}
                        </td>
                        <td className="p-4 text-right text-sm">
                          {item.unitPrice ? formatCurrency(item.unitPrice) : '-'}
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {item.supplier || '-'}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(item)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(item.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
            {/* Contrôles de pagination */}
            {pagination.totalPages > 1 && (
              <div className="border-t border-border p-4 flex items-center justify-between">
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
              </div>
            )}
          </Card>
        </motion.div>
      )}

      {/* Form Modal */}
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
              className="bg-card rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border"
            >
              <Card className="border-0">
                <CardHeader className="border-b border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>
                        {editingItem ? 'Modifier l\'article' : 'Nouvel article'}
                      </CardTitle>
                      <CardDescription>
                        Ajoutez un article à votre stock
                      </CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={resetForm}>
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Catégorie</Label>
                        <select
                          id="category"
                          value={formData.category}
                          onChange={(e) =>
                            setFormData({ ...formData, category: e.target.value })
                          }
                          className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="">Sélectionner une catégorie</option>
                          {STOCK_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="supplier">Fournisseur</Label>
                        <Input
                          id="supplier"
                          value={formData.supplier}
                          onChange={(e) =>
                            setFormData({ ...formData, supplier: e.target.value })
                          }
                          className="h-11"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="quantity">Quantité *</Label>
                        <Input
                          id="quantity"
                          type="number"
                          step="0.01"
                          value={formData.quantity}
                          onChange={(e) =>
                            setFormData({ ...formData, quantity: e.target.value })
                          }
                          required
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="unit">Unité</Label>
                        <Input
                          id="unit"
                          value={formData.unit}
                          onChange={(e) =>
                            setFormData({ ...formData, unit: e.target.value })
                          }
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="minQuantity">Stock minimum</Label>
                        <Input
                          id="minQuantity"
                          type="number"
                          step="0.01"
                          value={formData.minQuantity}
                          onChange={(e) =>
                            setFormData({ ...formData, minQuantity: e.target.value })
                          }
                          className="h-11"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unitPrice">Prix unitaire (€)</Label>
                      <Input
                        id="unitPrice"
                        type="number"
                        step="0.01"
                        value={formData.unitPrice}
                        onChange={(e) =>
                          setFormData({ ...formData, unitPrice: e.target.value })
                        }
                        className="h-11"
                      />
                    </div>
                    <div className="flex gap-2 justify-end pt-4 border-t border-border">
                      <Button type="button" variant="outline" onClick={resetForm}>
                        Annuler
                      </Button>
                      <Button type="submit">
                        {editingItem ? 'Modifier' : 'Créer'}
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
