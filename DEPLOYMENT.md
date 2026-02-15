# Checklist de déploiement — Site Autisme

## Phase 1 : Tests locaux ✅ (Complété)

- [x] npm install — 73 packages installés
- [x] npm start — Serveur Express sur http://localhost:3000
- [x] GET /api/news — Retourne [] (public, pas d'auth requise)
- [x] GET /api/admin/news — Retourne 401 sans auth, 200 avec auth (admin:demo123)
- [x] POST /api/news — Accepte les actualités avec auth
- [x] Stockage persistant — data/news.json contient l'item de test
- [x] Frontend pages — Tous les fichiers .html en place (index, comprendre, types, ressources, contact, temoignages, faq, actualites, actualites-archive, admin, moderation)
- [x] CSS responsive — style.css appliqué avec succès
- [x] Authentification locale — login/logout dans admin.html et moderation.html fonctionne

## Phase 2 : Préparation pour production

### Variables d'environnement (.env)
- [ ] Copier .env.example → .env
- [ ] Remplacer les valeurs d'exemple :
  - `ADMIN_USER` → Votre identifiant
  - `ADMIN_PASS` → Votre mot de passe sécurisé
  - `SMTP_HOST` → Votre serveur SMTP (ex. smtp.gmail.com)
  - `SMTP_PORT` → Port SMTP (ex. 587)
  - `SMTP_USER` → Votre email SMTP
  - `SMTP_PASS` → Mot de passe d'app SMTP
  - `ADMIN_EMAIL` → Email recevant les notifications
  - `PUBLIC_URL` → URL finale du site (ex. https://monsite.com)

**IMPORTANT** : Ne commitez **JAMAIS** le fichier `.env` avec des secrets (ajout automatique au .gitignore une fois commencé)

### Git & GitHub
- [ ] Initialiser repo git : `git init`
- [ ] Ajouter fichiers : `git add .`
- [ ] Premier commit : `git commit -m "Initial commit"`
- [ ] Créer repo sur GitHub (public pour GitHub Pages)
- [ ] Ajouter remote : `git remote add origin https://github.com/USER/REPO.git`
- [ ] Pusher : `git push -u origin main`

### GitHub Pages (Frontend)
- [ ] Vérifier que `.github/workflows/deploy-pages.yml` existe
- [ ] Sur GitHub → Settings → Pages
  - Branch : gh-pages
  - Folder : / (root)
- [ ] Premier push vers `main` déclenche le workflow automatiquement
- [ ] Vérifier le déploiement dans Actions tab
- [ ] Site accessible à : `https://USERNAME.github.io/REPO_NAME/`

### Heroku (Backend)
```bash
# 1. Installer Heroku CLI si absent
# 2. Authentification
heroku login

# 3. Créer l'app
heroku create mon-app-autisme

# 4. Configurer env vars (remplacer les valeurs !)
heroku config:set ADMIN_USER=admin ADMIN_PASS=MonPwd123 --app mon-app-autisme
heroku config:set SMTP_HOST=smtp.gmail.com SMTP_PORT=587 SMTP_SECURE=false --app mon-app-autisme
heroku config:set SMTP_USER=monmail@gmail.com SMTP_PASS="mdp-app-google" --app mon-app-autisme
heroku config:set ADMIN_EMAIL=admin@monsite.com PUBLIC_URL=https://mon-app-autisme.herokuapp.com --app mon-app-autisme

# 5. Déployer
git push heroku main

# 6. Vérifier
heroku open --app mon-app-autisme
heroku logs --app mon-app-autisme --tail
```

Ou utiliser le script :
```bash
bash deploy-heroku.sh
```

Backend accessible à : `https://mon-app-autisme.herokuapp.com/api/news`

## Phase 3 : Intégration frontend ↔ backend

### Dans admin.html
- [ ] Mettre à jour le champ "Endpoint" vers votre URL Heroku
  - Exemple : `https://mon-app-autisme.herokuapp.com/api/news`
- [ ] Tester l'envoi depuis admin.html vers le serveur
- [ ] Vérifier que les emails sont envoyés (si SMTP configuré)

### Dans moderation.html
- [ ] L'endpoint `/api/news` doit être accessible au public
- [ ] Les pages actualites.html et actualites-archive.html affichent les articles publiés

## Phase 4 : Vérifications finales

### Sécurité
- [ ] HTTPS activé (Heroku et GitHub Pages le font automatiquement)
- [ ] Variables sensibles (SMTP, auth) ne sont **pas** dans le code Git
- [ ] `.gitignore` inclut `.env` et `node_modules/`
- [ ] Passwords forts pour `ADMIN_USER` et `ADMIN_PASS`

### Fonctionnalités
- [ ] Frontend pages chargent correctement
- [ ] Navigation entre pages fonctionne
- [ ] admin.html peut se connecter et envoyer des actualités
- [ ] moderation.html peut examiner et publier
- [ ] Emails reçus correctement (si SMTP configuré)
- [ ] Actualités publiées apparaissent dans actualites.html

### Monitoring
- [ ] Heroku logs ne montrent pas d'erreurs
- [ ] GitHub Actions workflow est vert (✓)
- [ ] Site est accessible via l'URL GitHub Pages

## Phase 5 : Après déploiement

### Domaine personnalisé (optionnel)
- **GitHub Pages** : Settings → Custom domain
- **Heroku** : Apps → Domains → Add domain

### Maintenance
- Backups réguliers de data/news.json (Heroku déploie depuis Git)
- Rotation des mots de passe SMTP annuellement
- Monitoring des logs d'erreur Heroku

## Notes importantes

1. **Stockage** : data/news.json est sauvegardé dans Git → utiliser un repo privé ou une base de données pour plus de sécurité
2. **Email** : Nécessite un compte SMTP (Gmail avec app-password, ou SendGrid, MailChimp, etc.)
3. **Heroku gratuit** : Peut être lent au démarrage — passer à une dyno payante si nécessaire (actuellement $7/mois)
4. **GitHub Pages** : Gratuit, statique uniquement — le backend doit être ailleurs (Heroku, Vercel, etc.)
5. **Scaling** : data/news.json ne scale pas — pour 1000+ articles, passer à une base de données type MongoDB

## Ressources

- [Heroku Nodejs Buildpack](https://devcenter.heroku.com/articles/buildpacks)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Nodemailer Guide](https://nodemailer.com/)
- [Google App Passwords](https://support.google.com/accounts/answer/185833) (pour SMTP)
