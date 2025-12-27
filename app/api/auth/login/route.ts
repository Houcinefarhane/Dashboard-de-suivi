import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { compare } from 'bcryptjs'

export async function POST(request: Request) {
  try {
    console.log('Login attempt - Début')
    const body = await request.json()
    const { email, password } = body

    console.log('Login attempt - Email:', email)

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      )
    }

    // Trouver l'artisan
    console.log('Login attempt - Recherche artisan dans la base de données...')
    let artisan
    try {
      artisan = await prisma.artisan.findUnique({
        where: { email: email.toLowerCase().trim() },
      })
      console.log('Login attempt - Artisan trouvé:', artisan ? 'Oui' : 'Non')
    } catch (dbError: any) {
      console.error('Erreur de connexion à la base de données:', dbError)
      console.error('Message d\'erreur:', dbError?.message)
      console.error('Code d\'erreur:', dbError?.code)
      
      // Vérifier si c'est une erreur de format DATABASE_URL
      if (dbError?.message?.includes('did not match the expected pattern') || 
          dbError?.message?.includes('Invalid connection string')) {
        throw new Error('Format de connexion à la base de données invalide. Vérifiez votre fichier .env (DATABASE_URL)')
      }
      
      throw new Error(`Erreur de connexion à la base de données: ${dbError?.message || 'Erreur inconnue'}`)
    }

    if (!artisan) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Vérifier le mot de passe
    console.log('Login attempt - Vérification du mot de passe...')
    const isValidPassword = await compare(password, artisan.password)
    console.log('Login attempt - Mot de passe valide:', isValidPassword)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Vérifier que l'email est vérifié (sauf si SKIP_EMAIL_VERIFICATION est activé)
    const skipVerification = process.env.SKIP_EMAIL_VERIFICATION === 'true'
    
    if (!artisan.emailVerified && !skipVerification) {
      return NextResponse.json(
        { 
          error: 'Veuillez vérifier votre adresse email avant de vous connecter. Vérifiez votre boîte de réception.',
          requiresVerification: true,
          email: artisan.email,
        },
        { status: 403 }
      )
    }
    
    // Marquer automatiquement comme vérifié si skip activé
    if (!artisan.emailVerified && skipVerification) {
      await prisma.artisan.update({
        where: { id: artisan.id },
        data: { emailVerified: true },
      })
      console.log('Email automatiquement vérifié pour:', artisan.email)
    }

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
    
    console.log('Cookie défini pour artisan:', artisan.id)
    console.log('Options du cookie:', cookieOptions)

    return response
  } catch (error: any) {
    console.error('Login error:', error)
    console.error('Error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      code: error?.code,
    })
    
    // Retourner un message d'erreur plus détaillé en développement, mais toujours logger en production
    const isDevelopment = process.env.NODE_ENV === 'development'
    const errorMessage = isDevelopment
      ? `Erreur lors de la connexion: ${error?.message || 'Erreur inconnue'}`
      : 'Erreur lors de la connexion'
    
    // Logger l'erreur complète pour le debugging en production
    if (!isDevelopment) {
      console.error('Erreur de connexion en production:', {
        message: error?.message,
        name: error?.name,
        code: (error as any)?.code,
      })
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

