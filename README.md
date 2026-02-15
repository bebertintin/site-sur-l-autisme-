# Site d'information — Autisme (démo)

Ce dépôt contient un site informatif complet (HTML5/CSS3) et un backend de démonstration (Express + Node.js) pour gérer les propositions d'actualités avec authentification, email, et stockage persistant.

## Structure du projet

### Frontend (statique)
- **Pages principales** : `index.html`, `comprendre.html`, `types.html`, `ressources.html`, `contact.html`, `temoignages.html`, `faq.html`
- **Pages admin** : `admin.html` (soumettre des actualités), `moderation.html` (examiner/publier)
- **Pages de contenu** : `actualites.html` (affichage avec localStorage), `actualites-archive.html` (archive)
- **Style** : `style.css` (responsive, Flexbox/Grid, a11y)

### Backend (Node.js + Express)
- **API** :
  - `GET /api/news` — Récupère toutes les actualités (publiques)
  - `GET /api/admin/news` — Récupère les actualités (authentification requise)
  - `POST /api/news` — Crée une actualité (authentification optionnelle si `ADMIN_USER` défini)
- **Stockage** : Fichier JSON (`data/news.json`)
- **Email** : Nodemailer avec templates HTML personnalisés

## Tester localement

### Frontend seul
```bash
# Ouvrez index.html dans un navigateur
# ou utilisez Live Server (VS Code extension)
```

### Frontend + Backend complet
```bash
# 1. Installation
npm install

# 2. Créer un fichier .env (copié de .env.example)
cp .env.example .env
# Éditez .env avec vos variables

# 3. Démarrer le serveur
npm start
# Le serveur écoute sur http://localhost:3000

# 4. Accédez au site
# Frontend : http://localhost:3000/admin.html
# API : http://localhost:3000/api/news
```

## Configuration (Variables d'environnement)

Créez un fichier `.env` à la racine du projet en copiant `.env.example` :

### Serveur
- `PORT=3000` — Port d'écoute

### Email (SMTP, optionnel)
- `SMTP_HOST` — Ex. `smtp.gmail.com`
- `SMTP_PORT` — Ex. `587`
- `SMTP_SECURE` — `true` ou `false` (utiliser TLS)
- `SMTP_USER` — Identifiant SMTP
- `SMTP_PASS` — Mot de passe d'application SMTP
- `EMAIL_FROM` — Adresse d'expédition (ex. `noreply@exemple.com`)
- `ADMIN_EMAIL` — Adresse de l'administrateur (reçoit une copie)

Si ces variables ne sont **pas** définies, l'API fonctionne toujours mais n'enverra **pas** d'email.

### Authentification (Basic Auth, optionnel)
- `ADMIN_USER` — Nom d'utilisateur (ex. `admin`)
- `ADMIN_PASS` — Mot de passe (ex. `demo123`)

Si définis :
- `POST /api/news` exige Basic Auth
- `GET /api/admin/news` exige Basic Auth

Sinon, l'API est **publique**.

### URL publique
- `PUBLIC_URL` — URL du site déployé (ex. `https://monsite.com`)
  - Utilisée pour générer des liens dans les emails

## Authentification (Basic Auth)

### Client-side (dans `admin.html` ou `moderation.html`)
1. Entrez vos identifiants dans la section "Connexion administrateur"
2. Cliquez "Se connecter"
3. Les identifiants sont encodés en base64 et stockés dans `localStorage` (clé `adminAuth`)
4. Tous les appels `fetch()` ultérieurs incluent l'header `Authorization: Basic <token>`

### Server-side (dans `server.js`)
- Fonction `isAdminAuthenticated(req)` valide l'header `Authorization`
- Compare l'email/mot de passe à `process.env.ADMIN_USER` et `process.env.ADMIN_PASS`
- Répond avec statut **401** si invalide ou manquant

### Exemple : Test avec curl
```bash
# Sans auth → 200 (publique)
curl http://localhost:3000/api/news

# Avec auth → 401 (non autorisé)
curl http://localhost:3000/api/admin/news

# Avec good auth → 200 (données)
curl -H "Authorization: Basic $(echo -n 'admin:demo123' | base64)" \
  http://localhost:3000/api/admin/news
```

## Markdown dans les actualités

- L'admin peut cocher "Support Markdown" lors de la création
- Le système supporte :
  - **Gras** : `**texte**` ou `__texte__`
  - *Italique* : `*texte*` ou `_texte_`
  - Titres : `# H1`, `## H2`, `### H3`
  - Listes : `- item` ou `* item`
  - Lien : `[texte](url)`
  - Code : `` `code` ``
  - Blocs de code : ` ``` ... ``` `

Rendu JSON du stockage (exemple) :
```json
{
  "id": 1234567890,
  "title": "Mon actualité",
  "date": "2026-02-15",
  "content": "**Gras** et *italique*.",
  "notifyEmail": "moi@exemple.com"
}
```

## Workflow de modération

1. **Administrateur crée** une actualité dans `admin.html`
   - Validation automatique
   - Aperçu Markdown en temps réel
   - Stockage local (localStorage) automatique
   - Envoi optionnel au serveur via endpoint

2. **Administrateur examine** dans `moderation.html`
   - Affiche toutes les propositions locales (localStorage)
   - Buttons : Approuver → Archive | Rejeter → Supprimer | Publier → Serveur

3. **Actualités affichées** dans `actualites.html`
   - Propositions récentes (localStorage)
   - Lien vers `moderation.html` et `actualites-archive.html`

4. **Archive** dans `actualites-archive.html`
   - Actualités approuvées ou publiées

## Déploiement

### Type 1 : Frontend seul (GitHub Pages)

```bash
# 1. Créez un repo GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/votre-user/site-web-autisme.git
git branch -M main
git push -u origin main

# 2. Activez GitHub Pages (Settings → Pages)
#    - Source : Deploy from a branch
#    - Branch : gh-pages
#    - Folder : root

# 3. Un workflow GitHub Actions `.github/workflows/deploy-pages.yml` 
#    publie automtiquement le contenu statique sur gh-pages
```

Site accessible à : `https://votre-user.github.io/site-web-autisme/`

### Type 2 : Backend sur Heroku + Frontend sur GitHub Pages

#### Prérequis
- Compte Heroku
- `heroku-cli` installé
- Environnement Node.js + npm

#### Étapes

```bash
# 1. Créer l'app Heroku
heroku login
heroku create mon-app-autisme

# 2. Configurer les variables d'environnement
heroku config:set ADMIN_USER=admin ADMIN_PASS=demo123 --app mon-app-autisme
heroku config:set SMTP_HOST=smtp.gmail.com SMTP_PORT=587 SMTP_SECURE=false --app mon-app-autisme
heroku config:set SMTP_USER=votre@gmail.com SMTP_PASS="votre-pwd-app" --app mon-app-autisme
heroku config:set ADMIN_EMAIL=you@example.com PUBLIC_URL=https://mon-app-autisme.herokuapp.com --app mon-app-autisme

# 3. Déployer
git push heroku main

# 4. Vérifier
heroku open --app mon-app-autisme
```

Ou utiliser le script :
```bash
bash deploy-heroku.sh
```

backend accessible à : `https://mon-app-autisme.herokuapp.com/`

À partir de `admin.html` ou `moderation.html`, définissez l'endpoint :
```
https://mon-app-autisme.herokuapp.com/api/news
```

### Type 3 : Backend sur Vercel

**Note** : Vercel utilise un système de fichiers éphémère → `data/news.json` ne persistera **pas** entre déploiements. Préférez Heroku pour une production réelle.

```bash
vercel login
vercel
# Suivez les invites
```

Fichier `vercel.json` inclus configure les routes.

## Sécurité

### Production checklist
- ✅ Utilisez **HTTPS** partout (Heroku/Vercel le font automatiquement)
- ✅ Ne committez **jamais** de secrets (SMTP, auth). Utilisez les variables d'environnement de votre plateforme.
- ⚠️ Basic Auth n'est pas sûr sans HTTPS (identifiants visibles en base64)
- ⚠️ Le système de fichiers (`data/news.json`) n'est pas pensé pour évoluer—considérez une base de données pour la prod
- ⚠️ Validez/sanisez toutes les entrées utilisateur côté serveur (actuellement minimaliste)

## Remarques de développement

### Dépendances
- `express` — Framework web
- `cors` — Partage des ressources (CORS)
- `nodemailer` — Envoi d'email SMTP
- `dotenv` — Chargement des variables d'environnement

### Architecture
- **Pas de cadre frontend** (vanilla JS) → léger, sans dépendances
- **LocalStorage** pour les données client (optionnel)
- **Fichier JSON** pour le serveur (optionnel → base de données)
- **Email asynchrone** (non-bloquant)

### Améliorations futures
- Ajouter une base de données (MongoDB, PostgreSQL, etc.)
- Validation + sanitizing côté serveur plus robustes
- Rate limiting + logging
- Interface d'admin HTML côté serveur (actuellement client-side seul)
- Webhooks pour intégrations tierces
