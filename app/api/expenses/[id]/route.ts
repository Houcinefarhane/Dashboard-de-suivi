import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { getCurrentArtisan } from '@/lib/auth'

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
    const { description, category, amount, date, receipt } = body

    // Vérifier que la dépense appartient à l'artisan
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id: params.id,
        artisanId: artisan.id,
      },
    })

    if (!existingExpense) {
      return NextResponse.json(
        { error: 'Dépense non trouvée' },
        { status: 404 }
      )
    }

    const expense = await prisma.expense.update({
      where: { id: params.id },
      data: {
        description: description || existingExpense.description,
        category: category || existingExpense.category,
        amount: amount ? parseFloat(amount) : existingExpense.amount,
        date: date ? new Date(date) : existingExpense.date,
        receipt: receipt !== undefined ? receipt : existingExpense.receipt,
      },
    })

    return NextResponse.json(expense)
  } catch (error) {
    console.error('Error updating expense:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la dépense' },
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

    // Vérifier que la dépense appartient à l'artisan
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id: params.id,
        artisanId: artisan.id,
      },
    })

    if (!existingExpense) {
      return NextResponse.json(
        { error: 'Dépense non trouvée' },
        { status: 404 }
      )
    }

    await prisma.expense.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting expense:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la dépense' },
      { status: 500 }
    )
  }
}

