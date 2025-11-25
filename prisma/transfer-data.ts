import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Transfert des données de test...\n')

  // Récupérer l'artisan source (celui avec les données de test)
  const sourceArtisan = await prisma.artisan.findFirst({
    where: {
      email: 'houcine.farhane@outlook.fr'
    }
  })

  if (!sourceArtisan) {
    console.log('❌ Artisan source non trouvé')
    return
  }

  console.log(`✅ Artisan source trouvé: ${sourceArtisan.email}`)

  // Demander l'email de destination
  const args = process.argv.slice(2)
  const targetEmail = args[0]

  if (!targetEmail) {
    console.log('\n❌ Usage: npm run db:transfer <email-destination>')
    console.log('   Exemple: npm run db:transfer admin.123@outlook.fr')
    return
  }

  const targetArtisan = await prisma.artisan.findUnique({
    where: { email: targetEmail }
  })

  if (!targetArtisan) {
    console.log(`❌ Artisan destination non trouvé: ${targetEmail}`)
    return
  }

  console.log(`✅ Artisan destination trouvé: ${targetArtisan.email}\n`)

  // Compter les données à transférer
  const counts = {
    clients: await prisma.client.count({ where: { artisanId: sourceArtisan.id } }),
    interventions: await prisma.intervention.count({ where: { artisanId: sourceArtisan.id } }),
    invoices: await prisma.invoice.count({ where: { artisanId: sourceArtisan.id } }),
    quotes: await prisma.quote.count({ where: { artisanId: sourceArtisan.id } }),
    expenses: await prisma.expense.count({ where: { artisanId: sourceArtisan.id } }),
    stockItems: await prisma.stockItem.count({ where: { artisanId: sourceArtisan.id } }),
    notifications: await prisma.notification.count({ where: { artisanId: sourceArtisan.id } }),
  }

  console.log('📊 Données à transférer:')
  console.log(`   - Clients: ${counts.clients}`)
  console.log(`   - Interventions: ${counts.interventions}`)
  console.log(`   - Factures: ${counts.invoices}`)
  console.log(`   - Devis: ${counts.quotes}`)
  console.log(`   - Dépenses: ${counts.expenses}`)
  console.log(`   - Stock: ${counts.stockItems}`)
  console.log(`   - Notifications: ${counts.notifications}\n`)

  console.log('⏳ Transfert en cours...\n')

  // Transférer les clients (et leurs relations)
  console.log('👥 Transfert des clients...')
  await prisma.client.updateMany({
    where: { artisanId: sourceArtisan.id },
    data: { artisanId: targetArtisan.id }
  })

  // Transférer les interventions
  console.log('📅 Transfert des interventions...')
  await prisma.intervention.updateMany({
    where: { artisanId: sourceArtisan.id },
    data: { artisanId: targetArtisan.id }
  })

  // Transférer les factures
  console.log('💰 Transfert des factures...')
  await prisma.invoice.updateMany({
    where: { artisanId: sourceArtisan.id },
    data: { artisanId: targetArtisan.id }
  })

  // Transférer les devis
  console.log('📄 Transfert des devis...')
  await prisma.quote.updateMany({
    where: { artisanId: sourceArtisan.id },
    data: { artisanId: targetArtisan.id }
  })

  // Transférer les dépenses
  console.log('💸 Transfert des dépenses...')
  await prisma.expense.updateMany({
    where: { artisanId: sourceArtisan.id },
    data: { artisanId: targetArtisan.id }
  })

  // Transférer le stock
  console.log('📦 Transfert du stock...')
  await prisma.stockItem.updateMany({
    where: { artisanId: sourceArtisan.id },
    data: { artisanId: targetArtisan.id }
  })

  // Transférer les notifications
  console.log('🔔 Transfert des notifications...')
  await prisma.notification.updateMany({
    where: { artisanId: sourceArtisan.id },
    data: { artisanId: targetArtisan.id }
  })

  console.log('\n✅ Transfert terminé avec succès!')
  console.log(`\n🔑 Connectez-vous avec: ${targetEmail}`)
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

