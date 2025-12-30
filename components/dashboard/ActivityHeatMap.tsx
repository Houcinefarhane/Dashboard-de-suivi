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
      lastDay.setHours(23, 59, 59, 999) // Fin de la journée
      
      // Récupérer les interventions du mois avec filtrage par dates
      const params = new URLSearchParams({
        start: firstDay.toISOString(),
        end: lastDay.toISOString(),
      })
      
      const res = await fetch(`/api/interventions?${params.toString()}`)
      const data = await res.json()
      
      if (res.ok) {
        const interventions: Intervention[] = Array.isArray(data) ? data : []
        
        console.log(`📅 Interventions récupérées pour ${monthName}:`, interventions.length)
        
        // Compter les interventions par jour du mois
        const dayCountMap: { [key: number]: number } = {}
        interventions.forEach((intervention) => {
          const date = new Date(intervention.date)
          const day = date.getDate()
          dayCountMap[day] = (dayCountMap[day] || 0) + 1
        })
        
        console.log('📊 Répartition par jour:', dayCountMap)
        
        // Créer le tableau de données pour le calendrier
        const calendarData: DayData[] = []
        
        // Calculer le jour de la semaine du premier jour (0 = Dimanche, 1 = Lundi, etc.)
        // En JavaScript: 0=Dim, 1=Lun, 2=Mar, 3=Mer, 4=Jeu, 5=Ven, 6=Sam
        // On veut: 0=Lun, 1=Mar, 2=Mer, 3=Jeu, 4=Ven, 5=Sam, 6=Dim
        let firstDayOfWeek = firstDay.getDay() - 1 // -1 pour que Lundi = 0
        if (firstDayOfWeek === -1) firstDayOfWeek = 6 // Dimanche devient 6
        
        // Ajouter les jours du mois précédent pour compléter la première semaine
        const prevMonth = new Date(year, month, 0) // Dernier jour du mois précédent
        const prevMonthLastDay = prevMonth.getDate()
        
        // Si le mois commence un Lundi (0), pas besoin d'ajouter de jours
        // Si le mois commence un Mardi (1), ajouter 1 jour (le Lundi précédent)
        // Si le mois commence un Dimanche (6), ajouter 6 jours (Lun-Sam précédents)
        for (let i = 0; i < firstDayOfWeek; i++) {
          const dayNumber = prevMonthLastDay - firstDayOfWeek + i + 1
          calendarData.push({
            date: dayNumber,
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
        
        // Ajouter les jours du mois suivant pour compléter la dernière semaine
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
      } else {
        console.error('❌ Erreur API:', res.status, data)
      }
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des données du heatmap:', error)
    } finally {
      setLoading(false)
    }
  }

  const getColor = (count: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return 'bg-gray-100/50 dark:bg-gray-900/50'
    if (count === 0) return 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800'
    if (count === 1) return 'bg-emerald-100 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-900'
    if (count === 2) return 'bg-emerald-200 dark:bg-emerald-900 border-emerald-300 dark:border-emerald-800'
    if (count === 3) return 'bg-emerald-300 dark:bg-emerald-800 border-emerald-400 dark:border-emerald-700'
    if (count === 4) return 'bg-emerald-400 dark:bg-emerald-700 border-emerald-500 dark:border-emerald-600'
    if (count === 5) return 'bg-emerald-500 dark:bg-emerald-600 border-emerald-600 dark:border-emerald-500'
    if (count === 6) return 'bg-emerald-600 dark:bg-emerald-500 border-emerald-700 dark:border-emerald-400'
    if (count >= 7) return 'bg-emerald-700 dark:bg-emerald-400 border-emerald-800 dark:border-emerald-300'
    return 'bg-emerald-800 dark:bg-emerald-300 border-emerald-900 dark:border-emerald-200'
  }

  const getTextColor = (count: number) => {
    if (count === 0) return 'text-gray-400 dark:text-gray-600'
    if (count <= 3) return 'text-emerald-800 dark:text-emerald-300'
    return 'text-white dark:text-emerald-950'
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
      <CardHeader className="pb-2 pt-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <div>
              <CardTitle className="text-sm">Carte d'activité mensuelle</CardTitle>
              <CardDescription className="text-[9px] mt-0">
                {monthName}
              </CardDescription>
            </div>
          </div>
          
          {/* Navigation mois */}
          <div className="flex items-center gap-0.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousMonth}
              className="h-6 w-6 p-0"
            >
              <ChevronLeft className="w-3 h-3" />
            </Button>
            
            {!isCurrentMonth && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleToday}
                className="h-6 px-1.5 text-[9px]"
              >
                Aujourd'hui
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextMonth}
              className="h-6 w-6 p-0"
            >
              <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 pb-2 px-4">
        {loading ? (
          <div className="flex items-center justify-center h-24">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-1.5">
            {/* Calendrier mensuel */}
            <div className="overflow-x-auto">
              <div className="min-w-full">
                {/* En-tête des jours de la semaine */}
                <div className="grid grid-cols-7 gap-0.5 mb-0.5">
                  {daysOfWeek.map((day) => (
                    <div
                      key={day}
                      className="text-center text-[8px] font-semibold text-muted-foreground py-0.5"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Grille des jours du mois */}
                <div className="grid grid-cols-7 gap-0.5">
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
                            w-full h-8 rounded-sm flex flex-col items-center justify-center
                            transition-all duration-200 hover:scale-105 hover:shadow-md cursor-pointer
                            relative group border
                            ${getColor(dayData.count, dayData.isCurrentMonth)}
                            ${isToday ? 'ring-2 ring-blue-500 ring-offset-0' : ''}
                          `}
                        >
                          {/* Numéro du jour - petit en haut à gauche */}
                          <span
                            className={`
                              text-[7px] font-semibold absolute top-0.5 left-0.5
                              ${dayData.isCurrentMonth ? getTextColor(dayData.count) : 'text-gray-400 dark:text-gray-700'}
                            `}
                          >
                            {dayData.date}
                          </span>
                          
                          {/* Nombre d'interventions - au centre */}
                          {dayData.isCurrentMonth && dayData.count > 0 && (
                            <span className={`text-xs font-bold ${getTextColor(dayData.count)}`}>
                              {dayData.count}
                            </span>
                          )}
                          
                          {/* Tooltip au survol - compact */}
                          {dayData.isCurrentMonth && (
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-0.5 px-1.5 py-0.5 bg-gray-900 dark:bg-gray-800 text-white text-[9px] rounded opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-20 pointer-events-none shadow-lg">
                              <div className="font-semibold">
                                {dayData.date} {monthName.split(' ')[0]} : {dayData.count} intervention{dayData.count > 1 ? 's' : ''}
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

            {/* Légende - dégradé compact */}
            <div className="flex items-center justify-center gap-2 pt-1.5 border-t">
              <span className="text-[8px] text-muted-foreground font-medium">Moins</span>
              <div className="flex gap-0.5">
                <div className="w-3 h-3 rounded-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800"></div>
                <div className="w-3 h-3 rounded-sm bg-emerald-100 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-900"></div>
                <div className="w-3 h-3 rounded-sm bg-emerald-200 dark:bg-emerald-900 border border-emerald-300 dark:border-emerald-800"></div>
                <div className="w-3 h-3 rounded-sm bg-emerald-300 dark:bg-emerald-800 border border-emerald-400 dark:border-emerald-700"></div>
                <div className="w-3 h-3 rounded-sm bg-emerald-400 dark:bg-emerald-700 border border-emerald-500 dark:border-emerald-600"></div>
                <div className="w-3 h-3 rounded-sm bg-emerald-500 dark:bg-emerald-600 border border-emerald-600 dark:border-emerald-500"></div>
                <div className="w-3 h-3 rounded-sm bg-emerald-600 dark:bg-emerald-500 border border-emerald-700 dark:border-emerald-400"></div>
                <div className="w-3 h-3 rounded-sm bg-emerald-700 dark:bg-emerald-400 border border-emerald-800 dark:border-emerald-300"></div>
              </div>
              <span className="text-[8px] text-muted-foreground font-medium">Plus</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

