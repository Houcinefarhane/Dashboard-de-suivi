import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

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

    const supabase = createServerSupabaseClient()

    // Renvoyer l'email de vérification via Supabase Auth
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.toLowerCase().trim(),
      options: {
        emailRedirectTo: `${process.env.NEXTAUTH_URL || 'https://dashboard-de-suivi.vercel.app'}/auth/verify-email`,
      },
    })

    if (error) {
      console.error('Supabase resend error:', error)
      
      // Ne pas révéler si l'email existe ou non pour la sécurité
      return NextResponse.json({
        success: true,
        message: 'Si cet email existe et n\'est pas encore vérifié, un nouveau lien de vérification a été envoyé.',
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Un nouveau lien de vérification a été envoyé à votre adresse email.',
    })
  } catch (error) {
    console.error('Resend Supabase verification error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la demande de renvoi' },
      { status: 500 }
    )
  }
}

