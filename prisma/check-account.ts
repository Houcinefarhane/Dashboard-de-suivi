import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.CHECK_EMAIL || process.argv[2]
  
  if (!email) {
    console.log('Usage: npm run db:check <email> ou définir CHECK_EMAIL dans .env')
    return
  }

  const artisan = await prisma.artisan.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      companyName: true,
    }
  })

  if (artisan) {
    console.log('Compte trouvé:')
    console.log('  ID:', artisan.id)
    console.log('  Email:', artisan.email)
    console.log('  Nom:', artisan.name)
    console.log('  Entreprise:', artisan.companyName)
  } else {
    console.log('Compte non trouvé')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

