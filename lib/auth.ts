import { cookies } from 'next/headers'
import { getServerSession } from 'next-auth'
import { prisma } from './prisma'
import { authOptions } from './auth-nextauth'

export async function getCurrentArtisan() {
  try {
    // PRIORITÉ 1: Vérifier NextAuth session (OAuth Google) - prioritaire car plus récent
    // Mais seulement si NextAuth est configuré (évite erreurs si non configuré)
    let session = null
    try {
      session = await getServerSession(authOptions)
    } catch (nextAuthError: any) {
      // Si NextAuth échoue (ex: variables d'environnement manquantes), continuer avec cookies
      console.warn('⚠️ NextAuth session check failed, using cookies:', nextAuthError?.message)
    }
    
    console.log('getCurrentArtisan - Session NextAuth:', {
      hasSession: !!session,
      email: session?.user?.email,
      artisanId: (session as any)?.artisanId,
    })
    
    if (session?.user?.email) {
      const email = session.user.email.toLowerCase().trim()
      const artisan = await prisma.artisan.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          email: true,
          companyName: true,
          phone: true,
        },
      })

      if (artisan) {
        console.log('✅ getCurrentArtisan - Artisan trouvé via NextAuth session:', artisan.email)
        // Si session NextAuth existe, on ignore les cookies custom pour éviter les conflits
        return artisan
      } else {
        console.warn('⚠️ getCurrentArtisan - Session NextAuth trouvée mais artisan non trouvé pour:', email)
        console.warn('⚠️ Le compte Google n\'a peut-être pas été créé lors de la connexion OAuth')
        // Si session NextAuth existe mais pas de compte, on ne fallback PAS sur les cookies
        // pour éviter de se connecter sur le mauvais compte
        return null
      }
    }

    // PRIORITÉ 2: Vérifier les cookies custom (authentification email/password)
    // Seulement si pas de session NextAuth active
    const cookieStore = await cookies()
    const artisanId = cookieStore.get('artisanId')?.value

    console.log('getCurrentArtisan - Cookie artisanId:', artisanId ? 'présent' : 'absent')

    if (artisanId) {
      const artisan = await prisma.artisan.findUnique({
        where: { id: artisanId },
        select: {
          id: true,
          name: true,
          email: true,
          companyName: true,
          phone: true,
        },
      })

      if (artisan) {
        console.log('✅ getCurrentArtisan - Artisan trouvé via cookie:', artisan.email)
        return artisan
      }
    }

    console.log('❌ getCurrentArtisan - Aucun artisan trouvé')
    return null
  } catch (error) {
    console.error('❌ getCurrentArtisan - Erreur:', error)
    return null
  }
}

