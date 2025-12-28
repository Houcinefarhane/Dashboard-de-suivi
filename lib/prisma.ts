import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// Fonction pour valider et nettoyer DATABASE_URL
function validateDatabaseUrl(url: string | undefined): string {
  if (!url) {
    throw new Error('DATABASE_URL manquant. Vérifiez votre fichier .env')
  }

  // Supprimer les guillemets et espaces (au début et à la fin)
  let cleanUrl = url.trim()
  // Supprimer les guillemets doubles ou simples au début et à la fin
  cleanUrl = cleanUrl.replace(/^["']+|["']+$/g, '')
  // Supprimer les espaces restants
  cleanUrl = cleanUrl.trim()

  // Vérifier le format de base
  if (!cleanUrl.startsWith('postgresql://') && !cleanUrl.startsWith('postgres://')) {
    console.error('ERREUR: DATABASE_URL doit commencer par postgresql:// ou postgres://')
    console.error('Format actuel détecté:', cleanUrl.substring(0, 30) + '...')
    throw new Error('Format DATABASE_URL invalide. Doit commencer par postgresql:// ou postgres://')
  }

  // Vérifier la structure de base
  try {
    const urlObj = new URL(cleanUrl)
    if (!urlObj.hostname || !urlObj.pathname) {
      throw new Error('Structure URL invalide')
    }
  } catch (error) {
    console.error('ERREUR: DATABASE_URL n\'est pas une URL valide')
    console.error('URL fournie:', cleanUrl.substring(0, 50) + '...')
    throw new Error('DATABASE_URL n\'est pas une URL valide. Format attendu: postgresql://user:password@host:port/database')
  }

  return cleanUrl
}

// Détecter si on est en phase de build
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                     (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL)

// Créer Prisma Client - toujours défini (même pendant le build)
const prisma: PrismaClient = globalThis.prisma ?? (() => {
  if (isBuildTime) {
    // Pendant le build, créer un client minimal sans validation
    return new PrismaClient({
      log: [],
    })
  } else {
    // Au runtime, valider et créer le client normalement
    try {
      const databaseUrl = validateDatabaseUrl(process.env.DATABASE_URL)
      
      // Logger en production pour debug (sans exposer le mot de passe)
      if (process.env.NODE_ENV === 'production') {
        const urlObj = new URL(databaseUrl)
        console.log('DATABASE_URL configuré:', {
          host: urlObj.hostname,
          port: urlObj.port,
          database: urlObj.pathname,
          user: urlObj.username,
          hasPassword: !!urlObj.password,
        })
      }
      
      return new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
        datasources: {
          db: {
            url: databaseUrl,
          },
        },
      })
    } catch (error: any) {
      console.error('=== ERREUR DE CONFIGURATION DATABASE_URL ===')
      console.error('Message:', error.message)
      console.error('\nFormat attendu:')
      console.error('postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres')
      console.error('\nPour obtenir votre DATABASE_URL:')
      console.error('1. Allez sur https://supabase.com')
      console.error('2. Sélectionnez votre projet')
      console.error('3. Settings → Database')
      console.error('4. Copiez la "Connection string" (URI)')
      console.error('5. Assurez-vous que le mot de passe est URL-encodé (ex: ! devient %21)')
      
      // Ne pas throw pendant le build - créer un client minimal
      if (!isBuildTime) {
        throw error
      }
      return new PrismaClient({ log: [] })
    }
  }
})()

// En développement, réutiliser le même client
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

export { prisma }

