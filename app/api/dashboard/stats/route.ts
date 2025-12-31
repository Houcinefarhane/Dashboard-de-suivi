import { NextResponse } from 'next/server'
import { getCurrentArtisan } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfMonth, subMonths } from 'date-fns'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const artisan = await getCurrentArtisan()

    if (!artisan) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Dates pour les calculs
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    startOfMonth.setHours(0, 0, 0, 0)
    
    const nextWeek = new Date(now)
    nextWeek.setDate(nextWeek.getDate() + 7)
    
    const startOfLastMonth = subMonths(startOfMonth, 1)
    const endOfLastMonth = new Date(startOfMonth)
    endOfLastMonth.setMilliseconds(-1)

    // Toutes les requêtes en parallèle avec aggregations SQL
    const [
      totalClients,
      upcomingInterventions,
      monthlyRevenueAgg,
      lastMonthRevenueAgg,
      totalRevenueAgg,
      pendingInvoices,
      stockItems,
    ] = await Promise.all([
      // 1. Compter les clients
      prisma.client.count({
        where: { artisanId: artisan.id },
      }),
      
      // 2. Compter les interventions à venir
      prisma.intervention.count({
        where: {
          artisanId: artisan.id,
          date: {
            gte: now,
            lte: nextWeek,
          },
          status: {
            not: 'cancelled',
          },
        },
      }),
      
      // 3. Revenus du mois en cours (aggregation SQL)
      prisma.invoice.aggregate({
        where: {
          artisanId: artisan.id,
          date: { gte: startOfMonth },
          status: 'paid',
        },
        _sum: { total: true },
      }),
      
      // 4. Revenus du mois précédent (aggregation SQL)
      prisma.invoice.aggregate({
        where: {
          artisanId: artisan.id,
          date: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
          status: 'paid',
        },
        _sum: { total: true },
      }),
      
      // 5. Revenus totaux (aggregation SQL)
      prisma.invoice.aggregate({
        where: {
          artisanId: artisan.id,
          status: 'paid',
        },
        _sum: { total: true },
      }),
      
      // 6. Factures en attente
      prisma.invoice.count({
        where: {
          artisanId: artisan.id,
          status: {
            in: ['sent', 'draft'],
          },
        },
      }),
      
      // 7. Articles de stock (pour calculer lowStockItems)
      prisma.stockItem.findMany({
        where: { artisanId: artisan.id },
        select: {
          quantity: true,
          minQuantity: true,
        },
      }),
    ])

    // Calculs finaux
    const monthlyRevenue = monthlyRevenueAgg._sum.total || 0
    const lastMonthRevenue = lastMonthRevenueAgg._sum.total || 0
    const totalRevenue = totalRevenueAgg._sum.total || 0
    const monthlyGrowth = lastMonthRevenue > 0
      ? Math.round(((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
      : 0
    
    const lowStockItems = stockItems.filter(
      (item) => item.quantity <= (item.minQuantity || 0)
    ).length

    return NextResponse.json({
      totalClients,
      upcomingInterventions,
      monthlyRevenue,
      lowStockItems,
      pendingInvoices,
      totalRevenue,
      monthlyGrowth,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    )
  }
}
