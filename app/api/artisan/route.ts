import { NextResponse } from 'next/server'
import { getCurrentArtisan } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const artisan = await getCurrentArtisan()

    if (!artisan) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Récupérer toutes les informations de l'artisan, y compris les informations légales
    const fullArtisan = await prisma.artisan.findUnique({
      where: { id: artisan.id },
      select: {
        id: true,
        name: true,
        email: true,
        companyName: true,
        phone: true,
        address: true,
        siret: true,
        siren: true,
        kbis: true,
        vatNumber: true,
        legalAddress: true,
        capital: true,
        rcs: true,
      },
    })

    if (!fullArtisan) {
      return NextResponse.json(
        { error: 'Artisan non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json(fullArtisan)
  } catch (error) {
    console.error('Error fetching artisan:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des informations' },
      { status: 500 }
    )
  }
}

