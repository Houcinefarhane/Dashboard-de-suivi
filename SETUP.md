# Guide de démarrage

## Installation

1. **Installer les dépendances :**
```bash
npm install
```

2. **Configurer la base de données :**
   - Créer un fichier `.env` à la racine du projet avec le contenu suivant :
   ```
   DATABASE_URL="file:./prisma/dev.db"
   NEXTAUTH_SECRET="your-secret-key-change-in-production"
   NEXTAUTH_URL="http://localhost:3000"
   ```

3. **Initialiser Prisma :**
```bash
npm run db:generate
npm run db:push
```

4. **Lancer le serveur de développement :**
```bash
npm run dev
```

5. **Ouvrir l'application :**
   - Accédez à [http://localhost:3000](http://localhost:3000)
   - Créez un compte depuis la page d'inscription
   - Connectez-vous et commencez à utiliser le dashboard

## Fonctionnalités disponibles

✅ **Dashboard principal** - Vue d'ensemble avec statistiques et insights intelligents
✅ **Gestion des clients** - CRUD complet avec recherche
✅ **Planning** - Calendrier interactif pour gérer les interventions
✅ **Factures** - Liste des factures (génération PDF à implémenter)
✅ **Finances** - Graphiques et analytics des revenus/dépenses
✅ **Stock** - Gestion du matériel avec alertes de stock faible

## Commandes utiles

- `npm run dev` - Lancer le serveur de développement
- `npm run build` - Construire pour la production
- `npm run db:studio` - Ouvrir Prisma Studio (interface graphique pour la DB)
- `npm run db:push` - Synchroniser le schéma avec la base de données

## Notes importantes

- La base de données SQLite est créée automatiquement dans `prisma/dev.db`
- Pour la production, changez `DATABASE_URL` vers PostgreSQL ou MySQL
- Changez `NEXTAUTH_SECRET` pour un secret aléatoire en production
- Les mots de passe sont hashés avec bcrypt

## Prochaines étapes

- Implémenter la génération PDF pour les factures
- Ajouter l'envoi d'emails pour les rappels
- Améliorer les insights IA avec de vraies analyses
- Ajouter l'export des données

