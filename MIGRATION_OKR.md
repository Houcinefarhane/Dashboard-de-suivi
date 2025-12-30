# Migration pour les objectifs OKR

## ⚠️ Action requise : Mise à jour de la base de données

Pour activer les fonctionnalités d'objectifs OKR dans le module Finances, vous devez créer les nouvelles tables dans votre base de données Supabase.

## 🔧 Instructions

### Étape 1 : Ouvrir l'éditeur SQL Supabase

1. Connectez-vous à votre projet Supabase : https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Dans le menu de gauche, cliquez sur **SQL Editor**

### Étape 2 : Exécuter le script SQL

1. Cliquez sur **New query**
2. Copiez le contenu du fichier `prisma/migrations/add_okr_tables.sql`
3. Collez-le dans l'éditeur SQL
4. Cliquez sur **Run** (ou appuyez sur `Ctrl+Enter` / `Cmd+Enter`)

### Étape 3 : Vérifier la création des tables

Vous devriez voir un message de succès. Les tables suivantes ont été créées :

- ✅ `FinancialObjective` : Pour stocker les objectifs
- ✅ `KeyResult` : Pour stocker les résultats clés

### Étape 4 : Tester

1. Retournez sur votre application : https://dashboard-de-suivi.vercel.app/dashboard/finances
2. Cliquez sur le bouton **"Objectif"**
3. Remplissez le formulaire et créez votre premier objectif OKR !

## 📋 Que font ces tables ?

### FinancialObjective
Stocke vos objectifs financiers (mensuels ou annuels) :
- Titre et description
- Période (mensuel/annuel)
- Année et mois cible
- Statut (actif/complété/archivé)

### KeyResult
Stocke les résultats clés mesurables pour chaque objectif :
- Titre du résultat clé
- Métrique (revenus, bénéfice, dépenses, clients, interventions)
- Valeur cible et valeur actuelle
- Unité de mesure (€, %, unité, etc.)

## 🆘 En cas de problème

Si vous rencontrez une erreur, vérifiez que :
- Vous êtes bien connecté au bon projet Supabase
- Vous avez les droits d'administration sur le projet
- Les tables `Artisan` existent déjà (table de base créée lors de l'installation initiale)

Si l'erreur persiste, vous pouvez supprimer les tables et réessayer :

```sql
DROP TABLE IF EXISTS "KeyResult" CASCADE;
DROP TABLE IF EXISTS "FinancialObjective" CASCADE;
```

Puis relancez le script de création.

