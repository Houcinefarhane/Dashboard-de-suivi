import { NextResponse } from 'next/server'
import { getCurrentArtisan } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const artisan = await getCurrentArtisan()

    if (!artisan) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Récupérer ou créer la personnalisation
    let customization = await prisma.invoiceCustomization.findUnique({
      where: { artisanId: artisan.id },
    })

    // Si pas de personnalisation, créer une par défaut
    if (!customization) {
      customization = await prisma.invoiceCustomization.create({
        data: {
          artisanId: artisan.id,
          showLogo: true,
          primaryColorR: 150,
          primaryColorG: 185,
          primaryColorB: 220,
          showLegalInfo: true,
          showCompanyInfo: true,
          footerText: 'Merci de votre confiance !',
        },
      })
    }

    return NextResponse.json(customization)
  } catch (error) {
    console.error('Error fetching invoice customization:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la personnalisation' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const artisan = await getCurrentArtisan()

    if (!artisan) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      logoUrl,
      showLogo,
      primaryColorR,
      primaryColorG,
      primaryColorB,
      footerText,
      headerText,
      showLegalInfo,
      showCompanyInfo,
      siren,
      siret,
      kbis,
      rcs,
      vatNumber,
      capital,
      legalAddress,
      customFields,
    } = body

    // Mettre à jour ou créer la personnalisation
    const customization = await prisma.invoiceCustomization.upsert({
      where: { artisanId: artisan.id },
      update: {
        logoUrl: logoUrl !== undefined ? logoUrl : null,
        showLogo: showLogo !== undefined ? showLogo : true,
        primaryColorR: primaryColorR !== undefined ? primaryColorR : 150,
        primaryColorG: primaryColorG !== undefined ? primaryColorG : 185,
        primaryColorB: primaryColorB !== undefined ? primaryColorB : 220,
        footerText: footerText !== undefined ? footerText : null,
        headerText: headerText !== undefined ? headerText : null,
        showLegalInfo: showLegalInfo !== undefined ? showLegalInfo : true,
        showCompanyInfo: showCompanyInfo !== undefined ? showCompanyInfo : true,
        siren: siren !== undefined ? siren : null,
        siret: siret !== undefined ? siret : null,
        kbis: kbis !== undefined ? kbis : null,
        rcs: rcs !== undefined ? rcs : null,
        vatNumber: vatNumber !== undefined ? vatNumber : null,
        capital: capital !== undefined ? capital : null,
        legalAddress: legalAddress !== undefined ? legalAddress : null,
        customFields: customFields !== undefined ? customFields : null,
      },
      create: {
        artisanId: artisan.id,
        logoUrl: logoUrl || null,
        showLogo: showLogo !== undefined ? showLogo : true,
        primaryColorR: primaryColorR || 150,
        primaryColorG: primaryColorG || 185,
        primaryColorB: primaryColorB || 220,
        footerText: footerText || null,
        headerText: headerText || null,
        showLegalInfo: showLegalInfo !== undefined ? showLegalInfo : true,
        showCompanyInfo: showCompanyInfo !== undefined ? showCompanyInfo : true,
        siren: siren || null,
        siret: siret || null,
        kbis: kbis || null,
        rcs: rcs || null,
        vatNumber: vatNumber || null,
        capital: capital || null,
        legalAddress: legalAddress || null,
        customFields: customFields || null,
      },
    })

    return NextResponse.json(customization)
  } catch (error) {
    console.error('Error updating invoice customization:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la personnalisation' },
      { status: 500 }
    )
  }
}

