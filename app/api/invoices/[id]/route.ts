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
    const { status, items, subtotal, taxRate, tax, total, ...otherFields } = body

    // Vérifier que la facture appartient à l'artisan
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        id: params.id,
        artisanId: artisan.id,
      },
      include: {
        items: true,
      },
    })

    if (!existingInvoice) {
      return NextResponse.json(
        { error: 'Facture non trouvée' },
        { status: 404 }
      )
    }

    const updateData: any = {}
    if (status) updateData.status = status
    if (otherFields.date) updateData.date = new Date(otherFields.date)
    if (otherFields.dueDate !== undefined) updateData.dueDate = otherFields.dueDate ? new Date(otherFields.dueDate) : null
    if (otherFields.notes !== undefined) updateData.notes = otherFields.notes

    // Si des items sont fournis, mettre à jour les items et recalculer les totaux
    if (items && Array.isArray(items)) {
      // Supprimer les anciens items
      await prisma.invoiceItem.deleteMany({
        where: { invoiceId: params.id },
      })

      // Créer les nouveaux items avec calcul correct du total
      const itemsToCreate = items
        .filter((item: any) => item.description && item.description.trim() !== '')
        .map((item: any) => ({
          description: item.description.trim(),
          quantity: Math.floor(parseFloat(item.quantity) || 1),
          unitPrice: parseFloat(item.unitPrice) || 0,
          total: Math.round((Math.floor(parseFloat(item.quantity) || 1) * (parseFloat(item.unitPrice) || 0)) * 100) / 100, // Recalculer le total
        }))

      // Recalculer les totaux à partir des items
      const calculatedSubtotal = itemsToCreate.reduce((sum: number, item: any) => sum + item.total, 0)
      const calculatedTaxRate = taxRate ? parseFloat(taxRate) : existingInvoice.taxRate
      const calculatedTax = Math.round(calculatedSubtotal * (calculatedTaxRate / 100) * 100) / 100
      const calculatedTotal = Math.round((calculatedSubtotal + calculatedTax) * 100) / 100

      updateData.subtotal = calculatedSubtotal
      updateData.taxRate = calculatedTaxRate
      updateData.tax = calculatedTax
      updateData.total = calculatedTotal

      // Mettre à jour la facture avec les nouveaux totaux
      await prisma.invoice.update({
        where: { id: params.id },
        data: updateData,
      })

      // Créer les nouveaux items
      await prisma.invoiceItem.createMany({
        data: itemsToCreate.map((item: any) => ({
          ...item,
          invoiceId: params.id,
        })),
      })
    } else if (subtotal !== undefined && taxRate !== undefined && tax !== undefined && total !== undefined) {
      // Si les totaux sont fournis directement, les utiliser
      updateData.subtotal = parseFloat(subtotal)
      updateData.taxRate = parseFloat(taxRate)
      updateData.tax = parseFloat(tax)
      updateData.total = parseFloat(total)
    }

    const invoice = await prisma.invoice.update({
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

    return NextResponse.json(invoice)
  } catch (error) {
    console.error('Error updating invoice:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la facture' },
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

    // Vérifier que la facture appartient à l'artisan
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        id: params.id,
        artisanId: artisan.id,
      },
    })

    if (!existingInvoice) {
      return NextResponse.json(
        { error: 'Facture non trouvée' },
        { status: 404 }
      )
    }

    await prisma.invoice.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting invoice:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la facture' },
      { status: 500 }
    )
  }
}

