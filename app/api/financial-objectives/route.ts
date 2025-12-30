import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const artisanId = cookieStore.get('artisanId')?.value

    if (!artisanId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'all' // monthly, annual, all
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : new Date().getFullYear()
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : null

    let whereClause: any = {
      artisanId,
      year,
    }

    if (period === 'monthly' && month) {
      whereClause.period = 'monthly'
      whereClause.month = month
    } else if (period === 'annual') {
      whereClause.period = 'annual'
    }

    const objectives = await prisma.financialObjective.findMany({
      where: whereClause,
      include: {
        keyResults: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(objectives)
  } catch (error) {
    console.error('Error fetching financial objectives:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des objectifs' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const artisanId = cookieStore.get('artisanId')?.value

    if (!artisanId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, period, year, month, keyResults } = body

    const objective = await prisma.financialObjective.create({
      data: {
        title,
        description,
        period,
        year,
        month: period === 'monthly' ? month : null,
        artisanId,
        keyResults: {
          create: keyResults.map((kr: any) => ({
            title: kr.title,
            metric: kr.metric,
            targetValue: kr.targetValue,
            currentValue: 0,
            unit: kr.unit || '€',
          })),
        },
      },
      include: {
        keyResults: true,
      },
    })

    return NextResponse.json(objective)
  } catch (error) {
    console.error('Error creating financial objective:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'objectif' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies()
    const artisanId = cookieStore.get('artisanId')?.value

    if (!artisanId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { id, status, keyResults } = body

    // Mettre à jour l'objectif
    const objective = await prisma.financialObjective.update({
      where: { id, artisanId },
      data: {
        status,
        updatedAt: new Date(),
      },
    })

    // Mettre à jour les key results si fournis
    if (keyResults && keyResults.length > 0) {
      for (const kr of keyResults) {
        if (kr.id) {
          await prisma.keyResult.update({
            where: { id: kr.id },
            data: {
              currentValue: kr.currentValue,
            },
          })
        }
      }
    }

    return NextResponse.json(objective)
  } catch (error) {
    console.error('Error updating financial objective:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'objectif' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies()
    const artisanId = cookieStore.get('artisanId')?.value

    if (!artisanId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    await prisma.financialObjective.delete({
      where: { id, artisanId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting financial objective:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'objectif' },
      { status: 500 }
    )
  }
}

