'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Route, RefreshCw, Filter, X, Navigation, Calendar, Clock, User, CheckCircle2, XCircle, CheckSquare, Square } from 'lucide-react'
import { formatDate, formatTime, cn } from '@/lib/utils'
import dynamic from 'next/dynamic'

// Import dynamique de Leaflet pour éviter les erreurs SSR
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })
const Polyline = dynamic(() => import('react-leaflet').then(mod => mod.Polyline), { ssr: false })

// Import des styles Leaflet
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix pour les icônes Leaflet avec Next.js
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  })
}

interface Intervention {
  id: string
  title: string
  description: string | null
  date: string
  duration: number | null
  status: string
  price: number | null
  address: string | null
  latitude: number | null
  longitude: number | null
  client: {
    id: string
    firstName: string
    lastName: string
    phone: string
  }
}

export default function GeolocalisationPage() {
  const [interventions, setInterventions] = useState<Intervention[]>([])
  const [filteredInterventions, setFilteredInterventions] = useState<Intervention[]>([])
  const [loading, setLoading] = useState(true)
  const [geocoding, setGeocoding] = useState(false)
  const [optimizedRoute, setOptimizedRoute] = useState<Intervention[]>([])
  const [showOptimized, setShowOptimized] = useState(false)
  const [showOptimizationModal, setShowOptimizationModal] = useState(false)
  const [selectedInterventions, setSelectedInterventions] = useState<string[]>([])
  const [dateFilter, setDateFilter] = useState<string>('all') // all, today, week, month
  const [statusFilter, setStatusFilter] = useState<string>('all') // all, todo, completed, cancelled
  const [mapCenter, setMapCenter] = useState<[number, number]>([48.8566, 2.3522]) // Paris par défaut
  const [mapZoom, setMapZoom] = useState(10)

  useEffect(() => {
    fetchInterventions()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [interventions, dateFilter, statusFilter])

  const fetchInterventions = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/interventions')
      const data = await res.json()
      if (res.ok) {
        setInterventions(data)
        setFilteredInterventions(data)
        
        // Centrer la carte sur les interventions
        const withCoords = data.filter((i: Intervention) => i.latitude && i.longitude)
        if (withCoords.length > 0) {
          const avgLat = withCoords.reduce((sum: number, i: Intervention) => sum + (i.latitude || 0), 0) / withCoords.length
          const avgLng = withCoords.reduce((sum: number, i: Intervention) => sum + (i.longitude || 0), 0) / withCoords.length
          setMapCenter([avgLat, avgLng])
        }
      }
    } catch (error) {
      console.error('Error fetching interventions:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...interventions]

    // Filtre par date
    if (dateFilter !== 'all') {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      filtered = filtered.filter((intervention) => {
        const interventionDate = new Date(intervention.date)
        
        if (dateFilter === 'today') {
          return interventionDate.toDateString() === today.toDateString()
        } else if (dateFilter === 'week') {
          const weekFromNow = new Date(today)
          weekFromNow.setDate(weekFromNow.getDate() + 7)
          return interventionDate >= today && interventionDate <= weekFromNow
        } else if (dateFilter === 'month') {
          const monthFromNow = new Date(today)
          monthFromNow.setMonth(monthFromNow.getMonth() + 1)
          return interventionDate >= today && interventionDate <= monthFromNow
        }
        return true
      })
    }

    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter((intervention) => intervention.status === statusFilter)
    }

    setFilteredInterventions(filtered)
  }

  const handleGeocodeAll = async () => {
    try {
      setGeocoding(true)
      const res = await fetch('/api/interventions/geocode', {
        method: 'POST',
      })
      const data = await res.json()
      
      if (res.ok) {
        alert(`${data.geocoded} interventions géocodées avec succès. ${data.errors > 0 ? `${data.errors} erreurs.` : ''}`)
        fetchInterventions()
      } else {
        alert('Erreur lors du géocodage')
      }
    } catch (error) {
      console.error('Error geocoding:', error)
      alert('Erreur lors du géocodage')
    } finally {
      setGeocoding(false)
    }
  }

  const handleGenerateFakeCoordinates = async () => {
    try {
      setGeocoding(true)
      const res = await fetch('/api/interventions/generate-coordinates', {
        method: 'POST',
      })
      const data = await res.json()
      
      if (res.ok) {
        alert(`${data.updated} interventions mises à jour avec des coordonnées GPS fictives`)
        fetchInterventions()
      } else {
        alert('Erreur lors de la génération des coordonnées')
      }
    } catch (error) {
      console.error('Error generating coordinates:', error)
      alert('Erreur lors de la génération des coordonnées')
    } finally {
      setGeocoding(false)
    }
  }

  // Ouvrir le modal d'optimisation
  const openOptimizationModal = () => {
    const withCoords = filteredInterventions.filter(
      (i) => i.latitude && i.longitude && i.status !== 'cancelled'
    )

    if (withCoords.length < 2) {
      alert('Il faut au moins 2 interventions avec coordonnées GPS pour optimiser le trajet')
      return
    }

    // Pré-sélectionner toutes les interventions avec coordonnées
    setSelectedInterventions(withCoords.map(i => i.id))
    setShowOptimizationModal(true)
  }

  // Toggle sélection d'une intervention
  const toggleInterventionSelection = (id: string) => {
    setSelectedInterventions(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  // Calculer le trajet optimisé avec les interventions sélectionnées
  const calculateOptimizedRoute = () => {
    if (selectedInterventions.length < 2) {
      alert('Sélectionnez au moins 2 interventions pour optimiser le trajet')
      return
    }

    // Récupérer les interventions sélectionnées
    const selected = filteredInterventions.filter(
      (i) => selectedInterventions.includes(i.id) && i.latitude && i.longitude
    )

    if (selected.length < 2) {
      alert('Au moins 2 interventions sélectionnées doivent avoir des coordonnées GPS')
      return
    }

    // Trier par date et heure
    const sorted = [...selected].sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return dateA - dateB
    })

    // Algorithme Nearest Neighbor simplifié
    const optimized: Intervention[] = []
    const remaining = [...sorted]
    let current = remaining.shift()!

    optimized.push(current)

    while (remaining.length > 0) {
      let nearestIndex = 0
      let nearestDistance = Infinity

      remaining.forEach((intervention, index) => {
        const distance = calculateDistance(
          current.latitude!,
          current.longitude!,
          intervention.latitude!,
          intervention.longitude!
        )
        if (distance < nearestDistance) {
          nearestDistance = distance
          nearestIndex = index
        }
      })

      current = remaining.splice(nearestIndex, 1)[0]
      optimized.push(current)
    }

    setOptimizedRoute(optimized)
    setShowOptimized(true)
    setShowOptimizationModal(false)
  }

  // Calcul de distance entre deux points (formule de Haversine)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Calculer la distance totale du trajet optimisé
  const calculateTotalDistance = (route: Intervention[]): number => {
    let total = 0
    for (let i = 0; i < route.length - 1; i++) {
      total += calculateDistance(
        route[i].latitude!,
        route[i].longitude!,
        route[i + 1].latitude!,
        route[i + 1].longitude!
      )
    }
    return total
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10b981' // Vert
      case 'cancelled':
        return '#ef4444' // Rouge
      default:
        return '#3b82f6' // Bleu
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />
      case 'cancelled':
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const interventionsWithCoords = filteredInterventions.filter(
    (i) => i.latitude && i.longitude && i.status !== 'cancelled'
  )

  const routeToDisplay = showOptimized && optimizedRoute.length > 0 ? optimizedRoute : interventionsWithCoords

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold mb-2">Géolocalisation</h1>
          <p className="text-muted-foreground">
            Visualisez vos interventions sur la carte et optimisez vos trajets
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={handleGenerateFakeCoordinates}
            disabled={geocoding}
          >
            {geocoding ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <MapPin className="w-4 h-4 mr-2" />
            )}
            {geocoding ? 'Génération...' : 'Générer des coordonnées GPS'}
          </Button>
          <Button
            variant="outline"
            onClick={handleGeocodeAll}
            disabled={geocoding}
          >
            {geocoding ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <MapPin className="w-4 h-4 mr-2" />
            )}
            {geocoding ? 'Géocodage...' : 'Géocoder toutes les adresses'}
          </Button>
          <Button
            variant="outline"
            onClick={openOptimizationModal}
            disabled={interventionsWithCoords.length < 2}
          >
            <Route className="w-4 h-4 mr-2" />
            Optimiser le trajet
          </Button>
          {showOptimized && (
            <Button
              variant="outline"
              onClick={() => {
                setShowOptimized(false)
                setOptimizedRoute([])
              }}
            >
              <X className="w-4 h-4 mr-2" />
              Annuler l'optimisation
            </Button>
          )}
        </div>
      </motion.div>

      {/* Filtres */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex items-center gap-2 flex-1">
                <Filter className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Filtres :</span>
              </div>
              
              <div className="flex flex-wrap gap-3 flex-1">
                {/* Filtre par date */}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="all">Toutes les dates</option>
                    <option value="today">Aujourd'hui</option>
                    <option value="week">Cette semaine</option>
                    <option value="month">Ce mois</option>
                  </select>
                </div>

                {/* Filtre par statut */}
                <div className="flex items-center gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="todo">À faire</option>
                    <option value="completed">Terminées</option>
                    <option value="cancelled">Annulées</option>
                  </select>
                </div>

                {/* Bouton pour réinitialiser les filtres */}
                {(dateFilter !== 'all' || statusFilter !== 'all') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDateFilter('all')
                      setStatusFilter('all')
                    }}
                    className="h-10"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Réinitialiser
                  </Button>
                )}
              </div>

              {/* Distance du trajet optimisé */}
              {showOptimized && optimizedRoute.length > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-md border border-primary/20">
                  <Navigation className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-primary">
                    Distance totale: {calculateTotalDistance(optimizedRoute).toFixed(2)} km
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total interventions</p>
                <p className="text-2xl font-bold">{filteredInterventions.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avec coordonnées</p>
                <p className="text-2xl font-bold">{interventionsWithCoords.length}</p>
              </div>
              <MapPin className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sans coordonnées</p>
                <p className="text-2xl font-bold">
                  {filteredInterventions.length - interventionsWithCoords.length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
        {showOptimized && optimizedRoute.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Trajet optimisé</p>
                  <p className="text-2xl font-bold">{optimizedRoute.length} étapes</p>
                </div>
                <Route className="w-8 h-8 text-accent" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Carte */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Carte des interventions</CardTitle>
              <CardDescription>
                {interventionsWithCoords.length} intervention(s) affichée(s) sur la carte
              </CardDescription>
            </div>
            {/* Légende */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#3b82f6] border-2 border-white shadow-sm"></div>
                <span className="text-muted-foreground">À faire</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#10b981] border-2 border-white shadow-sm"></div>
                <span className="text-muted-foreground">Terminée</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-[600px] flex items-center justify-center">
              <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : interventionsWithCoords.length === 0 ? (
            <div className="h-[600px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aucune intervention avec coordonnées GPS</p>
                <p className="text-sm mt-2">Cliquez sur "Géocoder toutes les adresses" pour ajouter les coordonnées</p>
              </div>
            </div>
          ) : (
            <div className="h-[600px] rounded-lg overflow-hidden relative z-0">
              <MapContainer
                center={mapCenter}
                zoom={mapZoom}
                style={{ height: '100%', width: '100%', zIndex: 1 }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {routeToDisplay.map((intervention, index) => {
                  if (!intervention.latitude || !intervention.longitude) return null
                  
                  const color = getStatusColor(intervention.status)
                  
                  return (
                    <Marker
                      key={intervention.id}
                      position={[intervention.latitude, intervention.longitude]}
                      icon={L.divIcon({
                        className: 'custom-marker',
                        html: `
                          <div style="
                            background-color: ${color};
                            width: 30px;
                            height: 30px;
                            border-radius: 50% 50% 50% 0;
                            transform: rotate(-45deg);
                            border: 3px solid white;
                            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            position: relative;
                          ">
                            <span style="
                              transform: rotate(45deg);
                              color: white;
                              font-weight: bold;
                              font-size: 12px;
                            ">${index + 1}</span>
                          </div>
                        `,
                        iconSize: [30, 30],
                        iconAnchor: [15, 30],
                      })}
                    >
                      <Popup>
                        <div className="p-2 min-w-[200px]">
                          <h3 className="font-bold text-sm mb-2">{intervention.title}</h3>
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center gap-2">
                              <User className="w-3 h-3" />
                              <span>{intervention.client.firstName} {intervention.client.lastName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(intervention.date)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              <span>{formatTime(intervention.date)}</span>
                            </div>
                            {intervention.address && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-3 h-3" />
                                <span className="text-xs">{intervention.address}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              {getStatusIcon(intervention.status)}
                              <span className="text-xs capitalize">{intervention.status === 'todo' ? 'À faire' : intervention.status === 'completed' ? 'Terminée' : 'Annulée'}</span>
                            </div>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  )
                })}
                {showOptimized && optimizedRoute.length > 1 && (
                  <Polyline
                    positions={optimizedRoute
                      .filter(i => i.latitude && i.longitude)
                      .map(i => [i.latitude!, i.longitude!])}
                    color="#3b82f6"
                    weight={3}
                    opacity={0.6}
                  />
                )}
              </MapContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Liste des interventions */}
      {showOptimized && optimizedRoute.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Trajet optimisé</CardTitle>
            <CardDescription>
              Ordre recommandé pour minimiser la distance totale
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {optimizedRoute.map((intervention, index) => {
                const nextIntervention = optimizedRoute[index + 1]
                const distance = nextIntervention
                  ? calculateDistance(
                      intervention.latitude!,
                      intervention.longitude!,
                      nextIntervention.latitude!,
                      nextIntervention.longitude!
                    )
                  : 0

                return (
                  <div
                    key={intervention.id}
                    className="flex items-center gap-4 p-4 border border-border rounded-lg"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{intervention.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {intervention.client.firstName} {intervention.client.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {intervention.address}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatDate(intervention.date)}</p>
                      <p className="text-xs text-muted-foreground">{formatTime(intervention.date)}</p>
                    </div>
                    {nextIntervention && (
                      <div className="text-right">
                        <p className="text-sm font-medium text-primary">
                          → {distance.toFixed(2)} km
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
          </Card>
        )}

        {/* Modal d'optimisation de trajet */}
        <AnimatePresence>
          {showOptimizationModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
              onClick={() => setShowOptimizationModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-card rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-border flex flex-col z-[10000]"
              >
                <Card className="border-0 flex flex-col h-full">
                  <CardHeader className="border-b border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl">Optimisation de trajet</CardTitle>
                        <CardDescription>
                          Sélectionnez les interventions à inclure dans le trajet optimisé
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const allIds = filteredInterventions
                              .filter(i => i.latitude && i.longitude && i.status !== 'cancelled')
                              .map(i => i.id)
                            if (selectedInterventions.length === allIds.length) {
                              setSelectedInterventions([])
                            } else {
                              setSelectedInterventions(allIds)
                            }
                          }}
                        >
                          {selectedInterventions.length === filteredInterventions.filter(i => i.latitude && i.longitude && i.status !== 'cancelled').length
                            ? 'Tout désélectionner'
                            : 'Tout sélectionner'}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setShowOptimizationModal(false)}>
                          <X className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-3">
                      {filteredInterventions
                        .filter(i => i.latitude && i.longitude && i.status !== 'cancelled')
                        .map((intervention) => {
                          const isSelected = selectedInterventions.includes(intervention.id)
                          return (
                            <motion.div
                              key={intervention.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={cn(
                                "flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all",
                                isSelected
                                  ? "border-primary bg-primary/10"
                                  : "border-border hover:border-primary/50 hover:bg-muted/50"
                              )}
                              onClick={() => toggleInterventionSelection(intervention.id)}
                            >
                              <div className="flex-shrink-0">
                                {isSelected ? (
                                  <CheckSquare className="w-5 h-5 text-primary" />
                                ) : (
                                  <Square className="w-5 h-5 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm truncate">{intervention.title}</h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {intervention.client.firstName} {intervention.client.lastName}
                                </p>
                                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>{formatDate(intervention.date)}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{formatTime(intervention.date)}</span>
                                  </div>
                                  {intervention.address && (
                                    <div className="flex items-center gap-1 truncate">
                                      <MapPin className="w-3 h-3 flex-shrink-0" />
                                      <span className="truncate">{intervention.address}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex-shrink-0">
                                {getStatusIcon(intervention.status)}
                              </div>
                            </motion.div>
                          )
                        })}
                    </div>
                    {filteredInterventions.filter(i => i.latitude && i.longitude && i.status !== 'cancelled').length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Aucune intervention avec coordonnées GPS disponible</p>
                      </div>
                    )}
                  </CardContent>
                  <div className="border-t border-border p-4 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {selectedInterventions.length} intervention(s) sélectionnée(s)
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setShowOptimizationModal(false)}>
                        Annuler
                      </Button>
                      <Button 
                        onClick={calculateOptimizedRoute}
                        disabled={selectedInterventions.length < 2}
                      >
                        <Route className="w-4 h-4 mr-2" />
                        Calculer le trajet optimisé
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

