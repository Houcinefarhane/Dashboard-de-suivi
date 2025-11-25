import { NextResponse } from 'next/server'
import { getCurrentArtisan } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
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

    // Données mensuelles (6 derniers mois)
    const monthlyData = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(new Date(), i))
      const monthEnd = startOfMonth(subMonths(new Date(), i - 1))

      const monthInvoices = await prisma.invoice.findMany({
        where: {
          artisanId: artisan.id,
          date: {
            gte: monthStart,
            lt: monthEnd,
          },
          status: 'paid',
        },
        select: {
          total: true,
        },
      })

      const revenue = monthInvoices.reduce((sum, inv) => sum + inv.total, 0)

      monthlyData.push({
        month: format(monthStart, 'MMM', { locale: fr }),
        revenue: Math.round(revenue),
      })
    }

    return NextResponse.json(monthlyData)
  } catch (error) {
    console.error('Error fetching revenue chart data:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données' },
      { status: 500 }
    )
  }
}

