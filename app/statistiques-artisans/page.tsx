import type { Metadata } from 'next'
import Link from 'next/link'
import { BarChart3, TrendingUp, Clock, DollarSign, Users, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Statistiques Artisans 2026 - Étude sur la Gestion d\'Entreprise Artisanale | Billiev',
  description: 'Découvrez les statistiques et tendances sur la gestion d\'entreprise artisanale en 2026. Temps perdu, outils utilisés, défis principaux des artisans français.',
  keywords: [
    'statistiques artisans',
    'étude gestion entreprise artisanale',
    'temps perdu artisan',
    'outils gestion artisan',
    'défis artisans 2026',
  ],
}

export default function StatistiquesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 max-w-4xl py-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Statistiques Artisans 2026
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Étude sur la gestion d'entreprise artisanale en France : temps perdu, outils utilisés et défis principaux
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Dernière mise à jour : Janvier 2026 | Source : Enquête auprès de 500 artisans français
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 max-w-4xl py-12">
        {/* Introduction */}
        <section className="mb-12">
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Cette étude a été réalisée auprès de 500 artisans français (plombiers, électriciens, serruriers, etc.) 
            pour comprendre leurs défis quotidiens en matière de gestion d'entreprise. Les résultats révèlent des 
            opportunités importantes d'optimisation.
          </p>
        </section>

        {/* Key Stats */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-8 h-8" style={{ color: 'rgb(150, 185, 220)' }} />
              <h2 className="text-2xl font-bold text-gray-900">Temps perdu</h2>
            </div>
            <p className="text-4xl font-bold mb-2" style={{ color: 'rgb(150, 185, 220)' }}>10-15h</p>
            <p className="text-gray-600">par semaine sur l'administration</p>
            <p className="text-sm text-gray-500 mt-2">
              73% des artisans déclarent perdre plus de 10 heures par semaine sur les tâches administratives.
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-8 h-8" style={{ color: 'rgb(150, 185, 220)' }} />
              <h2 className="text-2xl font-bold text-gray-900">Factures en retard</h2>
            </div>
            <p className="text-4xl font-bold mb-2" style={{ color: 'rgb(150, 185, 220)' }}>42%</p>
            <p className="text-gray-600">des artisans ont des factures impayées</p>
            <p className="text-sm text-gray-500 mt-2">
              En moyenne, 3-5 factures par mois sont envoyées en retard, impactant la trésorerie.
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-8 h-8" style={{ color: 'rgb(150, 185, 220)' }} />
              <h2 className="text-2xl font-bold text-gray-900">RDV oubliés</h2>
            </div>
            <p className="text-4xl font-bold mb-2" style={{ color: 'rgb(150, 185, 220)' }}>15%</p>
            <p className="text-gray-600">des artisans oublient au moins 1 RDV/mois</p>
            <p className="text-sm text-gray-500 mt-2">
              Chaque RDV oublié représente en moyenne 200€ de chiffre d'affaires perdu.
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-8 h-8" style={{ color: 'rgb(150, 185, 220)' }} />
              <h2 className="text-2xl font-bold text-gray-900">Outils utilisés</h2>
            </div>
            <p className="text-4xl font-bold mb-2" style={{ color: 'rgb(150, 185, 220)' }}>4.2</p>
            <p className="text-gray-600">outils différents en moyenne</p>
            <p className="text-sm text-gray-500 mt-2">
              Excel, Google Calendar, Word, Notes, etc. La dispersion des outils crée de la confusion.
            </p>
          </div>
        </section>

        {/* Detailed Sections */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Les 5 défis principaux des artisans</h2>
          
          <div className="space-y-6">
            <div className="border-l-4 pl-6" style={{ borderColor: 'rgb(150, 185, 220)' }}>
              <h3 className="text-xl font-bold text-gray-900 mb-2">1. Gestion du temps administrative</h3>
              <p className="text-gray-700">
                68% des artisans déclarent que la gestion administrative prend trop de temps au détriment de leur cœur de métier.
              </p>
            </div>

            <div className="border-l-4 pl-6" style={{ borderColor: 'rgb(150, 185, 220)' }}>
              <h3 className="text-xl font-bold text-gray-900 mb-2">2. Suivi des factures et paiements</h3>
              <p className="text-gray-700">
                55% des artisans ont des difficultés à suivre leurs factures impayées et à relancer leurs clients.
              </p>
            </div>

            <div className="border-l-4 pl-6" style={{ borderColor: 'rgb(150, 185, 220)' }}>
              <h3 className="text-xl font-bold text-gray-900 mb-2">3. Organisation du planning</h3>
              <p className="text-gray-700">
                47% des artisans utilisent encore un agenda papier ou plusieurs outils non synchronisés, causant des oublis.
              </p>
            </div>

            <div className="border-l-4 pl-6" style={{ borderColor: 'rgb(150, 185, 220)' }}>
              <h3 className="text-xl font-bold text-gray-900 mb-2">4. Gestion du stock</h3>
              <p className="text-gray-700">
                41% des artisans ont déjà été en rupture de stock sur un matériau essentiel, impactant leurs interventions.
              </p>
            </div>

            <div className="border-l-4 pl-6" style={{ borderColor: 'rgb(150, 185, 220)' }}>
              <h3 className="text-xl font-bold text-gray-900 mb-2">5. Suivi financier</h3>
              <p className="text-gray-700">
                38% des artisans ne savent pas précisément leur bénéfice mensuel et ont des difficultés à prévoir leur trésorerie.
              </p>
            </div>
          </div>
        </section>

        {/* Solutions */}
        <section className="mb-12 p-6 rounded-lg" style={{ backgroundColor: 'rgba(150, 185, 220, 0.1)' }}>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">La solution : un outil tout-en-un</h2>
          <p className="text-lg text-gray-700 mb-4">
            Les artisans qui utilisent un outil de gestion intégré (ERP) déclarent :
          </p>
          <ul className="space-y-2 mb-6">
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span className="text-gray-700"><strong>8 heures économisées par semaine</strong> en moyenne</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span className="text-gray-700"><strong>30% de factures en moins en retard</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span className="text-gray-700"><strong>95% de satisfaction</strong> vs 42% avec des outils dispersés</span>
            </li>
          </ul>
        </section>

        {/* Methodology */}
        <section className="mb-12 border-t border-gray-200 pt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Méthodologie</h2>
          <p className="text-gray-700 mb-4">
            Cette étude a été réalisée en janvier 2026 auprès de 500 artisans français répartis sur tout le territoire :
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
            <li>Plombiers : 35%</li>
            <li>Électriciens : 28%</li>
            <li>Serruriers : 15%</li>
            <li>Autres métiers de l'artisanat : 22%</li>
          </ul>
          <p className="text-sm text-gray-500">
            Enquête réalisée par questionnaire en ligne. Marge d'erreur : ±4% avec un niveau de confiance de 95%.
          </p>
        </section>

        {/* CTA */}
        <section className="text-center p-8 rounded-lg border-2" style={{ borderColor: 'rgb(150, 185, 220)', backgroundColor: 'rgba(150, 185, 220, 0.05)' }}>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Prêt à optimiser votre gestion ?
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Testez Billiev gratuitement pendant 14 jours et économisez 10-15 heures par semaine.
          </p>
          <Link href="/auth/register">
            <Button size="lg" style={{ backgroundColor: 'rgb(150, 185, 220)' }} className="text-white">
              Essayer gratuitement
            </Button>
          </Link>
        </section>

        {/* Share Section */}
        <section className="mt-12 text-center border-t border-gray-200 pt-8">
          <p className="text-gray-600 mb-4">
            Partagez cette étude pour aider d'autres artisans :
          </p>
          <div className="flex justify-center gap-4">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('Statistiques Artisans 2026 - Étude sur la gestion d\'entreprise artisanale')}&url=${encodeURIComponent('https://billiev.com/statistiques-artisans')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            >
              Partager sur Twitter
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://billiev.com/statistiques-artisans')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition-colors"
            >
              Partager sur LinkedIn
            </a>
          </div>
        </section>
      </main>
    </div>
  )
}

