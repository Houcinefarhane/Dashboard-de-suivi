import { NextResponse } from 'next/server'
import { getCurrentArtisan } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { invoiceSchema } from '@/lib/validations'

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
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
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

    // Compter le total de factures
    const total = await prisma.invoice.count({
      where: whereClause,
    })

    // Récupérer les factures avec pagination
    const invoices = await prisma.invoice.findMany({
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

    // Calculer les statistiques globales (avec les filtres appliqués)
    const allInvoicesForStats = await prisma.invoice.findMany({
      where: whereClause,
      select: {
        status: true,
        total: true,
      },
    })

    // Calculer le montant total de TOUTES les factures correspondant aux filtres
    const totalAmountAll = allInvoicesForStats.reduce((sum, i) => sum + i.total, 0)
    
    // Calculer le montant total des factures payées (pour l'affichage général)
    const totalAmountPaid = allInvoicesForStats
      .filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + i.total, 0)

    const stats = {
      total: allInvoicesForStats.length,
      sent: allInvoicesForStats.filter(i => i.status === 'sent').length,
      paid: allInvoicesForStats.filter(i => i.status === 'paid').length,
      // Montant total de toutes les factures filtrées (pas seulement payées)
      totalAmount: totalAmountAll,
      // Montant total des factures payées (pour référence)
      totalAmountPaid: totalAmountPaid,
    }

    // Sérialiser les dates pour éviter les erreurs de sérialisation
    const serializedInvoices = invoices.map(invoice => ({
      ...invoice,
      date: invoice.date ? invoice.date.toISOString() : new Date().toISOString(),
      dueDate: invoice.dueDate ? invoice.dueDate.toISOString() : null,
      createdAt: invoice.createdAt ? invoice.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: invoice.updatedAt ? invoice.updatedAt.toISOString() : new Date().toISOString(),
      items: invoice.items.map(item => ({
        ...item,
        createdAt: item.createdAt ? item.createdAt.toISOString() : new Date().toISOString(),
      })),
    }))

    return NextResponse.json({
      invoices: serializedInvoices,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      stats,
    })
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des factures' },
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
    const validationResult = invoiceSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Données invalides',
          details: validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        },
        { status: 400 }
      )
    }
    
    const { clientId, date, dueDate, subtotal, taxRate, tax, total, notes, taxExemptionText, items } = validationResult.data

    console.log('Creating invoice with data:', { clientId, date, itemsCount: items?.length })

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

    // Générer un numéro de facture unique
    // Récupérer toutes les factures de l'artisan pour trouver le numéro le plus élevé
    const allInvoices = await prisma.invoice.findMany({
      where: { artisanId: artisan.id },
      select: { invoiceNumber: true },
    })

    // Extraire tous les numéros et trouver le maximum
    let maxNumber = 0
    for (const invoice of allInvoices) {
      const match = invoice.invoiceNumber.match(/FAC-(\d+)/)
      if (match) {
        const num = parseInt(match[1], 10)
        if (num > maxNumber) {
          maxNumber = num
        }
      }
    }

    // Générer le nouveau numéro et vérifier l'unicité
    let nextNumber = maxNumber + 1
    let invoiceNumber = `FAC-${String(nextNumber).padStart(6, '0')}`
    
    // Vérifier que le numéro n'existe pas déjà (sécurité supplémentaire)
    // Si le numéro existe, chercher le prochain disponible
    let existingInvoice = await prisma.invoice.findUnique({
      where: { invoiceNumber },
    })
    
    while (existingInvoice) {
      nextNumber++
      invoiceNumber = `FAC-${String(nextNumber).padStart(6, '0')}`
      existingInvoice = await prisma.invoice.findUnique({
        where: { invoiceNumber },
      })
    }
    
    console.log(`Génération du numéro de facture: ${invoiceNumber}`)

    // Créer la facture avec ses items
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        date: new Date(date),
        dueDate: dueDate ? new Date(dueDate) : null,
        subtotal: typeof subtotal === 'number' ? subtotal : parseFloat(String(subtotal)),
        taxRate: taxRate ? (typeof taxRate === 'number' ? taxRate : parseFloat(String(taxRate))) : 20, // Par défaut 20% si non fourni
        tax: typeof tax === 'number' ? tax : parseFloat(String(tax)),
        taxExemptionText: taxExemptionText || null,
        total: typeof total === 'number' ? total : parseFloat(String(total)),
        notes: notes || null,
        status: 'draft',
        artisanId: artisan.id,
        clientId,
        items: {
          create: items.map((item: any) => ({
            description: item.description.trim(),
            quantity: Math.floor(parseFloat(item.quantity) || 1), // Forcer un entier
            unitPrice: parseFloat(item.unitPrice) || 0,
            total: parseFloat(item.total) || 0,
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

    console.log('Invoice created successfully:', invoice.id)
    return NextResponse.json(invoice)
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json(
      { error: `Erreur lors de la création de la facture: ${error instanceof Error ? error.message : 'Erreur inconnue'}` },
      { status: 500 }
    )
  }
}
