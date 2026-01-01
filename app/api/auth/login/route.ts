import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { compare } from 'bcryptjs'
import { rateLimit } from '@/lib/rate-limit'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      )
    }

    // 🔒 RATE LIMITING : Protection contre brute force
    // Pourquoi ? Sans ça, un hacker peut essayer 1000 mots de passe/seconde
    // Avec ça : maximum 5 tentatives toutes les 15 minutes par IP/email
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'
    const identifier = `${ip}:${email.toLowerCase().trim()}`
    
    const rateLimitResult = rateLimit(identifier, 5, 15 * 60 * 1000) // 5 tentatives / 15 min
    
    if (!rateLimitResult.allowed) {
      const retryAfter = Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
      return NextResponse.json(
        { 
          error: 'Trop de tentatives de connexion. Veuillez réessayer dans quelques minutes.',
          retryAfter 
        },
        { 
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
          }
        }
      )
    }

    // Vérifier DATABASE_URL (sans logger les détails sensibles)
    if (!process.env.DATABASE_URL) {
      logger.error('DATABASE_URL non défini')
      return NextResponse.json(
        { error: 'Configuration de la base de données manquante. Contactez l\'administrateur.' },
        { status: 500 }
      )
    }
    
    let artisan
    try {
      await prisma.$connect()
      
      const emailNormalized = email.toLowerCase().trim()
      
      artisan = await prisma.artisan.findUnique({
        where: { email: emailNormalized },
      })
           } catch (dbError: any) {
             logger.error('Erreur base de données', { code: dbError?.code })
             
             // Vérifier le type d'erreur Prisma
             if (dbError?.code === 'P1001') {
               throw new Error('Impossible de se connecter à la base de données. Vérifiez votre configuration DATABASE_URL dans Vercel.')
             }
             
             if (dbError?.code === 'P1000') {
               throw new Error('Échec d\'authentification à la base de données. Vérifiez le mot de passe dans DATABASE_URL.')
             }
             
             // Vérifier si c'est une erreur de format DATABASE_URL
             if (dbError?.message?.includes('did not match the expected pattern') || 
                 dbError?.message?.includes('Invalid connection string') ||
                 dbError?.code === 'P1013') {
               throw new Error('Format de connexion à la base de données invalide. Vérifiez votre DATABASE_URL dans Vercel.')
             }
             
             // Erreur générique
             throw new Error(`Erreur de connexion à la base de données: ${dbError?.message || 'Erreur inconnue'} (Code: ${dbError?.code || 'N/A'})`)
           }

    if (!artisan) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Vérifier le mot de passe
    let isValidPassword = false
    try {
      if (!artisan.password) {
        // Compte OAuth sans mot de passe
        isValidPassword = false
      } else {
        isValidPassword = await compare(password, artisan.password)
      }
    } catch (compareError: any) {
      // Ne pas logger l'erreur en production (peut exposer des infos)
      if (process.env.NODE_ENV === 'development') {
        console.error('Erreur lors de la comparaison du mot de passe:', compareError?.message)
      }
      isValidPassword = false
    }

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

           // Connexion autorisée
           logger.info('Connexion réussie')

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
    
    // Utiliser response.cookies.set() (méthode Next.js recommandée)
    response.cookies.set('artisanId', artisan.id, {
      httpOnly: true,
      secure: isProduction, // HTTPS en production
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      path: '/',
    })
    
           // Cookie défini avec succès
    
    // Ajouter headers rate limit dans la réponse
    response.headers.set('X-RateLimit-Limit', '5')
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
    response.headers.set('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString())

    return response
         } catch (error: any) {
           logger.error('Erreur login', { code: error?.code })
    
    // Messages d'erreur génériques (ne pas exposer de détails techniques)
    let errorMessage = 'Erreur lors de la connexion'
    
    // Messages d'erreur génériques (ne pas exposer de détails techniques en production)
    if (error?.code === 'P1001' || error?.message?.includes('Can\'t reach database server')) {
      errorMessage = 'Impossible de se connecter à la base de données'
    } else if (error?.code === 'P1000') {
      errorMessage = 'Erreur de configuration de la base de données'
    } else if (error?.code === 'P1013' || error?.message?.includes('did not match')) {
      errorMessage = 'Erreur de configuration de la base de données'
    } else if (error?.message?.includes('DATABASE_URL manquant')) {
      errorMessage = 'Configuration de la base de données manquante'
    }
    
    // Retourner un message générique (sans détails techniques)
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

