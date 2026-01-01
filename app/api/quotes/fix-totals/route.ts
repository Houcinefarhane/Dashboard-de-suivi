import { NextResponse } from 'next/server'
import { getCurrentArtisan } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const artisan = await getCurrentArtisan()

    if (!artisan) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // 1. Corriger tous les totaux des QuoteItem
    const allQuoteItems = await prisma.quoteItem.findMany({
      where: {
        quote: {
          artisanId: artisan.id,
        },
      },
    })

    let correctedCount = 0
    for (const item of allQuoteItems) {
      const correctTotal = Math.round((item.quantity * item.unitPrice) * 100) / 100
      if (Math.abs(item.total - correctTotal) > 0.01) {
        await prisma.quoteItem.update({
          where: { id: item.id },
          data: { total: correctTotal },
        })
        correctedCount++
      }
    }

    // 2. Recalculer les totaux des devis
    const allQuotes = await prisma.quote.findMany({
      where: { artisanId: artisan.id },
      include: { items: true },
    })

    let quotesCorrected = 0
    for (const quote of allQuotes) {
      const newSubtotal = quote.items.reduce((sum, item) => sum + item.total, 0)
      const newTax = Math.round(newSubtotal * (quote.taxRate / 100) * 100) / 100
      const newTotal = Math.round((newSubtotal + newTax) * 100) / 100

      if (
        Math.abs(quote.subtotal - newSubtotal) > 0.01 ||
        Math.abs(quote.tax - newTax) > 0.01 ||
        Math.abs(quote.total - newTotal) > 0.01
      ) {
        await prisma.quote.update({
          where: { id: quote.id },
          data: {
            subtotal: newSubtotal,
            tax: newTax,
            total: newTotal,
          },
        })
        quotesCorrected++
      }
    }

    return NextResponse.json({
      success: true,
      itemsCorrected: correctedCount,
      quotesCorrected,
      message: `${correctedCount} items et ${quotesCorrected} devis corrigés`,
    })
  } catch (error) {
    console.error('Error fixing quote totals:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la correction des totaux' },
      { status: 500 }
    )
  }
}

