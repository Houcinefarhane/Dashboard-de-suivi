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

  // Couleurs
  const primaryColor = [150, 185, 220] // Bleu pastel plus bleuté
  const creamColor = [253, 244, 220] // Crème
  const darkColor = [10, 10, 10] // Noir
  const textColor = [38, 38, 38] // Gris foncé

  // En-tête avec logo
  doc.setFillColor(...primaryColor)
  doc.roundedRect(margin, yPos, 30, 30, 3, 3, 'F')
  
  // Icône Wrench (simplifiée - dessin manuel)
  doc.setLineWidth(2)
  doc.setDrawColor(0, 0, 0)
  // Dessiner un W stylisé
  doc.line(margin + 10, yPos + 10, margin + 15, yPos + 20)
  doc.line(margin + 15, yPos + 20, margin + 20, yPos + 10)
  doc.line(margin + 20, yPos + 10, margin + 20, yPos + 20)
  
  // Nom de l'entreprise
  const companyName = invoice.artisan?.companyName || invoice.artisan?.name || 'ArtisanPro'
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...darkColor)
  doc.text(companyName, margin + 40, yPos + 12)
  
  // Informations de l'entreprise
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
  if (invoice.artisan?.siret) {
    doc.text(`SIRET: ${invoice.artisan.siret}`, margin + 40, companyInfoY)
    companyInfoY += 5
  }
  if (invoice.artisan?.vatNumber) {
    doc.text(`TVA: ${invoice.artisan.vatNumber}`, margin + 40, companyInfoY)
  }
  
  // Titre FACTURE
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...darkColor)
  doc.text('FACTURE', pageWidth - margin, yPos + 15, { align: 'right' })
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(`N° ${invoice.invoiceNumber}`, pageWidth - margin, yPos + 25, { align: 'right' })
  
  yPos = 60

  // Informations client et facture
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...darkColor)
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
  doc.setFillColor(...creamColor)
  doc.roundedRect(margin, yPos - 5, pageWidth - 2 * margin, 8, 1, 1, 'F')
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...darkColor)
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
  
  doc.setFillColor(...primaryColor)
  doc.roundedRect(rectX, yPos - 5, rectWidth, rectHeight, 2, 2, 'F')
  doc.setTextColor(0, 0, 0)
  doc.text(totalLabel, totalsX, yPos + 2, { align: 'right' })
  doc.text(totalValue, pageWidth - margin - 5, yPos + 2, { align: 'right' })

  yPos += 20

  // Notes
  if (invoice.notes) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...darkColor)
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
  
  // Informations légales
  const legalInfo: string[] = []
  if (invoice.artisan?.siret) {
    legalInfo.push(`SIRET: ${invoice.artisan.siret}`)
  }
  if (invoice.artisan?.siren) {
    legalInfo.push(`SIREN: ${invoice.artisan.siren}`)
  }
  if (invoice.artisan?.rcs) {
    legalInfo.push(`RCS: ${invoice.artisan.rcs}`)
  }
  if (invoice.artisan?.kbis) {
    legalInfo.push(`KBIS: ${invoice.artisan.kbis}`)
  }
  if (invoice.artisan?.capital) {
    legalInfo.push(`Capital: ${invoice.artisan.capital}`)
  }
  if (invoice.artisan?.legalAddress) {
    legalInfo.push(`Siège social: ${invoice.artisan.legalAddress}`)
  }
  
  if (legalInfo.length > 0) {
    doc.text(legalInfo.join(' | '), pageWidth / 2, footerY, { align: 'center', maxWidth: pageWidth - 2 * margin })
    footerY += 5
  }
  
  doc.text('Merci de votre confiance !', pageWidth / 2, footerY + 5, { align: 'center' })

  // Télécharger le PDF
  doc.save(`facture-${invoice.invoiceNumber}.pdf`)
}

