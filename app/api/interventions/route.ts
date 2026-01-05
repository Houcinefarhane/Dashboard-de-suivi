import { NextResponse } from 'next/server'
import { getCurrentArtisan } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { interventionSchema } from '@/lib/validations'

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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {
      artisanId: artisan.id,
    }

    if (start && end) {
      where.date = {
        gte: new Date(start),
        lte: new Date(end),
      }
    }

    // Si start/end fournis (heatmap), pas de pagination mais limite max pour éviter crash
    // Sinon, pagination par défaut (50 par page)
    const usePagination = !start || !end
    const MAX_LIMIT = 1000 // Limite max pour éviter crash avec gros volumes
    
    // Valider et limiter le limit
    const safeLimit = Math.min(Math.max(1, limit), MAX_LIMIT)
    const safePage = Math.max(1, page)
    
    const [interventions, total] = await Promise.all([
      prisma.intervention.findMany({
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
        orderBy: { date: 'desc' },
        ...(usePagination ? {
          skip: (safePage - 1) * safeLimit,
          take: safeLimit,
        } : {
          take: MAX_LIMIT, // Limite max même pour heatmap
        }),
      }),
      usePagination ? prisma.intervention.count({ where }) : Promise.resolve(0)
    ])

    // Sérialiser les dates pour éviter les erreurs de sérialisation
    const serializedInterventions = interventions.map(intervention => ({
      ...intervention,
      date: intervention.date.toISOString(),
      createdAt: intervention.createdAt.toISOString(),
      updatedAt: intervention.updatedAt.toISOString(),
    }))

    // Si pagination activée, retourner avec métadonnées
    if (usePagination) {
      return NextResponse.json({
        interventions: serializedInterventions,
        pagination: {
          page: safePage,
          limit: safeLimit,
          total,
          totalPages: Math.ceil(total / safeLimit),
        }
      })
    }

    // Sinon, retour simple pour le heatmap
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
    
    // Validation avec Zod
    const validationResult = interventionSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Données invalides',
          details: validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        },
        { status: 400 }
      )
    }
    
    const { title, description, date, duration, clientId, address, price, status } = validationResult.data

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

