'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Intervention {
  id: string
  date: string
  startTime: string
  status: string
}

interface DayData {
  date: number // Jour du mois (1-31)
  count: number
  isCurrentMonth: boolean
}

export default function ActivityHeatMap() {
  const [monthData, setMonthData] = useState<DayData[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())

  const daysOfWeek = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

  useEffect(() => {
    fetchMonthData()
  }, [currentDate])

  const fetchMonthData = async () => {
    try {
      setLoading(true)
      
      // Obtenir le premier et le dernier jour du mois
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth()
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      
      // Récupérer toutes les interventions
      const res = await fetch('/api/interventions?limit=1000')
      const data = await res.json()
      
      if (res.ok) {
        const interventions: Intervention[] = data.interventions || []
        
        // Filtrer les interventions du mois en cours
        const monthInterventions = interventions.filter((intervention) => {
          const date = new Date(intervention.date)
          return date >= firstDay && date <= lastDay
        })
        
        // Compter les interventions par jour
        const dayCountMap: { [key: number]: number } = {}
        monthInterventions.forEach((intervention) => {
          const date = new Date(intervention.date)
          const day = date.getDate()
          dayCountMap[day] = (dayCountMap[day] || 0) + 1
        })
        
        // Créer le tableau de données pour le calendrier
        const calendarData: DayData[] = []
        
        // Calculer le jour de la semaine du premier jour (0 = Dimanche, 1 = Lundi, etc.)
        const firstDayOfWeek = (firstDay.getDay() + 6) % 7 // Convertir en 0 = Lundi
        
        // Ajouter les jours vides avant le début du mois
        for (let i = 0; i < firstDayOfWeek; i++) {
          const prevMonthDay = new Date(year, month, -firstDayOfWeek + i + 1)
          calendarData.push({
            date: prevMonthDay.getDate(),
            count: 0,
            isCurrentMonth: false,
          })
        }
        
        // Ajouter les jours du mois
        const daysInMonth = lastDay.getDate()
        for (let day = 1; day <= daysInMonth; day++) {
          calendarData.push({
            date: day,
            count: dayCountMap[day] || 0,
            isCurrentMonth: true,
          })
        }
        
        // Ajouter les jours vides après la fin du mois pour compléter la dernière semaine
        const remainingDays = 7 - (calendarData.length % 7)
        if (remainingDays < 7) {
          for (let i = 1; i <= remainingDays; i++) {
            calendarData.push({
              date: i,
              count: 0,
              isCurrentMonth: false,
            })
          }
        }
        
        setMonthData(calendarData)
      }
    } catch (error) {
      console.error('Error fetching month data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getColor = (count: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return 'bg-gray-50 dark:bg-gray-900 opacity-30'
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800'
    if (count === 1) return 'bg-blue-200 dark:bg-blue-900'
    if (count === 2) return 'bg-blue-400 dark:bg-blue-700'
    if (count >= 3 && count <= 4) return 'bg-blue-600 dark:bg-blue-600'
    return 'bg-blue-800 dark:bg-blue-500'
  }

  const getIntensity = (count: number) => {
    if (count === 0) return 'Aucune'
    if (count === 1) return 'Faible'
    if (count === 2) return 'Moyenne'
    if (count >= 3 && count <= 4) return 'Élevée'
    return 'Très élevée'
  }

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const monthName = currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  const isCurrentMonth = 
    currentDate.getMonth() === new Date().getMonth() && 
    currentDate.getFullYear() === new Date().getFullYear()

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <div>
              <CardTitle>Carte d'activité mensuelle</CardTitle>
              <CardDescription className="text-xs mt-1">
                Densité des interventions - {monthName}
              </CardDescription>
            </div>
          </div>
          
          {/* Navigation mois */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousMonth}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            {!isCurrentMonth && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleToday}
                className="h-8 px-3 text-xs"
              >
                Aujourd'hui
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextMonth}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Calendrier mensuel */}
            <div className="overflow-x-auto">
              <div className="min-w-full">
                {/* En-tête des jours de la semaine */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {daysOfWeek.map((day) => (
                    <div
                      key={day}
                      className="text-center text-xs font-semibold text-muted-foreground py-2"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Grille des jours du mois */}
                <div className="grid grid-cols-7 gap-1">
                  {monthData.map((dayData, index) => {
                    const today = new Date()
                    const isToday =
                      dayData.isCurrentMonth &&
                      dayData.date === today.getDate() &&
                      currentDate.getMonth() === today.getMonth() &&
                      currentDate.getFullYear() === today.getFullYear()
                    
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          duration: 0.2,
                          delay: index * 0.01,
                        }}
                        className="relative"
                      >
                        <div
                          className={`
                            aspect-square rounded-lg flex flex-col items-center justify-center
                            transition-all duration-200 hover:scale-110 hover:shadow-lg cursor-pointer
                            relative group
                            ${getColor(dayData.count, dayData.isCurrentMonth)}
                            ${isToday ? 'ring-2 ring-primary ring-offset-2' : ''}
                          `}
                        >
                          {/* Numéro du jour */}
                          <span
                            className={`
                              text-sm font-semibold
                              ${dayData.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}
                              ${dayData.count > 3 ? 'text-white' : ''}
                            `}
                          >
                            {dayData.date}
                          </span>
                          
                          {/* Badge nombre d'interventions */}
                          {dayData.count > 0 && dayData.isCurrentMonth && (
                            <span className="text-[10px] font-bold text-white bg-black/30 px-1.5 py-0.5 rounded-full mt-1">
                              {dayData.count}
                            </span>
                          )}
                          
                          {/* Tooltip au survol */}
                          {dayData.isCurrentMonth && (
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 pointer-events-none">
                              {dayData.date} {monthName.split(' ')[0]}
                              <div className="font-semibold">
                                {dayData.count} intervention{dayData.count > 1 ? 's' : ''}
                              </div>
                              <div className="text-[10px] text-gray-300">
                                {getIntensity(dayData.count)}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Légende */}
            <div className="flex items-center justify-between pt-4 border-t">
              <span className="text-xs text-muted-foreground">Moins d'activité</span>
              <div className="flex gap-1">
                <div className="w-4 h-4 rounded bg-gray-100 dark:bg-gray-800"></div>
                <div className="w-4 h-4 rounded bg-blue-200 dark:bg-blue-900"></div>
                <div className="w-4 h-4 rounded bg-blue-400 dark:bg-blue-700"></div>
                <div className="w-4 h-4 rounded bg-blue-600 dark:bg-blue-600"></div>
                <div className="w-4 h-4 rounded bg-blue-800 dark:bg-blue-500"></div>
              </div>
              <span className="text-xs text-muted-foreground">Plus d'activité</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

