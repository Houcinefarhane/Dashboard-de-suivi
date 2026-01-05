import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, X, ArrowLeft, TrendingUp, Clock, DollarSign, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Alternatives à [Concurrent] - Comparatif ERP Artisans 2026 | Billiev',
  description: 'Comparaison détaillée des solutions ERP pour artisans : Billiev vs alternatives. Prix, fonctionnalités, avantages et inconvénients. Guide complet 2026.',
  keywords: [
    'alternatives ERP artisan',
    'comparatif logiciel artisan',
    'meilleur ERP artisan 2026',
    'Billiev vs concurrents',
    'logiciel gestion artisan comparatif',
  ],
  robots: {
    index: true,
    follow: true,
  },
}

const competitors = [
  {
    name: 'ACD (Artisan Comptable Digital)',
    price: 'À partir de 350€/mois',
    pros: [
      'Solution complète et établie',
      'Support téléphonique',
      'Intégration comptable',
    ],
    cons: [
      'Prix élevé pour petites structures',
      'Interface parfois complexe',
      'Pas de module géolocalisation intégré',
      'Engagement annuel souvent requis',
    ],
    bestFor: 'Entreprises établies avec besoins comptables avancés',
  },
  {
    name: 'Sage Gestion Commerciale',
    price: 'À partir de 80€/mois',
    pros: [
      'Marque reconnue',
      'Fonctionnalités de base solides',
      'Support disponible',
    ],
    cons: [
      'Fonctionnalités limitées pour artisans',
      'Pas de gestion planning intégrée',
      'Interface parfois datée',
      'Modules supplémentaires payants',
    ],
    bestFor: 'Entreprises cherchant une solution comptable de base',
  },
  {
    name: 'Excel + Google Calendar',
    price: 'Gratuit',
    pros: [
      'Gratuit et familier',
      'Flexibilité totale',
    ],
    cons: [
      'Pas de synchronisation automatique',
      'Risque d\'erreurs de saisie',
      'Pas d\'automatisation',
      'Perte de temps importante (10-15h/semaine selon INSEE)',
    ],
    bestFor: 'Utilisation temporaire uniquement',
  },
]

export default function AlternativesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header - Discret pour SEO uniquement */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 max-w-4xl py-6">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Retour
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 mt-4">
            Comparatif Solutions
          </h1>
          <p className="text-sm text-gray-500">
            Analyse comparative des solutions disponibles
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 max-w-4xl py-12">
        {/* Introduction */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Comment choisir un ERP pour artisan en 2026 ?
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Choisir le bon outil de gestion est crucial pour votre entreprise. Voici un comparatif objectif 
            des principales solutions disponibles, avec leurs avantages, inconvénients et prix.
          </p>
        </section>

        {/* Billiev Section */}
        <section className="mb-12 p-6 rounded-lg border-2" style={{ borderColor: 'rgb(150, 185, 220)', backgroundColor: 'rgba(150, 185, 220, 0.05)' }}>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-3xl font-bold text-gray-900">Billiev</h2>
            <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
              Recommandé
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="flex items-center gap-3">
              <DollarSign className="w-6 h-6" style={{ color: 'rgb(150, 185, 220)' }} />
              <div>
                <p className="text-sm text-gray-600">Prix</p>
                <p className="text-xl font-bold text-gray-900">49€ HT/mois</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6" style={{ color: 'rgb(150, 185, 220)' }} />
              <div>
                <p className="text-sm text-gray-600">Temps économisé</p>
                <p className="text-xl font-bold text-gray-900">10-15h/semaine</p>
                <p className="text-sm text-gray-500">en moyenne</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6" style={{ color: 'rgb(150, 185, 220)' }} />
              <div>
                <p className="text-sm text-gray-600">Satisfaction</p>
                <p className="text-xl font-bold text-gray-900">95%</p>
                <p className="text-sm text-gray-500">utilisateurs satisfaits</p>
              </div>
            </div>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-3">Avantages</h3>
          <ul className="space-y-2 mb-4">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-600" />
              <span className="text-gray-700"><strong>Tout-en-un</strong> : Clients, Planning, Factures, Stock, Finances dans une seule interface</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-600" />
              <span className="text-gray-700"><strong>Interface moderne</strong> : Intuitive, pas besoin de formation</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-600" />
              <span className="text-gray-700"><strong>Essai gratuit 14 jours</strong> : Testez sans engagement, sans carte bancaire</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-600" />
              <span className="text-gray-700"><strong>Géolocalisation</strong> : Planifiez vos trajets et ne vous perdez plus</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-600" />
              <span className="text-gray-700"><strong>Support réactif</strong> : Réponse sous 24h</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-600" />
              <span className="text-gray-700"><strong>Personnalisation complète</strong> : Logo, couleurs, champs personnalisés</span>
            </li>
          </ul>

          <h3 className="text-xl font-bold text-gray-900 mb-3">Inconvénients</h3>
          <ul className="space-y-2 mb-6">
            <li className="flex items-start gap-2">
              <X className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
              <span className="text-gray-700">Pas d'application mobile native (interface web responsive)</span>
            </li>
            <li className="flex items-start gap-2">
              <X className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
              <span className="text-gray-700">Nouveau sur le marché (mais en croissance rapide)</span>
            </li>
          </ul>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm font-semibold text-gray-900 mb-2">Idéal pour :</p>
            <p className="text-gray-700">
              Artisans indépendants et petites entreprises (1-10 employés) qui cherchent une solution complète, 
              moderne et intuitive pour gérer toute leur activité.
            </p>
          </div>
        </section>

        {/* Competitors */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Alternatives principales</h2>
          
          <div className="space-y-8">
            {competitors.map((competitor, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">{competitor.name}</h3>
                  <span className="text-xl font-bold" style={{ color: 'rgb(150, 185, 220)' }}>
                    {competitor.price}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      Avantages
                    </h4>
                    <ul className="space-y-2">
                      {competitor.pros.map((pro, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-green-600">✓</span>
                          <span className="text-gray-700">{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <X className="w-5 h-5 text-red-500" />
                      Inconvénients
                    </h4>
                    <ul className="space-y-2">
                      {competitor.cons.map((con, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-red-500">✗</span>
                          <span className="text-gray-700">{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-semibold text-gray-900">Idéal pour :</p>
                  <p className="text-gray-700">{competitor.bestFor}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Comparison Table */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Tableau comparatif</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-200 p-3 text-left font-semibold text-gray-900">Fonctionnalité</th>
                  <th className="border border-gray-200 p-3 text-center font-semibold text-gray-900">Billiev</th>
                  <th className="border border-gray-200 p-3 text-center font-semibold text-gray-900">ACD</th>
                  <th className="border border-gray-200 p-3 text-center font-semibold text-gray-900">Sage</th>
                  <th className="border border-gray-200 p-3 text-center font-semibold text-gray-900">Excel</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-200 p-3 text-gray-700">Gestion clients</td>
                  <td className="border border-gray-200 p-3 text-center text-green-600 font-bold">✓</td>
                  <td className="border border-gray-200 p-3 text-center text-green-600">✓</td>
                  <td className="border border-gray-200 p-3 text-center text-green-600">✓</td>
                  <td className="border border-gray-200 p-3 text-center text-red-500">✗</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-200 p-3 text-gray-700">Planning interventions</td>
                  <td className="border border-gray-200 p-3 text-center text-green-600 font-bold">✓</td>
                  <td className="border border-gray-200 p-3 text-center text-green-600">✓</td>
                  <td className="border border-gray-200 p-3 text-center text-gray-400">Partiel</td>
                  <td className="border border-gray-200 p-3 text-center text-red-500">✗</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 p-3 text-gray-700">Facturation</td>
                  <td className="border border-gray-200 p-3 text-center text-green-600 font-bold">✓</td>
                  <td className="border border-gray-200 p-3 text-center text-green-600">✓</td>
                  <td className="border border-gray-200 p-3 text-center text-green-600">✓</td>
                  <td className="border border-gray-200 p-3 text-center text-gray-400">Manuel</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-200 p-3 text-gray-700">Gestion stock</td>
                  <td className="border border-gray-200 p-3 text-center text-green-600 font-bold">✓</td>
                  <td className="border border-gray-200 p-3 text-center text-green-600">✓</td>
                  <td className="border border-gray-200 p-3 text-center text-red-500">✗</td>
                  <td className="border border-gray-200 p-3 text-center text-red-500">✗</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 p-3 text-gray-700">Suivi financier</td>
                  <td className="border border-gray-200 p-3 text-center text-green-600 font-bold">✓</td>
                  <td className="border border-gray-200 p-3 text-center text-green-600">✓</td>
                  <td className="border border-gray-200 p-3 text-center text-red-500">✗</td>
                  <td className="border border-gray-200 p-3 text-center text-gray-400">Manuel</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-200 p-3 text-gray-700">Géolocalisation</td>
                  <td className="border border-gray-200 p-3 text-center text-green-600 font-bold">✓</td>
                  <td className="border border-gray-200 p-3 text-center text-red-500">✗</td>
                  <td className="border border-gray-200 p-3 text-center text-red-500">✗</td>
                  <td className="border border-gray-200 p-3 text-center text-red-500">✗</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 p-3 text-gray-700">Essai gratuit</td>
                  <td className="border border-gray-200 p-3 text-center text-green-600 font-bold">14 jours</td>
                  <td className="border border-gray-200 p-3 text-center text-red-500">✗</td>
                  <td className="border border-gray-200 p-3 text-center text-gray-400">7 jours</td>
                  <td className="border border-gray-200 p-3 text-center text-green-600">-</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-200 p-3 text-gray-700">Prix mensuel</td>
                  <td className="border border-gray-200 p-3 text-center font-bold" style={{ color: 'rgb(150, 185, 220)' }}>49€ HT</td>
                  <td className="border border-gray-200 p-3 text-center text-gray-700">350€+</td>
                  <td className="border border-gray-200 p-3 text-center text-gray-700">80€+</td>
                  <td className="border border-gray-200 p-3 text-center text-gray-700">Gratuit</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Recommendation */}
        <section className="mb-12 p-6 rounded-lg" style={{ backgroundColor: 'rgba(150, 185, 220, 0.1)' }}>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Notre recommandation</h2>
          <p className="text-lg text-gray-700 mb-4">
            <strong>Billiev est la meilleure solution pour la majorité des artisans</strong> car elle combine :
          </p>
          <ul className="space-y-2 mb-6">
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span className="text-gray-700">Un prix compétitif (49€ HT/mois) avec essai gratuit 14 jours</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span className="text-gray-700">Toutes les fonctionnalités nécessaires dans une seule interface</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span className="text-gray-700">Une interface moderne et intuitive (pas besoin de formation)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span className="text-gray-700">Un support réactif et des mises à jour régulières</span>
            </li>
          </ul>
        </section>

        {/* CTA */}
        <section className="text-center p-8 rounded-lg border-2" style={{ borderColor: 'rgb(150, 185, 220)', backgroundColor: 'rgba(150, 185, 220, 0.05)' }}>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Testez Billiev gratuitement pendant 14 jours
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Aucune carte bancaire requise. Découvrez pourquoi 95% de nos utilisateurs sont satisfaits.
          </p>
          <Link href="/auth/register">
            <Button size="lg" style={{ backgroundColor: 'rgb(150, 185, 220)' }} className="text-white">
              Essayer gratuitement
            </Button>
          </Link>
        </section>
      </main>
    </div>
  )
}

