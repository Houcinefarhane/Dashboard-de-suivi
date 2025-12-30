import { NextResponse } from 'next/server'
import { getCurrentArtisan } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
import { 
  startOfMonth, subMonths, format, startOfWeek, endOfWeek, 
  startOfYear, endOfYear, eachWeekOfInterval, eachMonthOfInterval,
  subWeeks, subYears
} from 'date-fns'
import { fr } from 'date-fns/locale/fr'

export async function GET(request: Request) {
  try {
    const artisan = await getCurrentArtisan()

    if (!artisan) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const granularity = searchParams.get('granularity') || 'month' // week, month, year
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : new Date().getFullYear()
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : new Date().getMonth() + 1

    // Déterminer la période selon la granularité
    let startDate: Date
    let endDate: Date
    let periods: Date[] = []

    if (granularity === 'week') {
      // Semaines du mois sélectionné
      startDate = startOfMonth(new Date(year, month - 1))
      endDate = endOfYear(new Date(year, month - 1))
      periods = eachWeekOfInterval({ start: startDate, end: endDate }, { weekStartsOn: 1 })
    } else if (granularity === 'month') {
      // Mois de l'année sélectionnée
      startDate = startOfYear(new Date(year, 0))
      endDate = endOfYear(new Date(year, 0))
      periods = eachMonthOfInterval({ start: startDate, end: endDate })
    } else if (granularity === 'year') {
      // 5 dernières années
      startDate = startOfYear(subYears(new Date(), 4))
      endDate = endOfYear(new Date())
      for (let i = 4; i >= 0; i--) {
        periods.push(startOfYear(subYears(new Date(), i)))
      }
    }

    // Récupérer toutes les factures payées
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

    // Récupérer toutes les dépenses
    const expenses = await prisma.expense.findMany({
      where: {
        artisanId: artisan.id,
      },
      select: {
        amount: true,
        date: true,
      },
    })

    // Calculer les totaux pour la période complète
    const periodInvoices = paidInvoices.filter((inv) => {
      const invDate = new Date(inv.date)
      return invDate >= startDate && invDate <= endDate
    })

    const periodExpenses = expenses.filter((exp) => {
      const expDate = new Date(exp.date)
      return expDate >= startDate && expDate <= endDate
    })

    const totalRevenue = periodInvoices.reduce((sum, invoice) => sum + invoice.total, 0)
    const totalExpenses = periodExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    const profit = totalRevenue - totalExpenses

    // Générer les données par période
    const chartData = periods.map((periodStart) => {
      let periodEnd: Date

      if (granularity === 'week') {
        periodEnd = endOfWeek(periodStart, { weekStartsOn: 1 })
      } else if (granularity === 'month') {
        periodEnd = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 0)
      } else {
        periodEnd = endOfYear(periodStart)
      }

      const periodRevenue = paidInvoices
        .filter((inv) => {
          const invDate = new Date(inv.date)
          return invDate >= periodStart && invDate <= periodEnd
        })
        .reduce((sum, inv) => sum + inv.total, 0)

      const periodExpensesAmount = expenses
        .filter((exp) => {
          const expDate = new Date(exp.date)
          return expDate >= periodStart && expDate <= periodEnd
        })
        .reduce((sum, exp) => sum + exp.amount, 0)

      let label: string
      if (granularity === 'week') {
        label = `S${format(periodStart, 'w', { locale: fr })}`
      } else if (granularity === 'month') {
        label = format(periodStart, 'MMM', { locale: fr })
      } else {
        label = format(periodStart, 'yyyy')
      }

      return {
        period: label,
        revenue: periodRevenue,
        expenses: periodExpensesAmount,
        profit: periodRevenue - periodExpensesAmount,
      }
    })

    return NextResponse.json({
      totalRevenue,
      totalExpenses,
      profit,
      chartData,
      granularity,
      year,
      month,
    })
  } catch (error) {
    console.error('Error fetching financial data:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données financières' },
      { status: 500 }
    )
  }
}

