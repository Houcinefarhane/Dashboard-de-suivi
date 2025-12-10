import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'
import { randomBytes } from 'crypto'
import { sendVerificationEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, companyName, phone } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Tous les champs requis doivent être remplis' },
        { status: 400 }
      )
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.artisan.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 400 }
      )
    }

    // Hasher le mot de passe
    const hashedPassword = await hash(password, 10)

    // Générer un token de vérification
    const verificationToken = randomBytes(32).toString('hex')
    const tokenExpires = new Date()
    tokenExpires.setHours(tokenExpires.getHours() + 24) // Expire dans 24h

    // Créer l'artisan (non vérifié)
    console.log('📝 Création de l\'artisan:', { email, name })
    const artisan = await prisma.artisan.create({
      data: {
        name,
        email,
        password: hashedPassword,
        companyName: companyName || null,
        phone: phone || null,
        emailVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationTokenExpires: tokenExpires,
      },
    })
    console.log('✅ Artisan créé avec succès:', artisan.id)

    // Envoyer l'email de vérification (ne pas bloquer l'inscription si ça échoue)
    let emailSent = false
    try {
      console.log('📧 Tentative d\'envoi d\'email de vérification...')
      const emailResult = await sendVerificationEmail(email, name, verificationToken)
      if (emailResult && emailResult.success) {
        console.log('✅ Email de vérification envoyé à:', email)
        emailSent = true
      } else {
        console.warn('⚠️ Email non envoyé mais compte créé:', email)
        console.warn('⚠️ Raison:', emailResult?.error || 'Raison inconnue')
      }
    } catch (emailError: any) {
      console.error('❌ Erreur envoi email (non bloquant):', emailError?.message || emailError)
      console.error('❌ Stack:', emailError?.stack)
      // On continue même si l'email échoue, l'utilisateur pourra demander un renvoi
    }
    
    console.log('✅ Inscription terminée, compte créé:', artisan.id)

    // Ne pas connecter directement, rediriger vers la page de confirmation
    return NextResponse.json({
      success: true,
      message: 'Un email de vérification a été envoyé à votre adresse',
      requiresVerification: true,
    })
  } catch (error: any) {
    console.error('Registration error:', error)
    console.error('Error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    })
    
    // Retourner un message d'erreur plus détaillé en développement
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? `Erreur lors de l'inscription: ${error?.message || 'Erreur inconnue'}`
      : 'Erreur lors de l\'inscription'
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

