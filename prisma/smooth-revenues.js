const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Début du lissage des revenus...\n')

  // Récupérer toutes les factures et interventions
  const allInvoices = await prisma.invoice.findMany({
    orderBy: { date: 'asc' }
  })

  const allInterventions = await prisma.intervention.findMany({
    orderBy: { date: 'asc' }
  })

  console.log(`📊 Données actuelles:`)
  console.log(`  - ${allInvoices.length} factures`)
  console.log(`  - ${allInterventions.length} interventions\n`)

  // Calculer le revenu total des factures payées
  const totalRevenue = allInvoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total, 0)

  console.log(`💰 Revenu total des factures payées: ${(totalRevenue / 100).toFixed(2)}€\n`)

  // Trouver la plage de dates
  const minDate = new Date(Math.min(
    new Date(allInvoices[0]?.date || Date.now()).getTime(),
    new Date(allInterventions[0]?.date || Date.now()).getTime()
  ))
  const maxDate = new Date(Math.max(
    new Date(allInvoices[allInvoices.length - 1]?.date || Date.now()).getTime(),
    new Date(allInterventions[allInterventions.length - 1]?.date || Date.now()).getTime()
  ))

  // Calculer le nombre de mois
  const months = []
  const current = new Date(minDate.getFullYear(), minDate.getMonth(), 1)
  const end = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1)

  while (current <= end) {
    months.push({
      year: current.getFullYear(),
      month: current.getMonth() + 1,
      key: `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`
    })
    current.setMonth(current.getMonth() + 1)
  }

  console.log(`📅 Nombre de mois: ${months.length}`)
  console.log(`   De ${minDate.toISOString().split('T')[0]} à ${maxDate.toISOString().split('T')[0]}\n`)

  // Calculer le revenu cible par mois
  const targetRevenuePerMonth = totalRevenue / months.length
  console.log(`🎯 Revenu cible par mois: ${(targetRevenuePerMonth / 100).toFixed(2)}€\n`)

  // Répartir les factures équitablement sur chaque mois
  console.log('📝 Redistribution des factures...')
  
  const invoicesPerMonth = Math.ceil(allInvoices.length / months.length)
  console.log(`   ~${invoicesPerMonth} factures par mois`)

  let invoiceIndex = 0
  for (const month of months) {
    const invoicesForThisMonth = allInvoices.slice(invoiceIndex, invoiceIndex + invoicesPerMonth)
    
    for (let i = 0; i < invoicesForThisMonth.length; i++) {
      const invoice = invoicesForThisMonth[i]
      // Répartir équitablement dans le mois (entre le 1er et le 28ème jour)
      const day = Math.floor((i / invoicesForThisMonth.length) * 27) + 1
      const newDate = new Date(month.year, month.month - 1, day, 12, 0, 0)
      
      // Calculer nouvelle date d'échéance (30 jours après)
      const newDueDate = new Date(newDate)
      newDueDate.setDate(newDueDate.getDate() + 30)
      
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          date: newDate,
          dueDate: newDueDate
        }
      })
    }
    
    invoiceIndex += invoicesPerMonth
  }
  
  console.log('   ✅ Factures redistribuées')

  // Répartir les interventions équitablement sur chaque mois
  console.log('\n🔧 Redistribution des interventions...')
  
  const interventionsPerMonth = Math.ceil(allInterventions.length / months.length)
  console.log(`   ~${interventionsPerMonth} interventions par mois`)

  let interventionIndex = 0
  for (const month of months) {
    const interventionsForThisMonth = allInterventions.slice(interventionIndex, interventionIndex + interventionsPerMonth)
    
    for (let i = 0; i < interventionsForThisMonth.length; i++) {
      const intervention = interventionsForThisMonth[i]
      // Répartir équitablement dans le mois, sur les jours ouvrables (excluant week-ends)
      const daysInMonth = new Date(month.year, month.month, 0).getDate()
      const targetDay = Math.floor((i / interventionsForThisMonth.length) * daysInMonth) + 1
      
      // Trouver le jour ouvrable le plus proche
      let newDate = new Date(month.year, month.month - 1, targetDay, 9, 0, 0)
      const dayOfWeek = newDate.getDay()
      
      // Si samedi (6), avancer à lundi
      if (dayOfWeek === 6) {
        newDate.setDate(newDate.getDate() + 2)
      }
      // Si dimanche (0), avancer à lundi
      else if (dayOfWeek === 0) {
        newDate.setDate(newDate.getDate() + 1)
      }
      
      // Heures ouvrables: 8h-18h
      const hour = 8 + Math.floor((i % 5) * 2) // Répartir sur la journée
      newDate.setHours(hour)
      
      await prisma.intervention.update({
        where: { id: intervention.id },
        data: {
          date: newDate
        }
      })
    }
    
    interventionIndex += interventionsPerMonth
  }
  
  console.log('   ✅ Interventions redistribuées')

  // Calculer les nouveaux revenus par mois
  console.log('\n📊 Analyse des nouveaux revenus par mois:')
  console.log('='.repeat(60))
  
  const updatedInvoices = await prisma.invoice.findMany({
    where: { status: 'paid' }
  })

  const revenueByMonth = {}
  for (const invoice of updatedInvoices) {
    const date = new Date(invoice.date)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    revenueByMonth[key] = (revenueByMonth[key] || 0) + invoice.total
  }

  for (const month of months) {
    const revenue = revenueByMonth[month.key] || 0
    const percentage = totalRevenue > 0 ? ((revenue / totalRevenue) * 100).toFixed(1) : '0.0'
    console.log(`  ${month.key}: ${(revenue / 100).toFixed(2)}€ (${percentage}%)`)
  }

  console.log('='.repeat(60))
  console.log('\n✅ Lissage terminé avec succès!')
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du lissage:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

