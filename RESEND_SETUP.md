# Configuration de Resend pour l'envoi d'emails

## Qu'est-ce que Resend ?

Resend est un service d'envoi d'emails transactionnels. Il est utilisé dans cette application pour envoyer les emails de vérification lors de l'inscription.

## Plan gratuit

- **100 emails/jour** gratuitement
- Parfait pour commencer et tester
- Pas de carte bancaire requise

## Configuration

### 1. Créer un compte

1. Allez sur [resend.com](https://resend.com)
2. Créez un compte (gratuit)
3. Vérifiez votre email

### 2. Obtenir la clé API

1. Dans le dashboard Resend, allez dans "API Keys"
2. Cliquez sur "Create API Key"
3. Donnez un nom (ex: "Dashboard Artisan")
4. Copiez la clé API (elle ne sera affichée qu'une seule fois !)

### 3. Configurer dans le projet

Ajoutez dans votre fichier `.env` :

```env
RESEND_API_KEY="re_xxxxxxxxxxxxx"
RESEND_FROM_EMAIL="onboarding@resend.dev"
```

**En développement** : Vous pouvez utiliser `onboarding@resend.dev` (fourni par Resend)

**En production** : Configurez votre propre domaine :

1. Dans Resend → Domains
2. Ajoutez votre domaine (ex: `votredomaine.com`)
3. Suivez les instructions DNS pour vérifier le domaine
4. Mettez à jour `RESEND_FROM_EMAIL` avec votre domaine (ex: `noreply@votredomaine.com`)

### 4. Variables d'environnement pour Vercel

Lors du déploiement sur Vercel, ajoutez ces variables dans Settings → Environment Variables :

- `RESEND_API_KEY` : Votre clé API Resend
- `RESEND_FROM_EMAIL` : L'adresse email d'expéditeur

## Test

Pour tester l'envoi d'emails :

1. Créez un nouveau compte artisan
2. Vérifiez votre boîte de réception
3. Cliquez sur le lien de vérification
4. Vous devriez être automatiquement connecté

## Dépannage

### Les emails ne sont pas reçus

1. Vérifiez les spams
2. Vérifiez que `RESEND_API_KEY` est correcte
3. Vérifiez les logs dans Resend Dashboard → Logs
4. Vérifiez que `NEXTAUTH_URL` est correcte (pour générer les liens)

### Erreur "Invalid API key"

- Vérifiez que la clé API est correcte
- Vérifiez qu'elle n'a pas été révoquée dans Resend

### Erreur "Domain not verified"

- En production, vous devez vérifier votre domaine dans Resend
- En développement, utilisez `onboarding@resend.dev`

## Limites

- **Plan gratuit** : 100 emails/jour
- **Plan Pro** : À partir de $20/mois pour plus d'emails

Pour la plupart des applications, 100 emails/jour suffisent largement pour commencer.

