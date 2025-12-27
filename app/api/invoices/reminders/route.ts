import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { getCurrentArtisan } from '@/lib/auth'
import { getAllReminders, checkAndCreateInvoiceReminders } from '@/lib/invoice-reminders'

// GET: Récupérer toutes les relances
export async function GET() {
  try {
    const artisan = await getCurrentArtisan()

    if (!artisan) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const reminders = await getAllReminders(artisan.id)

    return NextResponse.json(reminders)
  } catch (error) {
    console.error('Error fetching reminders:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des relances' },
      { status: 500 }
    )
  }
}

// POST: Vérifier et créer de nouvelles relances
export async function POST() {
  try {
    const artisan = await getCurrentArtisan()

    if (!artisan) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const results = await checkAndCreateInvoiceReminders(artisan.id)

    return NextResponse.json({
      success: true,
      ...results,
    })
  } catch (error) {
    console.error('Error checking reminders:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la vérification des relances' },
      { status: 500 }
    )
  }
}

