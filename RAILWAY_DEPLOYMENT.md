# Déploiement sur Railway avec MySQL

## Étapes de déploiement

### 1. Prérequis
- Compte Railway (https://railway.app)
- Git avec le code poussé sur GitHub/GitLab
- Clé SendGrid (optionnel mais recommandé pour les emails)

### 2. Configuration du projet

#### 2.1. Créer un nouveau projet Railway
1. Connectez-vous à Railway
2. Cliquez sur "New Project"
3. Choisissez "Deploy from GitHub repo"
4. Sélectionnez votre dépôt `gestion-formations-cfp`

#### 2.2. Configuration des services
Railway va automatiquement détecter deux services:
- **Backend** (Node.js)
- **MySQL** (base de données)

### 3. Variables d'environnement

Dans le tableau de bord Railway, ajoutez ces variables d'environnement:

#### Pour le service Backend:
```
NODE_ENV=production
PORT=5000
JWT_SECRET=votre_secret_jwt_tres_securise_ici
SENDGRID_API_KEY=votre_cle_sendgrid
EMAIL_FROM=no-reply@votredomaine.com
FRONTEND_URL=https://votre-frontend.railway.app
```

#### Variables MySQL (automatiquement créées par Railway):
```
RAILWAY_MYSQL_HOST
RAILWAY_MYSQL_USER  
RAILWAY_MYSQL_PASSWORD
RAILWAY_MYSQL_DATABASE
RAILWAY_MYSQL_PORT
```

### 4. Configuration du frontend

Mettez à jour votre frontend pour pointer vers l'URL Railway:

```javascript
// Dans votre configuration API
const API_BASE_URL = 'https://votre-backend.railway.app/api';
```

### 5. Déploiement automatique

Une fois configuré, Railway déploiera automatiquement:
- Le backend Node.js avec le Dockerfile
- La base de données MySQL
- Appliquera les variables d'environnement

### 6. Vérification du déploiement

1. **Health Check**: Visitez `https://votre-backend.railway.app/api/health`
2. **Base de données**: Vérifiez que les tables sont créées automatiquement
3. **Logs**: Consultez les logs dans le tableau de bord Railway

### 7. Dépannage

#### Problèmes courants:
- **CORS**: Vérifiez que `FRONTEND_URL` est correctement configuré
- **Base de données**: Les variables MySQL doivent être correctement liées
- **Email**: Configurez SendGrid si nécessaire pour les fonctionnalités d'email

#### Commandes utiles:
```bash
# Vérifier les logs
railway logs

# Redémarrer les services
railway restart

# Vérifier les variables d'environnement
railway variables
```

### 8. Domaine personnalisé (optionnel)

1. Dans Railway > Settings > Domains
2. Ajoutez votre domaine personnalisé
3. Configurez les DNS comme indiqué

### 9. Backup de la base de données

Railway propose des backups automatiques. Pour exporter manuellement:
```bash
railway mysql:dump > backup.sql
```

## Fichiers modifiés pour Railway

- `backend/.env.example` - Variables d'environnement pour Railway
- `backend/src/app.js` - Health check endpoint et CORS dynamique
- `backend/Dockerfile` - Configuration optimisée pour Railway
- `backend/railway.toml` - Configuration des services Railway

## Support

- Documentation Railway: https://docs.railway.app
- Support: https://help.railway.app
