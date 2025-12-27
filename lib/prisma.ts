import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
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

// Créer Prisma Client avec lazy initialization pour éviter les erreurs pendant le build
function getPrismaClient(): PrismaClient {
  // Ne pas valider/créer pendant le build (Next.js build process)
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    // Pendant le build, retourner un client minimal qui ne se connecte pas
    return globalForPrisma.prisma ?? new PrismaClient({
      log: [],
      datasources: {
        db: {
          url: process.env.DATABASE_URL || 'postgresql://placeholder',
        },
      },
    })
  }

  // Valider DATABASE_URL seulement au runtime
  let databaseUrl: string
  try {
    databaseUrl = validateDatabaseUrl(process.env.DATABASE_URL)
    if (process.env.NODE_ENV === 'development') {
      console.log('DATABASE_URL validé avec succès')
    }
  } catch (error: any) {
    console.error('ERREUR DE CONFIGURATION DATABASE_URL:')
    console.error(error.message)
    console.error('\nFormat attendu:')
    console.error('DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"')
    console.error('\nPour obtenir votre DATABASE_URL:')
    console.error('1. Allez sur https://supabase.com')
    console.error('2. Sélectionnez votre projet')
    console.error('3. Settings → Database')
    console.error('4. Copiez la "Connection string" (URI)')
    throw error
  }

  // Créer Prisma Client avec gestion d'erreur améliorée
  if (!globalForPrisma.prisma) {
    try {
      globalForPrisma.prisma = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      })
    } catch (error: any) {
      console.error('ERREUR lors de la création du client Prisma:')
      console.error(error.message)
      if (error.message?.includes('did not match the expected pattern')) {
        console.error('\nLe DATABASE_URL ne correspond pas au format attendu par Prisma.')
        console.error('Vérifiez que:')
        console.error('- Le mot de passe est correctement encodé (utilisez encodeURIComponent si nécessaire)')
        console.error('- Il n\'y a pas d\'espaces ou de caractères invalides')
        console.error('- Le format est: postgresql://user:password@host:port/database')
      }
      throw error
    }
  }

  return globalForPrisma.prisma
}

// Export lazy Prisma client
const prisma = getPrismaClient()
export { prisma }

