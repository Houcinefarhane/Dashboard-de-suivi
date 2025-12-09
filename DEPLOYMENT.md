# Guide de déploiement

Ce guide vous explique comment déployer l'application pour que chaque artisan puisse créer un compte, se connecter et accéder à ses données en temps réel.

## ✅ Ce qui est déjà en place

- ✅ Base de données Supabase configurée (multi-tenant)
- ✅ Système d'authentification (inscription + connexion)
- ✅ Isolation des données par artisan (artisanId)
- ✅ Routes API sécurisées
- ✅ Interface utilisateur complète

## 🚀 Étapes de déploiement

### 1. Préparer le projet

Assurez-vous que tout est commité et poussé sur GitHub :

```bash
git add .
git commit -m "Prêt pour le déploiement"
git push origin main
```

### 2. Déployer sur Vercel (recommandé)

Vercel est la plateforme recommandée pour Next.js car elle offre :
- Déploiement automatique depuis GitHub
- HTTPS automatique
- Variables d'environnement sécurisées
- Plan gratuit généreux

#### 2.1. Créer un compte Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Créez un compte (gratuit)
3. Connectez votre compte GitHub

#### 2.2. Importer le projet

1. Cliquez sur "Add New Project"
2. Sélectionnez votre repository GitHub : `Houcinefarhane/Dashboard-de-suivi`
3. Vercel détectera automatiquement Next.js

#### 2.3. Configurer les variables d'environnement

Dans la section "Environment Variables", ajoutez :

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-clé-anon
SUPABASE_SERVICE_ROLE_KEY=votre-clé-service-role
NEXTAUTH_SECRET=générez-avec-openssl-rand-base64-32
NEXTAUTH_URL=https://votre-domaine.vercel.app
```

**Important** :
- Remplacez `[PASSWORD]` par le mot de passe de votre base Supabase
- Remplacez `[PROJECT_REF]` par la référence de votre projet Supabase
- Pour `NEXTAUTH_SECRET`, générez une clé avec : `openssl rand -base64 32`
- Pour `NEXTAUTH_URL`, utilisez l'URL que Vercel vous donnera après le premier déploiement

#### 2.4. Déployer

1. Cliquez sur "Deploy"
2. Attendez la fin du déploiement (2-3 minutes)
3. Votre application sera accessible sur `https://votre-projet.vercel.app`

### 3. Alternative : Déployer sur Railway

Railway est une autre option populaire :

1. Allez sur [railway.app](https://railway.app)
2. Créez un compte
3. "New Project" → "Deploy from GitHub repo"
4. Sélectionnez votre repository
5. Ajoutez les variables d'environnement (même liste que ci-dessus)
6. Railway déploiera automatiquement

### 4. Vérifier le déploiement

Une fois déployé, testez :

1. **Page d'accueil** : `https://votre-domaine.com`
2. **Inscription** : `https://votre-domaine.com/auth/register`
   - Créez un nouveau compte artisan
   - Vérifiez que vous êtes redirigé vers le dashboard
3. **Connexion** : `https://votre-domaine.com/auth/login`
   - Connectez-vous avec le compte créé
   - Vérifiez l'accès au dashboard
4. **Données isolées** : 
   - Créez un deuxième compte
   - Vérifiez que chaque artisan ne voit que ses propres données

## 🔒 Sécurité en production

### Cookies sécurisés

Les cookies sont automatiquement sécurisés en production :
- `secure: true` (HTTPS uniquement)
- `httpOnly: true` (non accessible depuis JavaScript)
- `sameSite: 'lax'` (protection CSRF)

### Variables d'environnement

⚠️ **Ne jamais** commiter le fichier `.env` sur GitHub. Il est déjà dans `.gitignore`.

Toutes les variables sensibles doivent être configurées dans l'interface de votre hébergeur (Vercel, Railway, etc.).

## 📊 Monitoring

### Vérifier les logs

- **Vercel** : Dashboard → Votre projet → Logs
- **Railway** : Dashboard → Votre projet → Deployments → View Logs

### Vérifier la base de données

- **Supabase Dashboard** : Vérifiez que les nouveaux artisans sont créés
- **Prisma Studio** : `npx prisma studio` (en local, connecté à Supabase)

## 🐛 Dépannage

### Problème : Les cookies ne fonctionnent pas

**Solution** : Vérifiez que :
- `NEXTAUTH_URL` correspond exactement à votre domaine de production
- Le domaine est en HTTPS (Vercel le fait automatiquement)
- Les cookies sont bien définis avec `secure: true` en production

### Problème : Erreur de connexion à la base de données

**Solution** : Vérifiez que :
- `DATABASE_URL` est correcte dans les variables d'environnement
- Le mot de passe de la base Supabase est correct
- La base Supabase est accessible (pas de firewall bloquant)

### Problème : Les données ne s'affichent pas

**Solution** : Vérifiez que :
- L'artisan est bien connecté (cookie `artisanId` présent)
- Les routes API filtrent bien par `artisanId`
- Les logs du serveur pour voir les erreurs

## 🎯 Fonctionnalités disponibles après déploiement

Une fois déployé, chaque artisan peut :

1. **Créer un compte** : `/auth/register`
2. **Se connecter** : `/auth/login`
3. **Accéder à son dashboard** : `/dashboard`
4. **Gérer ses clients** : `/dashboard/clients`
5. **Planifier ses interventions** : `/dashboard/interventions`
6. **Créer des devis** : `/dashboard/devis`
7. **Générer des factures** : `/dashboard/factures`
8. **Suivre ses finances** : `/dashboard/finances`
9. **Gérer son stock** : `/dashboard/stock`
10. **Voir ses notifications** : `/dashboard/notifications`
11. **Utiliser la géolocalisation** : `/dashboard/geolocalisation`

Toutes les données sont **automatiquement isolées** par artisan grâce au système multi-tenant.

## 📈 Évolutivité

Avec Supabase gratuit (500 MB) :
- **~40 artisans** avec le même volume de données que les données de test
- **Plus d'artisans** si moins de données par artisan

Pour plus d'artisans, vous pouvez :
- Passer au plan payant Supabase
- Optimiser les données (archivage, compression)
- Nettoyer les anciennes données

## 🎉 C'est prêt !

Une fois déployé, votre application est prête à être utilisée par plusieurs artisans. Chaque artisan aura :
- Son propre compte isolé
- Ses propres données
- Accès en temps réel à toutes ses informations
- Interface moderne et intuitive

