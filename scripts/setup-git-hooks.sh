#!/bin/bash
# Script pour installer les hooks Git de sécurité

echo "Installation des hooks Git de sécurité..."

# Créer le dossier hooks s'il n'existe pas
mkdir -p .git/hooks

# Copier le hook pre-commit
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh
# Hook Git pour empêcher les commits de données sensibles

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "Vérification des données sensibles avant commit..."

# Vérifier les URLs de base de données réelles
if git diff --cached | grep -qi "postgresql://postgres:[^@]*@db\.[a-z0-9]*\.supabase\.co"; then
    echo "${RED}ERREUR: URL de base de données détectée dans les fichiers à commiter !${NC}"
    echo "${YELLOW}Utilisez [PASSWORD] et [PROJECT_REF] dans le README, pas les vraies valeurs.${NC}"
    exit 1
fi

# Vérifier les clés API Stripe
if git diff --cached | grep -E "sk_(test|live)_[a-zA-Z0-9]{20,}"; then
    echo "${RED}ERREUR: Clé secrète Stripe détectée !${NC}"
    exit 1
fi

if git diff --cached | grep -E "pk_(test|live)_[a-zA-Z0-9]{20,}"; then
    echo "${RED}ERREUR: Clé publique Stripe détectée !${NC}"
    exit 1
fi

if git diff --cached | grep -E "whsec_[a-zA-Z0-9]{20,}"; then
    echo "${RED}ERREUR: Secret webhook Stripe détecté !${NC}"
    exit 1
fi

# Vérifier les clés Resend
if git diff --cached | grep -E "re_[a-zA-Z0-9]{20,}"; then
    echo "${RED}ERREUR: Clé API Resend détectée !${NC}"
    exit 1
fi

# Vérifier les fichiers .env
if git diff --cached --name-only | grep -E "\.env$|\.env\.[^e]"; then
    echo "${RED}ERREUR: Fichier .env détecté dans les fichiers à commiter !${NC}"
    echo "${YELLOW}Les fichiers .env ne doivent jamais être commités.${NC}"
    exit 1
fi

# Vérifier les mots de passe en dur
if git diff --cached | grep -iE "password\s*=\s*['\"][^'\"]{8,}['\"]"; then
    echo "${YELLOW}ATTENTION: Mot de passe potentiel détecté. Vérifiez que ce n'est pas un vrai mot de passe.${NC}"
fi

echo "${GREEN}Vérification terminée. Aucune donnée sensible détectée.${NC}"
exit 0
EOF

# Rendre le hook exécutable
chmod +x .git/hooks/pre-commit

echo "Hook pre-commit installé avec succès."
echo "Il vérifiera automatiquement les données sensibles avant chaque commit."

