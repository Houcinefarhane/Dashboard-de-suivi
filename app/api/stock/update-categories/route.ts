import { NextResponse } from 'next/server'
import { getCurrentArtisan } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Mapping des anciennes catégories vers les nouvelles
const CATEGORY_MAPPING: Record<string, string> = {
  // Anciennes catégories spécifiques → Nouvelles catégories génériques
  'Vis': 'Matériel',
  'Boulons': 'Matériel',
  'Clés': 'Outillage',
  'Écrous': 'Matériel',
  'Rondelles': 'Matériel',
  'Tuyaux': 'Matériel',
  'Raccords': 'Matériel',
  'Colliers': 'Matériel',
  'Joint': 'Matériel',
  'Robinet': 'Équipement',
  'Vanne': 'Équipement',
  'Serrure': 'Équipement',
  'Cylindre': 'Pièces détachées',
  'Gond': 'Pièces détachées',
  'Pêne': 'Pièces détachées',
  // Catégories courantes qu'on pourrait trouver
  'outils': 'Outillage',
  'Outils': 'Outillage',
  'plomberie': 'Matériel',
  'Plomberie': 'Matériel',
  'serrurerie': 'Équipement',
  'Serrurerie': 'Équipement',
  'électricité': 'Équipement',
  'Électricité': 'Équipement',
}

// Nouvelles catégories valides
const VALID_CATEGORIES = [
  'Matériel',
  'Fournitures',
  'Outillage',
  'Équipement',
  'Consommables',
  'Pièces détachées',
  'Accessoires',
  'Produits finis',
  'Matières premières',
  'Emballage',
  'Informatique',
  'Bureau',
  'Maintenance',
  'Sécurité',
  'Nettoyage',
  'Autre',
]

export async function POST(request: Request) {
  try {
    const artisan = await getCurrentArtisan()

    if (!artisan) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Récupérer tous les items de stock de l'artisan
    const allItems = await prisma.stockItem.findMany({
      where: { artisanId: artisan.id },
      select: { id: true, category: true },
    })

    let updatedCount = 0
    let mappedCount = 0
    let invalidCount = 0

    for (const item of allItems) {
      if (!item.category) {
        // Pas de catégorie, on laisse tel quel
        continue
      }

      // Vérifier si la catégorie est déjà valide
      if (VALID_CATEGORIES.includes(item.category)) {
        continue
      }

      // Essayer de mapper l'ancienne catégorie
      const normalizedCategory = item.category.trim()
      const newCategory = CATEGORY_MAPPING[normalizedCategory] || 'Autre'

      // Mettre à jour l'item
      await prisma.stockItem.update({
        where: { id: item.id },
        data: { category: newCategory },
      })

      if (CATEGORY_MAPPING[normalizedCategory]) {
        mappedCount++
      } else {
        invalidCount++
      }
      updatedCount++
    }

    return NextResponse.json({
      success: true,
      totalItems: allItems.length,
      updated: updatedCount,
      mapped: mappedCount,
      setToOther: invalidCount,
      message: `${updatedCount} catégories mises à jour (${mappedCount} mappées, ${invalidCount} mises à "Autre")`,
    })
  } catch (error) {
    console.error('Error updating stock categories:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour des catégories' },
      { status: 500 }
    )
  }
}

