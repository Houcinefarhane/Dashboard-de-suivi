import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

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

    // Créer l'artisan
    const artisan = await prisma.artisan.create({
      data: {
        name,
        email,
        password: hashedPassword,
        companyName: companyName || null,
        phone: phone || null,
      },
    })

    // Créer un cookie de session
    const response = NextResponse.json({
      success: true,
      artisan: {
        id: artisan.id,
        name: artisan.name,
        email: artisan.email,
      },
    })

    // Définir le cookie dans la réponse
    response.cookies.set('artisanId', artisan.id, {
      httpOnly: true,
      secure: false, // Désactivé en développement pour permettre HTTP
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      path: '/', // Important : définir le chemin
      domain: undefined, // Ne pas définir de domaine pour permettre localhost
    })
    
    console.log('✅ Cookie défini pour artisan (register):', artisan.id)

    return response
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'inscription' },
      { status: 500 }
    )
  }
}

