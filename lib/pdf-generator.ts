import jsPDF from 'jspdf'
import { formatCurrency, formatDate } from './utils'

interface InvoiceData {
  invoiceNumber: string
  date: string
  dueDate: string | null
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

export function generateInvoicePDF(invoice: InvoiceData): void {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  let yPos = margin

  // Fonction pour formater les montants pour PDF
  // Utiliser un format avec espaces insécables pour éviter les problèmes de rendu
  const formatCurrencyPDF = (amount: number): string => {
    const parts = amount.toFixed(2).split('.')
    const integerPart = parts[0]
    const decimalPart = parts[1]
    
    // Ajouter des espaces tous les 3 chiffres pour la partie entière
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0') // Espace insécable
    
    return `${formattedInteger},${decimalPart} €`
  }

  // Couleurs personnalisées ou par défaut
  const customization = invoice.customization
  const primaryColor = customization
    ? [customization.primaryColorR, customization.primaryColorG, customization.primaryColorB]
    : [150, 185, 220] // Bleu pastel par défaut
  const creamColor = [253, 244, 220] // Crème
  const darkColor = [10, 10, 10] // Noir
  const textColor = [38, 38, 38] // Gris foncé

  // En-tête avec logo
  if (customization?.showLogo && customization?.logoUrl) {
    // Si un logo est fourni, on essaie de l'ajouter (nécessite une conversion base64 -> image)
    // Pour l'instant, on garde le rectangle coloré
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.roundedRect(margin, yPos, 30, 30, 3, 3, 'F')
    // TODO: Ajouter le logo si c'est une URL valide
  } else if (!customization || customization.showLogo) {
    // Logo par défaut (icône)
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.roundedRect(margin, yPos, 30, 30, 3, 3, 'F')
    
    // Icône Wrench (simplifiée - dessin manuel)
    doc.setLineWidth(2)
    doc.setDrawColor(0, 0, 0)
    // Dessiner un W stylisé
    doc.line(margin + 10, yPos + 10, margin + 15, yPos + 20)
    doc.line(margin + 15, yPos + 20, margin + 20, yPos + 10)
    doc.line(margin + 20, yPos + 10, margin + 20, yPos + 20)
  }
  
  // Nom de l'entreprise
  const companyName = invoice.artisan?.companyName || invoice.artisan?.name || 'ArtisanPro'
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
    
    if (invoice.artisan?.address) {
      doc.text(invoice.artisan.address, margin + 40, companyInfoY)
      companyInfoY += 5
    }
    if (invoice.artisan?.phone) {
      doc.text(`Tél: ${invoice.artisan.phone}`, margin + 40, companyInfoY)
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
    
    const siren = customization?.siren || invoice.artisan?.siren
    const siret = customization?.siret || invoice.artisan?.siret
    const kbis = customization?.kbis || invoice.artisan?.kbis
    const rcs = customization?.rcs || invoice.artisan?.rcs
    const vatNumber = customization?.vatNumber || invoice.artisan?.vatNumber
    const capital = customization?.capital || invoice.artisan?.capital
    const legalAddress = customization?.legalAddress || invoice.artisan?.legalAddress
    
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
  
  // Titre FACTURE
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2])
  doc.text('FACTURE', pageWidth - margin, yPos + 15, { align: 'right' })
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(`N° ${invoice.invoiceNumber}`, pageWidth - margin, yPos + 25, { align: 'right' })
  
  yPos = 60

  // Informations client et facture
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2])
  doc.text('Facturé à :', margin, yPos)
  
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(60, 60, 60)
  doc.setFontSize(10)
  doc.text(
    `${invoice.client.firstName} ${invoice.client.lastName}`,
    margin,
    yPos + 7
  )
  if (invoice.client.email) {
    doc.text(invoice.client.email, margin, yPos + 14)
  }
  doc.text(invoice.client.phone, margin, yPos + 21)
  if (invoice.client.address) {
    doc.text(invoice.client.address, margin, yPos + 28)
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

  // Informations facture (droite)
  doc.setFont('helvetica', 'bold')
  doc.text('Informations :', pageWidth - margin, yPos, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.text(`Date: ${formatDate(invoice.date)}`, pageWidth - margin, yPos + 7, { align: 'right' })
  if (invoice.dueDate) {
    doc.text(`Échéance: ${formatDate(invoice.dueDate)}`, pageWidth - margin, yPos + 14, { align: 'right' })
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

  invoice.items.forEach((item) => {
    if (yPos > pageHeight - 60) {
      doc.addPage()
      yPos = margin + 10
    }

    doc.setFont('helvetica', 'normal')
    doc.setTextColor(60, 60, 60)
    doc.text(item.description.substring(0, 40), margin + 5, yPos)
    doc.text(item.quantity.toString(), margin + 100, yPos, { align: 'right' })
    doc.text(formatCurrencyPDF(item.unitPrice), margin + 130, yPos, { align: 'right' })
    doc.setFont('helvetica', 'bold')
    doc.text(formatCurrencyPDF(item.total), pageWidth - margin - 5, yPos, { align: 'right' })
    yPos += 8
  })

  yPos += 5

  // Totaux
  const totalsX = pageWidth - margin - 60
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  doc.text('Sous-total HT :', totalsX, yPos, { align: 'right' })
  doc.text(formatCurrencyPDF(invoice.subtotal), pageWidth - margin - 5, yPos, { align: 'right' })
  yPos += 7

  const taxRateLabel = invoice.taxRate ? `TVA (${invoice.taxRate}%) :` : 'TVA :'
  doc.text(taxRateLabel, totalsX, yPos, { align: 'right' })
  doc.text(formatCurrencyPDF(invoice.tax), pageWidth - margin - 5, yPos, { align: 'right' })
  yPos += 10

  // Calculer la largeur du texte pour ajuster le rectangle
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  const totalLabel = 'Total TTC :'
  const totalValue = formatCurrencyPDF(invoice.total)
  const labelWidth = doc.getTextWidth(totalLabel)
  const valueWidth = doc.getTextWidth(totalValue)
  const spacing = 5 // Espace entre label et valeur
  const totalTextWidth = labelWidth + spacing + valueWidth
  
  // Ajuster la position et la largeur du rectangle pour qu'il s'adapte exactement au texte
  const rectX = pageWidth - margin - totalTextWidth - 10
  const rectWidth = totalTextWidth + 15
  const rectHeight = 10
  
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.roundedRect(rectX, yPos - 5, rectWidth, rectHeight, 2, 2, 'F')
  doc.setTextColor(0, 0, 0)
  doc.text(totalLabel, totalsX, yPos + 2, { align: 'right' })
  doc.text(totalValue, pageWidth - margin - 5, yPos + 2, { align: 'right' })

  yPos += 20

  // Notes
  if (invoice.notes) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2])
    doc.text('Notes :', margin, yPos)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(60, 60, 60)
    const splitNotes = doc.splitTextToSize(invoice.notes, pageWidth - 2 * margin)
    doc.text(splitNotes, margin, yPos + 7)
  }

  // Pied de page avec informations légales
  let footerY = pageHeight - 30
  doc.setFontSize(7)
  doc.setTextColor(120, 120, 120)
  
  // Informations légales (si activées) - Pied de page
  // Utiliser les valeurs de la personnalisation en priorité, sinon celles de l'artisan
  if (!customization || customization.showLegalInfo) {
    const legalInfo: string[] = []
    
    // Utiliser les valeurs de la personnalisation en priorité
    const siren = customization?.siren || invoice.artisan?.siren
    const siret = customization?.siret || invoice.artisan?.siret
    const rcs = customization?.rcs || invoice.artisan?.rcs
    const kbis = customization?.kbis || invoice.artisan?.kbis
    const vatNumber = customization?.vatNumber || invoice.artisan?.vatNumber
    const capital = customization?.capital || invoice.artisan?.capital
    const legalAddress = customization?.legalAddress || invoice.artisan?.legalAddress
    
    // Ordre recommandé pour les informations légales françaises
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
      // Afficher les informations légales sur plusieurs lignes si nécessaire
      const fullText = legalInfo.join(' | ')
      const textLines = doc.splitTextToSize(fullText, pageWidth - 2 * margin)
      
      textLines.forEach((line: string, index: number) => {
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
  doc.save(`facture-${invoice.invoiceNumber}.pdf`)
}

