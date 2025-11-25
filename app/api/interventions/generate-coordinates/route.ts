import { NextResponse } from 'next/server'
import { getCurrentArtisan } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Coordonnées GPS pour différentes villes françaises (pour rendre les données réalistes)
const frenchCities = [
  { name: 'Paris', lat: 48.8566, lng: 2.3522 },
  { name: 'Lyon', lat: 45.7640, lng: 4.8357 },
  { name: 'Marseille', lat: 43.2965, lng: 5.3698 },
  { name: 'Toulouse', lat: 43.6047, lng: 1.4442 },
  { name: 'Nice', lat: 43.7102, lng: 7.2620 },
  { name: 'Nantes', lat: 47.2184, lng: -1.5536 },
  { name: 'Strasbourg', lat: 48.5734, lng: 7.7521 },
  { name: 'Montpellier', lat: 43.6108, lng: 3.8767 },
  { name: 'Bordeaux', lat: 44.8378, lng: -0.5792 },
  { name: 'Lille', lat: 50.6292, lng: 3.0573 },
  { name: 'Rennes', lat: 48.1173, lng: -1.6778 },
  { name: 'Reims', lat: 49.2583, lng: 4.0317 },
  { name: 'Le Havre', lat: 49.4944, lng: 0.1079 },
  { name: 'Saint-Étienne', lat: 45.4397, lng: 4.3872 },
  { name: 'Toulon', lat: 43.1242, lng: 5.9280 },
]

// Fonction pour générer une coordonnée GPS aléatoire autour d'une ville
function generateRandomCoordinates(city: { lat: number; lng: number }) {
  // Générer un décalage aléatoire de ±0.1 degré (environ 11 km)
  const latOffset = (Math.random() - 0.5) * 0.2
  const lngOffset = (Math.random() - 0.5) * 0.2
  
  return {
    latitude: city.lat + latOffset,
    longitude: city.lng + lngOffset,
  }
}

// Générer des coordonnées GPS fictives pour toutes les interventions sans coordonnées
export async function POST() {
  try {
    const artisan = await getCurrentArtisan()

    if (!artisan) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Récupérer toutes les interventions sans coordonnées GPS
    const interventions = await prisma.intervention.findMany({
      where: {
        artisanId: artisan.id,
        OR: [
          { latitude: null },
          { longitude: null },
        ],
      },
      select: {
        id: true,
      },
    })

    if (interventions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Toutes les interventions ont déjà des coordonnées GPS',
        updated: 0,
      })
    }

    let updated = 0
    const errors: string[] = []

    for (const intervention of interventions) {
      try {
        // Sélectionner une ville aléatoire
        const randomCity = frenchCities[Math.floor(Math.random() * frenchCities.length)]
        
        // Générer des coordonnées autour de cette ville
        const { latitude, longitude } = generateRandomCoordinates(randomCity)

        // Mettre à jour l'intervention
        await prisma.intervention.update({
          where: { id: intervention.id },
          data: {
            latitude,
            longitude,
          },
        })

        updated++
      } catch (error) {
        errors.push(intervention.id)
        console.error(`Erreur pour l'intervention ${intervention.id}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      message: `${updated} interventions mises à jour avec des coordonnées GPS fictives`,
      updated,
      errors: errors.length,
    })
  } catch (error) {
    console.error('Error generating coordinates:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la génération des coordonnées' },
      { status: 500 }
    )
  }
}

