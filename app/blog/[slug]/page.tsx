import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

const articles: Record<string, {
  title: string
  description: string
  content: string
  readTime: string
  date: string
  category: string
}> = {
  'comment-facturer-plus-rapidement-artisan': {
    title: 'Comment facturer 3x plus rapidement en tant qu\'artisan ?',
    description: 'Découvrez les 5 astuces pour créer vos factures en quelques clics et gagner 5 heures par semaine.',
    readTime: '5 min',
    date: '2026-01-05',
    category: 'Facturation',
    content: `
# Comment facturer 3x plus rapidement en tant qu'artisan ?

En tant qu'artisan, vous savez que la facturation peut prendre énormément de temps. Entre la création du document, la saisie des informations client, le calcul des montants et l'envoi, vous pouvez facilement perdre 5 à 10 heures par semaine.

## Les 5 astuces pour facturer plus rapidement

### 1. Utilisez un modèle de facture personnalisable

Un modèle de facture pré-rempli avec vos informations (logo, coordonnées, mentions légales) vous fait gagner 5 minutes par facture. Multiplié par 20 factures par semaine, c'est 100 minutes économisées.

### 2. Automatisez le calcul des montants

Un logiciel qui calcule automatiquement les totaux, la TVA et les remises vous évite les erreurs et vous fait gagner du temps. Plus besoin de vérifier vos calculs à la main.

### 3. Centralisez les informations clients

Avoir toutes les informations clients (nom, adresse, SIRET, etc.) déjà enregistrées vous évite de les ressaisir à chaque fois. Un simple clic pour sélectionner le client, et toutes les informations sont pré-remplies.

### 4. Exportez directement en PDF

Générer un PDF professionnel en un clic plutôt que de passer par Word ou Excel, c'est un gain de temps considérable. Votre facture est prête à être envoyée immédiatement.

### 5. Envoyez automatiquement par email

L'envoi automatique par email avec un suivi de lecture vous évite de devoir envoyer manuellement chaque facture. Vous savez quand le client a reçu et lu votre facture.

## Résultat : 5 heures économisées par semaine

En appliquant ces 5 astuces, vous pouvez facilement économiser 5 heures par semaine sur la facturation. C'est du temps que vous pouvez consacrer à votre cœur de métier : vos interventions.

## Comment Billiev vous aide

Billiev intègre toutes ces fonctionnalités dans une seule interface :
- Modèles de facture personnalisables
- Calcul automatique des montants
- Base de données clients centralisée
- Export PDF en un clic
- Envoi automatique par email

**Essai gratuit de 14 jours** - Sans engagement, sans carte bancaire.
    `,
  },
  'meilleur-outil-gratuit-gestion-artisan-2026': {
    title: 'Le meilleur outil gratuit pour gérer votre entreprise artisanale en 2026',
    description: 'Comparatif des solutions gratuites et payantes pour la gestion d\'entreprise artisanale. Quelle solution choisir ?',
    readTime: '8 min',
    date: '2026-01-04',
    category: 'Comparatif',
    content: `
# Le meilleur outil gratuit pour gérer votre entreprise artisanale en 2026

Vous cherchez un outil de gestion pour votre entreprise artisanale ? Entre les solutions gratuites limitées et les solutions payantes complètes, le choix peut être difficile.

## Les solutions gratuites : avantages et limites

### Avantages
- Gratuit (évidemment)
- Accessible rapidement
- Pas d'engagement

### Limites
- Fonctionnalités limitées
- Support souvent absent
- Publicités ou limitations de données
- Pas de personnalisation

## Les solutions payantes : investissement rentable

### Avantages
- Toutes les fonctionnalités
- Support dédié
- Mises à jour régulières
- Personnalisation complète
- Sécurité des données

### Inconvénient
- Coût mensuel ou annuel

## Notre recommandation : Billiev

Billiev propose un **essai gratuit de 14 jours** pour tester toutes les fonctionnalités sans engagement. Après l'essai, deux formules :

- **49€ HT/mois** : Abonnement flexible, résiliable à tout moment

### Pourquoi choisir Billiev ?

1. **Tout-en-un** : Clients, Planning, Factures, Stock, Finances dans une seule interface
2. **Interface moderne** : Intuitive, pas besoin de formation
3. **Support réactif** : Réponse sous 24h
4. **Sécurité** : Vos données sont protégées et sauvegardées régulièrement

## Conclusion

Si vous cherchez une solution gratuite pour tester, les outils gratuits peuvent suffire temporairement. Mais pour une gestion professionnelle et complète de votre entreprise, investir dans une solution payante comme Billiev est un choix rentable qui vous fait gagner du temps et de l'argent sur le long terme.

**Testez Billiev gratuitement pendant 14 jours** - Aucune carte bancaire requise.
    `,
  },
  'comment-organiser-planning-interventions': {
    title: 'Comment organiser son planning d\'interventions sans rien oublier ?',
    description: 'Guide complet pour optimiser votre planning et ne plus jamais oublier un rendez-vous client.',
    readTime: '6 min',
    date: '2026-01-03',
    category: 'Planning',
    content: `
# Comment organiser son planning d'interventions sans rien oublier ?

Oublier un rendez-vous client, c'est perdre un client. Voici comment organiser votre planning pour ne plus jamais rien oublier.

## Les 5 règles d'or du planning

### 1. Centralisez tout au même endroit

Ne pas avoir plusieurs calendriers (agenda papier, Google Calendar, notes sur le téléphone). Un seul outil centralisé évite les oublis.

### 2. Enregistrez immédiatement

Dès qu'un client vous appelle pour prendre rendez-vous, enregistrez-le immédiatement. Ne remettez pas à plus tard, vous risquez d'oublier.

### 3. Utilisez les rappels automatiques

Configurez des rappels automatiques 24h et 2h avant chaque intervention. Vous serez toujours prévenu à temps.

### 4. Géolocalisez vos interventions

Avoir la géolocalisation de chaque intervention vous permet d'optimiser vos trajets et de ne pas vous perdre.

### 5. Consultez votre planning chaque matin

Prenez 5 minutes chaque matin pour consulter votre planning de la journée. Vous serez préparé et organisé.

## Les outils qui vous aident

### Calendrier papier
- ✅ Simple
- ❌ Pas de rappels
- ❌ Pas de géolocalisation
- ❌ Difficile à partager

### Google Calendar
- ✅ Gratuit
- ✅ Rappels
- ❌ Pas adapté aux interventions
- ❌ Pas de gestion clients intégrée

### Logiciel spécialisé (Billiev)
- ✅ Tout-en-un
- ✅ Rappels automatiques
- ✅ Géolocalisation
- ✅ Gestion clients intégrée
- ✅ Photos avant/après
- ✅ Statuts en temps réel

## Conclusion

Pour ne plus jamais oublier un rendez-vous, centralisez votre planning dans un outil adapté aux artisans. Billiev vous permet de gérer toutes vos interventions avec rappels automatiques, géolocalisation et suivi en temps réel.

**Testez Billiev gratuitement** - Planning optimisé en quelques minutes.
    `,
  },
}

export async function generateStaticParams() {
  return Object.keys(articles).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = articles[params.slug]
  
  if (!article) {
    return {
      title: 'Article non trouvé | Billiev',
    }
  }

  return {
    title: `${article.title} | Billiev Blog`,
    description: article.description,
    keywords: [
      'artisan',
      'gestion entreprise',
      article.category.toLowerCase(),
      'guide pratique',
      'conseils artisan',
    ],
  }
}

export default function BlogArticlePage({ params }: { params: { slug: string } }) {
  const article = articles[params.slug]

  if (!article) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 max-w-4xl py-6">
          <Link href="/blog">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au blog
            </Button>
          </Link>
          <div className="flex items-center gap-4 mb-3">
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
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            {article.title}
          </h1>
          <p className="text-lg text-gray-600">
            {article.description}
          </p>
        </div>
      </header>

      {/* Article Content */}
      <main className="container mx-auto px-4 max-w-4xl py-12">
        <article className="prose prose-lg max-w-none">
          <div className="text-gray-700 leading-relaxed whitespace-pre-line">
            {article.content.split('\n').map((line, i) => {
              if (line.startsWith('# ')) {
                return <h2 key={i} className="text-3xl font-bold text-gray-900 mt-8 mb-4">{line.substring(2)}</h2>
              }
              if (line.startsWith('## ')) {
                return <h3 key={i} className="text-2xl font-bold text-gray-900 mt-6 mb-3">{line.substring(3)}</h3>
              }
              if (line.startsWith('### ')) {
                return <h4 key={i} className="text-xl font-bold text-gray-900 mt-4 mb-2">{line.substring(4)}</h4>
              }
              if (line.startsWith('- ')) {
                return <li key={i} className="ml-4 mb-2">{line.substring(2)}</li>
              }
              if (line.trim() === '') {
                return <br key={i} />
              }
              if (line.startsWith('**') && line.endsWith('**')) {
                return <p key={i} className="font-semibold text-gray-900 my-4">{line.substring(2, line.length - 2)}</p>
              }
              return <p key={i} className="mb-4">{line}</p>
            })}
          </div>
        </article>

        {/* CTA */}
        <div className="mt-12 p-6 rounded-lg border-2" style={{ borderColor: 'rgb(150, 185, 220)', backgroundColor: 'rgba(150, 185, 220, 0.05)' }}>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Prêt à optimiser votre gestion ?
          </h3>
          <p className="text-gray-600 mb-4">
            Testez Billiev gratuitement pendant 14 jours. Aucune carte bancaire requise.
          </p>
          <Link href="/auth/register">
            <Button size="lg" style={{ backgroundColor: 'rgb(150, 185, 220)' }} className="text-white">
              Essayer gratuitement
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}

