import { NextResponse } from 'next/server'
import { getCurrentArtisan } from '@/lib/auth'
import { checkInterventionReminders } from '@/lib/notifications'

export async function POST() {
  try {
    const artisan = await getCurrentArtisan()

    if (!artisan) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const result = await checkInterventionReminders(artisan.id)

    return NextResponse.json({ 
      success: true, 
      message: 'Vérification des rappels effectuée',
      reminders24h: result.reminders24h,
      remindersToday: result.remindersToday,
    })
  } catch (error) {
    console.error('Error checking intervention reminders:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la vérification des rappels' },
      { status: 500 }
    )
  }
}

