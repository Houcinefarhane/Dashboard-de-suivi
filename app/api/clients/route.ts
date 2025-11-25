import { NextResponse } from 'next/server'
import { getCurrentArtisan } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const artisan = await getCurrentArtisan()

    if (!artisan) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Récupérer les paramètres de pagination
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const skip = (page - 1) * limit

    // Compter le total de clients
    const total = await prisma.client.count({
      where: { artisanId: artisan.id },
    })

    // Récupérer les clients avec pagination
    const clients = await prisma.client.findMany({
      where: { artisanId: artisan.id },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    })

    const totalPages = Math.ceil(total / limit)

    // Sérialiser les dates pour éviter les erreurs de sérialisation
    const serializedClients = clients.map((client: any) => ({
      ...client,
      createdAt: client.createdAt.toISOString(),
      updatedAt: client.updatedAt.toISOString(),
    }))

    return NextResponse.json({
      clients: serializedClients,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    })
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des clients' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const artisan = await getCurrentArtisan()

    if (!artisan) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { firstName, lastName, email, phone, address, city, postalCode, notes } = body

    if (!firstName || !lastName || !phone) {
      return NextResponse.json(
        { error: 'Prénom, nom et téléphone sont requis' },
        { status: 400 }
      )
    }

    const client = await prisma.client.create({
      data: {
        firstName,
        lastName,
        email: email || null,
        phone,
        address: address || null,
        city: city || null,
        postalCode: postalCode || null,
        notes: notes || null,
        artisanId: artisan.id,
      },
    })

    return NextResponse.json(client)
  } catch (error) {
    console.error('Error creating client:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du client' },
      { status: 500 }
    )
  }
}

