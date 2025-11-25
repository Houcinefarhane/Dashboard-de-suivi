# Dashboard Artisan

Une application web moderne et élégante pour gérer l'activité des plombiers, serruriers et autres artisans.

## 🚀 Fonctionnalités

- ✅ **Gestion des clients** - CRUD complet avec recherche
- 📅 **Planning intelligent** - Calendrier interactif pour les interventions
- 📄 **Devis et factures** - Génération automatique en PDF
- 💰 **Suivi financier** - Graphiques et analytics
- 📦 **Gestion du stock** - Alertes automatiques
- 🤖 **Insights intelligents** - Suggestions basées sur l'IA

## 🛠️ Technologies

- **Next.js 14** - Framework React
- **TypeScript** - Typage statique
- **Tailwind CSS** - Styling moderne
- **Framer Motion** - Animations fluides
- **Prisma** - ORM pour la base de données
- **SQLite** - Base de données (facilement migrable vers PostgreSQL)

## 📦 Installation

1. Installer les dépendances :
```bash
npm install
```

2. Configurer la base de données :
```bash
# Créer le fichier .env
cp .env.example .env

# Générer le client Prisma
npm run db:generate

# Créer la base de données
npm run db:push
```

3. Lancer le serveur de développement :
```bash
npm run dev
```

4. Ouvrir [http://localhost:3000](http://localhost:3000)

## 🎨 Design

L'application utilise un design moderne inspiré d'Apple et de sites premium comme celui de Lando Norris, avec :
- Animations fluides avec Framer Motion
- Design responsive (mobile, tablette, desktop)
- Interface utilisateur intuitive
- Thème clair/sombre

## 📝 Structure du projet

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

## 🔐 Authentification

L'authentification est simple : un artisan = un compte. Les sessions sont gérées via des cookies sécurisés.

## 🚧 Développement

Pour accéder à Prisma Studio (interface graphique pour la base de données) :
```bash
npm run db:studio
```

## 🌱 Génération de données de test

Pour tester l'application avec beaucoup de données (centaines d'entrées) :
```bash
npm run db:seed
```

Ce script génère :
- **500 clients**
- **200 items de stock**
- **800 interventions**
- **400 devis**
- **600 factures**
- **300 dépenses**
- **200 notifications**

**Identifiants de connexion après le seed :**
- Email: `test@artisan.com`
- Mot de passe: `password123`

> ⚠️ **Attention** : Le script utilise l'artisan existant ou crée un nouveau compte de test. Les données sont ajoutées aux données existantes.

## 🌓 Thème jour/nuit

L'application dispose d'un bouton de basculement jour/nuit dans la barre de navigation :
- Cliquez sur l'icône ☀️/🌙 pour changer de thème
- Le choix est sauvegardé dans le navigateur (localStorage)
- Le thème est appliqué automatiquement au prochain chargement

## 📄 Licence

Ce projet est privé et destiné à la vente aux artisans.

