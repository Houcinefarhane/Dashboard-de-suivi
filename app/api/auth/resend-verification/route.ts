import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'
import { sendVerificationEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      )
    }

    // Trouver l'artisan
    const artisan = await prisma.artisan.findUnique({
      where: { email },
    })

    if (!artisan) {
      // Ne pas révéler si l'email existe ou non pour la sécurité
      return NextResponse.json({
        success: true,
        message: 'Si cet email existe, un nouveau lien de vérification a été envoyé.',
      })
    }

    // Si déjà vérifié, ne rien faire
    if (artisan.emailVerified) {
      return NextResponse.json({
        success: true,
        message: 'Votre email est déjà vérifié.',
      })
    }

    // Générer un nouveau token
    const verificationToken = randomBytes(32).toString('hex')
    const tokenExpires = new Date()
    tokenExpires.setHours(tokenExpires.getHours() + 24)

    // Mettre à jour le token
    await prisma.artisan.update({
      where: { id: artisan.id },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationTokenExpires: tokenExpires,
      },
    })

    // Envoyer l'email
    try {
      await sendVerificationEmail(email, artisan.name, verificationToken)
      console.log('Email de vérification renvoyé à:', email)
    } catch (emailError) {
      console.error('Erreur envoi email:', emailError)
      return NextResponse.json(
        { error: 'Erreur lors de l\'envoi de l\'email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Un nouveau lien de vérification a été envoyé à votre adresse email.',
    })
  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la demande de renvoi' },
      { status: 500 }
    )
  }
}

