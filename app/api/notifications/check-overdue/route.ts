import { NextResponse } from 'next/server'
import { getCurrentArtisan } from '@/lib/auth'
import { checkOverdueInvoices } from '@/lib/notifications'

export async function POST() {
  try {
    const artisan = await getCurrentArtisan()

    if (!artisan) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    await checkOverdueInvoices(artisan.id)

    return NextResponse.json({ success: true, message: 'Vérification des factures en retard effectuée' })
  } catch (error) {
    console.error('Error checking overdue invoices:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la vérification des factures en retard' },
      { status: 500 }
    )
  }
}

