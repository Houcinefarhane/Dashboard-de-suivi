# Gestion Pro

ERP (Enterprise Resource Planning) complet pour tous types d'entreprises. Solution de gestion intégrée permettant de gérer l'ensemble de votre activité : clients, rendez-vous, factures, devis, stock, finances, planning et bien plus.

## Technologies utilisées

- Next.js 14 avec TypeScript
- Tailwind CSS pour le styling
- Prisma comme ORM
- PostgreSQL sur Supabase
- React Query pour le cache côté client
- Framer Motion pour les animations
- NextAuth pour l'authentification (email/password + OAuth Google)

## Installation

D'abord installer les dépendances :

```bash
npm install
```

Ensuite configurer la base de données :

```bash
npm run db:generate
npm run db:push
```

Puis lancer le serveur de développement :

```bash
npm run dev
```

L'application sera accessible sur http://localhost:3010

## Configuration

Il faut créer un fichier `.env` à la racine du projet avec les variables suivantes :

```env
DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
NEXTAUTH_SECRET=générez-avec-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3010
GOOGLE_CLIENT_ID=votre-client-id
GOOGLE_CLIENT_SECRET=votre-client-secret
```

Pour `DATABASE_URL`, utiliser le format pooler Supabase avec le port 6543 et `?pgbouncer=true` pour éviter les problèmes de connexion en production.

Pour `NEXTAUTH_SECRET`, générer une clé avec :
```bash
openssl rand -base64 32
```

Les variables `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET` sont optionnelles si tu n'utilises pas l'authentification Google.

## Déploiement sur Vercel

1. Connecter le dépôt GitHub à Vercel
2. Aller dans Settings → Environment Variables
3. Ajouter toutes les variables du `.env`
4. Le déploiement se fait automatiquement

Important : pour `DATABASE_URL` en production, utiliser le format pooler Supabase avec `?pgbouncer=true`. Pour `NEXTAUTH_URL`, mettre l'URL de ton déploiement Vercel.

## Modules ERP

- **Gestion clients** : Base de données complète avec recherche avancée et historique
- **Planning & Interventions** : Calendrier interactif avec vue mensuelle et géolocalisation
- **Facturation** : Création, suivi et export PDF des factures avec relances automatiques
- **Devis** : Gestion complète des devis avec conversion en factures
- **Finances** : Tableaux de bord financiers, graphiques, objectifs OKR et suivi de trésorerie
- **Stock** : Gestion des produits avec alertes de seuil et suivi des mouvements
- **Notifications** : Système d'alertes pour factures impayées, stocks faibles, rendez-vous
- **Analytics** : Tableaux de bord avec statistiques en temps réel et heatmaps d'activité
- **Sécurité** : Authentification multi-facteurs, rate limiting, headers de sécurité

## Sécurité

Le projet inclut plusieurs mesures de sécurité :

- Rate limiting sur les routes d'authentification (5 tentatives max toutes les 15 minutes)
- Headers de sécurité HTTP (CSP, HSTS, X-Frame-Options, etc.)
- Logs sécurisés qui n'exposent pas d'informations sensibles en production
- Authentification requise sur toutes les routes API
- Vérification systématique que les ressources appartiennent à l'utilisateur connecté

## Structure du projet

```
app/
  ├── api/          # Routes API
  ├── auth/         # Pages d'authentification
  └── dashboard/    # Pages du dashboard
components/          # Composants React réutilisables
lib/                # Utilitaires (auth, prisma, logger, etc.)
prisma/             # Schéma de base de données
```

## Données de test

Pour générer des données de test et tester l'application :

```bash
npm run db:seed
```

Cela génère environ 50 clients, 60 factures, 120 interventions, etc. Les identifiants de connexion après le seed sont :
- Email: `test@example.com`
- Mot de passe: `password123`

## Licence

Projet privé - Tous droits réservés
