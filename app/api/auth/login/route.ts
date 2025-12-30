import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { compare } from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    console.log('=== LOGIN ATTEMPT ===')
    console.log('NODE_ENV:', process.env.NODE_ENV)
    console.log('SKIP_EMAIL_VERIFICATION:', process.env.SKIP_EMAIL_VERIFICATION)
    
    const body = await request.json()
    const { email, password } = body

    console.log('Email reçu:', email ? 'Oui' : 'Non')
    console.log('Password reçu:', password ? 'Oui' : 'Non')

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      )
    }

    // Trouver l'artisan
    console.log('=== RECHERCHE ARTISAN ===')
    console.log('DATABASE_URL présent:', !!process.env.DATABASE_URL)
    if (process.env.DATABASE_URL) {
      try {
        const urlObj = new URL(process.env.DATABASE_URL)
        console.log('DATABASE_URL analysé:', {
          host: urlObj.hostname,
          port: urlObj.port || '5432 (défaut)',
          user: urlObj.username,
          database: urlObj.pathname,
          hasPassword: !!urlObj.password,
        })
      } catch (e) {
        console.error('Erreur parsing DATABASE_URL:', e)
      }
    } else {
      console.error('ERREUR: DATABASE_URL n\'est pas défini!')
      return NextResponse.json(
        { error: 'Configuration de la base de données manquante. Contactez l\'administrateur.' },
        { status: 500 }
      )
    }
    
    let artisan
    try {
      // Tester la connexion d'abord
      console.log('Test de connexion à la base de données...')
      await prisma.$connect()
      console.log('✅ Connexion réussie!')
      
      const emailNormalized = email.toLowerCase().trim()
      console.log('Email normalisé:', emailNormalized)
      
      artisan = await prisma.artisan.findUnique({
        where: { email: emailNormalized },
      })
      
      console.log('Artisan trouvé:', artisan ? `Oui (ID: ${artisan.id}, Email vérifié: ${artisan.emailVerified})` : 'Non')
      
      if (!artisan) {
        // Essayer de trouver tous les emails pour debug
        const allArtisans = await prisma.artisan.findMany({
          select: { email: true, emailVerified: true },
          take: 5,
        })
        console.log('Emails dans la base (premiers 5):', allArtisans.map(a => ({ email: a.email, verified: a.emailVerified })))
      }
    } catch (dbError: any) {
      console.error('=== ERREUR BASE DE DONNÉES ===')
      console.error('Type:', dbError?.constructor?.name)
      console.error('Message:', dbError?.message)
      console.error('Code:', dbError?.code)
      console.error('Stack:', dbError?.stack)
      
      // Vérifier le type d'erreur Prisma
      if (dbError?.code === 'P1001') {
        console.error('ERREUR: Impossible de se connecter au serveur de base de données')
        console.error('Vérifiez que DATABASE_URL est correct et que Supabase est accessible')
        throw new Error('Impossible de se connecter à la base de données. Vérifiez votre configuration DATABASE_URL dans Vercel.')
      }
      
      if (dbError?.code === 'P1000') {
        console.error('ERREUR: Échec d\'authentification')
        throw new Error('Échec d\'authentification à la base de données. Vérifiez le mot de passe dans DATABASE_URL.')
      }
      
      // Vérifier si c'est une erreur de format DATABASE_URL
      if (dbError?.message?.includes('did not match the expected pattern') || 
          dbError?.message?.includes('Invalid connection string') ||
          dbError?.code === 'P1013') {
        console.error('ERREUR: Format DATABASE_URL invalide')
        throw new Error('Format de connexion à la base de données invalide. Vérifiez votre DATABASE_URL dans Vercel.')
      }
      
      // Erreur générique
      console.error('Erreur complète:', JSON.stringify(dbError, Object.getOwnPropertyNames(dbError), 2))
      throw new Error(`Erreur de connexion à la base de données: ${dbError?.message || 'Erreur inconnue'} (Code: ${dbError?.code || 'N/A'})`)
    }

    if (!artisan) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Vérifier le mot de passe
    console.log('Vérification du mot de passe...')
    let isValidPassword = false
    try {
      isValidPassword = await compare(password, artisan.password)
      console.log('Mot de passe valide:', isValidPassword)
    } catch (compareError: any) {
      console.error('Erreur lors de la comparaison du mot de passe:', compareError?.message)
      isValidPassword = false
    }

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Plus besoin de vérifier l'email - tous les comptes sont automatiquement vérifiés
    console.log('Connexion autorisée pour:', artisan.email)

    // Créer un cookie de session (simplifié - dans un vrai projet, utiliser JWT)
    const response = NextResponse.json({
      success: true,
      artisan: {
        id: artisan.id,
        name: artisan.name,
        email: artisan.email,
      },
    })

    // Définir le cookie dans la réponse
    const isProduction = process.env.NODE_ENV === 'production'
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction, // HTTPS en production
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      path: '/', // Important : définir le chemin
      // Ne pas définir de domaine pour permettre tous les sous-domaines Netlify
    }
    
    response.cookies.set('artisanId', artisan.id, cookieOptions)
    
    console.log('=== CONNEXION RÉUSSIE ===')
    console.log('Artisan ID:', artisan.id)
    console.log('Artisan Email:', artisan.email)
    console.log('Options du cookie:', cookieOptions)
    console.log('Cookie défini avec succès')

    return response
  } catch (error: any) {
    console.error('=== ERREUR LOGIN ===')
    console.error('Type:', error?.constructor?.name)
    console.error('Message:', error?.message)
    console.error('Stack:', error?.stack)
    console.error('Name:', error?.name)
    console.error('Code:', error?.code)
    
    // Messages d'erreur détaillés pour aider au diagnostic
    let errorMessage = 'Erreur lors de la connexion'
    let errorDetails: any = {}
    
    // Vérifier si c'est une erreur Prisma
    if (error?.code === 'P1001' || error?.message?.includes('Can\'t reach database server')) {
      console.error('ERREUR: Impossible de se connecter au serveur de base de données')
      errorMessage = 'Impossible de se connecter à la base de données'
      errorDetails = {
        code: 'P1001',
        suggestion: 'Vérifiez que DATABASE_URL est correctement configuré dans Vercel. Utilisez le pooler Supabase (Transaction mode, port 6543) avec ?pgbouncer=true.',
      }
    } else if (error?.code === 'P1000') {
      console.error('ERREUR: Échec d\'authentification')
      errorMessage = 'Échec d\'authentification à la base de données'
      errorDetails = {
        code: 'P1000',
        suggestion: 'Vérifiez le mot de passe dans DATABASE_URL. Les caractères spéciaux doivent être URL-encodés (ex: ! devient %21).',
      }
    } else if (error?.code === 'P1013' || error?.message?.includes('did not match the expected pattern') || 
               error?.message?.includes('Invalid connection string')) {
      console.error('ERREUR: Format DATABASE_URL invalide')
      errorMessage = 'Format de connexion à la base de données invalide'
      errorDetails = {
        code: 'P1013',
        suggestion: 'Vérifiez le format de DATABASE_URL. Format attendu: postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres',
      }
    } else if (error?.message?.includes('DATABASE_URL manquant')) {
      errorMessage = 'Configuration de la base de données manquante'
      errorDetails = {
        suggestion: 'Ajoutez DATABASE_URL dans les variables d\'environnement Vercel (Settings → Environment Variables).',
      }
    } else {
      // Erreur générique - toujours retourner le message pour aider au debug
      errorMessage = error?.message || 'Erreur lors de la connexion'
      errorDetails = {
        type: error?.constructor?.name,
        code: error?.code,
      }
    }
    
    // Logger l'erreur complète pour le debugging
    console.error('Erreur complète:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
    
    // Retourner un message utile avec suggestions
    return NextResponse.json(
      { 
        error: errorMessage,
        ...errorDetails,
      },
      { status: 500 }
    )
  } finally {
    console.log('=== FIN LOGIN ===')
  }
}

