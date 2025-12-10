# 🌐 Configurer un domaine dans Resend pour envoyer à toutes les adresses

## Pourquoi ?

Resend en mode test (`onboarding@resend.dev`) ne permet d'envoyer qu'à votre adresse email de compte. Pour envoyer à **toutes les adresses**, vous devez **vérifier votre propre domaine**.

## Étapes pour configurer un domaine

### Option 1 : Utiliser un domaine que vous possédez

Si vous avez un domaine (ex: `votredomaine.com`, `monsite.fr`, etc.) :

1. **Allez sur [resend.com/domains](https://resend.com/domains)**
2. Cliquez sur **"Add Domain"**
3. Entrez votre domaine (ex: `votredomaine.com`)
4. Resend vous donnera des **enregistrements DNS** à ajouter :
   - Un enregistrement TXT pour la vérification
   - Un enregistrement SPF
   - Un enregistrement DKIM
5. **Ajoutez ces enregistrements dans votre hébergeur de domaine** (ex: OVH, Namecheap, GoDaddy, etc.)
6. Attendez la vérification (quelques minutes à quelques heures)
7. Une fois vérifié, mettez à jour `.env` :
   ```env
   RESEND_FROM_EMAIL="noreply@votredomaine.com"
   ```

### Option 2 : Utiliser un sous-domaine gratuit

Si vous n'avez pas de domaine, vous pouvez utiliser un sous-domaine gratuit :

1. **Créez un compte sur [Freenom](https://www.freenom.com)** (domaines gratuits .tk, .ml, .ga, .cf, .gq)
   OU utilisez un service comme [No-IP](https://www.noip.com) pour un sous-domaine gratuit
2. Suivez les mêmes étapes que l'Option 1

### Option 3 : Utiliser un service de domaine temporaire (pour tests)

Pour tester rapidement, vous pouvez utiliser :
- **Mailtrap** (pour les tests uniquement)
- **Ethereal Email** (génère des emails de test)
- Ou simplement continuer avec `SKIP_EMAIL_VERIFICATION` en développement

## Configuration après vérification du domaine

Une fois votre domaine vérifié dans Resend :

1. **Mettez à jour `.env`** :
   ```env
   RESEND_FROM_EMAIL="noreply@votredomaine.com"
   SKIP_EMAIL_VERIFICATION="false"  # Réactiver la vérification
   ```

2. **Redémarrez le serveur**

3. **Testez** : Créez un compte avec n'importe quelle adresse email - l'email devrait arriver !

## Vérification

Pour vérifier que votre domaine est bien configuré :
1. Allez dans Resend Dashboard → Domains
2. Vérifiez que votre domaine a le statut **"Verified"** (vérifié)
3. Si c'est "Pending" (en attente), vérifiez que les enregistrements DNS sont corrects

## Aide pour les enregistrements DNS

Les enregistrements DNS ressemblent à ça :

```
Type: TXT
Name: @ (ou votre-domaine.com)
Value: (valeur fournie par Resend)

Type: TXT  
Name: _resend
Value: (valeur fournie par Resend)

Type: CNAME
Name: (fourni par Resend)
Value: (fourni par Resend)
```

**Important** : Les changements DNS peuvent prendre jusqu'à 48h, mais généralement c'est quelques minutes.

