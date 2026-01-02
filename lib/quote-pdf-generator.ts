import jsPDF from 'jspdf'
import { formatCurrency, formatDate } from './utils'

interface QuoteData {
  quoteNumber: string
  date: string
  validUntil: string | null
  taxRate: number
  client: {
    firstName: string
    lastName: string
    email: string | null
    phone: string
    address: string | null
  }
  artisan?: {
    name: string
    companyName: string | null
    phone: string | null
    address: string | null
    siret: string | null
    siren: string | null
    kbis: string | null
    vatNumber: string | null
    legalAddress: string | null
    capital: string | null
    rcs: string | null
  }
  items: Array<{
    description: string
    quantity: number
    unitPrice: number
    total: number
  }>
  subtotal: number
  tax: number
  total: number
  notes: string | null
  customization?: {
    logoUrl: string | null
    showLogo: boolean
    primaryColorR: number
    primaryColorG: number
    primaryColorB: number
    footerText: string | null
    headerText: string | null
    showLegalInfo: boolean
    showCompanyInfo: boolean
    siren?: string | null
    siret?: string | null
    kbis?: string | null
    rcs?: string | null
    vatNumber?: string | null
    capital?: string | null
    legalAddress?: string | null
    customFields?: Array<{ id: string; label: string; value: string; position: 'header' | 'footer' | 'client' }>
  }
}

export function generateQuotePDF(quote: QuoteData): void {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  let yPos = margin

  // Fonction pour formater les montants pour PDF
  const formatCurrencyPDF = (amount: number): string => {
    const parts = amount.toFixed(2).split('.')
    const integerPart = parts[0]
    const decimalPart = parts[1]
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0')
    return `${formattedInteger},${decimalPart} €`
  }

  // Couleurs personnalisées ou par défaut
  const customization = quote.customization
  const primaryColor = customization
    ? [customization.primaryColorR, customization.primaryColorG, customization.primaryColorB]
    : [150, 185, 220]
  const creamColor = [253, 244, 220]
  const darkColor = [10, 10, 10]
  const textColor = [38, 38, 38]

  // En-tête avec logo
  if (customization?.showLogo && customization?.logoUrl) {
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.roundedRect(margin, yPos, 30, 30, 3, 3, 'F')
  } else if (!customization || customization.showLogo) {
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.roundedRect(margin, yPos, 30, 30, 3, 3, 'F')
    doc.setLineWidth(2)
    doc.setDrawColor(0, 0, 0)
    doc.line(margin + 10, yPos + 10, margin + 15, yPos + 20)
    doc.line(margin + 15, yPos + 20, margin + 20, yPos + 10)
    doc.line(margin + 20, yPos + 10, margin + 20, yPos + 20)
  }

  // Nom de l'entreprise
  const companyName = quote.artisan?.companyName || quote.artisan?.name || 'Gestion Pro'
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2])
  doc.text(companyName, margin + 40, yPos + 12)

  // Informations de l'entreprise (si activées)
  if (!customization || customization.showCompanyInfo) {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 100, 100)
    let companyInfoY = yPos + 20

    if (quote.artisan?.address) {
      doc.text(quote.artisan.address, margin + 40, companyInfoY)
      companyInfoY += 5
    }
    if (quote.artisan?.phone) {
      doc.text(`Tél: ${quote.artisan.phone}`, margin + 40, companyInfoY)
      companyInfoY += 5
    }
  }

  // Informations légales (si activées) - En-tête
  // Utiliser les valeurs de la personnalisation en priorité, sinon celles de l'artisan
  if (!customization || customization.showLegalInfo) {
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(80, 80, 80)
    let legalInfoY = yPos + 20

    const siren = customization?.siren || quote.artisan?.siren
    const siret = customization?.siret || quote.artisan?.siret
    const kbis = customization?.kbis || quote.artisan?.kbis
    const rcs = customization?.rcs || quote.artisan?.rcs
    const vatNumber = customization?.vatNumber || quote.artisan?.vatNumber
    const capital = customization?.capital || quote.artisan?.capital
    const legalAddress = customization?.legalAddress || quote.artisan?.legalAddress

    if (siren) {
      doc.text(`SIREN: ${siren}`, margin + 40, legalInfoY)
      legalInfoY += 4
    }
    if (siret) {
      doc.text(`SIRET: ${siret}`, margin + 40, legalInfoY)
      legalInfoY += 4
    }
    if (kbis) {
      doc.text(`KBIS: ${kbis}`, margin + 40, legalInfoY)
      legalInfoY += 4
    }
    if (rcs) {
      doc.text(`RCS: ${rcs}`, margin + 40, legalInfoY)
      legalInfoY += 4
    }
    if (vatNumber) {
      doc.text(`TVA Intracommunautaire: ${vatNumber}`, margin + 40, legalInfoY)
      legalInfoY += 4
    }
    if (capital) {
      doc.text(`Capital social: ${capital}`, margin + 40, legalInfoY)
      legalInfoY += 4
    }
    if (legalAddress) {
      doc.text(`Siège social: ${legalAddress}`, margin + 40, legalInfoY)
    }
  }

  // Texte d'en-tête personnalisé
  if (customization?.headerText) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(100, 100, 100)
    doc.text(customization.headerText, pageWidth / 2, yPos + 35, { align: 'center' })
  }

  // Champs personnalisés dans l'en-tête
  if (customization?.customFields) {
    const headerFields = customization.customFields.filter((f: any) => f.position === 'header')
    if (headerFields.length > 0) {
      let headerFieldsY = yPos + 45
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(80, 80, 80)
      headerFields.forEach((field: any) => {
        if (field.label && field.value) {
          doc.text(`${field.label}: ${field.value}`, pageWidth / 2, headerFieldsY, { align: 'center' })
          headerFieldsY += 5
        }
      })
    }
  }

  // Titre DEVIS
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2])
  doc.text('DEVIS', pageWidth - margin, yPos + 15, { align: 'right' })
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(`N° ${quote.quoteNumber}`, pageWidth - margin, yPos + 25, { align: 'right' })

  yPos = 60

  // Informations client et devis
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2])
  doc.text('Devis pour :', margin, yPos)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(60, 60, 60)
  doc.setFontSize(10)
  doc.text(
    `${quote.client.firstName} ${quote.client.lastName}`,
    margin,
    yPos + 7
  )
  if (quote.client.email) {
    doc.text(quote.client.email, margin, yPos + 14)
  }
  doc.text(quote.client.phone, margin, yPos + 21)
  if (quote.client.address) {
    doc.text(quote.client.address, margin, yPos + 28)
  }

  // Champs personnalisés dans la section client
  if (customization?.customFields) {
    const clientFields = customization.customFields.filter((f: any) => f.position === 'client')
    if (clientFields.length > 0) {
      let clientFieldsY = yPos + 35
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(80, 80, 80)
      clientFields.forEach((field: any) => {
        if (field.label && field.value) {
          doc.text(`${field.label}: ${field.value}`, margin, clientFieldsY)
          clientFieldsY += 5
        }
      })
    }
  }

  // Informations devis (droite)
  doc.setFont('helvetica', 'bold')
  doc.text('Informations :', pageWidth - margin, yPos, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.text(`Date: ${formatDate(quote.date)}`, pageWidth - margin, yPos + 7, { align: 'right' })
  if (quote.validUntil) {
    doc.text(`Valable jusqu'au: ${formatDate(quote.validUntil)}`, pageWidth - margin, yPos + 14, { align: 'right' })
  }

  yPos = 110

  // Tableau des articles
  doc.setFillColor(creamColor[0], creamColor[1], creamColor[2])
  doc.roundedRect(margin, yPos - 5, pageWidth - 2 * margin, 8, 1, 1, 'F')

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2])
  doc.text('Description', margin + 5, yPos)
  doc.text('Qté', margin + 100, yPos, { align: 'right' })
  doc.text('Prix unit.', margin + 130, yPos, { align: 'right' })
  doc.text('Total', pageWidth - margin - 5, yPos, { align: 'right' })

  yPos += 10

  quote.items.forEach((item) => {
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(textColor[0], textColor[1], textColor[2])
    doc.setFontSize(9)

    const descriptionLines = doc.splitTextToSize(item.description, 80)
    descriptionLines.forEach((line: string, index: number) => {
      doc.text(line, margin + 5, yPos + (index * 5))
    })

    const maxLines = Math.max(descriptionLines.length, 1)
    doc.text(String(item.quantity), margin + 100, yPos + (maxLines - 1) * 2.5, { align: 'right' })
    doc.text(formatCurrencyPDF(item.unitPrice), margin + 130, yPos + (maxLines - 1) * 2.5, { align: 'right' })
    doc.text(formatCurrencyPDF(item.total), pageWidth - margin - 5, yPos + (maxLines - 1) * 2.5, { align: 'right' })

    yPos += maxLines * 5 + 3
  })

  // Totaux
  yPos += 5
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(textColor[0], textColor[1], textColor[2])

  const subtotalLabel = 'Sous-total HT'
  const subtotalValue = formatCurrencyPDF(quote.subtotal)
  const subtotalX = pageWidth - margin - 80
  doc.text(subtotalLabel, subtotalX, yPos, { align: 'right' })
  doc.text(subtotalValue, pageWidth - margin - 5, yPos, { align: 'right' })
  yPos += 6

  const taxLabel = `TVA (${quote.taxRate}%)`
  const taxValue = formatCurrencyPDF(quote.tax)
  doc.text(taxLabel, subtotalX, yPos, { align: 'right' })
  doc.text(taxValue, pageWidth - margin - 5, yPos, { align: 'right' })
  yPos += 8

  // Total TTC avec fond coloré
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2])

  const totalLabel = 'TOTAL TTC'
  const totalValue = formatCurrencyPDF(quote.total)
  const totalTextWidth = doc.getTextWidth(totalLabel) + doc.getTextWidth(totalValue) + 10

  const rectX = pageWidth - margin - totalTextWidth - 10
  const rectWidth = totalTextWidth + 15
  const rectHeight = 10

  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.roundedRect(rectX, yPos - 5, rectWidth, rectHeight, 2, 2, 'F')
  doc.setTextColor(0, 0, 0)
  doc.text(totalLabel, subtotalX, yPos + 2, { align: 'right' })
  doc.text(totalValue, pageWidth - margin - 5, yPos + 2, { align: 'right' })

  yPos += 20

  // Notes
  if (quote.notes) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2])
    doc.text('Notes :', margin, yPos)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(60, 60, 60)
    const splitNotes = doc.splitTextToSize(quote.notes, pageWidth - 2 * margin)
    doc.text(splitNotes, margin, yPos + 7)
  }

  // Pied de page avec informations légales
  let footerY = pageHeight - 30
  doc.setFontSize(7)
  doc.setTextColor(120, 120, 120)

  // Informations légales (si activées) - Pied de page
  if (!customization || customization.showLegalInfo) {
    const legalInfo: string[] = []

    const siren = customization?.siren || quote.artisan?.siren
    const siret = customization?.siret || quote.artisan?.siret
    const rcs = customization?.rcs || quote.artisan?.rcs
    const kbis = customization?.kbis || quote.artisan?.kbis
    const vatNumber = customization?.vatNumber || quote.artisan?.vatNumber
    const capital = customization?.capital || quote.artisan?.capital
    const legalAddress = customization?.legalAddress || quote.artisan?.legalAddress

    if (siren) {
      legalInfo.push(`SIREN: ${siren}`)
    }
    if (siret) {
      legalInfo.push(`SIRET: ${siret}`)
    }
    if (rcs) {
      legalInfo.push(`RCS: ${rcs}`)
    }
    if (kbis) {
      legalInfo.push(`KBIS: ${kbis}`)
    }
    if (vatNumber) {
      legalInfo.push(`TVA Intracommunautaire: ${vatNumber}`)
    }
    if (capital) {
      legalInfo.push(`Capital social: ${capital}`)
    }
    if (legalAddress) {
      legalInfo.push(`Siège social: ${legalAddress}`)
    }

    if (legalInfo.length > 0) {
      const fullText = legalInfo.join(' | ')
      const textLines = doc.splitTextToSize(fullText, pageWidth - 2 * margin)

      textLines.forEach((line: string) => {
        doc.text(line, pageWidth / 2, footerY, { align: 'center' })
        footerY += 4
      })
    }
  }

  // Texte de pied de page personnalisé
  const footerText = customization?.footerText || 'Merci de votre confiance !'
  doc.text(footerText, pageWidth / 2, footerY + 5, { align: 'center' })

  // Champs personnalisés dans le pied de page
  if (customization?.customFields) {
    const footerFields = customization.customFields.filter((f: any) => f.position === 'footer')
    if (footerFields.length > 0) {
      let footerFieldsY = footerY + 12
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 100, 100)
      footerFields.forEach((field: any) => {
        if (field.label && field.value) {
          doc.text(`${field.label}: ${field.value}`, pageWidth / 2, footerFieldsY, { align: 'center' })
          footerFieldsY += 4
        }
      })
    }
  }

  // Télécharger le PDF
  doc.save(`devis-${quote.quoteNumber}.pdf`)
}

