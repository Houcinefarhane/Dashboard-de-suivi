import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('=== TEST CONNEXION BASE DE DONNÉES ===')
    console.log('DATABASE_URL présent:', !!process.env.DATABASE_URL)
    
    if (process.env.DATABASE_URL) {
      try {
        const urlObj = new URL(process.env.DATABASE_URL)
        console.log('DATABASE_URL analysé:', {
          protocol: urlObj.protocol,
          hostname: urlObj.hostname,
          port: urlObj.port || '5432 (défaut)',
          pathname: urlObj.pathname,
          username: urlObj.username,
          hasPassword: !!urlObj.password,
        })
      } catch (e) {
        console.error('Erreur parsing URL:', e)
      }
    }
    
    // Tester la connexion
    console.log('Tentative de connexion...')
    await prisma.$connect()
    console.log('Connexion réussie!')
    
    // Tester une requête simple
    const count = await prisma.artisan.count()
    console.log(`Nombre d'artisans: ${count}`)
    
    await prisma.$disconnect()
    
    return NextResponse.json({
      success: true,
      message: 'Connexion à la base de données réussie',
      artisanCount: count,
    })
  } catch (error: any) {
    console.error('=== ERREUR TEST CONNEXION ===')
    console.error('Type:', error?.constructor?.name)
    console.error('Message:', error?.message)
    console.error('Code:', error?.code)
    console.error('Stack:', error?.stack)
    
    return NextResponse.json({
      success: false,
      error: error?.message || 'Erreur inconnue',
      code: error?.code,
      details: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
    }, { status: 500 })
  }
}

