import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerSupabaseClient } from '@/lib/supabase'
import { logger } from '@/lib/logger'

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

    const supabase = createServerSupabaseClient()

    // Authentifier avec Supabase Auth (gère automatiquement le rate limiting)
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    })

    if (authError) {
      // Supabase Auth gère déjà le rate limiting, donc on peut retourner l'erreur directement
      if (authError.message.includes('rate limit') || authError.message.includes('too many')) {
        return NextResponse.json(
          { error: 'Trop de tentatives de connexion. Veuillez réessayer dans quelques minutes.' },
          { status: 429 }
        )
      }

      // Erreur spécifique pour email non vérifié
      if (authError.message.includes('email') && authError.message.includes('confirm')) {
        return NextResponse.json(
          { 
            error: 'Votre email n\'a pas été vérifié. Veuillez vérifier votre boîte mail et cliquer sur le lien de confirmation.',
            requiresEmailVerification: true
          },
          { status: 401 }
        )
      }

      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Erreur lors de la connexion' },
        { status: 500 }
      )
    }

    // Récupérer l'artisan depuis Prisma
    const artisan = await prisma.artisan.findUnique({
      where: { id: authData.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        companyName: true,
        phone: true,
      },
    })

    if (!artisan) {
      // L'utilisateur existe dans Supabase Auth mais pas dans Prisma
      // Créer l'artisan avec les données de Supabase Auth
      const newArtisan = await prisma.artisan.create({
        data: {
          id: authData.user.id,
          name: authData.user.user_metadata?.name || authData.user.email?.split('@')[0] || 'Utilisateur',
          email: authData.user.email!,
          password: null,
          companyName: authData.user.user_metadata?.companyName || null,
          phone: authData.user.user_metadata?.phone || null,
          emailVerified: authData.user.email_confirmed_at !== null,
          emailVerificationToken: null,
          emailVerificationTokenExpires: null,
        },
        select: {
          id: true,
          name: true,
          email: true,
          companyName: true,
          phone: true,
        },
      })

      logger.info('Artisan créé automatiquement depuis Supabase Auth')

      const response = NextResponse.json({
        success: true,
        artisan: newArtisan,
      })

      return response
    }

    logger.info('Connexion réussie via Supabase Auth')

    // La session est gérée automatiquement par Supabase via les cookies
    const response = NextResponse.json({
      success: true,
      artisan: {
        id: artisan.id,
        name: artisan.name,
        email: artisan.email,
      },
    })

    return response
  } catch (error: any) {
    logger.error('Erreur login', { code: error?.code })
    
    return NextResponse.json(
      { error: 'Erreur lors de la connexion. Veuillez réessayer.' },
      { status: 500 }
    )
  }
}

