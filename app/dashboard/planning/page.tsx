'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar, Plus, Clock, MapPin, User, CheckCircle2, XCircle, Loader, Camera, X, Image as ImageIcon, FileDown } from 'lucide-react'
import { formatDate, formatDateTime } from '@/lib/utils'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, addDays, subDays, startOfDay, isToday, addWeeks, subWeeks, getHours, getMinutes, setHours, setMinutes } from 'date-fns'
import { fr } from 'date-fns/locale/fr'
import { toast } from '@/lib/toast'

interface Intervention {
  id: string
  title: string
  description: string | null
  date: string
  duration: number | null
  status: string
  price: number | null
  address: string | null
  photosBefore: string | null
  photosAfter: string | null
  client: {
    id: string
    firstName: string
    lastName: string
    phone: string
  }
}

interface Client {
  id: string
  firstName: string
  lastName: string
}

export default function PlanningPage() {
  const [interventions, setInterventions] = useState<Intervention[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('month')
  const [showForm, setShowForm] = useState(false)
  const [selectedIntervention, setSelectedIntervention] = useState<Intervention | null>(null)
  const [showPhotoForm, setShowPhotoForm] = useState<'before' | 'after' | null>(null)
  const [photoUrl, setPhotoUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [showSidePanel, setShowSidePanel] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: '',
    clientId: '',
    address: '',
    price: '',
    status: 'todo',
  })

  const fetchInterventions = async () => {
    try {
      const start = startOfMonth(currentDate).toISOString()
      const end = endOfMonth(currentDate).toISOString()
      const res = await fetch(`/api/interventions?start=${start}&end=${end}`)
      const data = await res.json()
      if (res.ok) {
        setInterventions(data)
      }
    } catch (error) {
      console.error('Error fetching interventions:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients')
      const data = await res.json()
      if (res.ok) {
        setClients(data)
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    }
  }

  useEffect(() => {
    fetchInterventions()
    fetchClients()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, viewMode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const dateTime = new Date(`${formData.date}T${formData.time}`)
    
    // Validation de cohérence : comparer uniquement les dates (sans l'heure)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const interventionDay = new Date(dateTime)
    interventionDay.setHours(0, 0, 0, 0)
    
    let finalStatus = formData.status
    
    // Si l'intervention est passée (date < aujourd'hui)
    if (interventionDay < today) {
      // Doit être "completed" ou "cancelled", pas "todo"
      if (finalStatus === 'todo') {
        alert('Les interventions passées ne peuvent pas être "à faire". Choisissez "Terminée" ou "Annulée".')
        finalStatus = 'completed' // Par défaut
      }
    }
    
    // Si l'intervention est future (date > aujourd'hui)
    if (interventionDay > today) {
      // Doit être "todo" ou "cancelled", pas "completed"
      if (finalStatus === 'completed') {
        alert('Les interventions futures ne peuvent pas être "terminées". Choisissez "À faire" ou "Annulée".')
        finalStatus = 'todo' // Par défaut
      }
    }

    try {
          // Validation de la durée (max 2h)
          const duration = formData.duration ? parseInt(formData.duration) : null
          if (duration && duration > 120) {
            alert('La durée maximum est de 2h (120 minutes)')
            return
          }

          const res = await fetch('/api/interventions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: formData.title,
              description: formData.description,
              date: dateTime.toISOString(),
              duration: duration && duration <= 120 ? duration : null,
              clientId: formData.clientId,
              address: formData.address,
              price: formData.price ? parseFloat(formData.price) : null,
              status: finalStatus,
            }),
          })

      if (res.ok) {
        fetchInterventions()
        resetForm()
      }
    } catch (error) {
      console.error('Error creating intervention:', error)
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      // Trouver l'intervention pour vérifier sa date
      const intervention = interventions.find(i => i.id === id)
      if (intervention) {
        const interventionDate = new Date(intervention.date)
        
        // Comparer uniquement les dates (sans l'heure)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const interventionDay = new Date(interventionDate)
        interventionDay.setHours(0, 0, 0, 0)
        
        const isPast = interventionDay < today
        const isFuture = interventionDay > today
        
        // Validation : interventions passées ne peuvent pas être "todo"
        if (isPast && status === 'todo') {
          alert('Les interventions passées ne peuvent pas être marquées comme "à faire". Elles doivent être terminées ou annulées.')
          return
        }
        
        // Validation : interventions futures ne peuvent pas être "completed"
        if (isFuture && status === 'completed') {
          alert('Les interventions futures ne peuvent pas être marquées comme "terminées". Elles doivent être "à faire" ou "annulées".')
          return
        }
      }

      const res = await fetch(`/api/interventions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (res.ok) {
        fetchInterventions()
        window.dispatchEvent(new CustomEvent('notification-update'))
        
        const statusLabels: Record<string, string> = {
          completed: 'terminée',
          todo: 'à faire',
          cancelled: 'annulée',
        }
        const statusLabel = statusLabels[status] || status
        toast.show({
          title: 'Statut mis à jour',
          message: `L'intervention a été marquée comme ${statusLabel}`,
          type: 'intervention_status',
          duration: 4000,
        })
      }
    } catch (error) {
      console.error('Error updating intervention:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      duration: '',
      clientId: '',
      address: '',
      price: '',
      status: 'todo',
    })
    setSelectedDate(null)
    setShowForm(false)
  }

  // Calculer les jours à afficher selon la vue
  const getDaysToDisplay = () => {
    if (viewMode === 'day') {
      return [startOfDay(currentDate)]
    } else if (viewMode === 'week') {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
      return eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) })
    } else {
      const monthStart = startOfMonth(currentDate)
      const monthEnd = endOfMonth(currentDate)
      return eachDayOfInterval({ start: monthStart, end: monthEnd })
    }
  }

  const daysToDisplay = getDaysToDisplay()

  const getInterventionsForDate = (date: Date) => {
    return interventions.filter((intervention) =>
      isSameDay(new Date(intervention.date), date)
    )
  }

  // Convertir les minutes en heures et minutes
  const formatDuration = (minutes: number | null): string => {
    if (!minutes) return ''
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins} min`
    if (mins === 0) return `${hours}h`
    return `${hours}h ${mins} min`
  }

  // Formater l'heure d'une intervention
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString)
    return format(date, 'HH:mm')
  }

  // Obtenir la position verticale d'une intervention dans la timeline (0-100%)
  const getTimePosition = (dateString: string): number => {
    const date = new Date(dateString)
    const hours = getHours(date)
    const minutes = getMinutes(date)
    // Position basée sur 24h (0h = 0%, 24h = 100%)
    return ((hours * 60 + minutes) / (24 * 60)) * 100
  }

  // Obtenir la hauteur d'une intervention en % basée sur sa durée
  const getTimeHeight = (duration: number | null): number => {
    if (!duration) return (60 / 60) * (100 / 24) // 1h par défaut = ~4.17%
    // 1h = 100% / 24h = ~4.17% de la journée
    // On calcule la hauteur proportionnelle à la durée
    const heightPercent = (duration / 60) * (100 / 24)
    // Hauteur minimale de 30 minutes = ~2.08%
    return Math.max(2.08, heightPercent)
  }

  const getStatusColor = (status: string): { border: string; bg: string; icon: string; monthBar: string; outlookColor: string } => {
    switch (status) {
      case 'completed':
        return {
          border: 'border-emerald-400',
          bg: 'bg-emerald-50 dark:bg-emerald-950/30',
          icon: 'text-emerald-600 dark:text-emerald-400',
          monthBar: 'bg-emerald-400 dark:bg-emerald-500',
          outlookColor: '#34D399' // Vert émeraude moderne
        }
      case 'todo':
        return {
          border: 'border-indigo-400',
          bg: 'bg-indigo-50 dark:bg-indigo-950/30',
          icon: 'text-indigo-600 dark:text-indigo-400',
          monthBar: 'bg-indigo-400 dark:bg-indigo-500',
          outlookColor: '#818CF8' // Indigo moderne
        }
      case 'cancelled':
        return {
          border: 'border-rose-400',
          bg: 'bg-rose-50 dark:bg-rose-950/30',
          icon: 'text-rose-600 dark:text-rose-400',
          monthBar: 'bg-rose-400 dark:bg-rose-500',
          outlookColor: '#FB7185' // Rose moderne
        }
      default:
        return {
          border: 'border-slate-400',
          bg: 'bg-slate-50 dark:bg-slate-950/30',
          icon: 'text-slate-600 dark:text-slate-400',
          monthBar: 'bg-slate-400 dark:bg-slate-500',
          outlookColor: '#94A3B8' // Slate moderne
        }
    }
  }

  // Fonction pour détecter et résoudre les chevauchements avec espacement minimum de 2h
  const layoutInterventions = (interventions: Intervention[]) => {
    if (interventions.length === 0) return []
    
    const sorted = [...interventions].sort((a, b) => {
      const timeA = new Date(a.date).getTime()
      const timeB = new Date(b.date).getTime()
      if (timeA !== timeB) return timeA - timeB
      // Si même heure, trier par durée (plus court d'abord)
      return (a.duration || 0) - (b.duration || 0)
    })

    const SPACING_MINUTES = 120 // 2h en minutes
    const SPACING_HEIGHT = getTimeHeight(SPACING_MINUTES) // Hauteur en % pour 2h
    
    // Structure pour stocker les interventions par colonne
    const columns: Array<Array<{ endTime: number; endWithSpacing: number }>> = []
    const layout: Array<{ intervention: Intervention; left: number; width: number; column: number }> = []

    for (const intervention of sorted) {
      const start = getTimePosition(intervention.date)
      const duration = intervention.duration || 60
      const end = start + getTimeHeight(duration)
      const endWithSpacing = end + SPACING_HEIGHT // Fin avec espacement

      // Trouver une colonne disponible
      let columnIndex = -1
      for (let i = 0; i < columns.length; i++) {
        const column = columns[i]
        // Vérifier si cette colonne est libre à cette position (avec espacement)
        const hasOverlap = column.some(item => {
          // Chevauchement si les intervalles se chevauchent OU si l'espacement minimum n'est pas respecté
          // L'intervention ne peut pas commencer avant que la précédente + son espacement soit terminé
          return !(endWithSpacing <= item.endTime || start >= item.endWithSpacing)
        })
        if (!hasOverlap) {
          columnIndex = i
          break
        }
      }

      // Si aucune colonne disponible, créer une nouvelle
      if (columnIndex === -1) {
        columnIndex = columns.length
        columns.push([])
      }

      // Ajouter cette intervention à la colonne
      columns[columnIndex].push({ endTime: end, endWithSpacing })
      
      // Calculer la largeur et la position en fonction du nombre total de colonnes
      const totalColumns = columns.length
      // Pour la vue semaine, on veut que chaque intervention prenne toute la largeur de sa colonne
      // On laisse juste un petit espace entre les colonnes (2% de marge totale)
      const marginBetween = totalColumns > 1 ? 1 : 0 // 1% de marge entre chaque colonne
      const availableWidth = 100 - (marginBetween * (totalColumns - 1))
      const width = availableWidth / totalColumns
      const left = columnIndex * (width + marginBetween)

      layout.push({
        intervention,
        left,
        width,
        column: columnIndex
      })
      
      // Recalculer toutes les largeurs précédentes car le nombre de colonnes a peut-être changé
      if (columnIndex === totalColumns - 1 && totalColumns > 1) {
        const newMarginBetween = 1
        const newAvailableWidth = 100 - (newMarginBetween * (totalColumns - 1))
        const newWidth = newAvailableWidth / totalColumns
        for (let i = 0; i < layout.length - 1; i++) {
          layout[i].width = newWidth
          layout[i].left = layout[i].column * (newWidth + newMarginBetween)
        }
      }
    }

    return layout
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold mb-2">Planning</h1>
          <p className="text-muted-foreground">
            Gérez vos interventions et rendez-vous
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={async () => {
              try {
                const { exportInterventions } = require('@/lib/export')
                exportInterventions(interventions, `interventions-${new Date().toISOString().split('T')[0]}`)
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
            Nouvelle intervention
          </Button>
        </div>
      </motion.div>

      {/* View Mode Selector */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'day' ? 'default' : 'outline'}
            onClick={() => setViewMode('day')}
            size="sm"
          >
            Jour
          </Button>
          <Button
            variant={viewMode === 'week' ? 'default' : 'outline'}
            onClick={() => setViewMode('week')}
            size="sm"
          >
            Semaine
          </Button>
          <Button
            variant={viewMode === 'month' ? 'default' : 'outline'}
            onClick={() => setViewMode('month')}
            size="sm"
          >
            Mois
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              if (viewMode === 'day') setCurrentDate(subDays(currentDate, 1))
              else if (viewMode === 'week') setCurrentDate(subWeeks(currentDate, 1))
              else setCurrentDate(subMonths(currentDate, 1))
            }}
          >
            ←
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentDate(new Date())}
          >
            Aujourd'hui
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              if (viewMode === 'day') setCurrentDate(addDays(currentDate, 1))
              else if (viewMode === 'week') setCurrentDate(addWeeks(currentDate, 1))
              else setCurrentDate(addMonths(currentDate, 1))
            }}
          >
            →
          </Button>
        </div>
      </div>

      {/* Calendar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">
                {viewMode === 'day' 
                  ? format(currentDate, 'EEEE d MMMM yyyy', { locale: fr })
                  : viewMode === 'week'
                  ? `Semaine du ${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'd MMMM', { locale: fr })}`
                  : format(currentDate, 'MMMM yyyy', { locale: fr })
                }
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === 'day' ? (
            // Vue Jour - Style épuré et moderne (identique à la vue semaine)
            <div className="flex border border-border/50 rounded-lg overflow-hidden bg-white dark:bg-card shadow-sm">
              {/* Colonne des heures - Style moderne */}
              <div className="w-16 border-r border-border/50 bg-white dark:bg-muted/20 flex-shrink-0">
                {Array.from({ length: 13 }, (_, i) => {
                  const hour = i + 6 // De 6h à 18h
                  return (
                    <div
                      key={hour}
                      className="h-12 border-b border-[#E1DFDD] dark:border-[#3D3D3D] flex items-start justify-end pr-2 pt-1"
                    >
                      <span className="text-xs text-muted-foreground font-medium">
                        {hour.toString().padStart(2, '0')}
                      </span>
                    </div>
                  )
                })}
              </div>
              {/* Zone des interventions - Style moderne */}
              <div className="flex-1 relative min-h-[624px] bg-white dark:bg-background">
                {/* Lignes horaires principales - Style moderne */}
                {Array.from({ length: 13 }, (_, i) => {
                  const hour = i + 6
                  return (
                    <div
                      key={hour}
                      className="absolute w-full h-12 border-b border-border/20"
                      style={{ top: `${(i / 13) * 100}%` }}
                    />
                  )
                })}
                {/* Lignes de 30 minutes - Style moderne */}
                {Array.from({ length: 13 }, (_, i) => (
                  <div
                    key={`half-${i}`}
                    className="absolute w-full h-6 border-b border-border/5"
                    style={{ top: `${((i + 0.5) / 13) * 100}%` }}
                  />
                ))}
                {/* Interventions positionnées sur la timeline - Style compact */}
                {getInterventionsForDate(currentDate)
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((intervention) => {
                    const interventionDate = new Date(intervention.date)
                    const hours = getHours(interventionDate)
                    const minutes = getMinutes(interventionDate)
                    
                    // Position relative à 6h-18h (0% = 6h, 100% = 18h)
                    const position = hours < 6 ? 0 : hours > 18 ? 100 : ((hours - 6) * 60 + minutes) / (12 * 60) * 100
                    
                    const colors = getStatusColor(intervention.status)

                    return (
                      <motion.div
                        key={intervention.id}
                        initial={{ opacity: 0, y: -2 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.1 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedIntervention(intervention)
                          setShowSidePanel(true)
                        }}
                        className="absolute left-0 right-0 cursor-pointer hover:opacity-90 transition-opacity z-10 overflow-hidden"
                        style={{
                          top: `${Math.max(0, Math.min(100, position))}%`,
                          height: '28px', // Hauteur augmentée
                          backgroundColor: colors.outlookColor,
                          marginLeft: '2px',
                          marginRight: '2px',
                        }}
                      >
                        <div className="px-2 py-1 h-full flex items-center justify-center text-white">
                          <div className="text-xs font-normal truncate w-full leading-tight text-center">
                            <span className="font-bold">{formatTime(intervention.date)}</span>
                            {' '}
                            <span>{intervention.title}</span>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
              </div>
            </div>
          ) : viewMode === 'week' ? (
            // Vue Semaine - Style épuré et moderne
            <div className="flex border border-border/50 rounded-lg overflow-hidden bg-white dark:bg-card shadow-sm">
              {/* Colonne des heures - Style moderne */}
              <div className="w-16 border-r border-border/50 bg-white dark:bg-muted/20 flex-shrink-0">
                {Array.from({ length: 13 }, (_, i) => {
                  const hour = i + 6 // De 6h à 18h
                  return (
                    <div
                      key={hour}
                      className="h-12 border-b border-[#E1DFDD] dark:border-[#3D3D3D] flex items-start justify-end pr-2 pt-1"
                    >
                      <span className="text-xs text-muted-foreground font-medium">
                        {hour.toString().padStart(2, '0')}
                      </span>
                    </div>
                  )
                })}
              </div>
              {/* Colonnes des jours - Style moderne */}
              <div className="flex-1 grid grid-cols-7 divide-x divide-border/50">
                {daysToDisplay.map((day) => {
                  const dayInterventions = getInterventionsForDate(day)
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  const isToday = isSameDay(day, new Date())
                  const isSelected = selectedDate && isSameDay(day, selectedDate)

                  return (
                    <div
                      key={day.toISOString()}
                      className={`
                        relative bg-white dark:bg-background transition-colors
                        ${isToday ? 'bg-primary/5 dark:bg-primary/10' : ''}
                      `}
                    >
                      {/* En-tête du jour - Style moderne */}
                      <div
                        className={`
                          sticky top-0 z-20 px-3 py-2 border-b border-border/50
                          ${isToday 
                            ? 'bg-primary/10 dark:bg-primary/20 text-primary font-semibold' 
                            : 'bg-white dark:bg-muted/20 text-foreground border-b border-border/30'
                          }
                          cursor-pointer hover:bg-muted/60 dark:hover:bg-muted/40 transition-colors
                        `}
                        onClick={() => {
                          setSelectedDate(day)
                          setShowSidePanel(true)
                          setFormData({ ...formData, date: format(day, 'yyyy-MM-dd') })
                        }}
                      >
                        <div className={`text-[11px] mb-0.5 uppercase tracking-wide font-medium ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                          {format(day, 'EEE', { locale: fr })}
                        </div>
                        <div className={`text-lg font-bold ${isToday ? 'text-primary' : 'text-foreground'}`}>
                          {format(day, 'd')}
                        </div>
                      </div>
                      {/* Timeline du jour (6h à 18h) - Style moderne */}
                      <div className="relative min-h-[624px] bg-white dark:bg-background">
                        {/* Lignes horaires (6h à 18h) - Style moderne */}
                        {Array.from({ length: 13 }, (_, i) => {
                          const hour = i + 6
                          return (
                            <div
                              key={hour}
                              className="absolute w-full h-12 border-b border-border/20"
                              style={{ top: `${(i / 13) * 100}%` }}
                            />
                          )
                        })}
                        {/* Lignes de 30 minutes - Style moderne */}
                        {Array.from({ length: 13 }, (_, i) => (
                          <div
                            key={`half-${i}`}
                            className="absolute w-full h-6 border-b border-border/5"
                            style={{ top: `${((i + 0.5) / 13) * 100}%` }}
                          />
                        ))}
                        {/* Interventions positionnées sur la timeline - Style Outlook compact */}
                        {dayInterventions.map((intervention) => {
                          const interventionDate = new Date(intervention.date)
                          const hours = getHours(interventionDate)
                          const minutes = getMinutes(interventionDate)
                          
                          // Position relative à 6h-18h (0% = 6h, 100% = 18h)
                          const position = hours < 6 ? 0 : hours > 18 ? 100 : ((hours - 6) * 60 + minutes) / (12 * 60) * 100
                          
                          const colors = getStatusColor(intervention.status)

                          return (
                            <motion.div
                              key={intervention.id}
                              initial={{ opacity: 0, y: -2 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.1 }}
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedIntervention(intervention)
                                setShowSidePanel(true)
                              }}
                              className="absolute left-0 right-0 cursor-pointer hover:opacity-90 transition-opacity z-10 overflow-hidden"
                              style={{
                                top: `${Math.max(0, Math.min(100, position))}%`,
                                height: '28px', // Hauteur augmentée
                                backgroundColor: colors.outlookColor,
                                marginLeft: '2px',
                                marginRight: '2px',
                              }}
                            >
                              <div className="px-2 py-1 h-full flex items-center justify-center text-white">
                                <div className="text-xs font-normal truncate w-full leading-tight text-center">
                                  <span className="font-bold">{formatTime(intervention.date)}</span>
                                  {' '}
                                  <span>{intervention.title}</span>
                                </div>
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            // Vue Mois
            <>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
                  <div key={day} className="text-center font-semibold text-sm text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {daysToDisplay.map((day) => {
                  const dayInterventions = getInterventionsForDate(day)
                  const isToday = isSameDay(day, new Date())
                  const isSelected = selectedDate && isSameDay(day, selectedDate)

                  return (
                    <motion.div
                      key={day.toISOString()}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => {
                        setSelectedDate(day)
                        setShowSidePanel(true)
                        setFormData({ ...formData, date: format(day, 'yyyy-MM-dd') })
                      }}
                      className={`
                        min-h-[80px] p-2 rounded-lg border-2 cursor-pointer transition-all
                        ${isToday ? 'border-primary bg-primary/10' : 'border-transparent hover:border-primary/50'}
                        ${isSelected ? 'border-primary bg-primary/20' : ''}
                      `}
                    >
                      <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary' : ''}`}>
                        {format(day, 'd')}
                      </div>
                      <div className="space-y-0.5">
                        {dayInterventions
                          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                          .slice(0, 4)
                          .map((intervention) => {
                            const colors = getStatusColor(intervention.status)
                            return (
                              <div
                                key={intervention.id}
                                className={`text-[10px] px-1 py-0.5 rounded ${colors.monthBar} text-white truncate cursor-pointer hover:opacity-80 transition-opacity`}
                                title={`${formatTime(intervention.date)} - ${intervention.title}`}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedIntervention(intervention)
                                  setShowSidePanel(true)
                                }}
                              >
                                <span className="font-bold">{formatTime(intervention.date)}</span>
                                {intervention.duration && (
                                  <> <span className="font-bold">{formatDuration(intervention.duration)}</span></>
                                )}
                                {' '}
                                <span>{intervention.title}</span>
                              </div>
                            )
                          })}
                        {dayInterventions.length > 4 && (
                          <div className="text-[10px] text-muted-foreground font-medium px-1">
                            +{dayInterventions.length - 4} autres
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Side Panel - Vue Outlook (à droite) */}
      <AnimatePresence>
        {showSidePanel && selectedDate && (
          <>
            {/* Overlay */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowSidePanel(false)
                setSelectedDate(null)
                setSelectedIntervention(null)
              }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            {/* Side Panel */}
            <motion.div
              key="panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 h-full w-full md:w-[500px] lg:w-[600px] bg-card border-l border-border z-50 shadow-2xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {getInterventionsForDate(selectedDate).length} intervention{getInterventionsForDate(selectedDate).length > 1 ? 's' : ''}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setShowSidePanel(false)
                      setSelectedDate(null)
                      setSelectedIntervention(null)
                    }}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {getInterventionsForDate(selectedDate).length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <p className="text-muted-foreground">
                      Aucune intervention prévue ce jour
                    </p>
                    <Button
                      className="mt-4"
                      onClick={() => {
                        setShowForm(true)
                        setShowSidePanel(false)
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Créer une intervention
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getInterventionsForDate(selectedDate).map((intervention) => (
                      <motion.div
                        key={intervention.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-all cursor-pointer"
                        onClick={() => setSelectedIntervention(intervention)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">{intervention.title}</h3>
                              <span className={`px-2 py-1 rounded text-xs text-white ${getStatusColor(intervention.status)}`}>
                                {intervention.status === 'completed' ? 'Terminée' :
                                 intervention.status === 'cancelled' ? 'Annulée' : 'À faire'}
                              </span>
                            </div>
                            {intervention.description && (
                              <p className="text-sm text-muted-foreground mb-2">
                                {intervention.description}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span className="font-bold">{formatTime(intervention.date)}</span>
                              </div>
                              {intervention.duration && (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  <span className="font-bold">{formatDuration(intervention.duration)}</span>
                                </div>
                              )}
                              {intervention.address && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {intervention.address}
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                {intervention.client.firstName} {intervention.client.lastName}
                              </div>
                              {(intervention.photosBefore || intervention.photosAfter) && (
                                <div className="flex items-center gap-1 text-primary">
                                  <Camera className="w-4 h-4" />
                                  <span className="text-xs">
                                    {intervention.photosBefore ? JSON.parse(intervention.photosBefore).length : 0} avant
                                    {intervention.photosAfter && ` / ${JSON.parse(intervention.photosAfter).length} après`}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                            {intervention.status === 'todo' && (
                              <Button
                                size="sm"
                                onClick={() => handleStatusChange(intervention.id, 'completed')}
                              >
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                Terminer
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={async (e) => {
                                e.stopPropagation()
                                if (confirm('Êtes-vous sûr de vouloir annuler cette intervention ?')) {
                                  await handleStatusChange(intervention.id, 'cancelled')
                                }
                              }}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Annuler
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={resetForm}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <Card className="border-0">
                <CardHeader>
                  <CardTitle>Nouvelle intervention</CardTitle>
                  <CardDescription>
                    Planifiez une nouvelle intervention
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Titre *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        required
                        placeholder="Ex: Réparation de fuite"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clientId">Client *</Label>
                      <select
                        id="clientId"
                        value={formData.clientId}
                        onChange={(e) =>
                          setFormData({ ...formData, clientId: e.target.value })
                        }
                        required
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="">Sélectionner un client</option>
                        {clients.map((client) => (
                          <option key={client.id} value={client.id}>
                            {client.firstName} {client.lastName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="status">État *</Label>
                        <select
                          id="status"
                          value={formData.status}
                          onChange={(e) => {
                            const selectedStatus = e.target.value
                            if (!formData.date || !formData.time) {
                              setFormData({ ...formData, status: selectedStatus })
                              return
                            }
                            
                            const selectedDate = new Date(`${formData.date}T${formData.time}`)
                            
                            // Comparer uniquement les dates (sans l'heure)
                            const today = new Date()
                            today.setHours(0, 0, 0, 0)
                            const interventionDay = new Date(selectedDate)
                            interventionDay.setHours(0, 0, 0, 0)
                            
                            const isPast = interventionDay < today
                            const isFuture = interventionDay > today
                            
                            // Si l'intervention est passée, on ne peut pas choisir "todo"
                            if (isPast && selectedStatus === 'todo') {
                              alert('Les interventions passées ne peuvent pas être marquées comme "à faire". Choisissez "Terminée" ou "Annulée".')
                              return
                            }
                            
                            // Si l'intervention est future, on ne peut pas choisir "completed"
                            if (isFuture && selectedStatus === 'completed') {
                              alert('Les interventions futures ne peuvent pas être marquées comme "terminées". Choisissez "À faire" ou "Annulée".')
                              return
                            }
                            
                            setFormData({ ...formData, status: selectedStatus })
                          }}
                          required
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="todo">À faire</option>
                          <option value="completed">Terminée</option>
                          <option value="cancelled">Annulée</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="date">Date *</Label>
                        <Input
                          id="date"
                          type="date"
                          value={formData.date}
                          onChange={(e) =>
                            setFormData({ ...formData, date: e.target.value })
                          }
                          required
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="time">Heure * (8:00 - 18:00)</Label>
                        <Input
                          id="time"
                          type="time"
                          min="08:00"
                          max="18:00"
                          value={formData.time}
                          onChange={(e) => {
                            const time = e.target.value
                            const [hours, minutes] = time.split(':').map(Number)
                            
                            // Validation : entre 8:00 et 18:00
                            if (hours < 8 || hours > 18 || (hours === 18 && minutes > 0)) {
                              alert('L\'heure doit être entre 8:00 et 18:00')
                              return
                            }
                            
                            setFormData({ ...formData, time })
                          }}
                          required
                          className="h-10"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="duration">Durée (minutes, max 2h)</Label>
                        <Input
                          id="duration"
                          type="number"
                          min="1"
                          max="120"
                          value={formData.duration}
                          onChange={(e) => {
                            const value = e.target.value
                            if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 120)) {
                              setFormData({ ...formData, duration: value })
                            } else if (parseInt(value) > 120) {
                              alert('La durée maximum est de 2h (120 minutes)')
                              setFormData({ ...formData, duration: '120' })
                            }
                          }}
                          placeholder="60"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price">Prix (€)</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) =>
                            setFormData({ ...formData, price: e.target.value })
                          }
                          placeholder="150.00"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Adresse</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        placeholder="Adresse de l'intervention"
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
                        placeholder="Détails de l'intervention..."
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button type="button" variant="outline" onClick={resetForm}>
                        Annuler
                      </Button>
                      <Button type="submit">Créer</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Panneau latéral - Vue détaillée intervention */}
      <AnimatePresence>
        {selectedIntervention && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setSelectedIntervention(null)}
            />
            <motion.div
              key="panel"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 h-full w-full max-w-2xl bg-card shadow-2xl z-[60] overflow-y-auto border-r border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-full flex flex-col">
                {/* Header */}
                <div className="sticky top-0 bg-card border-b border-border p-6 z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold">{selectedIntervention.title}</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatTime(selectedIntervention.date)} • {selectedIntervention.client.firstName} {selectedIntervention.client.lastName}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedIntervention(null)}>
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                  {/* Status badge */}
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(selectedIntervention.status)}`}>
                      {selectedIntervention.status === 'completed' ? 'Terminée' :
                       selectedIntervention.status === 'cancelled' ? 'Annulée' : 'À faire'}
                    </span>
                    {/* Action buttons */}
                    <div className="flex gap-2 ml-auto">
                      {selectedIntervention.status === 'todo' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(selectedIntervention.id, 'completed')}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Terminer
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={async () => {
                          if (confirm('Êtes-vous sûr de vouloir annuler cette intervention ?')) {
                            try {
                              const res = await fetch(`/api/interventions/${selectedIntervention.id}`, {
                                method: 'DELETE',
                              })
                              if (res.ok) {
                                fetchInterventions()
                                setSelectedIntervention(null)
                                setShowSidePanel(false)
                                window.dispatchEvent(new CustomEvent('notification-update'))
                              }
                            } catch (error) {
                              console.error('Error deleting intervention:', error)
                            }
                          }
                        }}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Annuler l'intervention
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 space-y-6">
                  {/* Informations générales */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Informations</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Date et heure</p>
                        <p className="font-bold">{formatTime(selectedIntervention.date)}</p>
                      </div>
                      {selectedIntervention.duration && (
                        <div>
                          <p className="text-sm text-muted-foreground">Durée</p>
                          <p className="font-bold">{formatDuration(selectedIntervention.duration)}</p>
                        </div>
                      )}
                      {selectedIntervention.address && (
                        <div className="col-span-2">
                          <p className="text-sm text-muted-foreground">Adresse</p>
                          <p className="font-medium">{selectedIntervention.address}</p>
                        </div>
                      )}
                    </div>
                    {selectedIntervention.description && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Description</p>
                        <p className="text-sm">{selectedIntervention.description}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Client</p>
                      <p className="font-medium">{selectedIntervention.client.firstName} {selectedIntervention.client.lastName}</p>
                      <p className="text-sm text-muted-foreground">{selectedIntervention.client.phone}</p>
                    </div>
                  </div>

                  <div className="border-t border-border pt-6">
                    <h3 className="font-semibold text-lg mb-4">Photos</h3>
                  </div>

                  {/* Photos avant */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Camera className="w-5 h-5" />
                        Photos avant intervention
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowPhotoForm('before')
                          setPhotoUrl('')
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter
                      </Button>
                    </div>
                    {selectedIntervention.photosBefore ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {JSON.parse(selectedIntervention.photosBefore).map((url: string, index: number) => (
                          <div key={index} className="relative group">
                            <img
                              src={url}
                              alt={`Avant ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border border-border"
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={async () => {
                                const photos = JSON.parse(selectedIntervention.photosBefore || '[]')
                                photos.splice(index, 1)
                                await fetch(`/api/interventions/${selectedIntervention.id}`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    photosBefore: photos.length > 0 ? JSON.stringify(photos) : null,
                                  }),
                                })
                                fetchInterventions()
                                setSelectedIntervention({
                                  ...selectedIntervention,
                                  photosBefore: photos.length > 0 ? JSON.stringify(photos) : null,
                                })
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 border border-dashed border-border rounded-lg">
                        <ImageIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                        <p className="text-sm text-muted-foreground">Aucune photo avant</p>
                      </div>
                    )}
                  </div>

                  {/* Photos après */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Camera className="w-5 h-5" />
                        Photos après intervention
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowPhotoForm('after')
                          setPhotoUrl('')
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter
                      </Button>
                    </div>
                    {selectedIntervention.photosAfter ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {JSON.parse(selectedIntervention.photosAfter).map((url: string, index: number) => (
                          <div key={index} className="relative group">
                            <img
                              src={url}
                              alt={`Après ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border border-border"
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={async () => {
                                const photos = JSON.parse(selectedIntervention.photosAfter || '[]')
                                photos.splice(index, 1)
                                await fetch(`/api/interventions/${selectedIntervention.id}`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    photosAfter: photos.length > 0 ? JSON.stringify(photos) : null,
                                  }),
                                })
                                fetchInterventions()
                                setSelectedIntervention({
                                  ...selectedIntervention,
                                  photosAfter: photos.length > 0 ? JSON.stringify(photos) : null,
                                })
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 border border-dashed border-border rounded-lg">
                        <ImageIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                        <p className="text-sm text-muted-foreground">Aucune photo après</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Formulaire d'ajout de photo */}
      <AnimatePresence>
        {showPhotoForm && selectedIntervention && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
            onClick={() => setShowPhotoForm(null)}
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
                    <CardTitle>Ajouter une photo {showPhotoForm === 'before' ? 'avant' : 'après'}</CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => setShowPhotoForm(null)}>
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="photoUrl">URL de la photo</Label>
                      <Input
                        id="photoUrl"
                        type="url"
                        value={photoUrl}
                        onChange={(e) => setPhotoUrl(e.target.value)}
                        placeholder="https://..."
                        className="h-11"
                      />
                      <p className="text-xs text-muted-foreground">
                        Pour l'instant, entrez l'URL d'une photo. L'upload direct sera disponible prochainement.
                      </p>
                    </div>
                    <div className="flex gap-2 justify-end pt-4">
                      <Button variant="outline" onClick={() => setShowPhotoForm(null)}>
                        Annuler
                      </Button>
                      <Button
                        onClick={async () => {
                          if (!photoUrl) return
                          
                          const currentPhotos = showPhotoForm === 'before'
                            ? JSON.parse(selectedIntervention.photosBefore || '[]')
                            : JSON.parse(selectedIntervention.photosAfter || '[]')
                          
                          currentPhotos.push(photoUrl)
                          
                          await fetch(`/api/interventions/${selectedIntervention.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              [showPhotoForm === 'before' ? 'photosBefore' : 'photosAfter']: JSON.stringify(currentPhotos),
                            }),
                          })
                          
                          fetchInterventions()
                          setSelectedIntervention({
                            ...selectedIntervention,
                            [showPhotoForm === 'before' ? 'photosBefore' : 'photosAfter']: JSON.stringify(currentPhotos),
                          })
                          setShowPhotoForm(null)
                          setPhotoUrl('')
                        }}
                      >
                        Ajouter
                      </Button>
                    </div>
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