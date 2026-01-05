import { NextResponse } from 'next/server'
import { getCurrentArtisan } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const artisan = await getCurrentArtisan()

    if (!artisan) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const subscription = await prisma.subscription.findUnique({
      where: { artisanId: artisan.id },
    })

    if (!subscription) {
      return NextResponse.json({
        status: 'inactive',
        subscription: null,
      })
    }

    return NextResponse.json({
      status: subscription.status,
      subscription: {
        id: subscription.id,
        stripeStatus: subscription.stripeStatus,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        canceledAt: subscription.canceledAt,
      },
    })
  } catch (error: any) {
    console.error('Erreur lors de la récupération de l\'abonnement:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'abonnement' },
      { status: 500 }
    )
  }
}

