# Dashboard Artisan

Application web pour la gestion d'activité des plombiers, serruriers et autres artisans.

## Fonctionnalités

- **Gestion des clients** - CRUD complet avec recherche
- **Planning** - Calendrier interactif pour les interventions
- **Devis et factures** - Génération automatique en PDF
- **Suivi financier** - Graphiques et analytics
- **Gestion du stock** - Alertes automatiques

## Technologies

- **Next.js 14** - Framework React
- **TypeScript** - Typage statique
- **Tailwind CSS** - Styling moderne
- **Framer Motion** - Animations fluides
- **Prisma** - ORM pour la base de données
- **PostgreSQL** - Base de données (hébergée sur Supabase)
- **Supabase** - Backend as a Service (base de données PostgreSQL)

## Installation

1. Installer les dépendances :
```bash
npm install
```

2. Installer les hooks Git de sécurité (recommandé) :
```bash
bash scripts/setup-git-hooks.sh
```

Les hooks empêchent automatiquement de commiter des données sensibles.

2. Configurer la base de données :
```bash
# Créer le fichier .env avec vos identifiants Supabase
# Voir la section Configuration ci-dessous

# Générer le client Prisma
npm run db:generate

# Créer la base de données
npm run db:push
```

### Configuration Supabase

1. Créer un compte sur [Supabase](https://supabase.com)
2. Créer un nouveau projet
3. Créer un fichier `.env` à la racine du projet et ajouter vos identifiants Supabase :
```env
DATABASE_URL=postgresql://postgres:[VOTRE_MOT_DE_PASSE]@db.[PROJECT_REF].supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key
SUPABASE_SERVICE_ROLE_KEY=votre-service-role-key
NEXTAUTH_SECRET=générez-une-clé-secrète-avec-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3010
RESEND_API_KEY=votre-clé-api-resend
RESEND_FROM_EMAIL=noreply@votredomaine.com
NEXT_PUBLIC_APP_URL=http://localhost:3010
SKIP_EMAIL_VERIFICATION=false
```

**IMPORTANT** : Le fichier `.env` est dans `.gitignore` et ne sera jamais commité sur GitHub. Toutes les données sensibles restent uniquement sur Supabase et dans votre fichier `.env` local.

### Déploiement

#### Sur Netlify (recommandé)

1. Créer un compte sur [Netlify](https://netlify.com)
2. Connecter votre dépôt GitHub
3. Configurer les paramètres de build :
   - Build command : `npm run build`
   - Publish directory : `.next`
4. Ajouter toutes les variables d'environnement dans Netlify (Settings → Environment variables) :
   - `DATABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXTAUTH_SECRET` (générer avec : `openssl rand -base64 32`)
   - `NEXTAUTH_URL` (votre URL Netlify : `https://votre-projet.netlify.app`)
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`
   - `NEXT_PUBLIC_APP_URL` (votre URL Netlify)
   - `SKIP_EMAIL_VERIFICATION=false`
   - `NODE_ENV=production`
5. Déployer

#### Sur Vercel (alternative)

1. Créer un compte sur [Vercel](https://vercel.com)
2. Connecter votre dépôt GitHub
3. Configurer les variables d'environnement
4. Déployer automatiquement

3. Lancer le serveur de développement :
```bash
npm run dev
```

4. Ouvrir [http://localhost:3010](http://localhost:3010)

## Design

Design moderne avec animations fluides, interface responsive et thème clair/sombre.

## Structure du projet

```
├── app/
│   ├── api/          # Routes API
│   ├── auth/         # Pages d'authentification
│   ├── dashboard/    # Pages du dashboard
│   └── layout.tsx    # Layout principal
├── components/       # Composants React
├── lib/             # Utilitaires et configuration
├── prisma/          # Schéma de base de données
└── public/          # Assets statiques
```

## Authentification

Un artisan = un compte. Les sessions sont gérées via des cookies sécurisés.

## Développement

Pour accéder à Prisma Studio (interface graphique pour la base de données) :
```bash
npm run db:studio
```

## Génération de données de test

Pour tester l'application avec des données de test :
```bash
npm run db:seed
```

Le script génère des centaines d'entrées (clients, interventions, factures, etc.).

Identifiants de connexion après le seed :
- Email: `test@artisan.com`
- Mot de passe: `password123`

Note : Le script utilise l'artisan existant ou crée un nouveau compte de test.

## Thème jour/nuit

Bouton de basculement jour/nuit dans la barre de navigation. Le choix est sauvegardé dans le navigateur.

## Licence

Ce projet est privé et destiné à la vente aux artisans.

