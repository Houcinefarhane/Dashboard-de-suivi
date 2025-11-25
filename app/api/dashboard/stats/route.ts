import { NextResponse } from 'next/server'
import { getCurrentArtisan } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfMonth, subMonths } from 'date-fns'

export async function GET() {
  try {
    const artisan = await getCurrentArtisan()

    if (!artisan) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Compter les clients
    const totalClients = await prisma.client.count({
      where: { artisanId: artisan.id },
    })

    // Compter les interventions à venir (7 prochains jours)
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)
    
    const upcomingInterventions = await prisma.intervention.count({
      where: {
        artisanId: artisan.id,
        date: {
          gte: new Date(),
          lte: nextWeek,
        },
        status: {
          not: 'cancelled',
        },
      },
    })

    // Calculer les revenus du mois en cours
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const invoices = await prisma.invoice.findMany({
      where: {
        artisanId: artisan.id,
        date: {
          gte: startOfMonth,
        },
        status: 'paid',
      },
      select: {
        total: true,
      },
    })

    const monthlyRevenue = invoices.reduce((sum, invoice) => sum + invoice.total, 0)

    // Revenus du mois précédent pour calculer la croissance
    const startOfLastMonth = subMonths(startOfMonth, 1)
    const endOfLastMonth = new Date(startOfMonth)
    endOfLastMonth.setMilliseconds(-1)

    const lastMonthInvoices = await prisma.invoice.findMany({
      where: {
        artisanId: artisan.id,
        date: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
        status: 'paid',
      },
      select: {
        total: true,
      },
    })

    const lastMonthRevenue = lastMonthInvoices.reduce((sum, invoice) => sum + invoice.total, 0)
    const monthlyGrowth = lastMonthRevenue > 0
      ? Math.round(((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
      : 0

    // Compter les articles en stock faible
    const stockItems = await prisma.stockItem.findMany({
      where: {
        artisanId: artisan.id,
      },
      select: {
        quantity: true,
        minQuantity: true,
      },
    })

    const lowStockItems = stockItems.filter(
      (item) => item.quantity <= (item.minQuantity || 0)
    ).length

    // Compter les factures en attente
    const pendingInvoices = await prisma.invoice.count({
      where: {
        artisanId: artisan.id,
        status: {
          in: ['sent', 'draft'],
        },
      },
    })

    // Revenus totaux
    const allPaidInvoices = await prisma.invoice.findMany({
      where: {
        artisanId: artisan.id,
        status: 'paid',
      },
      select: {
        total: true,
      },
    })

    const totalRevenue = allPaidInvoices.reduce((sum, invoice) => sum + invoice.total, 0)

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
