import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// API de géocodage utilisant Nominatim (OpenStreetMap) - gratuit et sans clé API
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')

    if (!address) {
      return NextResponse.json(
        { error: 'Adresse requise' },
        { status: 400 }
      )
    }

    // Utiliser Nominatim pour le géocodage
    const encodedAddress = encodeURIComponent(address)
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&addressdetails=1`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ArtisanPro-Dashboard/1.0', // Requis par Nominatim
      },
    })

    if (!response.ok) {
      throw new Error('Erreur lors du géocodage')
    }

    const data = await response.json()

    if (data.length === 0) {
      return NextResponse.json(
        { error: 'Adresse non trouvée' },
        { status: 404 }
      )
    }

    const result = data[0]
    return NextResponse.json({
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      displayName: result.display_name,
      address: result.address,
    })
  } catch (error) {
    console.error('Error geocoding address:', error)
    return NextResponse.json(
      { error: 'Erreur lors du géocodage' },
      { status: 500 }
    )
  }
}

