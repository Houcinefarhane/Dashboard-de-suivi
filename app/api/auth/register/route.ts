import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, companyName, phone, invitationCode } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Tous les champs requis doivent être remplis' },
        { status: 400 }
      )
    }

    // Vérifier le code d'invitation
    const requiredInvitationCode = process.env.INVITATION_CODE
    if (requiredInvitationCode) {
      if (!invitationCode || invitationCode !== requiredInvitationCode) {
        return NextResponse.json(
          { error: 'Code d\'invitation invalide. Veuillez nous contacter pour obtenir un code d\'accès.' },
          { status: 403 }
        )
      }
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

    // Créer l'artisan (directement vérifié)
    const artisan = await prisma.artisan.create({
      data: {
        name,
        email,
        password: hashedPassword,
        companyName: companyName || null,
        phone: phone || null,
        emailVerified: true, // Compte vérifié automatiquement
        emailVerificationToken: null,
        emailVerificationTokenExpires: null,
      },
    })

    // Compte créé avec succès - pas besoin de vérification
    return NextResponse.json({
      success: true,
      message: 'Compte créé avec succès ! Vous pouvez maintenant vous connecter.',
      artisanId: artisan.id,
    })
  } catch (error: any) {
    console.error('Registration error:', error)
    
    return NextResponse.json(
      { error: 'Erreur lors de l\'inscription. Veuillez réessayer.' },
      { status: 500 }
    )
  }
}

