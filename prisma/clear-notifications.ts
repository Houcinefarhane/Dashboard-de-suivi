import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2] || process.env.CLEAR_NOTIFICATIONS_EMAIL
  
  if (!email) {
    console.log('Usage: npm run db:clear-notifications <email> ou définir CLEAR_NOTIFICATIONS_EMAIL dans .env')
    return
  }

  console.log(` Suppression des notifications pour: ${email}\n`)

  const artisan = await prisma.artisan.findUnique({
    where: { email }
  })

  if (!artisan) {
    console.log(` Artisan non trouvé: ${email}`)
    return
  }

  const count = await prisma.notification.count({
    where: { artisanId: artisan.id }
  })

  console.log(` Notifications trouvées: ${count}`)

  if (count > 0) {
    await prisma.notification.deleteMany({
      where: { artisanId: artisan.id }
    })
    console.log(` ${count} notifications supprimées`)
  } else {
    console.log('ℹ️  Aucune notification à supprimer')
  }
}

main()
  .catch((e) => {
    console.error('Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

