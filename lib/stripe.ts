import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
})

// Prix mensuel : 49€ HT = 58.80€ TTC (TVA 20%)
export const PRICE_ID_MONTHLY = process.env.STRIPE_PRICE_ID_MONTHLY || ''

