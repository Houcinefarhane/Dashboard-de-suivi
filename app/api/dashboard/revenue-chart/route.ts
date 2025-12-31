import { NextResponse } from 'next/server'
import { getCurrentArtisan } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
import { startOfMonth, subMonths, format } from 'date-fns'
import { fr } from 'date-fns/locale/fr'

export async function GET() {
  try {
    const artisan = await getCurrentArtisan()

    if (!artisan) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Données mensuelles (6 derniers mois) - Requêtes en parallèle
    const monthPromises = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(new Date(), i))
      const monthEnd = startOfMonth(subMonths(new Date(), i - 1))

      monthPromises.push(
        prisma.invoice.aggregate({
          where: {
            artisanId: artisan.id,
            date: {
              gte: monthStart,
              lt: monthEnd,
            },
            status: 'paid',
          },
          _sum: { total: true },
        }).then(agg => ({
          month: format(monthStart, 'MMM', { locale: fr }),
          revenue: Math.round(agg._sum.total || 0),
        }))
      )
    }

    const monthlyData = await Promise.all(monthPromises)

    return NextResponse.json(monthlyData)
  } catch (error) {
    console.error('Error fetching revenue chart data:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données' },
      { status: 500 }
    )
  }
}

