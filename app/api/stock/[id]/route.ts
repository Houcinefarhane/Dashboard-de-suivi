import { NextResponse } from 'next/server'
import { getCurrentArtisan } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Vérifier que l'article appartient à l'artisan
    const existingItem = await prisma.stockItem.findFirst({
      where: {
        id: params.id,
        artisanId: artisan.id,
      },
    })

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Article non trouvé' },
        { status: 404 }
      )
    }

    const item = await prisma.stockItem.update({
      where: { id: params.id },
      data: {
        name,
        description: description !== undefined ? (description || null) : undefined,
        category: category !== undefined ? (category || null) : undefined,
        quantity: quantity !== undefined ? parseFloat(quantity) : undefined,
        unit: unit || 'unité',
        unitPrice: unitPrice !== undefined ? (unitPrice ? parseFloat(unitPrice) : null) : undefined,
        minQuantity: minQuantity !== undefined ? (minQuantity ? parseFloat(minQuantity) : null) : undefined,
        supplier: supplier !== undefined ? (supplier || null) : undefined,
      },
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error updating stock item:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'article' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const artisan = await getCurrentArtisan()

    if (!artisan) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Vérifier que l'article appartient à l'artisan
    const existingItem = await prisma.stockItem.findFirst({
      where: {
        id: params.id,
        artisanId: artisan.id,
      },
    })

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Article non trouvé' },
        { status: 404 }
      )
    }

    await prisma.stockItem.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting stock item:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'article' },
      { status: 500 }
    )
  }
}

