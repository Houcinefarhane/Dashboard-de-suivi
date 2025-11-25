# Guide de déploiement - URL publique permanente

## Option 1 : Déploiement sur Vercel (Recommandé - Gratuit et permanent)

### Étapes :

1. **Créer un compte Vercel** (gratuit)
   - Aller sur https://vercel.com
   - Se connecter avec GitHub/GitLab/Bitbucket

2. **Installer Vercel CLI** :
   ```bash
   npm i -g vercel
   ```

3. **Se connecter à Vercel** :
   ```bash
   vercel login
   ```

4. **Déployer l'application** :
   ```bash
   vercel
   ```
   
   Suivre les instructions :
   - Choisir le projet
   - Configurer les variables d'environnement (DATABASE_URL, etc.)
   - Vercel détectera automatiquement Next.js

5. **Configurer la base de données** :
   - Pour la production, utilisez une base PostgreSQL (gratuite sur Supabase, Railway, ou Neon)
   - Ajoutez `DATABASE_URL` dans les variables d'environnement Vercel

6. **Votre URL permanente sera** :
   ```
   https://votre-projet.vercel.app
   ```

### Avantages :
- ✅ URL permanente et gratuite
- ✅ HTTPS automatique
- ✅ Déploiement automatique à chaque push Git
- ✅ Optimisé pour Next.js
- ✅ CDN global

---

## Option 2 : Tunnel Cloudflare nommé (URL personnalisée)

Pour une URL personnalisée avec Cloudflare :

1. **Se connecter à Cloudflare** :
   ```bash
   cloudflared tunnel login
   ```

2. **Créer un tunnel nommé** :
   ```bash
   cloudflared tunnel create artisan-dashboard
   ```

3. **Configurer le tunnel** :
   ```bash
   cloudflared tunnel route dns artisan-dashboard votre-domaine.com
   ```

4. **Lancer le tunnel** :
   ```bash
   cloudflared tunnel run artisan-dashboard
   ```

---

## Option 3 : ngrok (Alternative simple)

1. **Installer ngrok** :
   ```bash
   brew install ngrok
   # ou télécharger depuis https://ngrok.com
   ```

2. **Créer un compte** (gratuit) sur https://ngrok.com

3. **Configurer votre token** :
   ```bash
   ngrok config add-authtoken VOTRE_TOKEN
   ```

4. **Lancer le tunnel** :
   ```bash
   ngrok http 3000
   ```

5. **URL générée** (exemple) :
   ```
   https://abc123.ngrok-free.app
   ```

---

## Option 4 : Tunnel Cloudflare temporaire (Actuel)

Le tunnel actuel fonctionne mais change à chaque redémarrage :

```bash
npm run tunnel
```

**URL actuelle** : `https://chorus-introductory-signed-looking.trycloudflare.com`

---

## Recommandation

Pour une **URL permanente et professionnelle**, utilisez **Vercel** (Option 1). C'est gratuit, optimisé pour Next.js, et vous obtiendrez une URL du type :
```
https://dashboard-artisan.vercel.app
```

