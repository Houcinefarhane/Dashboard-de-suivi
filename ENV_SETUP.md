# Configuration des variables d'environnement

Ce fichier documente les variables d'environnement nécessaires pour faire fonctionner l'application.

## Fichier .env

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```env
# Database - Supabase PostgreSQL
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT_REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"

# NextAuth (pour la production)
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3010"

# Resend - Envoi d'emails (pour la vérification d'email)
RESEND_API_KEY="your-resend-api-key"
RESEND_FROM_EMAIL="noreply@votredomaine.com"
```

## Comment obtenir ces valeurs

### 1. DATABASE_URL

1. Allez sur votre projet Supabase
2. Settings → Database
3. Copiez la "Connection string" (URI)
4. Remplacez `[PASSWORD]` par le mot de passe de votre base de données
5. Remplacez `[PROJECT_REF]` par la référence de votre projet

### 2. NEXT_PUBLIC_SUPABASE_URL

1. Dans Supabase Dashboard
2. Settings → API
3. Copiez l'URL du projet (ex: `https://xxxxx.supabase.co`)

### 3. NEXT_PUBLIC_SUPABASE_ANON_KEY

1. Dans Supabase Dashboard
2. Settings → API
3. Copiez la clé "anon" (publique)

### 4. SUPABASE_SERVICE_ROLE_KEY

1. Dans Supabase Dashboard
2. Settings → API
3. Copiez la clé "service_role" (secrète - à ne jamais exposer côté client)

### 5. NEXTAUTH_SECRET

Générez une clé secrète avec :
```bash
openssl rand -base64 32
```

### 6. NEXTAUTH_URL

- En développement : `http://localhost:3010`
- En production : l'URL de votre application déployée

### 7. RESEND_API_KEY

1. Créer un compte sur [Resend](https://resend.com) (gratuit jusqu'à 100 emails/jour)
2. Aller dans "API Keys"
3. Créer une nouvelle clé API
4. Copier la clé et l'ajouter dans `.env`

### 8. RESEND_FROM_EMAIL

- En développement : Vous pouvez utiliser `onboarding@resend.dev` (fourni par Resend)
- En production : Utilisez votre propre domaine (ex: `noreply@votredomaine.com`)
  - Pour utiliser votre domaine, configurez-le dans Resend → Domains

## Sécurité

⚠️ **Important** : Le fichier `.env` est dans `.gitignore` et ne doit JAMAIS être commité sur Git.

Pour le déploiement (Vercel, etc.), ajoutez ces variables dans les paramètres d'environnement de votre hébergeur.

