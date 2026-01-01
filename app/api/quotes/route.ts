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

    // Récupérer les paramètres de pagination et recherche
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const skip = (page - 1) * limit

    // Construire le filtre de recherche
    const whereClause: any = { artisanId: artisan.id }
    
    if (search) {
      whereClause.OR = [
        { quoteNumber: { contains: search, mode: 'insensitive' } },
        { 
          client: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
            ]
          }
        },
      ]
    }
    
    if (status && status !== 'all') {
      whereClause.status = status
    }

    // Compter le total de devis
    const total = await prisma.quote.count({
      where: whereClause,
    })

    // Récupérer les devis avec pagination
    const quotes = await prisma.quote.findMany({
      where: whereClause,
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
      orderBy: { date: 'desc' },
      skip,
      take: limit,
    })

    const totalPages = Math.ceil(total / limit)

    // Sérialiser les dates pour éviter les erreurs de sérialisation
    const serializedQuotes = quotes.map(quote => ({
      ...quote,
      date: quote.date ? quote.date.toISOString() : new Date().toISOString(),
      validUntil: quote.validUntil ? quote.validUntil.toISOString() : null,
      createdAt: quote.createdAt ? quote.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: quote.updatedAt ? quote.updatedAt.toISOString() : new Date().toISOString(),
      items: quote.items.map(item => ({
        ...item,
        createdAt: item.createdAt ? item.createdAt.toISOString() : new Date().toISOString(),
      })),
    }))

    return NextResponse.json({
      quotes: serializedQuotes,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    })
  } catch (error) {
    console.error('Error fetching quotes:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des devis' },
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
    const { clientId, date, validUntil, subtotal, taxRate, tax, total, notes, items } = body

    console.log('Received quote data:', { clientId, date, itemsCount: items?.length, subtotal, taxRate, tax, total })

    if (!clientId || !date || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Client, date et articles sont requis' },
        { status: 400 }
      )
    }

    // Valider que tous les items ont les champs requis
    const invalidItems = items.filter((item: any) => 
      !item.description || 
      !item.description.trim() || 
      isNaN(item.quantity) || 
      isNaN(item.unitPrice) || 
      isNaN(item.total)
    )
    
    if (invalidItems.length > 0) {
      return NextResponse.json(
        { error: 'Certains articles ont des données invalides' },
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

    // Générer un numéro de devis unique
    const existingQuotes = await prisma.quote.findMany({
      where: { artisanId: artisan.id },
      select: { quoteNumber: true },
      orderBy: { createdAt: 'desc' },
    })

    // Trouver le numéro le plus élevé
    let maxNumber = 0
    for (const quote of existingQuotes) {
      const match = quote.quoteNumber.match(/DEV-(\d+)/)
      if (match) {
        const num = parseInt(match[1], 10)
        if (num > maxNumber) maxNumber = num
      }
    }

    const quoteNumber = `DEV-${String(maxNumber + 1).padStart(6, '0')}`

    // Créer le devis avec ses items
    const quote = await prisma.quote.create({
      data: {
        quoteNumber,
        date: new Date(date),
        validUntil: validUntil ? new Date(validUntil) : null,
        subtotal: parseFloat(subtotal),
        taxRate: taxRate ? parseFloat(taxRate) : 20, // Par défaut 20% si non fourni
        tax: parseFloat(tax),
        total: parseFloat(total),
        notes: notes || null,
        status: 'draft',
        artisanId: artisan.id,
        clientId,
        items: {
          create: items.map((item: any) => ({
            description: item.description.trim(),
            quantity: Math.floor(Math.max(1, parseFloat(item.quantity) || 1)),
            unitPrice: parseFloat(item.unitPrice) || 0,
            total: Math.round((Math.floor(Math.max(1, parseFloat(item.quantity) || 1)) * (parseFloat(item.unitPrice) || 0)) * 100) / 100, // Recalculer le total
          })),
        },
      },
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
  } catch (error: any) {
    console.error('Error creating quote:', error)
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
    })
    return NextResponse.json(
      { 
        error: 'Erreur lors de la création du devis',
        details: error?.message || 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}

