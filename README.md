# Billiev

**L'ERP complet qui remplace 5 outils pour gérer votre entreprise artisanale**

Billiev est une solution de gestion intégrée qui centralise toute votre activité dans une seule interface moderne. Fini de jongler entre plusieurs outils : clients, planning, factures, stock et finances, tout est au même endroit.

🌐 Site web : https://billiev.com

## 🎯 Le problème que Billiev résout

En tant qu'artisan, vous perdez **10 à 15 heures par semaine** sur l'administration :
- 📅 **RDV oubliés** = clients perdus
- 📄 **Factures en retard** = trésorerie tendue
- 📊 **Suivi dispersé** = perte de temps
- 🗂️ **Plusieurs outils** = confusion et erreurs

## ✨ Ce que vous pouvez faire avec Billiev

### 👥 Gestion clients
- Base de données complète avec historique
- Recherche avancée et filtres
- Informations de contact centralisées
- Historique des interventions et factures

### 📅 Planning & Interventions
- Calendrier interactif avec vue mensuelle
- Géolocalisation des interventions
- Photos avant/après travaux
- Statuts en temps réel (à faire, en cours, terminé)
- Rappels automatiques

### 💰 Facturation
- Création de factures en quelques clics
- Export PDF professionnel
- Suivi des paiements
- Relances automatiques pour factures impayées
- Gestion de la TVA (20%, 10%, 5.5%, 0%)

### 📋 Devis
- Création de devis détaillés
- Conversion en facture en un clic
- Export PDF
- Suivi des validations

### 📦 Stock
- Gestion des produits et matériaux
- Alertes de seuil automatiques
- Suivi des mouvements
- Calcul des coûts

### 💵 Finances
- Tableaux de bord financiers en temps réel
- Graphiques de revenus et dépenses
- Objectifs OKR (Objectifs et Résultats Clés)
- Suivi de trésorerie
- Export CSV/PDF

### 📊 Analytics
- Statistiques en temps réel
- Heatmaps d'activité
- Tendances et prévisions
- Rapports personnalisables

## ⏱️ En quoi Billiev vous fait gagner du temps

- **10-15h/semaine économisées** : Plus besoin de jongler entre plusieurs outils
- **Facturation 3x plus rapide** : Création de factures en quelques clics
- **Zéro oubli de RDV** : Planning centralisé avec rappels
- **Suivi automatique** : Relances, alertes stock, notifications
- **Tout au même endroit** : Plus besoin d'ouvrir 5 applications différentes
- **Interface moderne** : Intuitive, pas besoin de formation

## 🛠️ Stack technique

- **Next.js 14** avec TypeScript
- **Tailwind CSS** pour le styling
- **Prisma** comme ORM
- **PostgreSQL** sur Supabase
- **React Query** pour le cache côté client
- **Framer Motion** pour les animations
- **NextAuth** pour l'authentification

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


## 🔔 Notifications intelligentes

Billiev vous alerte automatiquement sur :
- 📧 Factures impayées (relances automatiques)
- 📦 Stocks faibles (seuils personnalisables)
- 📅 Rendez-vous à venir
- 💰 Objectifs financiers atteints ou à risque
- ✅ Interventions à planifier

## 🔒 Sécurité

Vos données sont protégées par :
- Chiffrement des données
- Authentification sécurisée
- Sauvegardes régulières
- Conformité RGPD
- Accès protégé par mot de passe

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
