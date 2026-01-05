import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error('Erreur de signature webhook:', err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const artisanId = session.metadata?.artisanId

        if (artisanId && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          )

          await prisma.subscription.upsert({
            where: { artisanId },
            update: {
              stripeSubscriptionId: subscription.id,
              stripeCustomerId: subscription.customer as string,
              stripePriceId: subscription.items.data[0]?.price.id,
              stripeStatus: subscription.status,
              status: subscription.status === 'active' ? 'active' : 'inactive',
              currentPeriodStart: new Date(subscription.current_period_start * 1000),
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
            },
            create: {
              artisanId,
              stripeSubscriptionId: subscription.id,
              stripeCustomerId: subscription.customer as string,
              stripePriceId: subscription.items.data[0]?.price.id,
              stripeStatus: subscription.status,
              status: subscription.status === 'active' ? 'active' : 'inactive',
              currentPeriodStart: new Date(subscription.current_period_start * 1000),
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
            },
          })
        }
        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const artisanId = subscription.metadata?.artisanId

        if (artisanId) {
          await prisma.subscription.update({
            where: { stripeSubscriptionId: subscription.id },
            data: {
              stripeStatus: subscription.status,
              status: subscription.status === 'active' ? 'active' : 'canceled',
              currentPeriodStart: new Date(subscription.current_period_start * 1000),
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
              canceledAt: subscription.canceled_at
                ? new Date(subscription.canceled_at * 1000)
                : null,
            },
          })
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          )
          const artisanId = subscription.metadata?.artisanId

          if (artisanId) {
            await prisma.subscription.update({
              where: { stripeSubscriptionId: subscription.id },
              data: {
                currentPeriodStart: new Date(subscription.current_period_start * 1000),
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              },
            })
          }
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          )
          const artisanId = subscription.metadata?.artisanId

          if (artisanId) {
            await prisma.subscription.update({
              where: { stripeSubscriptionId: subscription.id },
              data: {
                status: 'past_due',
                stripeStatus: 'past_due',
              },
            })
          }
        }
        break
      }

      default:
        console.log(`Événement non géré: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Erreur lors du traitement du webhook:', error)
    return NextResponse.json(
      { error: 'Erreur lors du traitement du webhook' },
      { status: 500 }
    )
  }
}

