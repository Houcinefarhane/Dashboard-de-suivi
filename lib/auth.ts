import { cookies } from 'next/headers'
import { prisma } from './prisma'

export async function getCurrentArtisan() {
  try {
    const cookieStore = await cookies()
    const artisanId = cookieStore.get('artisanId')?.value

    console.log('getCurrentArtisan - artisanId from cookie:', artisanId)

    if (!artisanId) {
      console.log('getCurrentArtisan - Aucun artisanId trouvé dans les cookies')
      return null
    }

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

    console.log('getCurrentArtisan - Artisan trouvé:', artisan ? artisan.email : 'null')

    return artisan
  } catch (error) {
    console.error('getCurrentArtisan - Erreur:', error)
    return null
  }
}

