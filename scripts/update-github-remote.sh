#!/bin/bash

# Script pour mettre à jour le remote Git après le renommage du repository GitHub

echo "🔗 Mise à jour du remote Git vers 'billiev'..."
echo ""

# Mettre à jour le remote
git remote set-url origin git@github.com:Houcinefarhane/billiev.git

# Vérifier
echo "✅ Remote mis à jour :"
git remote -v

echo ""
echo "🧪 Test de connexion..."
git fetch origin --dry-run 2>&1 | head -3

echo ""
echo "✅ Si vous voyez 'Repository not found', le repository n'a pas encore été renommé sur GitHub."
echo "   → Allez sur https://github.com/Houcinefarhane/Dashboard-de-suivi/settings"
echo "   → Renommez en 'billiev'"
echo "   → Relancez ce script"

