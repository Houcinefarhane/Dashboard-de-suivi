/**
 * Script pour synchroniser emailVerified dans Prisma avec email_confirmed_at dans Supabase Auth
 * 
 * Usage: npx tsx scripts/sync-email-verified.ts
 */

import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'

const prisma = new PrismaClient()

// Variables d'environnement
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes:')
  console.error(`   NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅' : '❌'}`)
  console.error(`   SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? '✅' : '❌'}`)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function syncEmailVerified() {
  try {
    console.log('🔄 Synchronisation des emails vérifiés...\n')

    // Récupérer tous les artisans
    const artisans = await prisma.artisan.findMany({
      select: {
        id: true,
        email: true,
        emailVerified: true,
      },
    })

    console.log(`📊 ${artisans.length} artisans trouvés\n`)

    let updated = 0
    let alreadySynced = 0

    for (const artisan of artisans) {
      try {
        // Récupérer l'utilisateur depuis Supabase Auth
        const { data: user, error } = await supabase.auth.admin.getUserById(artisan.id)

        if (error) {
          console.error(`❌ Erreur pour ${artisan.email}: ${error.message}`)
          continue
        }

        if (!user) {
          console.warn(`⚠️  Utilisateur non trouvé dans Supabase Auth: ${artisan.email}`)
          continue
        }

        const isVerifiedInSupabase = user.user.email_confirmed_at !== null
        const isVerifiedInPrisma = artisan.emailVerified

        // Synchroniser si différent
        if (isVerifiedInSupabase !== isVerifiedInPrisma) {
          await prisma.artisan.update({
            where: { id: artisan.id },
            data: { emailVerified: isVerifiedInSupabase },
          })

          console.log(
            `✅ ${artisan.email}: ${isVerifiedInPrisma ? 'Non vérifié' : 'Vérifié'} → ${isVerifiedInSupabase ? 'Vérifié' : 'Non vérifié'}`
          )
          updated++
        } else {
          alreadySynced++
        }
      } catch (error: any) {
        console.error(`❌ Erreur pour ${artisan.email}: ${error.message}`)
      }
    }

    console.log(`\n✅ Synchronisation terminée:`)
    console.log(`   - ${updated} artisans mis à jour`)
    console.log(`   - ${alreadySynced} artisans déjà synchronisés`)
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

syncEmailVerified()

