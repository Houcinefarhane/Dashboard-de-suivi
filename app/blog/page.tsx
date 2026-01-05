import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Blog - Guides et Conseils pour Artisans | Billiev',
  description: 'Découvrez nos guides pratiques pour optimiser la gestion de votre entreprise artisanale : facturation, planning, gestion clients, stock et finances.',
  keywords: [
    'guide gestion artisan',
    'conseils facturation artisan',
    'optimiser planning artisan',
    'gestion entreprise artisanale',
    'astuces ERP artisan',
  ],
}

const articles = [
  {
    slug: 'comment-facturer-plus-rapidement-artisan',
    title: 'Comment facturer 3x plus rapidement en tant qu\'artisan ?',
    description: 'Découvrez les 5 astuces pour créer vos factures en quelques clics et gagner 5 heures par semaine.',
    readTime: '5 min',
    date: '2026-01-05',
    category: 'Facturation',
  },
  {
    slug: 'meilleur-outil-gratuit-gestion-artisan-2026',
    title: 'Le meilleur outil gratuit pour gérer votre entreprise artisanale en 2026',
    description: 'Comparatif des solutions gratuites et payantes pour la gestion d\'entreprise artisanale. Quelle solution choisir ?',
    readTime: '8 min',
    date: '2026-01-04',
    category: 'Comparatif',
  },
  {
    slug: 'comment-organiser-planning-interventions',
    title: 'Comment organiser son planning d\'interventions sans rien oublier ?',
    description: 'Guide complet pour optimiser votre planning et ne plus jamais oublier un rendez-vous client.',
    readTime: '6 min',
    date: '2026-01-03',
    category: 'Planning',
  },
  {
    slug: 'gerer-stock-materiaux-artisan',
    title: 'Comment gérer efficacement son stock de matériaux en tant qu\'artisan ?',
    description: 'Les meilleures pratiques pour éviter les ruptures de stock et optimiser vos commandes de matériaux.',
    readTime: '7 min',
    date: '2026-01-02',
    category: 'Stock',
  },
  {
    slug: 'logiciel-plombier-serrurier-electricien',
    title: 'Quel logiciel choisir pour plombier, serrurier ou électricien ?',
    description: 'Comparatif détaillé des solutions de gestion pour les métiers de l\'artisanat du bâtiment.',
    readTime: '10 min',
    date: '2026-01-01',
    category: 'Comparatif',
  },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 max-w-4xl py-6">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à l'accueil
            </Button>
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Blog & Guides Pratiques
          </h1>
          <p className="text-lg text-gray-600">
            Des conseils concrets pour optimiser la gestion de votre entreprise artisanale
          </p>
        </div>
      </header>

      {/* Articles List */}
      <main className="container mx-auto px-4 max-w-4xl py-12">
        <div className="space-y-6">
          {articles.map((article) => (
            <article
              key={article.slug}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
                  {article.category}
                </span>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(article.date).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {article.readTime}
                  </div>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {article.title}
              </h2>
              <p className="text-gray-600 mb-4">
                {article.description}
              </p>
              <Link href={`/blog/${article.slug}`}>
                <Button variant="outline">
                  Lire l'article
                </Button>
              </Link>
            </article>
          ))}
        </div>
      </main>
    </div>
  )
}

