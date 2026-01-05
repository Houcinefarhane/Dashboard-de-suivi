import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getCurrentArtisan } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PRICE_ID_MONTHLY } from '@/lib/stripe'

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

    // Vérifier si l'utilisateur a déjà un abonnement actif
    const existingSubscription = await prisma.subscription.findUnique({
      where: { artisanId: artisan.id },
    })

    if (existingSubscription && existingSubscription.status === 'active') {
      return NextResponse.json(
        { error: 'Vous avez déjà un abonnement actif' },
        { status: 400 }
      )
    }

    // Créer ou récupérer le client Stripe
    let customerId = existingSubscription?.stripeCustomerId

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: artisan.email,
        name: artisan.name,
        metadata: {
          artisanId: artisan.id,
        },
      })
      customerId = customer.id

      // Sauvegarder le customer ID
      if (existingSubscription) {
        await prisma.subscription.update({
          where: { artisanId: artisan.id },
          data: { stripeCustomerId: customerId },
        })
      } else {
        await prisma.subscription.create({
          data: {
            artisanId: artisan.id,
            stripeCustomerId: customerId,
            status: 'inactive',
          },
        })
      }
    }

    // Créer la session de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: PRICE_ID_MONTHLY,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/dashboard/abonnement?success=true`,
      cancel_url: `${baseUrl}/dashboard/abonnement?canceled=true`,
      subscription_data: {
        metadata: {
          artisanId: artisan.id,
        },
      },
      metadata: {
        artisanId: artisan.id,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Erreur lors de la création de la session checkout:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session de paiement' },
      { status: 500 }
    )
  }
}

