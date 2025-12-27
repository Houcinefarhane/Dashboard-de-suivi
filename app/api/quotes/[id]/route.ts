import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
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
    const { status, ...otherFields } = body

    // Vérifier que le devis appartient à l'artisan
    const existingQuote = await prisma.quote.findFirst({
      where: {
        id: params.id,
        artisanId: artisan.id,
      },
    })

    if (!existingQuote) {
      return NextResponse.json(
        { error: 'Devis non trouvé' },
        { status: 404 }
      )
    }

    const updateData: any = {}
    if (status) updateData.status = status
    if (otherFields.date) updateData.date = new Date(otherFields.date)
    if (otherFields.validUntil !== undefined) updateData.validUntil = otherFields.validUntil ? new Date(otherFields.validUntil) : null
    if (otherFields.notes !== undefined) updateData.notes = otherFields.notes

    const quote = await prisma.quote.update({
      where: { id: params.id },
      data: updateData,
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            address: true,
          },
        },
        items: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    return NextResponse.json(quote)
  } catch (error) {
    console.error('Error updating quote:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du devis' },
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

    // Vérifier que le devis appartient à l'artisan
    const existingQuote = await prisma.quote.findFirst({
      where: {
        id: params.id,
        artisanId: artisan.id,
      },
    })

    if (!existingQuote) {
      return NextResponse.json(
        { error: 'Devis non trouvé' },
        { status: 404 }
      )
    }

    await prisma.quote.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting quote:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du devis' },
      { status: 500 }
    )
  }
}

