import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const artisanId = cookieStore.get('artisanId')?.value

    if (!artisanId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { objectiveId } = body

    // Récupérer l'objectif
    const objective = await prisma.financialObjective.findUnique({
      where: { id: objectiveId, artisanId },
      include: { keyResults: true },
    })

    if (!objective) {
      return NextResponse.json({ error: 'Objectif non trouvé' }, { status: 404 })
    }

    // Déterminer la période
    let startDate: Date
    let endDate: Date

    if (objective.period === 'monthly' && objective.month) {
      startDate = startOfMonth(new Date(objective.year, objective.month - 1, 1))
      endDate = endOfMonth(new Date(objective.year, objective.month - 1, 1))
    } else {
      startDate = startOfYear(new Date(objective.year, 0, 1))
      endDate = endOfYear(new Date(objective.year, 0, 1))
    }

    // Mettre à jour chaque Key Result
    for (const kr of objective.keyResults) {
      let currentValue = 0

      switch (kr.metric) {
        case 'revenue':
          // Calculer le CA total sur la période
          const invoices = await prisma.invoice.findMany({
            where: {
              artisanId,
              status: 'paid',
              date: {
                gte: startDate,
                lte: endDate,
              },
            },
          })
          currentValue = invoices.reduce((sum, inv) => sum + inv.total, 0)
          break

        case 'profit':
          // Calculer le profit (CA - dépenses)
          const paidInvoices = await prisma.invoice.findMany({
            where: {
              artisanId,
              status: 'paid',
              date: {
                gte: startDate,
                lte: endDate,
              },
            },
          })
          const revenue = paidInvoices.reduce((sum, inv) => sum + inv.total, 0)

          const expenses = await prisma.expense.findMany({
            where: {
              artisanId,
              date: {
                gte: startDate,
                lte: endDate,
              },
            },
          })
          const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)

          currentValue = revenue - totalExpenses
          break

        case 'expenses':
          // Calculer les dépenses totales
          const allExpenses = await prisma.expense.findMany({
            where: {
              artisanId,
              date: {
                gte: startDate,
                lte: endDate,
              },
            },
          })
          currentValue = allExpenses.reduce((sum, exp) => sum + exp.amount, 0)
          break

        case 'client_count':
          // Compter les nouveaux clients
          const clients = await prisma.client.findMany({
            where: {
              artisanId,
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            },
          })
          currentValue = clients.length
          break

        case 'intervention_count':
          // Compter les interventions terminées
          const interventions = await prisma.intervention.findMany({
            where: {
              artisanId,
              status: 'completed',
              date: {
                gte: startDate,
                lte: endDate,
              },
            },
          })
          currentValue = interventions.length
          break
      }

      // Mettre à jour le Key Result
      await prisma.keyResult.update({
        where: { id: kr.id },
        data: { currentValue },
      })
    }

    // Récupérer l'objectif mis à jour
    const updatedObjective = await prisma.financialObjective.findUnique({
      where: { id: objectiveId },
      include: { keyResults: true },
    })

    return NextResponse.json(updatedObjective)
  } catch (error) {
    console.error('Error syncing financial objective:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la synchronisation de l\'objectif' },
      { status: 500 }
    )
  }
}

