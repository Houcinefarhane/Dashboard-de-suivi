import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const args = process.argv.slice(2)
  const email = args[0] || 'admin.123@outlook.fr'

  console.log(`🧹 Suppression des notifications pour: ${email}\n`)

  const artisan = await prisma.artisan.findUnique({
    where: { email }
  })

  if (!artisan) {
    console.log(`❌ Artisan non trouvé: ${email}`)
    return
  }

  const count = await prisma.notification.count({
    where: { artisanId: artisan.id }
  })

  console.log(`📊 Notifications trouvées: ${count}`)

  if (count > 0) {
    await prisma.notification.deleteMany({
      where: { artisanId: artisan.id }
    })
    console.log(`✅ ${count} notifications supprimées`)
  } else {
    console.log('ℹ️  Aucune notification à supprimer')
  }
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

