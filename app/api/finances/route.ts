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

    // Revenus totaux (factures payées)
    const paidInvoices = await prisma.invoice.findMany({
      where: {
        artisanId: artisan.id,
        status: 'paid',
      },
      select: {
        total: true,
        date: true,
      },
    })

    const totalRevenue = paidInvoices.reduce((sum, invoice) => sum + invoice.total, 0)

    // Dépenses totales
    const expenses = await prisma.expense.findMany({
      where: {
        artisanId: artisan.id,
      },
      select: {
        amount: true,
        date: true,
      },
    })

    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    // Bénéfice brut = revenus - dépenses
    const profit = totalRevenue - totalExpenses

    // Données mensuelles (12 derniers mois pour permettre la navigation)
    const monthlyData = []
    for (let i = 11; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(new Date(), i))
      const monthEnd = startOfMonth(subMonths(new Date(), i - 1))

      const monthRevenue = paidInvoices
        .filter((inv) => {
          const invDate = new Date(inv.date)
          return invDate >= monthStart && invDate < monthEnd
        })
        .reduce((sum, inv) => sum + inv.total, 0)

      const monthExpenses = expenses
        .filter((exp) => {
          const expDate = new Date(exp.date)
          return expDate >= monthStart && expDate < monthEnd
        })
        .reduce((sum, exp) => sum + exp.amount, 0)

      monthlyData.push({
        month: format(monthStart, 'MMM yyyy', { locale: fr }),
        revenue: monthRevenue,
        expenses: monthExpenses,
        profit: monthRevenue - monthExpenses, // Bénéfice brut = revenus - dépenses
      })
    }

    return NextResponse.json({
      totalRevenue,
      totalExpenses,
      profit,
      monthlyData,
    })
  } catch (error) {
    console.error('Error fetching financial data:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données financières' },
      { status: 500 }
    )
  }
}

