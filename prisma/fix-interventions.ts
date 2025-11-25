import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Correction des interventions existantes...')
  
  const now = new Date()
  
  // Récupérer toutes les interventions
  const interventions = await prisma.intervention.findMany()
  
  console.log(`📊 ${interventions.length} interventions trouvées`)
  
  let updated = 0
  let deleted = 0
  
  for (const intervention of interventions) {
    const interventionDate = new Date(intervention.date)
    const hours = interventionDate.getHours()
    const minutes = interventionDate.getMinutes()
    
    let needsUpdate = false
    const updateData: any = {}
    
    // Comparer uniquement les dates (sans l'heure) pour déterminer si c'est passé ou futur
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const interventionDay = new Date(interventionDate)
    interventionDay.setHours(0, 0, 0, 0)
    
    const isPast = interventionDay < today
    const isFuture = interventionDay > today
    
    // 1. Si l'intervention est passée (date < aujourd'hui)
    if (isPast) {
      // Doit être "completed" ou "cancelled", pas "todo"
      if (intervention.status === 'todo') {
        updateData.status = Math.random() < 0.8 ? 'completed' : 'cancelled'
        needsUpdate = true
        console.log(`  ⚠️  Intervention passée "${intervention.title}" (${interventionDate.toISOString()}) : ${intervention.status} → ${updateData.status}`)
      }
    }
    
    // 2. Si l'intervention est future (date > aujourd'hui)
    if (isFuture) {
      // Doit être "todo" ou "cancelled", pas "completed"
      if (intervention.status === 'completed') {
        updateData.status = Math.random() < 0.9 ? 'todo' : 'cancelled'
        needsUpdate = true
        console.log(`  ⚠️  Intervention future "${intervention.title}" (${interventionDate.toISOString()}) : ${intervention.status} → ${updateData.status}`)
      }
    }
    
    // 2. Vérifier si l'heure est en dehors de 8:00-18:00
    if (hours < 8 || hours > 18 || (hours === 18 && minutes > 0)) {
      // Corriger l'heure : mettre entre 8:00 et 18:00
      const newHour = Math.floor(Math.random() * (18 - 8 + 1)) + 8 // Entre 8 et 18 inclus
      let newMinute = 0
      if (newHour < 18) {
        newMinute = Math.random() < 0.5 ? 0 : 30
      }
      
      interventionDate.setHours(newHour, newMinute, 0, 0)
      updateData.date = interventionDate
      needsUpdate = true
      console.log(`  ⏰ Intervention "${intervention.title}" : heure ${hours}:${minutes.toString().padStart(2, '0')} → ${newHour}:${newMinute.toString().padStart(2, '0')}`)
    }
    
    if (needsUpdate) {
      await prisma.intervention.update({
        where: { id: intervention.id },
        data: updateData,
      })
      updated++
    }
  }
  
  console.log(`\n✅ ${updated} interventions corrigées`)
  console.log(`🗑️  ${deleted} interventions supprimées`)
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

