import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { getCurrentArtisan } from '@/lib/auth'
import { checkAndSendInvoiceReminders } from '@/lib/notifications'

// POST : Vérifier et envoyer automatiquement les relances pour toutes les factures en retard
export async function POST() {
  try {
    const artisan = await getCurrentArtisan()

    if (!artisan) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const results = await checkAndSendInvoiceReminders(artisan.id)

    return NextResponse.json({
      success: true,
      results,
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
    })
  } catch (error) {
    console.error('Error checking reminders:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la vérification des relances' },
      { status: 500 }
    )
  }
}

