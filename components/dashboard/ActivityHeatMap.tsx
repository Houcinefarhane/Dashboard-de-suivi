'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from 'lucide-react'

interface Intervention {
  id: string
  date: string
  startTime: string
  status: string
}

interface HeatMapData {
  day: number // 0 = Lundi, 6 = Dimanche
  hour: number // 0-23
  count: number
}

export default function ActivityHeatMap() {
  const [heatMapData, setHeatMapData] = useState<HeatMapData[]>([])
  const [loading, setLoading] = useState(true)

  const daysOfWeek = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
  const hoursOfDay = ['8h', '10h', '12h', '14h', '16h', '18h']

  useEffect(() => {
    fetchHeatMapData()
  }, [])

  const fetchHeatMapData = async () => {
    try {
      const res = await fetch('/api/interventions?limit=500')
      const data = await res.json()
      
      if (res.ok) {
        const interventions: Intervention[] = data.interventions || []
        
        // Calculer la densité d'activité par jour et heure
        const activityMap: { [key: string]: number } = {}
        
        interventions.forEach((intervention) => {
          const date = new Date(intervention.date)
          const day = (date.getDay() + 6) % 7 // Convertir Dimanche=0 en Lundi=0
          
          // Extraire l'heure de startTime (format "HH:mm")
          let hour = 9 // Heure par défaut
          if (intervention.startTime) {
            const timeParts = intervention.startTime.split(':')
            hour = parseInt(timeParts[0]) || 9
          }
          
          const key = `${day}-${hour}`
          activityMap[key] = (activityMap[key] || 0) + 1
        })
        
        // Convertir en tableau
        const heatData: HeatMapData[] = []
        for (let day = 0; day < 7; day++) {
          for (let hour = 8; hour <= 18; hour++) {
            const key = `${day}-${hour}`
            heatData.push({
              day,
              hour,
              count: activityMap[key] || 0,
            })
          }
        }
        
        setHeatMapData(heatData)
      }
    } catch (error) {
      console.error('Error fetching heat map data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getColor = (count: number) => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800'
    if (count === 1) return 'bg-green-200 dark:bg-green-900'
    if (count === 2) return 'bg-green-400 dark:bg-green-700'
    if (count === 3) return 'bg-green-600 dark:bg-green-600'
    return 'bg-green-800 dark:bg-green-500'
  }

  const getIntensity = (count: number) => {
    if (count === 0) return 'Aucune'
    if (count === 1) return 'Faible'
    if (count === 2) return 'Moyenne'
    if (count === 3) return 'Élevée'
    return 'Très élevée'
  }

  // Filtrer les heures de 8h à 18h pour l'affichage
  const displayHours = [8, 10, 12, 14, 16, 18]

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <CardTitle>Carte d'activité hebdomadaire</CardTitle>
        </div>
        <CardDescription>
          Visualisez la densité de vos interventions par jour et heure
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Grille du heatmap */}
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                {/* En-tête des heures */}
                <div className="flex mb-2">
                  <div className="w-12"></div>
                  {displayHours.map((hour) => (
                    <div
                      key={hour}
                      className="flex-1 text-center text-xs font-medium text-muted-foreground min-w-[40px]"
                    >
                      {hour}h
                    </div>
                  ))}
                </div>

                {/* Lignes de jours */}
                {daysOfWeek.map((day, dayIndex) => (
                  <div key={dayIndex} className="flex items-center mb-1">
                    <div className="w-12 text-xs font-medium text-muted-foreground">
                      {day}
                    </div>
                    {displayHours.map((hour) => {
                      const cell = heatMapData.find(
                        (d) => d.day === dayIndex && d.hour === hour
                      )
                      const count = cell?.count || 0
                      
                      return (
                        <motion.div
                          key={`${dayIndex}-${hour}`}
                          className="flex-1 min-w-[40px] px-0.5"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{
                            duration: 0.3,
                            delay: (dayIndex * displayHours.length + displayHours.indexOf(hour)) * 0.01,
                          }}
                        >
                          <div
                            className={`h-8 rounded ${getColor(count)} transition-all duration-200 hover:scale-110 hover:shadow-lg cursor-pointer relative group`}
                            title={`${day} ${hour}h: ${count} intervention${count > 1 ? 's' : ''}`}
                          >
                            {/* Tooltip au survol */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 pointer-events-none">
                              {count} intervention{count > 1 ? 's' : ''}
                              <div className="text-[10px] text-gray-300">
                                {getIntensity(count)}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Légende */}
            <div className="flex items-center justify-between pt-4 border-t">
              <span className="text-xs text-muted-foreground">Moins d'activité</span>
              <div className="flex gap-1">
                <div className="w-4 h-4 rounded bg-gray-100 dark:bg-gray-800"></div>
                <div className="w-4 h-4 rounded bg-green-200 dark:bg-green-900"></div>
                <div className="w-4 h-4 rounded bg-green-400 dark:bg-green-700"></div>
                <div className="w-4 h-4 rounded bg-green-600 dark:bg-green-600"></div>
                <div className="w-4 h-4 rounded bg-green-800 dark:bg-green-500"></div>
              </div>
              <span className="text-xs text-muted-foreground">Plus d'activité</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

