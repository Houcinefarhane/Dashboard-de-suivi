import { NextResponse } from 'next/server'
import { getCurrentArtisan } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay, addDays, isBefore } from 'date-fns'

export async function GET() {
  try {
    const artisan = await getCurrentArtisan()

    if (!artisan) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const today = new Date()
    const todayStart = startOfDay(today)
    const todayEnd = endOfDay(today)
    const tomorrowEnd = endOfDay(addDays(today, 1))

    // Interventions en cours aujourd'hui
    const todayInterventions = await prisma.intervention.findMany({
      where: {
        artisanId: artisan.id,
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
        status: {
          in: ['planned', 'in_progress'],
        },
      },
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
            address: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    })

    // Interventions urgentes (demain)
    const urgentInterventions = await prisma.intervention.findMany({
      where: {
        artisanId: artisan.id,
        date: {
          gte: todayEnd,
          lte: tomorrowEnd,
        },
        status: 'planned',
      },
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
            address: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    })

    // Interventions en cours (in_progress)
    const inProgressInterventions = await prisma.intervention.findMany({
      where: {
        artisanId: artisan.id,
        status: 'in_progress',
      },
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
            address: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    })

    // Factures en retard
    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        artisanId: artisan.id,
        status: {
          in: ['sent', 'draft'],
        },
        dueDate: {
          lt: today,
        },
      },
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    })

    // Groupement par zone géographique (par code postal ou ville)
    const allInterventions = [...todayInterventions, ...urgentInterventions]
    const interventionsByZone = allInterventions.reduce((acc, intervention) => {
      let zone = 'Non spécifié'
      
      if (intervention.address) {
        // Utiliser l'adresse de l'intervention si disponible
        const parts = intervention.address.split(',').map(p => p.trim())
        zone = parts[parts.length - 1] || 'Non spécifié'
      } else if (intervention.client.address) {
        // Sinon utiliser l'adresse du client
        const parts = intervention.client.address.split(',').map(p => p.trim())
        zone = parts[parts.length - 1] || 'Non spécifié'
      }
      
      if (!acc[zone]) {
        acc[zone] = []
      }
      acc[zone].push(intervention)
      return acc
    }, {} as Record<string, typeof todayInterventions>)

    return NextResponse.json({
      today: todayInterventions,
      urgent: urgentInterventions,
      inProgress: inProgressInterventions,
      overdueInvoices,
      byZone: Object.entries(interventionsByZone).map(([zone, interventions]) => ({
        zone,
        count: interventions.length,
        interventions,
      })),
    })
  } catch (error) {
    console.error('Error fetching operations:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des opérations' },
      { status: 500 }
    )
  }
}

