import { getCurrentArtisan } from './auth'
import { prisma } from './prisma'

/**
 * Vérifie si l'utilisateur connecté a accès à une feature spécifique
 * @param featureName Nom de la feature (ex: "new-quote-feature")
 * @returns true si la feature est activée pour cet utilisateur
 */
export async function hasFeature(featureName: string): Promise<boolean> {
  try {
    const artisan = await getCurrentArtisan()
    
    if (!artisan) {
      return false
    }

    // Récupérer l'artisan avec ses features
    const artisanWithFeatures = await prisma.artisan.findUnique({
      where: { id: artisan.id },
      select: { features: true, email: true },
    })

    if (!artisanWithFeatures) {
      return false
    }

    // Vérifier si la feature est dans la liste
    const features = artisanWithFeatures.features as string[] | null
    
    if (!features || !Array.isArray(features)) {
      return false
    }

    return features.includes(featureName)
  } catch (error) {
    console.error('Error checking feature:', error)
    return false
  }
}

/**
 * Active une feature pour un utilisateur spécifique (par email)
 * @param email Email de l'utilisateur
 * @param featureName Nom de la feature à activer
 */
export async function enableFeatureForUser(email: string, featureName: string): Promise<void> {
  try {
    const artisan = await prisma.artisan.findUnique({
      where: { email },
      select: { id: true, features: true },
    })

    if (!artisan) {
      throw new Error(`Utilisateur non trouvé: ${email}`)
    }

    const currentFeatures = (artisan.features as string[] | null) || []
    
    if (!currentFeatures.includes(featureName)) {
      await prisma.artisan.update({
        where: { id: artisan.id },
        data: {
          features: [...currentFeatures, featureName],
        },
      })
      console.log(`✅ Feature "${featureName}" activée pour ${email}`)
    } else {
      console.log(`ℹ️ Feature "${featureName}" déjà activée pour ${email}`)
    }
  } catch (error) {
    console.error('Error enabling feature:', error)
    throw error
  }
}

/**
 * Désactive une feature pour un utilisateur spécifique (par email)
 * @param email Email de l'utilisateur
 * @param featureName Nom de la feature à désactiver
 */
export async function disableFeatureForUser(email: string, featureName: string): Promise<void> {
  try {
    const artisan = await prisma.artisan.findUnique({
      where: { email },
      select: { id: true, features: true },
    })

    if (!artisan) {
      throw new Error(`Utilisateur non trouvé: ${email}`)
    }

    const currentFeatures = (artisan.features as string[] | null) || []
    
    if (currentFeatures.includes(featureName)) {
      await prisma.artisan.update({
        where: { id: artisan.id },
        data: {
          features: currentFeatures.filter(f => f !== featureName),
        },
      })
      console.log(`✅ Feature "${featureName}" désactivée pour ${email}`)
    } else {
      console.log(`ℹ️ Feature "${featureName}" n'était pas activée pour ${email}`)
    }
  } catch (error) {
    console.error('Error disabling feature:', error)
    throw error
  }
}

/**
 * Récupère toutes les features activées pour l'utilisateur connecté
 * @returns Liste des features activées
 */
export async function getEnabledFeatures(): Promise<string[]> {
  try {
    const artisan = await getCurrentArtisan()
    
    if (!artisan) {
      return []
    }

    const artisanWithFeatures = await prisma.artisan.findUnique({
      where: { id: artisan.id },
      select: { features: true },
    })

    if (!artisanWithFeatures) {
      return []
    }

    const features = artisanWithFeatures.features as string[] | null
    return features && Array.isArray(features) ? features : []
  } catch (error) {
    console.error('Error getting features:', error)
    return []
  }
}

