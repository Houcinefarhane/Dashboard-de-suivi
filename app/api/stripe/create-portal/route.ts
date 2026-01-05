import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getCurrentArtisan } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://billiev.com'

export async function POST(request: Request) {
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

    if (!subscription || !subscription.stripeCustomerId) {
      return NextResponse.json(
        { error: 'Aucun abonnement trouvé' },
        { status: 404 }
      )
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${baseUrl}/dashboard/abonnement`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error: any) {
    console.error('Erreur lors de la création de la session portal:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session du portail' },
      { status: 500 }
    )
  }
}

