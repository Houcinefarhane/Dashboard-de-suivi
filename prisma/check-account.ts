import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const artisan = await prisma.artisan.findUnique({
    where: { email: 'admin.123@outlook.fr' },
    select: {
      id: true,
      email: true,
      name: true,
      companyName: true,
    }
  })

  if (artisan) {
    console.log('✅ Compte trouvé:')
    console.log('   ID:', artisan.id)
    console.log('   Email:', artisan.email)
    console.log('   Nom:', artisan.name)
    console.log('   Entreprise:', artisan.companyName)
  } else {
    console.log('❌ Compte non trouvé')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

