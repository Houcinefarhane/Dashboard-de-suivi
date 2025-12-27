# Checklist de déploiement

## 1. Variables d'environnement de production

### Variables requises dans votre plateforme de déploiement (Vercel, etc.) :

```env
# Base de données Supabase
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key
SUPABASE_SERVICE_ROLE_KEY=votre-service-role-key

# Authentification
NEXTAUTH_SECRET=générez-une-clé-secrète-aléatoire
NEXTAUTH_URL=https://votre-domaine.com

# Email (Resend)
RESEND_API_KEY=votre-clé-api-resend
RESEND_FROM_EMAIL=noreply@votredomaine.com

# App URL
NEXT_PUBLIC_APP_URL=https://votre-domaine.com

# Options
SKIP_EMAIL_VERIFICATION=false
NODE_ENV=production
```

**Important :**
- Générez un `NEXTAUTH_SECRET` aléatoire : `openssl rand -base64 32`
- Configurez `NEXTAUTH_URL` avec votre domaine de production

## 2. Base de données

- [ ] Vérifier que toutes les migrations Prisma sont appliquées
- [ ] Tester la connexion à la base de données de production
- [ ] Vérifier que le schéma Prisma est à jour
- [ ] S'assurer que les index sont créés pour les performances

## 3. Build de production

- [ ] Tester le build localement : `npm run build`
- [ ] Vérifier qu'il n'y a pas d'erreurs de compilation
- [ ] Tester le build de production localement : `npm start`
- [ ] Vérifier que toutes les routes fonctionnent

## 4. Sécurité

- [ ] Vérifier que tous les fichiers `.env` sont dans `.gitignore`
- [ ] S'assurer qu'aucune clé API n'est dans le code
- [ ] Vérifier les permissions de la base de données
- [ ] Configurer les CORS si nécessaire
- [ ] Activer HTTPS (automatique sur Vercel)
- [ ] Vérifier les cookies sécurisés (secure: true en production)

## 5. Performance

- [ ] Optimiser les images (Next.js Image component)
- [ ] Vérifier le bundle size
- [ ] Activer la compression
- [ ] Configurer le caching si nécessaire
- [ ] Tester les performances avec Lighthouse

## 6. Configuration du déploiement

### Pour Vercel :

- [ ] Connecter votre dépôt GitHub à Vercel
- [ ] Configurer toutes les variables d'environnement
- [ ] Configurer le domaine personnalisé
- [ ] Configurer les redirections si nécessaire

### Pour autres plateformes :

- [ ] Configurer le serveur Node.js
- [ ] Configurer le reverse proxy (nginx, etc.)
- [ ] Configurer SSL/TLS
- [ ] Configurer les variables d'environnement

## 7. Tests

- [ ] Tester l'inscription d'un nouvel utilisateur
- [ ] Tester la connexion
- [ ] Tester toutes les fonctionnalités principales
- [ ] Tester sur mobile
- [ ] Tester les emails (vérification, etc.)

## 8. Monitoring et logs

- [ ] Configurer un service de monitoring (Sentry, LogRocket, etc.)
- [ ] Configurer les logs d'erreur
- [ ] Configurer les alertes pour les erreurs critiques

## 9. Documentation

- [ ] Documenter les variables d'environnement requises
- [ ] Documenter le processus de déploiement
- [ ] Documenter les procédures de rollback

## 10. Post-déploiement

- [ ] Vérifier que le site est accessible
- [ ] Tester toutes les fonctionnalités en production
- [ ] Vérifier les emails de production
- [ ] Configurer les sauvegardes de base de données
- [ ] Configurer les mises à jour automatiques si nécessaire

