import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

// Données de test
const firstNames = [
  'Jean', 'Marie', 'Pierre', 'Sophie', 'Michel', 'Isabelle', 'Philippe', 'Catherine',
  'Alain', 'Françoise', 'Bernard', 'Monique', 'Daniel', 'Nicole', 'Patrick', 'Martine',
  'Claude', 'Sylvie', 'Gérard', 'Brigitte', 'André', 'Christine', 'Robert', 'Françoise',
  'Henri', 'Véronique', 'Louis', 'Pascale', 'Marcel', 'Dominique', 'Paul', 'Céline',
  'Jacques', 'Valérie', 'René', 'Sandrine', 'Roger', 'Nathalie', 'Maurice', 'Stéphanie'
]

const lastNames = [
  'Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand',
  'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia', 'David',
  'Bertrand', 'Roux', 'Vincent', 'Fournier', 'Morel', 'Girard', 'André', 'Lefevre',
  'Mercier', 'Dupont', 'Lambert', 'Bonnet', 'François', 'Martinez', 'Legrand', 'Garnier',
  'Faure', 'Rousseau', 'Blanc', 'Guerin', 'Muller', 'Henry', 'Roussel', 'Nicolas'
]

const cities = [
  'Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier',
  'Bordeaux', 'Lille', 'Rennes', 'Reims', 'Le Havre', 'Saint-Étienne', 'Toulon', 'Grenoble',
  'Dijon', 'Angers', 'Nîmes', 'Villeurbanne', 'Saint-Denis', 'Le Mans', 'Aix-en-Provence',
  'Clermont-Ferrand', 'Brest', 'Limoges', 'Tours', 'Amiens', 'Perpignan', 'Metz'
]

const services = [
  'Réparation de fuite', 'Remplacement de robinet', 'Installation sanitaire', 'Débouchage canalisation',
  'Réparation chaudière', 'Installation plomberie', 'Rénovation salle de bain', 'Dépannage urgence',
  'Installation radiateur', 'Réparation WC', 'Installation douche', 'Remplacement tuyauterie',
  'Réparation serrure', 'Installation serrure', 'Déblocage porte', 'Changement serrure',
  'Installation alarme', 'Réparation porte', 'Installation blindage', 'Dépannage serrure'
]

const materials = [
  'Robinet mélangeur', 'Tuyau PVC', 'Collier de serrage', 'Joint torique', 'Vanne d\'arrêt',
  'Siphon', 'Flexible', 'Raccord', 'Manchon', 'Réducteur', 'Té', 'Coude',
  'Serrure multipoint', 'Cylindre', 'Gâche électrique', 'Béquille', 'Pêne', 'Cylindre double entrée',
  'Boulon', 'Vis', 'Clou', 'Cheville', 'Colle', 'Mastic', 'Joint', 'Ruban téflon'
]

const expenseCategories = [
  'Matériel', 'Transport', 'Outillage', 'Formation', 'Assurance', 'Publicité',
  'Téléphone', 'Électricité', 'Eau', 'Fournitures', 'Location', 'Maintenance'
]

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomFloat(min: number, max: number): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2))
}

async function main() {
  console.log('🌱 Début du seed...')

  // Récupérer ou créer l'artisan avec les bons identifiants
  const artisanEmail = process.env.SEED_EMAIL || 'test@artisan.com'
  // Mot de passe par défaut pour les comptes de test (à changer en production)
  const artisanPassword = process.env.SEED_PASSWORD || 'password123'
  
  let artisan = await prisma.artisan.findUnique({
    where: { email: artisanEmail }
  })
  
  if (!artisan) {
    console.log('👤 Création du compte artisan...')
    const hashedPassword = await hash(artisanPassword, 10)
    artisan = await prisma.artisan.create({
      data: {
        email: artisanEmail,
        password: hashedPassword,
        name: 'Admin Artisan',
        phone: '0123456789',
        address: '123 Rue de Test',
        companyName: 'Artisan Pro'
      }
    })
    console.log(`✅ Compte artisan créé: ${artisanEmail}`)
  } else {
    console.log(`✅ Artisan trouvé: ${artisanEmail}`)
    // Mettre à jour le mot de passe au cas où
    const hashedPassword = await hash(artisanPassword, 10)
    artisan = await prisma.artisan.update({
      where: { id: artisan.id },
      data: { password: hashedPassword }
    })
  }

  // Nettoyer les données existantes (sauf l'artisan)
  console.log('🧹 Nettoyage des données existantes...')
  
  // Supprimer dans l'ordre pour respecter les contraintes de clés étrangères
  await prisma.notification.deleteMany({
    where: { artisanId: artisan.id }
  })
  
  // Supprimer tous les reminders, items et factures (invoiceNumber est unique globalement)
  await prisma.invoiceReminder.deleteMany({})
  await prisma.invoiceItem.deleteMany({})
  await prisma.invoice.deleteMany({})
  
  // Supprimer tous les items de devis puis tous les devis (quoteNumber est unique globalement)
  await prisma.quoteItem.deleteMany({})
  await prisma.quote.deleteMany({})
  
  await prisma.intervention.deleteMany({
    where: { artisanId: artisan.id }
  })
  await prisma.expense.deleteMany({
    where: { artisanId: artisan.id }
  })
  await prisma.stockItem.deleteMany({
    where: { artisanId: artisan.id }
  })
  await prisma.client.deleteMany({
    where: { artisanId: artisan.id }
  })

  // Récupérer l'artisan mis à jour
  artisan = await prisma.artisan.findUnique({
    where: { id: artisan.id }
  })
  
  if (!artisan) {
    throw new Error(`Artisan avec l'email ${artisanEmail} non trouvé. Veuillez créer le compte d'abord.`)
  }
  
  console.log(`✅ Artisan trouvé/créé: ${artisan.email}`)

  // Générer des clients (500)
  console.log('👥 Création de 500 clients...')
  const clients = []
  for (let i = 0; i < 500; i++) {
    const firstName = randomElement(firstNames)
    const lastName = randomElement(lastNames)
    const city = randomElement(cities)
    
    const client = await prisma.client.create({
      data: {
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
        phone: `0${randomInt(100000000, 999999999)}`,
        address: `${randomInt(1, 200)} Rue ${randomElement(['de la', 'du', 'des', ''])} ${randomElement(['République', 'Liberté', 'Paix', 'France', 'Paris', 'Victor Hugo'])}`,
        city,
        postalCode: randomInt(10000, 99999).toString(),
        notes: i % 10 === 0 ? `Client fidèle depuis ${randomInt(1, 10)} ans` : null,
        artisanId: artisan.id
      }
    })
    clients.push(client)
    
    if ((i + 1) % 50 === 0) {
      console.log(`  ✅ ${i + 1}/500 clients créés`)
    }
  }

  // Générer des items de stock (200)
  console.log('📦 Création de 200 items de stock...')
  const stockItems = []
  for (let i = 0; i < 200; i++) {
    const material = randomElement(materials)
    const stockItem = await prisma.stockItem.create({
      data: {
        name: material,
        description: `Description pour ${material}`,
        quantity: randomInt(0, 500),
        unit: randomElement(['unité', 'mètre', 'kg', 'litre', 'paquet']),
        unitPrice: randomFloat(5, 200),
        minQuantity: randomInt(5, 50),
        artisanId: artisan.id
      }
    })
    stockItems.push(stockItem)
    
    if ((i + 1) % 50 === 0) {
      console.log(`  ✅ ${i + 1}/200 items de stock créés`)
    }
  }

  // Générer des interventions (maximum 4 par jour, bien espacées)
  console.log('📅 Création des interventions (max 4 par jour, espacées d\'au moins 1h)...')
  const interventions = []
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - 12) // 12 mois en arrière
  const endDate = new Date()
  endDate.setMonth(endDate.getMonth() + 3) // 3 mois dans le futur
  
  // Créer des maps pour suivre les interventions par jour
  const interventionsByDay = new Map<string, number>()
  const hoursByDay = new Map<string, number[]>()
  
  // Fonction pour obtenir la clé du jour (YYYY-MM-DD)
  const getDayKey = (date: Date): string => {
    return date.toISOString().split('T')[0]
  }
  
  // Générer toutes les dates possibles
  const allDates: Date[] = []
  const currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    allDates.push(new Date(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  // Pour chaque jour, créer maximum 4 interventions bien espacées d'au moins 2h
  for (const dayDate of allDates) {
    const dayKey = getDayKey(dayDate)
    const numInterventions = randomInt(1, 5) // Entre 1 et 4 (5 exclu)
    
    // Heures disponibles pour ce jour (8h à 18h)
    // Pour espacer d'au moins 2h, on divise la journée en créneaux de 2h
    const availableTimeSlots: number[] = []
    for (let h = 8; h <= 16; h += 2) {
      availableTimeSlots.push(h) // Créneaux espacés de 2h (8h, 10h, 12h, 14h, 16h)
    }
    
    // Mélanger les créneaux pour une distribution aléatoire
    const shuffledSlots = [...availableTimeSlots].sort(() => Math.random() - 0.5)
    const selectedSlots = shuffledSlots.slice(0, numInterventions).sort((a, b) => a - b)
    
    for (let i = 0; i < numInterventions; i++) {
      const client = randomElement(clients)
      const hour = selectedSlots[i]
      
      // Toujours à l'heure pile pour faciliter l'espacement
      const minute = 0
      
      const date = new Date(dayDate)
      date.setHours(hour, minute, 0, 0)
      
      // Logique de cohérence : comparer uniquement les dates (sans l'heure)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const interventionDay = new Date(date)
      interventionDay.setHours(0, 0, 0, 0)
      
      let status: string
      if (interventionDay < today) {
        // Intervention passée (date < aujourd'hui) : soit "completed" soit "cancelled"
        status = Math.random() < 0.8 ? 'completed' : 'cancelled' // 80% terminées, 20% annulées
      } else if (interventionDay > today) {
        // Intervention future (date > aujourd'hui) : soit "todo" soit "cancelled"
        status = Math.random() < 0.9 ? 'todo' : 'cancelled' // 90% à faire, 10% annulées
      } else {
        // Intervention aujourd'hui : peut être n'importe quel statut
        const statuses = ['todo', 'completed', 'cancelled']
        status = statuses[Math.floor(Math.random() * statuses.length)]
      }
      
      try {
        const intervention: any = await prisma.intervention.create({
          data: {
            title: randomElement(services),
            description: `Intervention ${randomElement(['urgente', 'planifiée', 'de maintenance', 'de réparation'])} pour ${client.firstName} ${client.lastName}`,
            date,
            duration: randomInt(30, 120), // 30 min à 2h maximum
            status,
            address: client.address || `${randomInt(1, 200)} Rue de Test`,
            price: randomFloat(50, 2000),
            photosBefore: interventions.length % 10 === 0 ? JSON.stringify([`https://example.com/photo-before-${interventions.length}.jpg`]) : null,
            photosAfter: status === 'completed' && interventions.length % 10 === 0 ? JSON.stringify([`https://example.com/photo-after-${interventions.length}.jpg`]) : null,
            clientId: client.id,
            artisanId: artisan.id
          }
        })
        interventions.push(intervention)
        
        // Mettre à jour le compteur pour ce jour
        const currentCount = interventionsByDay.get(dayKey) || 0
        interventionsByDay.set(dayKey, currentCount + 1)
        
        // Mettre à jour les heures utilisées pour ce jour
        const currentHours = hoursByDay.get(dayKey) || []
        currentHours.push(hour)
        hoursByDay.set(dayKey, currentHours)
        
        if (interventions.length % 100 === 0) {
          console.log(`  ✅ ${interventions.length} interventions créées`)
        }
      } catch (error) {
        console.error(`Erreur lors de la création de l'intervention:`, error)
      }
    }
  }
  
  console.log(`  ✅ ${interventions.length} interventions créées au total`)

  // Générer des devis (400)
  console.log('📄 Création de 400 devis...')
  const quotes = []
  const quoteStatuses = ['draft', 'sent', 'accepted', 'rejected', 'converted'] as const

  // Récupérer tous les numéros de devis existants pour éviter les conflits (quoteNumber est unique globalement)
  const existingQuotes = await prisma.quote.findMany({
    select: { quoteNumber: true }
  })
  console.log(`  📊 ${existingQuotes.length} devis existants trouvés`)
  const existingQuoteNumbers = new Set(existingQuotes.map((q: { quoteNumber: string }) => q.quoteNumber))
  
  // Trouver le numéro le plus élevé pour continuer la numérotation
  let maxQuoteNumber = 0
  for (const q of existingQuotes) {
    const match = (q.quoteNumber as string).match(/DEV-(\d+)/)
    if (match) {
      const num = parseInt(match[1], 10)
      if (num > maxQuoteNumber) maxQuoteNumber = num
    }
  }
  
  let quoteCounter = maxQuoteNumber + 1
  console.log(`  🔢 Début de la numérotation à DEV-${quoteCounter.toString().padStart(4, '0')}`)

  for (let i = 0; i < 400; i++) {
    const client = randomElement(clients)
    const date = randomDate(startDate, endDate)
    const status = randomElement([...quoteStatuses])
    const validUntil = new Date(date)
    validUntil.setDate(validUntil.getDate() + randomInt(7, 90))
    
    // Calculer d'abord les totaux
    const numItems = randomInt(1, 5)
    let subtotal = 0
    
    for (let j = 0; j < numItems; j++) {
      const quantity = randomInt(1, 10)
      const unitPrice = randomFloat(20, 500)
      const total = quantity * unitPrice
      subtotal += total
    }

    const tax = subtotal * 0.20 // 20% TVA
    const total = subtotal + tax

        // Générer un numéro de devis unique
        let quoteNumber: string
        let attempts = 0
        do {
          quoteNumber = `DEV-${quoteCounter.toString().padStart(4, '0')}`
          quoteCounter++
          attempts++
          if (attempts > 1000) {
            throw new Error(`Impossible de générer un numéro de devis unique après ${attempts} tentatives`)
          }
        } while (existingQuoteNumbers.has(quoteNumber))
        
        // Vérifier une dernière fois dans la base de données
        const existingQuote = await prisma.quote.findUnique({
          where: { quoteNumber },
          select: { id: true }
        })
        if (existingQuote) {
          console.log(`  ⚠️  Le numéro ${quoteNumber} existe déjà, on passe au suivant`)
          existingQuoteNumbers.add(quoteNumber)
          continue
        }
        
        existingQuoteNumbers.add(quoteNumber)
        
        const quote = await prisma.quote.create({
          data: {
            quoteNumber,
        date,
        validUntil,
        status,
        subtotal,
        tax,
        total,
        notes: i % 10 === 0 ? 'Devis avec conditions particulières' : null,
        clientId: client.id,
        artisanId: artisan.id
      }
    })

    // Ajouter des items au devis
    for (let j = 0; j < numItems; j++) {
      const quantity = randomInt(1, 10)
      const unitPrice = randomFloat(20, 500)
      const itemTotal = quantity * unitPrice
      
      await prisma.quoteItem.create({
        data: {
          description: randomElement(services),
          quantity,
          unitPrice,
          total: itemTotal,
          quoteId: quote.id
        }
      })
    }

    quotes.push(quote)
    
    if ((i + 1) % 50 === 0) {
      console.log(`  ✅ ${i + 1}/400 devis créés`)
    }
  }

  // Générer des factures (600)
  console.log('💰 Création de 600 factures...')
  const invoices = []
  const invoiceStatuses = ['draft', 'sent', 'paid', 'overdue'] as const
  
  // Récupérer tous les numéros de factures existants pour éviter les conflits (invoiceNumber est unique globalement)
  const existingInvoices = await prisma.invoice.findMany({
    select: { invoiceNumber: true }
  })
  console.log(`  📊 ${existingInvoices.length} factures existantes trouvées`)
  const existingInvoiceNumbers = new Set(existingInvoices.map((inv: { invoiceNumber: string }) => inv.invoiceNumber))
  
  // Trouver le numéro le plus élevé pour continuer la numérotation
  let maxInvoiceNumber = 0
  for (const inv of existingInvoices) {
    const match = (inv.invoiceNumber as string).match(/FAC-(\d+)/)
    if (match) {
      const num = parseInt(match[1], 10)
      if (num > maxInvoiceNumber) maxInvoiceNumber = num
    }
  }
  
  let invoiceCounter = maxInvoiceNumber + 1
  console.log(`  🔢 Début de la numérotation à FAC-${invoiceCounter.toString().padStart(4, '0')}`)

  for (let i = 0; i < 600; i++) {
    const client = randomElement(clients)
    const date = randomDate(startDate, endDate)
    const status = randomElement([...invoiceStatuses])
    const dueDate = new Date(date)
    dueDate.setDate(dueDate.getDate() + randomInt(15, 60))
    
    // Calculer d'abord les totaux
    const numItems = randomInt(1, 8)
    let subtotal = 0
    
    for (let j = 0; j < numItems; j++) {
      const quantity = randomInt(1, 15)
      const unitPrice = randomFloat(15, 800)
      const total = quantity * unitPrice
      subtotal += total
    }

    const tax = subtotal * 0.20 // 20% TVA
    const total = subtotal + tax

        // Générer un numéro de facture unique
        let invoiceNumber: string
        let attempts = 0
        do {
          invoiceNumber = `FAC-${invoiceCounter.toString().padStart(4, '0')}`
          invoiceCounter++
          attempts++
          if (attempts > 1000) {
            throw new Error(`Impossible de générer un numéro de facture unique après ${attempts} tentatives`)
          }
        } while (existingInvoiceNumbers.has(invoiceNumber))
        
        // Vérifier une dernière fois dans la base de données
        const existingInvoice = await prisma.invoice.findUnique({
          where: { invoiceNumber },
          select: { id: true }
        })
        if (existingInvoice) {
          console.log(`  ⚠️  Le numéro ${invoiceNumber} existe déjà, on passe au suivant`)
          existingInvoiceNumbers.add(invoiceNumber)
          continue
        }
        
        existingInvoiceNumbers.add(invoiceNumber)
        
        const invoice = await prisma.invoice.create({
          data: {
            invoiceNumber,
        date,
        dueDate,
        status,
        subtotal,
        tax,
        total,
        notes: i % 10 === 0 ? 'Facture avec mention spéciale' : null,
        clientId: client.id,
        artisanId: artisan.id
      }
    })

    // Ajouter des items à la facture
    for (let j = 0; j < numItems; j++) {
      const quantity = randomInt(1, 15)
      const unitPrice = randomFloat(15, 800)
      const itemTotal = quantity * unitPrice
      
      await prisma.invoiceItem.create({
        data: {
          description: randomElement(services),
          quantity,
          unitPrice,
          total: itemTotal,
          invoiceId: invoice.id
        }
      })
    }

    invoices.push(invoice)
    
    if ((i + 1) % 100 === 0) {
      console.log(`  ✅ ${i + 1}/600 factures créées`)
    }
  }

  // Générer des dépenses (300)
  console.log('💸 Création de 300 dépenses...')
  for (let i = 0; i < 300; i++) {
    const date = randomDate(startDate, endDate)
    const category = randomElement(expenseCategories)
    
    await prisma.expense.create({
      data: {
        description: `Dépense ${category.toLowerCase()} - ${randomElement(['Fournisseur A', 'Fournisseur B', 'Magasin', 'En ligne', 'Local'])}`,
        amount: randomFloat(10, 2000),
        category,
        date,
        artisanId: artisan.id
      }
    })
    
    if ((i + 1) % 50 === 0) {
      console.log(`  ✅ ${i + 1}/300 dépenses créées`)
    }
  }

  // Générer des notifications (200)
  console.log('🔔 Création de 200 notifications...')
  const notificationTypes = ['intervention_reminder', 'invoice_overdue', 'low_stock', 'intervention_status'] as const
  const notificationStatuses = ['unread', 'read'] as const

  for (let i = 0; i < 200; i++) {
    const type = randomElement([...notificationTypes])
    const status = randomElement([...notificationStatuses])
    const createdAt = randomDate(startDate, endDate)
    
    let title = ''
    let message = ''
    
    switch (type) {
      case 'intervention_reminder':
        title = 'Rappel intervention'
        message = `Intervention prévue demain à ${randomInt(8, 18)}h`
        break
      case 'invoice_overdue':
        title = 'Facture en retard'
        message = 'Une facture est en retard de paiement'
        break
      case 'low_stock':
        title = 'Stock faible'
        message = `Le stock de ${randomElement(materials)} est faible`
        break
      case 'intervention_status':
        title = 'Statut intervention'
        message = 'Le statut d\'une intervention a changé'
        break
    }
    
    await prisma.notification.create({
      data: {
        title,
        message,
        type,
        status,
        createdAt,
        artisanId: artisan.id
      }
    })
    
    if ((i + 1) % 50 === 0) {
      console.log(`  ✅ ${i + 1}/200 notifications créées`)
    }
  }

  console.log('')
  console.log('✅ Seed terminé avec succès!')
  console.log('')
  console.log('📊 Résumé des données créées:')
  console.log(`   - ${clients.length} clients`)
  console.log(`   - ${stockItems.length} items de stock`)
  console.log(`   - ${interventions.length} interventions`)
  console.log(`   - ${quotes.length} devis`)
  console.log(`   - ${invoices.length} factures`)
  console.log(`   - 300 dépenses`)
  console.log(`   - 200 notifications`)
  console.log('')
  console.log('🔑 Identifiants de connexion:')
  console.log(`   Email: ${artisan.email}`)
      console.log(`   Mot de passe: ${artisanPassword}`)
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

