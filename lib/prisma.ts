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
    
    // Vérifications spécifiques pour Supabase
    if (cleanUrl.includes('pooler.supabase.com')) {
      // Pour le pooler, vérifier le format
      if (!cleanUrl.includes('postgres.')) {
        console.warn('ATTENTION: URL pooler devrait utiliser postgres.[PROJECT_REF] comme username')
      }
      if (!cleanUrl.includes('?pgbouncer=true') && cleanUrl.includes(':6543')) {
        console.warn('ATTENTION: Pour le port 6543 (Transaction mode), ajoutez ?pgbouncer=true à la fin de l\'URL')
      }
    }
  } catch (error: any) {
    console.error('ERREUR: DATABASE_URL n\'est pas une URL valide')
    console.error('URL fournie (premiers 80 caractères):', cleanUrl.substring(0, 80))
    console.error('Erreur de parsing:', error.message)
    
    // Détecter les problèmes courants
    let errorMessage = 'DATABASE_URL n\'est pas une URL valide.\n'
    
    if (cleanUrl.includes(' ')) {
      errorMessage += '❌ PROBLÈME: L\'URL contient des espaces. Supprimez-les.\n'
    }
    if (cleanUrl.includes('"') || cleanUrl.includes("'")) {
      errorMessage += '❌ PROBLÈME: L\'URL contient des guillemets. Supprimez-les dans Netlify.\n'
    }
    if (!cleanUrl.includes('@')) {
      errorMessage += '❌ PROBLÈME: L\'URL ne contient pas de @ (séparateur user:password@host).\n'
    }
    if (!cleanUrl.includes('://')) {
      errorMessage += '❌ PROBLÈME: L\'URL ne contient pas de :// (protocole manquant).\n'
    }
    
    errorMessage += '\nFormat attendu pour Supabase pooler:\n'
    errorMessage += 'postgres://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true\n'
    errorMessage += '\nFormat attendu pour connexion directe:\n'
    errorMessage += 'postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres\n'
    errorMessage += '\n⚠️ IMPORTANT: Le mot de passe doit être URL-encodé (ex: ! devient %21)'
    
    throw new Error(errorMessage)
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
        try {
          const urlObj = new URL(databaseUrl)
          console.log('DATABASE_URL configuré:', {
            host: urlObj.hostname,
            port: urlObj.port || '5432 (défaut)',
            database: urlObj.pathname,
            user: urlObj.username,
            hasPassword: !!urlObj.password,
            passwordLength: urlObj.password?.length || 0,
          })
        } catch (urlError) {
          console.error('Erreur lors du parsing de DATABASE_URL:', urlError)
        }
      }
      
      // Prisma lit DATABASE_URL depuis le schema.prisma (env("DATABASE_URL"))
      // Pas besoin de le passer explicitement dans datasources
      return new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
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

