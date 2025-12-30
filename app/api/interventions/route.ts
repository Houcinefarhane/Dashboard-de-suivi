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

    const { searchParams } = new URL(request.url)
    const start = searchParams.get('start')
    const end = searchParams.get('end')

    const where: any = {
      artisanId: artisan.id,
    }

    if (start && end) {
      where.date = {
        gte: new Date(start),
        lte: new Date(end),
      }
    }

    const interventions = await prisma.intervention.findMany({
      where,
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
      orderBy: { date: 'asc' },
    })

    // Sérialiser les dates pour éviter les erreurs de sérialisation
    const serializedInterventions = interventions.map(intervention => ({
      ...intervention,
      date: intervention.date.toISOString(),
      createdAt: intervention.createdAt.toISOString(),
      updatedAt: intervention.updatedAt.toISOString(),
    }))

    return NextResponse.json(serializedInterventions)
  } catch (error) {
    console.error('Error fetching interventions:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des interventions' },
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
    const { title, description, date, duration, clientId, address, price, status } = body

    if (!title || !date || !clientId) {
      return NextResponse.json(
        { error: 'Titre, date et client sont requis' },
        { status: 400 }
      )
    }

    // Validation de la durée (minimum 1 minute)
    if (duration && duration < 1) {
      return NextResponse.json(
        { error: 'La durée doit être au minimum de 1 minute' },
        { status: 400 }
      )
    }

    // Validation de cohérence : comparer uniquement les dates (sans l'heure)
    const interventionDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const interventionDay = new Date(interventionDate)
    interventionDay.setHours(0, 0, 0, 0)
    
    const isPast = interventionDay < today
    const isFuture = interventionDay > today
    
    let finalStatus = status || 'todo'
    
    // Si l'intervention est passée, ne peut pas être "todo"
    if (isPast && finalStatus === 'todo') {
      return NextResponse.json(
        { error: 'Les interventions passées ne peuvent pas être marquées comme "à faire". Elles doivent être terminées ou annulées.' },
        { status: 400 }
      )
    }
    
    // Si l'intervention est future, ne peut pas être "completed"
    if (isFuture && finalStatus === 'completed') {
      return NextResponse.json(
        { error: 'Les interventions futures ne peuvent pas être marquées comme "terminées". Elles doivent être "à faire" ou "annulées".' },
        { status: 400 }
      )
    }

    // Vérifier que le client appartient à l'artisan
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        artisanId: artisan.id,
      },
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Client non trouvé' },
        { status: 404 }
      )
    }

    const intervention = await prisma.intervention.create({
      data: {
        title,
        description: description || null,
        date: new Date(date),
        duration: duration || null,
        address: address || null,
        price: price || null,
        status: finalStatus,
        artisanId: artisan.id,
        clientId,
      },
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

    return NextResponse.json(intervention)
  } catch (error) {
    console.error('Error creating intervention:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'intervention' },
      { status: 500 }
    )
  }
}

