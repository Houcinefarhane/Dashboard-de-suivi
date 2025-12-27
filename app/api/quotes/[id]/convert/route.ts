import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { getCurrentArtisan } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const artisan = await getCurrentArtisan()

    if (!artisan) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Récupérer le devis
    const quote = await prisma.quote.findFirst({
      where: {
        id: params.id,
        artisanId: artisan.id,
      },
      include: {
        client: true,
        items: true,
      },
    })

    if (!quote) {
      return NextResponse.json(
        { error: 'Devis non trouvé' },
        { status: 404 }
      )
    }

    // Générer un numéro de facture unique
    const lastInvoice = await prisma.invoice.findFirst({
      where: { artisanId: artisan.id },
      orderBy: { createdAt: 'desc' },
    })

    const invoiceNumber = lastInvoice
      ? `FAC-${String(parseInt(lastInvoice.invoiceNumber.split('-')[1] || '0') + 1).padStart(6, '0')}`
      : 'FAC-000001'

    // Créer la facture à partir du devis
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        date: new Date(),
        dueDate: quote.validUntil || null,
        subtotal: quote.subtotal,
        taxRate: quote.taxRate || 20,
        tax: quote.tax,
        total: quote.total,
        notes: quote.notes || null,
        status: 'draft',
        artisanId: artisan.id,
        clientId: quote.clientId,
        items: {
          create: quote.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
          })),
        },
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            address: true,
          },
        },
        items: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    // Mettre à jour le statut du devis à "accepted"
    await prisma.quote.update({
      where: { id: params.id },
      data: { status: 'accepted' },
    })

    return NextResponse.json(invoice)
  } catch (error) {
    console.error('Error converting quote to invoice:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la conversion du devis en facture' },
      { status: 500 }
    )
  }
}

