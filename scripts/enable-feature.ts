/**
 * Script pour activer une feature pour un utilisateur spécifique
 * 
 * Usage:
 *   npx tsx scripts/enable-feature.ts <email> <feature-name>
 * 
 * Exemple:
 *   npx tsx scripts/enable-feature.ts admin@example.com new-quote-feature
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]
  const featureName = process.argv[3]

  if (!email || !featureName) {
    console.error('❌ Usage: npx tsx scripts/enable-feature.ts <email> <feature-name>')
    console.error('   Exemple: npx tsx scripts/enable-feature.ts admin@example.com new-quote-feature')
    process.exit(1)
  }

  try {
    const artisan = await prisma.artisan.findUnique({
      where: { email },
      select: { id: true, email: true, features: true },
    })

    if (!artisan) {
      console.error(`❌ Utilisateur non trouvé: ${email}`)
      process.exit(1)
    }

    const currentFeatures = (artisan.features as string[] | null) || []
    
    if (currentFeatures.includes(featureName)) {
      console.log(`ℹ️  La feature "${featureName}" est déjà activée pour ${email}`)
    } else {
      await prisma.artisan.update({
        where: { id: artisan.id },
        data: {
          features: [...currentFeatures, featureName],
        },
      })
      console.log(`✅ Feature "${featureName}" activée pour ${email}`)
    }

    // Afficher toutes les features activées
    const updatedArtisan = await prisma.artisan.findUnique({
      where: { id: artisan.id },
      select: { features: true },
    })
    
    const allFeatures = (updatedArtisan?.features as string[] | null) || []
    console.log(`\n📋 Features activées pour ${email}:`)
    allFeatures.forEach(f => console.log(`   - ${f}`))
  } catch (error) {
    console.error('❌ Erreur:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()

