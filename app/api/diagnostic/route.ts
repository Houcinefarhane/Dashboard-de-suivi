import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function GET() {
  const diagnostic: any = {
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    databaseUrlInfo: null,
    connectionTests: [],
    recommendations: [],
  }

  // Analyser DATABASE_URL sans exposer le mot de passe
  if (process.env.DATABASE_URL) {
    try {
      const urlObj = new URL(process.env.DATABASE_URL)
      diagnostic.databaseUrlInfo = {
        protocol: urlObj.protocol,
        hostname: urlObj.hostname,
        port: urlObj.port || '5432 (défaut)',
        pathname: urlObj.pathname,
        username: urlObj.username,
        hasPassword: !!urlObj.password,
        passwordLength: urlObj.password?.length || 0,
        hasQueryParams: !!urlObj.search,
        queryParams: urlObj.search,
      }
    } catch (e: any) {
      diagnostic.databaseUrlInfo = {
        error: 'Format URL invalide',
        message: e.message,
      }
      diagnostic.recommendations.push('Le format de DATABASE_URL est invalide. Vérifiez qu\'il n\'y a pas de guillemets autour de la valeur.')
    }
  } else {
    diagnostic.recommendations.push('DATABASE_URL n\'est pas défini. Ajoutez-le dans les variables d\'environnement Vercel (Settings → Environment Variables).')
  }

  // Tester différentes configurations de connexion
  const testConfigs = [
    {
      name: 'Configuration actuelle',
      url: process.env.DATABASE_URL,
    },
  ]

  // Si le port est 5432, tester aussi avec 6543
  if (process.env.DATABASE_URL) {
    try {
      const urlObj = new URL(process.env.DATABASE_URL)
      if (urlObj.port === '5432' || !urlObj.port) {
        // Tester avec le pooler
        const poolerUrl = process.env.DATABASE_URL.replace(':5432', ':6543').replace('/postgres', '/postgres?pgbouncer=true')
        testConfigs.push({
          name: 'Pooler Supabase (port 6543)',
          url: poolerUrl,
        })
      }
    } catch (e) {
      // Ignorer les erreurs de parsing
    }
  }

  // Tester chaque configuration
  for (const config of testConfigs) {
    if (!config.url) continue

    const testResult: any = {
      name: config.name,
      url: config.url.substring(0, 50) + '...', // Afficher seulement le début
      success: false,
      error: null,
      parsedUrl: null,
    }

    try {
      // Parser l'URL pour vérifier le format
      try {
        const urlObj = new URL(config.url)
        testResult.parsedUrl = {
          protocol: urlObj.protocol,
          username: urlObj.username,
          hostname: urlObj.hostname,
          port: urlObj.port,
          pathname: urlObj.pathname,
          hasPassword: !!urlObj.password,
          passwordLength: urlObj.password?.length || 0,
          queryParams: urlObj.search,
        }
      } catch (parseError: any) {
        testResult.parseError = parseError.message
      }

      // Créer un client Prisma temporaire avec cette URL
      const testPrisma = new PrismaClient({
        datasources: {
          db: {
            url: config.url,
          },
        },
      })

      // Tester la connexion
      await testPrisma.$connect()
      testResult.success = true
      testResult.message = 'Connexion réussie'

      // Tester une requête simple
      try {
        const count = await testPrisma.artisan.count()
        testResult.queryTest = {
          success: true,
          artisanCount: count,
        }
      } catch (queryError: any) {
        testResult.queryTest = {
          success: false,
          error: queryError.message,
          code: queryError.code,
        }
      }

      await testPrisma.$disconnect()
    } catch (error: any) {
      testResult.success = false
      testResult.error = error.message
      testResult.code = error.code
      testResult.type = error.constructor?.name

      // Messages d'aide selon le code d'erreur
      if (error.code === 'P1001') {
        testResult.help = 'Impossible de se connecter au serveur. Cela peut signifier : 1) Le serveur Supabase est inaccessible depuis Vercel, 2) Le port est bloqué par un firewall, 3) L\'adresse IP de Vercel n\'est pas autorisée dans Supabase, 4) DATABASE_URL n\'est pas configuré dans Vercel.'
        diagnostic.recommendations.push('Vérifiez dans Supabase : Settings → Database → Connection Pooling → Activez le pooler et autorisez toutes les IPs (0.0.0.0/0)')
        diagnostic.recommendations.push('Vérifiez que DATABASE_URL est bien configuré dans Vercel (Settings → Environment Variables)')
      } else if (error.code === 'P1000' || error.message?.includes('Authentication failed') || error.message?.includes('credentials')) {
        testResult.help = 'Échec d\'authentification. Vérifiez : 1) Le username est correct (doit être postgres.tqvdjfesnavnsqchufjg pour le pooler), 2) Le mot de passe est correct et URL-encodé, 3) Le mot de passe dans Supabase correspond.'
        diagnostic.recommendations.push('Vérifiez dans Supabase : Settings → Database → Reset database password si nécessaire')
        diagnostic.recommendations.push('Pour le pooler, le username doit être postgres.[PROJECT_REF], pas juste postgres')
      } else if (error.code === 'P1013') {
        testResult.help = 'Format de connexion invalide.'
        diagnostic.recommendations.push('Vérifiez le format de DATABASE_URL. Il ne doit pas contenir de guillemets.')
      }
    }

    diagnostic.connectionTests.push(testResult)
  }

  // Recommandations générales
  if (diagnostic.connectionTests.every((test: any) => !test.success)) {
    diagnostic.recommendations.push('Aucune configuration ne fonctionne. Vérifiez dans Supabase :')
    diagnostic.recommendations.push('1. Settings → Database → Connection string → Utilisez "Connection pooling" (port 6543)')
    diagnostic.recommendations.push('2. Settings → Database → Network restrictions → Autorisez toutes les IPs ou ajoutez les IPs de Vercel')
    diagnostic.recommendations.push('3. Vérifiez que le mot de passe dans Supabase correspond à celui dans DATABASE_URL')
  }

  const hasSuccess = diagnostic.connectionTests.some((test: any) => test.success)

  return NextResponse.json(diagnostic, {
    status: hasSuccess ? 200 : 500,
  })
}

