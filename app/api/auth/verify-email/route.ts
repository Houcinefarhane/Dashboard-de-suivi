import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Token de vérification manquant' },
        { status: 400 }
      )
    }

    // Trouver l'artisan avec ce token
    const artisan = await prisma.artisan.findUnique({
      where: { emailVerificationToken: token },
    })

    if (!artisan) {
      return NextResponse.json(
        { error: 'Token de vérification invalide' },
        { status: 400 }
      )
    }

    // Vérifier si le token n'a pas expiré
    if (artisan.emailVerificationTokenExpires && artisan.emailVerificationTokenExpires < new Date()) {
      return NextResponse.json(
        { error: 'Le token de vérification a expiré. Veuillez demander un nouvel email.' },
        { status: 400 }
      )
    }

    // Vérifier si l'email est déjà vérifié
    if (artisan.emailVerified) {
      return NextResponse.json({
        success: true,
        message: 'Votre email est déjà vérifié',
        alreadyVerified: true,
      })
    }

    // Marquer l'email comme vérifié et supprimer le token
    await prisma.artisan.update({
      where: { id: artisan.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationTokenExpires: null,
      },
    })

    // Créer un cookie de session pour connecter automatiquement
    const response = NextResponse.json({
      success: true,
      message: 'Email vérifié avec succès',
      artisan: {
        id: artisan.id,
        name: artisan.name,
        email: artisan.email,
      },
    })

    // Définir le cookie dans la réponse
    response.cookies.set('artisanId', artisan.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la vérification de l\'email' },
      { status: 500 }
    )
  }
}

