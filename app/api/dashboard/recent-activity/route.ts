import { NextResponse } from 'next/server'
import { getCurrentArtisan } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
import { formatDistanceToNow } from 'date-fns'
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

    const activities: any[] = []

    // Dernières factures
    const recentInvoices = await prisma.invoice.findMany({
      where: { artisanId: artisan.id },
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 3,
    })

    recentInvoices.forEach((invoice) => {
      activities.push({
        type: 'invoice',
        title: `Facture #${invoice.invoiceNumber} - ${invoice.client.firstName} ${invoice.client.lastName}`,
        date: formatDistanceToNow(new Date(invoice.createdAt), { addSuffix: true, locale: fr }),
        amount: invoice.total,
        status: invoice.status,
        createdAt: invoice.createdAt,
      })
    })

    // Dernières interventions
    const recentInterventions = await prisma.intervention.findMany({
      where: { artisanId: artisan.id },
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 3,
    })

    recentInterventions.forEach((intervention) => {
      activities.push({
        type: 'intervention',
        title: `${intervention.title} - ${intervention.client.firstName} ${intervention.client.lastName}`,
        date: formatDistanceToNow(new Date(intervention.createdAt), { addSuffix: true, locale: fr }),
        status: intervention.status,
        createdAt: intervention.createdAt,
      })
    })

    // Derniers clients
    const recentClients = await prisma.client.findMany({
      where: { artisanId: artisan.id },
      orderBy: { createdAt: 'desc' },
      take: 2,
    })

    recentClients.forEach((client) => {
      activities.push({
        type: 'client',
        title: `Nouveau client: ${client.firstName} ${client.lastName}`,
        date: formatDistanceToNow(new Date(client.createdAt), { addSuffix: true, locale: fr }),
        createdAt: client.createdAt,
      })
    })

    // Trier par date de création et prendre les 6 plus récents
    activities.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return NextResponse.json(activities.slice(0, 6))
  } catch (error) {
    console.error('Error fetching recent activity:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'activité récente' },
      { status: 500 }
    )
  }
}

