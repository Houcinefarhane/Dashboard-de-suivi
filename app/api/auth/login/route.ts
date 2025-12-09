import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { compare } from 'bcryptjs'

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

    // Trouver l'artisan
    const artisan = await prisma.artisan.findUnique({
      where: { email },
    })

    if (!artisan) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Vérifier le mot de passe
    const isValidPassword = await compare(password, artisan.password)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
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
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS en production
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      path: '/', // Important : définir le chemin
      domain: process.env.NODE_ENV === 'production' ? undefined : undefined, // Pas de domaine pour permettre tous les sous-domaines
    }
    
    response.cookies.set('artisanId', artisan.id, cookieOptions)
    
    console.log('✅ Cookie défini pour artisan:', artisan.id)
    console.log('✅ Options du cookie:', cookieOptions)
    console.log('✅ Headers de la réponse:', Object.fromEntries(response.headers.entries()))

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la connexion' },
      { status: 500 }
    )
  }
}

