import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentArtisan } from '@/lib/auth'

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

    // Compter le total de dépenses
    const total = await prisma.expense.count({
      where: { artisanId: artisan.id },
    })

    // Récupérer les dépenses avec pagination
    const expenses = await prisma.expense.findMany({
      where: { artisanId: artisan.id },
      orderBy: { date: 'desc' },
      skip,
      take: limit,
    })

    // Formater les dépenses (sans factures pour l'instant pour éviter les erreurs)
    const formattedExpenses = expenses.map(expense => ({
      id: expense.id,
      description: expense.description,
      category: expense.category,
      amount: expense.amount,
      date: expense.date.toISOString(),
      receipt: expense.receipt,
      createdAt: expense.createdAt.toISOString(),
      updatedAt: expense.updatedAt.toISOString(),
      invoiceId: expense.invoiceId || null,
      invoice: null, // Temporairement null pour éviter les erreurs
    }))

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      expenses: formattedExpenses,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    })
  } catch (error) {
    console.error('Error fetching expenses:', error)
    console.error('Error details:', error instanceof Error ? error.message : error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des dépenses', details: error instanceof Error ? error.message : String(error) },
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
    const { description, category, amount, date, receipt } = body

    if (!description || !category || !amount || !date) {
      return NextResponse.json(
        { error: 'Description, catégorie, montant et date sont requis' },
        { status: 400 }
      )
    }

    const expense = await prisma.expense.create({
      data: {
        description,
        category,
        amount: parseFloat(amount),
        date: new Date(date),
        receipt: receipt || null,
        artisanId: artisan.id,
      },
    })

    return NextResponse.json(expense, { status: 201 })
  } catch (error) {
    console.error('Error creating expense:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la dépense' },
      { status: 500 }
    )
  }
}

