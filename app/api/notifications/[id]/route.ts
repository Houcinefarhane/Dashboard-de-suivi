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
    const { status, sentAt, readAt } = body

    // Vérifier que la notification appartient à l'artisan
    const existingNotification = await prisma.notification.findFirst({
      where: {
        id: params.id,
        artisanId: artisan.id,
      },
    })

    if (!existingNotification) {
      return NextResponse.json(
        { error: 'Notification non trouvée' },
        { status: 404 }
      )
    }

    const updateData: any = {}
    if (status) updateData.status = status
    if (sentAt) updateData.sentAt = new Date(sentAt)
    if (readAt !== undefined) {
      updateData.readAt = readAt ? new Date(readAt) : null
    }

    const notification = await prisma.notification.update({
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
          },
        },
      },
    })

    return NextResponse.json(notification)
  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la notification' },
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

    // Vérifier que la notification appartient à l'artisan
    const existingNotification = await prisma.notification.findFirst({
      where: {
        id: params.id,
        artisanId: artisan.id,
      },
    })

    if (!existingNotification) {
      return NextResponse.json(
        { error: 'Notification non trouvée' },
        { status: 404 }
      )
    }

    await prisma.notification.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting notification:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la notification' },
      { status: 500 }
    )
  }
}

