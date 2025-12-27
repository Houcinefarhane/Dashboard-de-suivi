import { NextResponse } from 'next/server'
import { getCurrentArtisan } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Géocoder toutes les interventions sans coordonnées GPS
export async function POST() {
  try {
    const artisan = await getCurrentArtisan()

    if (!artisan) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Récupérer toutes les interventions sans coordonnées GPS mais avec une adresse
    const interventions = await prisma.intervention.findMany({
      where: {
        artisanId: artisan.id,
        address: { not: null },
        OR: [
          { latitude: null },
          { longitude: null },
        ],
      },
      select: {
        id: true,
        address: true,
      },
    })

    const results = []
    const errors = []

    for (const intervention of interventions) {
      if (!intervention.address) continue

      try {
        // Géocoder l'adresse
        const encodedAddress = encodeURIComponent(intervention.address)
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`

        const response = await fetch(url, {
          headers: {
            'User-Agent': 'ArtisanPro-Dashboard/1.0',
          },
        })

        if (response.ok) {
          const data = await response.json()

          if (data.length > 0) {
            const result = data[0]
            const latitude = parseFloat(result.lat)
            const longitude = parseFloat(result.lon)

            // Mettre à jour l'intervention avec les coordonnées
            await prisma.intervention.update({
              where: { id: intervention.id },
              data: {
                latitude,
                longitude,
              },
            })

            results.push({
              id: intervention.id,
              address: intervention.address,
              latitude,
              longitude,
            })

            // Attendre 1 seconde entre les requêtes pour respecter la limite de taux de Nominatim
            await new Promise(resolve => setTimeout(resolve, 1000))
          } else {
            errors.push({
              id: intervention.id,
              address: intervention.address,
              error: 'Adresse non trouvée',
            })
          }
        }
      } catch (error) {
        errors.push({
          id: intervention.id,
          address: intervention.address,
          error: 'Erreur lors du géocodage',
        })
      }
    }

    return NextResponse.json({
      success: true,
      geocoded: results.length,
      errorsCount: errors.length,
      results,
      errors,
    })
  } catch (error) {
    console.error('Error geocoding interventions:', error)
    return NextResponse.json(
      { error: 'Erreur lors du géocodage' },
      { status: 500 }
    )
  }
}

