#!/bin/bash
# Script de déploiement Heroku (save in deployment/deploy-heroku.sh)

set -e

echo "🚀 Déploiement sur Heroku..."

# Create app if doesn't exist
HEROKU_APP=${HEROKU_APP:-site-web-autisme}
if ! heroku apps | grep -q "$HEROKU_APP"; then
  echo "📦 Création app Heroku: $HEROKU_APP"
  heroku create $HEROKU_APP
fi

# Copy environment example
cp .env.example .env.heroku || echo "⚠️ .env.example non trouvé"

echo "⚙️ Configuration des variables d'environnement..."
heroku config:set PORT=3000 --app=$HEROKU_APP
heroku config:set SMTP_HOST=${SMTP_HOST:-smtp.gmail.com} --app=$HEROKU_APP
heroku config:set SMTP_PORT=${SMTP_PORT:-587} --app=$HEROKU_APP
heroku config:set ADMIN_USER=${ADMIN_USER:-admin} --app=$HEROKU_APP
heroku config:set ADMIN_PASS=${ADMIN_PASS:-changeme} --app=$HEROKU_APP
heroku config:set PUBLIC_URL=https://${HEROKU_APP}.herokuapp.com --app=$HEROKU_APP

echo "📤 Push vers Heroku..."
git push heroku main

echo "✅ Déploiement terminé!"
echo "📍 App: https://${HEROKU_APP}.herokuapp.com"
echo "⚠️  N'oubliez pas de configurer les variables SMTP_USER, SMTP_PASS, ADMIN_EMAIL"
echo "  heroku config:set SMTP_USER=votre-email@gmail.com SMTP_PASS=app-password --app=$HEROKU_APP"
