import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Vérification des données dans la base...\n')

  const artisans = await prisma.artisan.findMany({
    include: {
      _count: {
        select: {
          clients: true,
          interventions: true,
          invoices: true,
          quotes: true,
          expenses: true,
          stockItems: true,
          notifications: true,
        }
      }
    }
  })

  console.log(`📊 Nombre d'artisans: ${artisans.length}\n`)

  artisans.forEach((artisan) => {
    console.log(`👤 Artisan: ${artisan.email}`)
    console.log(`   - Clients: ${artisan._count.clients}`)
    console.log(`   - Interventions: ${artisan._count.interventions}`)
    console.log(`   - Factures: ${artisan._count.invoices}`)
    console.log(`   - Devis: ${artisan._count.quotes}`)
    console.log(`   - Dépenses: ${artisan._count.expenses}`)
    console.log(`   - Stock: ${artisan._count.stockItems}`)
    console.log(`   - Notifications: ${artisan._count.notifications}`)
    console.log('')
  })

  const totalClients = await prisma.client.count()
  const totalInterventions = await prisma.intervention.count()
  const totalInvoices = await prisma.invoice.count()
  const totalQuotes = await prisma.quote.count()
  const totalExpenses = await prisma.expense.count()
  const totalStock = await prisma.stockItem.count()
  const totalNotifications = await prisma.notification.count()

  console.log('📈 Totaux globaux:')
  console.log(`   - Clients: ${totalClients}`)
  console.log(`   - Interventions: ${totalInterventions}`)
  console.log(`   - Factures: ${totalInvoices}`)
  console.log(`   - Devis: ${totalQuotes}`)
  console.log(`   - Dépenses: ${totalExpenses}`)
  console.log(`   - Stock: ${totalStock}`)
  console.log(`   - Notifications: ${totalNotifications}`)
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

