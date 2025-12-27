import { NextResponse } from 'next/server'
import { getCurrentArtisan } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

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

    // Compter le total d'articles
    const total = await prisma.stockItem.count({
      where: { artisanId: artisan.id },
    })

    // Récupérer les articles avec pagination
    const items = await prisma.stockItem.findMany({
      where: { artisanId: artisan.id },
      orderBy: { name: 'asc' },
      skip,
      take: limit,
    })

    const totalPages = Math.ceil(total / limit)

    // Sérialiser les dates pour éviter les erreurs de sérialisation
    const serializedItems = items.map(item => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }))

    return NextResponse.json({
      items: serializedItems,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    })
  } catch (error) {
    console.error('Error fetching stock items:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du stock' },
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
    const { name, description, category, quantity, unit, unitPrice, minQuantity, supplier } = body

    if (!name || quantity === undefined) {
      return NextResponse.json(
        { error: 'Nom et quantité sont requis' },
        { status: 400 }
      )
    }

    const item = await prisma.stockItem.create({
      data: {
        name,
        description: description || null,
        category: category || null,
        quantity: parseFloat(quantity),
        unit: unit || 'unité',
        unitPrice: unitPrice ? parseFloat(unitPrice) : null,
        minQuantity: minQuantity ? parseFloat(minQuantity) : null,
        supplier: supplier || null,
        artisanId: artisan.id,
      },
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error creating stock item:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'article' },
      { status: 500 }
    )
  }
}

