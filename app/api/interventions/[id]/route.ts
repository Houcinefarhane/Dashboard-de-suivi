import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { getCurrentArtisan } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notifyInterventionStatusChange } from '@/lib/notifications'

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

    // Vérifier que l'intervention appartient à l'artisan
    const existingIntervention = await prisma.intervention.findFirst({
      where: {
        id: params.id,
        artisanId: artisan.id,
      },
    })

    if (!existingIntervention) {
      return NextResponse.json(
        { error: 'Intervention non trouvée' },
        { status: 404 }
      )
    }

    // Validation de cohérence : comparer uniquement les dates (sans l'heure)
    if (status) {
      const interventionDate = new Date(existingIntervention.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const interventionDay = new Date(interventionDate)
      interventionDay.setHours(0, 0, 0, 0)
      
      const isPast = interventionDay < today
      const isFuture = interventionDay > today
      
      // Si l'intervention est passée, ne peut pas être "todo"
      if (isPast && status === 'todo') {
        return NextResponse.json(
          { error: 'Les interventions passées ne peuvent pas être marquées comme "à faire". Elles doivent être terminées ou annulées.' },
          { status: 400 }
        )
      }
      
      // Si l'intervention est future, ne peut pas être "completed"
      if (isFuture && status === 'completed') {
        return NextResponse.json(
          { error: 'Les interventions futures ne peuvent pas être marquées comme "terminées". Elles doivent être "à faire" ou "annulées".' },
          { status: 400 }
        )
      }
    }

    // Validation de la durée (minimum 1 minute)
    if (otherFields.duration !== undefined && otherFields.duration !== null) {
      if (otherFields.duration < 1) {
        return NextResponse.json(
          { error: 'La durée doit être au minimum de 1 minute' },
          { status: 400 }
        )
      }
    }

    const updateData: any = {}
    if (status) updateData.status = status
    if (otherFields.title) updateData.title = otherFields.title
    if (otherFields.description !== undefined) updateData.description = otherFields.description
    if (otherFields.date) updateData.date = new Date(otherFields.date)
    if (otherFields.duration !== undefined) updateData.duration = otherFields.duration
    if (otherFields.price !== undefined) updateData.price = otherFields.price
    if (otherFields.address !== undefined) updateData.address = otherFields.address
    if (otherFields.clientId) updateData.clientId = otherFields.clientId
    if (otherFields.photosBefore !== undefined) updateData.photosBefore = otherFields.photosBefore
    if (otherFields.photosAfter !== undefined) updateData.photosAfter = otherFields.photosAfter

    const intervention = await prisma.intervention.update({
      where: { id: params.id },
      data: updateData,
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    })

    // Créer une notification si le statut a changé
    if (status && existingIntervention.status !== status) {
      try {
        const notification = await notifyInterventionStatusChange(
          intervention.id,
          existingIntervention.status,
          status,
          artisan.id,
          intervention.client.id,
          `${intervention.client.firstName} ${intervention.client.lastName}`,
          intervention.title
        )
        console.log('Notification créée:', notification)
      } catch (error) {
        console.error('Error creating notification:', error)
        // Ne pas bloquer la mise à jour si la notification échoue
      }
    }

    return NextResponse.json(intervention)
  } catch (error) {
    console.error('Error updating intervention:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'intervention' },
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

    // Vérifier que l'intervention appartient à l'artisan
    const existingIntervention = await prisma.intervention.findFirst({
      where: {
        id: params.id,
        artisanId: artisan.id,
      },
    })

    if (!existingIntervention) {
      return NextResponse.json(
        { error: 'Intervention non trouvée' },
        { status: 404 }
      )
    }

    await prisma.intervention.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting intervention:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'intervention' },
      { status: 500 }
    )
  }
}

