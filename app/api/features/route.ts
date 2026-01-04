import { NextResponse } from 'next/server'
import { getCurrentArtisan } from '@/lib/auth'
import { getEnabledFeatures } from '@/lib/features'

export const dynamic = 'force-dynamic'

/**
 * GET /api/features
 * Récupère les features activées pour l'utilisateur connecté
 */
export async function GET() {
  try {
    const artisan = await getCurrentArtisan()

    if (!artisan) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const features = await getEnabledFeatures()

    return NextResponse.json({ features })
  } catch (error) {
    console.error('Error fetching features:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des features' },
      { status: 500 }
    )
  }
}

