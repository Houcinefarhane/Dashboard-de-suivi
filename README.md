# Dashboard Artisan

Application web de gestion pour plombiers, serruriers et artisans.

## 🚀 Stack Technique

- **Next.js 14** + **TypeScript** + **Tailwind CSS**
- **Prisma** + **PostgreSQL** (Supabase)
- **React Query** (cache), **Framer Motion** (animations)
- **NextAuth** (OAuth Google)

## 📦 Installation

```bash
# Installer les dépendances
npm install

# Configurer la base de données
npm run db:generate
npm run db:push

# Lancer le serveur
npm run dev
```

## ⚙️ Configuration

Créer un fichier `.env` à la racine :

```env
DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
NEXTAUTH_SECRET=générez-avec-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3010
GOOGLE_CLIENT_ID=votre-client-id
GOOGLE_CLIENT_SECRET=votre-client-secret
```

## 🌐 Déploiement Vercel

1. Connecter le dépôt GitHub à Vercel
2. Ajouter les variables d'environnement (Settings → Environment Variables)
3. Déploiement automatique

**Variables requises :**
- `DATABASE_URL` (format pooler Supabase avec `?pgbouncer=true`)
- `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (optionnel)

## 📋 Fonctionnalités

- Gestion clients, interventions, factures, devis
- Planning avec calendrier interactif
- Suivi financier avec graphiques et objectifs OKR
- Gestion stock avec alertes
- Authentification email/password + OAuth Google
- Export PDF, recherche globale, thème clair/sombre

## 🔒 Sécurité

- Rate limiting (5 tentatives / 15 min)
- Headers de sécurité (CSP, HSTS, X-Frame-Options)
- Logs sécurisés (pas d'infos sensibles en production)
- Authentification sur toutes les routes API
- Vérification d'appartenance (artisanId) systématique

## 📁 Structure

```
app/
  ├── api/          # Routes API
  ├── auth/         # Authentification
  └── dashboard/    # Pages dashboard
components/          # Composants React
lib/                # Utilitaires (auth, prisma, logger)
prisma/             # Schéma DB
```

## 🧪 Données de test

```bash
npm run db:seed
```

Génère 50 clients, 60 factures, 120 interventions, etc.

## 📄 Licence

Projet privé - Tous droits réservés
