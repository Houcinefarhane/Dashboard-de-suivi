import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('🔐 signIn callback appelé:', {
        provider: account?.provider,
        email: user?.email,
        name: user?.name,
      })

      if (!user?.email) {
        console.error('❌ Pas d\'email dans user object')
        return false
      }

      if (account?.provider === 'google') {
        try {
          const email = user.email.toLowerCase().trim()
          
          // Vérifier si l'artisan existe déjà
          const existingArtisan = await prisma.artisan.findUnique({
            where: { email },
          })

          if (!existingArtisan) {
            // Créer un nouveau compte Artisan
            // Générer un UUID pour l'ID (compatible avec Supabase Auth)
            const { randomUUID } = await import('crypto')
            const newArtisan = await prisma.artisan.create({
              data: {
                id: randomUUID(),
                email,
                name: user.name || email.split('@')[0],
                password: null, // Pas de mot de passe pour OAuth
                emailVerified: true, // Email vérifié via Google
              },
            })
            console.log('✅ Compte Artisan créé via Google OAuth:', {
              id: newArtisan.id,
              email: newArtisan.email,
              name: newArtisan.name,
            })
          } else {
            // Mettre à jour si nécessaire
            if (!existingArtisan.emailVerified || (user.name && existingArtisan.name !== user.name)) {
              await prisma.artisan.update({
                where: { id: existingArtisan.id },
                data: {
                  emailVerified: true,
                  name: user.name || existingArtisan.name,
                },
              })
              console.log('✅ Compte Artisan mis à jour via Google OAuth:', existingArtisan.email)
            } else {
              console.log('✅ Compte Artisan existant connecté via Google OAuth:', existingArtisan.email)
            }
          }
          
          // Vérifier que le compte a bien été créé/mis à jour
          const verifyArtisan = await prisma.artisan.findUnique({
            where: { email },
          })
          
          if (!verifyArtisan) {
            console.error('❌ CRITIQUE: Le compte n\'a pas été créé malgré le succès apparent')
            return false
          }
          
          console.log('✅ Vérification: Compte confirmé dans la DB:', verifyArtisan.email)
          return true
        } catch (error: any) {
          console.error('❌ Error creating/updating artisan from OAuth:', {
            message: error?.message,
            code: error?.code,
            stack: error?.stack,
          })
          // Retourner false pour bloquer la connexion si erreur critique
          return false
        }
      }
      
      // Pour les autres providers ou si pas de provider spécifique
      return true
    },
    async redirect({ url, baseUrl }) {
      // Rediriger vers /dashboard après connexion OAuth
      // Le cookie artisanId sera géré côté client si nécessaire
      if (url.startsWith('/')) return `${baseUrl}${url}`
      if (new URL(url).origin === baseUrl) return url
      return `${baseUrl}/dashboard`
    },
    async session({ session, token }) {
      try {
        // Récupérer artisanId depuis le token (déjà stocké dans jwt callback)
        if (token.artisanId) {
          ;(session as any).artisanId = token.artisanId
          return session
        }
        
        // Si pas dans le token, chercher par email
        if (!token.artisanId && session.user?.email) {
          try {
            const artisan = await prisma.artisan.findUnique({
              where: { email: session.user.email.toLowerCase().trim() },
              select: {
                id: true,
                name: true,
                email: true,
                companyName: true,
                phone: true,
              },
            })

            if (artisan) {
              ;(session as any).artisanId = artisan.id
              session.user.name = artisan.name
            }
          } catch (dbError: any) {
            // En cas d'erreur DB, retourner la session sans artisanId plutôt que de crasher
            console.error('Erreur DB dans session callback:', dbError?.message)
            return session
          }
        }
        return session
      } catch (error: any) {
        console.error('Erreur dans session callback:', error?.message)
        // Retourner la session même en cas d'erreur pour éviter de bloquer l'utilisateur
        return session
      }
    },
    async jwt({ token, user, account }) {
      try {
        // Lors de la première connexion OAuth ou si artisanId pas encore dans le token
        if (user?.email && (!token.artisanId || account?.provider === 'google')) {
          try {
            const artisan = await prisma.artisan.findUnique({
              where: { email: user.email.toLowerCase().trim() },
              select: { id: true },
            })
            if (artisan) {
              token.artisanId = artisan.id
              console.log('✅ artisanId ajouté au token JWT:', artisan.id)
            } else {
              console.warn('⚠️ Artisan non trouvé pour email:', user.email)
            }
          } catch (dbError: any) {
            // En cas d'erreur DB, continuer sans artisanId plutôt que de crasher
            console.error('Erreur DB dans jwt callback:', dbError?.message)
          }
        }
        return token
      } catch (error: any) {
        console.error('Erreur dans jwt callback:', error?.message)
        // Retourner le token même en cas d'erreur
        return token
      }
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development',
  debug: process.env.NODE_ENV === 'development',
}

