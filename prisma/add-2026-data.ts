import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Données de test (mêmes que dans seed.ts)
const services = [
  'Consultation', 'Installation', 'Réparation', 'Maintenance', 'Dépannage urgence',
  'Rénovation', 'Remplacement', 'Diagnostic', 'Contrôle qualité', 'Formation',
  'Audit', 'Optimisation', 'Mise en service', 'Configuration', 'Support technique',
  'Intervention sur site', 'Assistance', 'Conseil', 'Réglage', 'Nettoyage professionnel'
]

const expenseCategories = [
  'Matériel', 'Transport', 'Outillage', 'Formation', 'Assurance', 'Publicité',
  'Téléphone', 'Électricité', 'Eau', 'Fournitures', 'Location', 'Maintenance'
]

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

async function main() {
  console.log('🚀 Ajout de données pour 2026...')

  // Récupérer le premier artisan (ou créer un compte de test si nécessaire)
  let artisan = await prisma.artisan.findFirst()
  
  if (!artisan) {
    console.log('❌ Aucun artisan trouvé. Veuillez d\'abord créer un compte.')
    return
  }

  console.log(`✅ Artisan trouvé: ${artisan.email}`)

  // Récupérer les clients existants
  const clients = await prisma.client.findMany({
    where: { artisanId: artisan.id },
  })

  if (clients.length === 0) {
    console.log('❌ Aucun client trouvé. Veuillez d\'abord créer des clients.')
    return
  }

  console.log(`✅ ${clients.length} clients trouvés`)

  // Dates pour 2026
  const startDate2026 = new Date('2026-01-01')
  const endDate2026 = new Date('2026-12-31')

  // Générer des interventions pour 2026
  console.log('📅 Création d\'interventions pour 2026...')
  const interventions2026 = []
  const currentDate = new Date(startDate2026)
  
  while (currentDate <= endDate2026) {
    const numInterventions = randomInt(1, 4) // Entre 1 et 4 par jour
    
    for (let i = 0; i < numInterventions; i++) {
      const client = randomElement(clients)
      const hour = randomInt(8, 18)
      const minute = randomInt(0, 59)
      
      const date = new Date(currentDate)
      date.setHours(hour, minute, 0, 0)
      
      // Status : 90% todo, 10% cancelled (futures)
      const status = Math.random() < 0.9 ? 'todo' : 'cancelled'
      
      const duration = randomInt(30, 240) // 30 min à 4h
      const price = randomFloat(50, 500)
      
      const intervention = await prisma.intervention.create({
        data: {
          title: randomElement(services),
          description: `Intervention ${randomElement(services).toLowerCase()}`,
          date,
          duration,
          status,
          price,
          clientId: client.id,
          artisanId: artisan.id,
          latitude: randomFloat(48.8, 49.0), // Paris région
          longitude: randomFloat(2.2, 2.4),
        },
      })
      
      interventions2026.push(intervention)
    }
    
    currentDate.setDate(currentDate.getDate() + 1)
    
    if (interventions2026.length % 100 === 0) {
      console.log(`  ${interventions2026.length} interventions créées...`)
    }
  }

  console.log(`✅ ${interventions2026.length} interventions créées pour 2026`)

  // Générer des factures pour 2026 (environ 60, réparties sur l'année)
  console.log('💰 Création de factures pour 2026...')
  const invoices2026 = []
  
  // Récupérer les numéros de factures existants
  const existingInvoices = await prisma.invoice.findMany({
    select: { invoiceNumber: true },
  })
  let maxInvoiceNumber = 0
  for (const inv of existingInvoices) {
    const match = (inv.invoiceNumber as string).match(/FAC-(\d+)/)
    if (match) {
      const num = parseInt(match[1], 10)
      if (num > maxInvoiceNumber) maxInvoiceNumber = num
    }
  }
  let invoiceCounter = maxInvoiceNumber + 1

  const baseInvoicesPerMonth = Math.floor(60 / 12) // ~5 par mois
  
  for (let month = 0; month < 12; month++) {
    const variation = randomFloat(0.7, 1.3)
    let invoicesThisMonth = Math.round(baseInvoicesPerMonth * variation)
    
    if (month === 11) {
      invoicesThisMonth = 60 - invoices2026.length // Ajuster le dernier mois
    }
    
    for (let i = 0; i < invoicesThisMonth; i++) {
      const client = randomElement(clients)
      const day = Math.floor((i / invoicesThisMonth) * 27) + 1
      const date = new Date(2026, month, day, 12, 0, 0)
      
      // 70% payées, 15% envoyées, 10% en retard, 5% brouillon
      let status: 'draft' | 'sent' | 'paid' | 'overdue'
      const rand = Math.random()
      if (rand < 0.70) status = 'paid'
      else if (rand < 0.85) status = 'sent'
      else if (rand < 0.95) status = 'overdue'
      else status = 'draft'
      
      const dueDate = new Date(date)
      dueDate.setDate(dueDate.getDate() + randomInt(15, 45))
      
      const invoiceNumber = `FAC-${String(invoiceCounter++).padStart(6, '0')}`
      
      const numItems = randomInt(1, 5)
      let subtotal = 0
      
      for (let j = 0; j < numItems; j++) {
        const quantity = randomInt(1, 15)
        const unitPrice = randomFloat(15, 800)
        subtotal += quantity * unitPrice
      }
      
      const tax = subtotal * 0.20
      const total = subtotal + tax
      
      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber,
          date,
          dueDate,
          status,
          subtotal,
          taxRate: 20,
          tax,
          total,
          clientId: client.id,
          artisanId: artisan.id,
          items: {
            create: Array.from({ length: numItems }, () => ({
              description: randomElement(services),
              quantity: randomInt(1, 15),
              unitPrice: randomFloat(15, 800),
              total: 0, // Sera recalculé
            })),
          },
        },
      })
      
      // Recalculer les totaux des items
      const items = await prisma.invoiceItem.findMany({
        where: { invoiceId: invoice.id },
      })
      
      for (const item of items) {
        const itemTotal = item.quantity * item.unitPrice
        await prisma.invoiceItem.update({
          where: { id: item.id },
          data: { total: Math.round(itemTotal * 100) / 100 },
        })
      }
      
      // Recalculer le total de la facture
      const newSubtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
      const newTax = Math.round(newSubtotal * 0.20 * 100) / 100
      const newTotal = Math.round((newSubtotal + newTax) * 100) / 100
      
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          subtotal: Math.round(newSubtotal * 100) / 100,
          tax: newTax,
          total: newTotal,
        },
      })
      
      invoices2026.push(invoice)
    }
  }

  console.log(`✅ ${invoices2026.length} factures créées pour 2026`)

  // Générer des devis pour 2026 (environ 40)
  console.log('📄 Création de devis pour 2026...')
  const quotes2026 = []
  
  const existingQuotes = await prisma.quote.findMany({
    select: { quoteNumber: true },
  })
  let maxQuoteNumber = 0
  for (const q of existingQuotes) {
    const match = (q.quoteNumber as string).match(/DEV-(\d+)/)
    if (match) {
      const num = parseInt(match[1], 10)
      if (num > maxQuoteNumber) maxQuoteNumber = num
    }
  }
  let quoteCounter = maxQuoteNumber + 1

  const baseQuotesPerMonth = Math.floor(40 / 12) // ~3-4 par mois
  
  for (let month = 0; month < 12; month++) {
    const variation = randomFloat(0.7, 1.3)
    let quotesThisMonth = Math.round(baseQuotesPerMonth * variation)
    
    if (month === 11) {
      quotesThisMonth = 40 - quotes2026.length
    }
    
    for (let i = 0; i < quotesThisMonth; i++) {
      const client = randomElement(clients)
      const day = Math.floor((i / quotesThisMonth) * 27) + 1
      const date = new Date(2026, month, day, 10, 0, 0)
      
      const quoteStatuses = ['draft', 'sent', 'accepted', 'rejected', 'expired'] as const
      const status = randomElement([...quoteStatuses])
      
      const validUntil = new Date(date)
      validUntil.setDate(validUntil.getDate() + randomInt(7, 90))
      
      const quoteNumber = `DEV-${String(quoteCounter++).padStart(6, '0')}`
      
      const numItems = randomInt(1, 5)
      let subtotal = 0
      
      for (let j = 0; j < numItems; j++) {
        const quantity = randomInt(1, 10)
        const unitPrice = randomFloat(20, 500)
        subtotal += quantity * unitPrice
      }
      
      const tax = subtotal * 0.20
      const total = subtotal + tax
      
      const quote = await prisma.quote.create({
        data: {
          quoteNumber,
          date,
          validUntil,
          status,
          subtotal,
          taxRate: 20,
          tax,
          total,
          clientId: client.id,
          artisanId: artisan.id,
          items: {
            create: Array.from({ length: numItems }, () => ({
              description: randomElement(services),
              quantity: randomInt(1, 10),
              unitPrice: randomFloat(20, 500),
              total: 0, // Sera recalculé
            })),
          },
        },
      })
      
      // Recalculer les totaux des items
      const items = await prisma.quoteItem.findMany({
        where: { quoteId: quote.id },
      })
      
      for (const item of items) {
        const itemTotal = item.quantity * item.unitPrice
        await prisma.quoteItem.update({
          where: { id: item.id },
          data: { total: Math.round(itemTotal * 100) / 100 },
        })
      }
      
      // Recalculer le total du devis
      const newSubtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
      const newTax = Math.round(newSubtotal * 0.20 * 100) / 100
      const newTotal = Math.round((newSubtotal + newTax) * 100) / 100
      
      await prisma.quote.update({
        where: { id: quote.id },
        data: {
          subtotal: Math.round(newSubtotal * 100) / 100,
          tax: newTax,
          total: newTotal,
        },
      })
      
      quotes2026.push(quote)
    }
  }

  console.log(`✅ ${quotes2026.length} devis créés pour 2026`)

  // Générer des dépenses pour 2026 (environ 30)
  console.log('💸 Création de dépenses pour 2026...')
  const expenses2026 = []
  
  const baseExpensesPerMonth = Math.floor(30 / 12) // ~2-3 par mois
  
  for (let month = 0; month < 12; month++) {
    const variation = randomFloat(0.7, 1.3)
    let expensesThisMonth = Math.round(baseExpensesPerMonth * variation)
    
    if (month === 11) {
      expensesThisMonth = 30 - expenses2026.length
    }
    
    for (let i = 0; i < expensesThisMonth; i++) {
      const category = randomElement(expenseCategories)
      const day = Math.floor((i / expensesThisMonth) * 27) + 1
      const date = new Date(2026, month, day, randomInt(8, 18), 0, 0)
      
      const expense = await prisma.expense.create({
        data: {
          description: `Dépense ${category.toLowerCase()} - ${randomElement(['Fournisseur A', 'Fournisseur B', 'Magasin', 'En ligne', 'Local'])}`,
          amount: randomFloat(10, 2000),
          category,
          date,
          artisanId: artisan.id,
        },
      })
      
      expenses2026.push(expense)
    }
  }

  console.log(`✅ ${expenses2026.length} dépenses créées pour 2026`)

  console.log('\n🎉 Données 2026 ajoutées avec succès !')
  console.log(`   - ${interventions2026.length} interventions`)
  console.log(`   - ${invoices2026.length} factures`)
  console.log(`   - ${quotes2026.length} devis`)
  console.log(`   - ${expenses2026.length} dépenses`)
}

main()
  .catch((e) => {
    console.error('Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

