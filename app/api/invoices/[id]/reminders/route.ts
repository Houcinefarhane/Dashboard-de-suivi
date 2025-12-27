import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { getCurrentArtisan } from '@/lib/auth'
import { sendInvoiceReminder, checkAndSendInvoiceReminders } from '@/lib/notifications'
import { prisma } from '@/lib/prisma'

// GET : Récupérer l'historique des relances pour une facture
export async function GET(
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

    // Vérifier que la facture appartient à l'artisan
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: params.id,
        artisanId: artisan.id,
      },
    })

    if (!invoice) {
      return NextResponse.json(
        { error: 'Facture non trouvée' },
        { status: 404 }
      )
    }

    // Récupérer toutes les relances pour cette facture
    const reminders = await prisma.invoiceReminder.findMany({
      where: {
        invoiceId: params.id,
      },
      orderBy: {
        sentAt: 'desc',
      },
    })

    return NextResponse.json(reminders)
  } catch (error) {
    console.error('Error fetching reminders:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des relances' },
      { status: 500 }
    )
  }
}

// POST : Envoyer une relance manuelle pour une facture
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

    const body = await request.json()
    const { method = 'notification' } = body

    const reminder = await sendInvoiceReminder(params.id, artisan.id, method)

    return NextResponse.json(reminder)
  } catch (error) {
    console.error('Error sending reminder:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur lors de l\'envoi de la relance' },
      { status: 500 }
    )
  }
}
