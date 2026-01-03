/**
 * Script de migration des utilisateurs existants vers Supabase Auth
 * 
 * Ce script migre les utilisateurs de la table Artisan vers Supabase Auth.
 * ATTENTION: Les utilisateurs doivent avoir un mot de passe hashé dans la table Artisan.
 * 
 * Usage: npx tsx scripts/migrate-users-to-supabase-auth.ts
 */

import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Variables d\'environnement manquantes:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceRoleKey ? '✅' : '❌')
  process.exit(1)
}

// Client Supabase avec service role key pour les opérations admin
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

interface Artisan {
  id: string
  email: string
  password: string | null
  name: string
  companyName: string | null
  phone: string | null
}

async function migrateUsers() {
  console.log('🔄 Début de la migration des utilisateurs vers Supabase Auth...\n')

  try {
    // Récupérer tous les artisans qui ont un mot de passe
    const artisans = await prisma.artisan.findMany({
      where: {
        password: {
          not: null
        }
      },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        companyName: true,
        phone: true,
      },
    })

    console.log(`📊 ${artisans.length} utilisateur(s) trouvé(s) avec mot de passe\n`)

    if (artisans.length === 0) {
      console.log('✅ Aucun utilisateur à migrer.')
      return
    }

    let successCount = 0
    let skipCount = 0
    let errorCount = 0

    for (const artisan of artisans) {
      try {
        // Vérifier si l'utilisateur existe déjà dans Supabase Auth
        const { data: existingUser, error: checkError } = await supabase.auth.admin.getUserById(artisan.id)

        if (existingUser && !checkError) {
          console.log(`⏭️  Utilisateur ${artisan.email} existe déjà dans Supabase Auth, ignoré.`)
          skipCount++
          continue
        }

        // Note: La vérification principale avec getUserById est déjà faite ci-dessus
        // On skip la vérification par email car elle nécessite des permissions spéciales

        // Créer l'utilisateur dans Supabase Auth
        // Note: On ne peut pas migrer directement le hash bcrypt vers Supabase
        // Il faudra que l'utilisateur réinitialise son mot de passe
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          id: artisan.id, // Utiliser l'ID existant
          email: artisan.email,
          email_confirm: true, // Marquer l'email comme confirmé si emailVerified est true
          user_metadata: {
            name: artisan.name,
            companyName: artisan.companyName || null,
            phone: artisan.phone || null,
          },
          // On ne peut pas définir le mot de passe directement avec un hash bcrypt
          // L'utilisateur devra réinitialiser son mot de passe
        })

        if (createError) {
          console.error(`❌ Erreur lors de la création de ${artisan.email}:`, createError.message)
          errorCount++
          continue
        }

        if (!newUser.user) {
          console.error(`❌ Échec de la création de ${artisan.email}: pas d'utilisateur retourné`)
          errorCount++
          continue
        }

        // Mettre à jour l'artisan dans Prisma pour marquer que la migration est faite
        await prisma.artisan.update({
          where: { id: artisan.id },
          data: {
            emailVerified: true,
            // On garde le password pour l'instant, mais l'utilisateur devra le réinitialiser
          },
        })

        console.log(`✅ Utilisateur ${artisan.email} migré avec succès (ID: ${newUser.user.id})`)
        successCount++

      } catch (error: any) {
        console.error(`❌ Erreur lors de la migration de ${artisan.email}:`, error.message)
        errorCount++
      }
    }

    console.log('\n📊 Résumé de la migration:')
    console.log(`   ✅ Migrés avec succès: ${successCount}`)
    console.log(`   ⏭️  Ignorés (déjà existants): ${skipCount}`)
    console.log(`   ❌ Erreurs: ${errorCount}`)

    if (successCount > 0) {
      console.log('\n⚠️  IMPORTANT:')
      console.log('   Les utilisateurs migrés devront réinitialiser leur mot de passe.')
      console.log('   Les mots de passe hashés avec bcrypt ne peuvent pas être migrés directement vers Supabase Auth.')
      console.log('   Envoyez un email de réinitialisation de mot de passe à chaque utilisateur migré.')
    }

  } catch (error: any) {
    console.error('❌ Erreur fatale:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

migrateUsers()
  .then(() => {
    console.log('\n✅ Migration terminée.')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erreur:', error)
    process.exit(1)
  })

