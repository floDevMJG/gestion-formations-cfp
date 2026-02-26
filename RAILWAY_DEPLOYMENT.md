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
Railway va automatiquement détecter trois services:
- **Backend** (Node.js)
- **Frontend** (React)
- **MySQL** (base de données)

### 4. Configuration MySQL

#### 4.1. Ajout du service MySQL
Railway va automatiquement détecter et configurer MySQL grâce au fichier `railway.toml`:

```toml
[services]
  [services.mysql]
    sourceDir = "/"
    image = "mysql:8.0"
    healthcheckPath = "/health"
    healthcheckTimeout = 100
    restartPolicyType = "ON_FAILURE"
    restartPolicyMaxRetries = 10
```

#### 4.2. Variables d'environnement MySQL
Railway créera automatiquement ces variables:
```
RAILWAY_MYSQL_HOST
RAILWAY_MYSQL_USER  
RAILWAY_MYSQL_PASSWORD
RAILWAY_MYSQL_DATABASE
RAILWAY_MYSQL_PORT
```

#### 4.3. Initialisation de la base de données
Le script `database/init-database.sql` sera utilisé pour initialiser les tables:
- Tables des congés et permissions
- Vues et procédures stockées
- Triggers pour les statistiques

### 5. Variables d'environnement

#### Pour le service Backend:
```
NODE_ENV=production
PORT=5000
JWT_SECRET=votre_secret_jwt_tres_securise_ici
SENDGRID_API_KEY=votre_cle_sendgrid
EMAIL_FROM=no-reply@votredomaine.com
FRONTEND_URL=https://votre-frontend.railway.app
```

#### Pour le service Frontend:
```
REACT_APP_API_URL=https://votre-backend.railway.app/api
GENERATE_SOURCEMAP=false
```

#### Variables MySQL (automatiquement créées par Railway):
```
RAILWAY_MYSQL_HOST
RAILWAY_MYSQL_USER  
RAILWAY_MYSQL_PASSWORD
RAILWAY_MYSQL_DATABASE
RAILWAY_MYSQL_PORT
```

### 6. Déploiement automatique

Une fois configuré, Railway déploiera automatiquement:
- Le backend Node.js avec le Dockerfile
- Le frontend React avec nginx
- La base de données MySQL avec les tables initialisées
- Appliquera les variables d'environnement

### 7. Vérification du déploiement

#### Backend:
1. **Health Check**: Visitez `https://votre-backend.railway.app/api/health`
2. **Base de données**: Vérifiez que les tables sont créées automatiquement
3. **Logs**: Consultez les logs dans le tableau de bord Railway

#### Frontend:
1. **Application**: Visitez `https://votre-frontend.railway.app`
2. **Connexion API**: Vérifiez que le frontend communique avec le backend

#### MySQL:
1. **Connexion**: Vérifiez la connexion depuis le backend
2. **Tables**: Confirmez que toutes les tables sont créées
3. **Données**: Vérifiez l'import des données initiales si nécessaire

### 8. Dépannage

#### Problèmes courants:
- **CORS**: Vérifiez que `FRONTEND_URL` est correctement configuré dans le backend
- **Base de données**: Les variables MySQL doivent être correctement liées au backend
- **Email**: Configurez SendGrid si nécessaire pour les fonctionnalités d'email
- **API Frontend**: Assurez-vous que `REACT_APP_API_URL` pointe vers le bon backend
- **MySQL Connection**: Vérifiez que les variables d'environnement MySQL sont bien injectées

#### Commandes utiles:
```bash
# Vérifier les logs
railway logs

# Redémarrer les services
railway restart

# Vérifier les variables d'environnement
railway variables

# Se connecter à MySQL pour vérification
railway mysql
```

### 9. Domaine personnalisé (optionnel)

1. Dans Railway > Settings > Domains
2. Ajoutez votre domaine personnalisé pour le frontend et/ou backend
3. Configurez les DNS comme indiqué

### 10. Backup de la base de données

Railway propose des backups automatiques. Pour exporter manuellement:
```bash
railway mysql:dump > backup.sql
```

### 11. Déploiement en production

#### Étapes finales:
1. **Tester** toutes les fonctionnalités
2. **Configurer** les domaines personnalisés si nécessaire
3. **Surveiller** les logs et performances
4. **Sauvegarder** régulièrement la base de données

## Fichiers modifiés pour Railway

### Backend:
- `backend/.env.example` - Variables d'environnement pour Railway
- `backend/src/app.js` - Health check endpoint, CORS dynamique, logs de diagnostic
- `backend/Dockerfile` - Configuration optimisée pour Railway
- `backend/railway.toml` - Configuration des services Railway y compris MySQL
- `backend/start-simple.js` - Script de test sans base de données
- `backend/railway-mysql-init.sql` - Script d'initialisation MySQL
- `backend/database/init-database.sql` - Script principal d'initialisation

### Frontend:
- `frontend/.env.example` - Variables d'environnement pour Railway
- `frontend/Dockerfile` - Configuration multi-stage avec nginx
- `frontend/nginx.conf` - Configuration nginx optimisée
- `frontend/railway.toml` - Configuration des services Railway
- `frontend/package.json` - Scripts et dépendances additionnels

### Base de données:
- `backend/database/conges_permissions_mysql.sql` - Tables MySQL complètes
- `backend/database/init-database.sql` - Script d'initialisation principal

## Architecture de déploiement

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │     MySQL       │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (Database)    │
│ Railway App     │    │ Railway App     │    │ Railway Service │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Support

- Documentation Railway: https://docs.railway.app
- Support: https://help.railway.app
