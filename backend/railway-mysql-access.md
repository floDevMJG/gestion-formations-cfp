# Accès à MySQL sur Railway

## Méthodes pour accéder à votre base de données MySQL

### 1. Via l'interface web Railway (recommandé)

1. **Connectez-vous à Railway** : https://railway.app
2. **Sélectionnez votre projet** `gestion-formations-cfp`
3. **Cliquez sur le service MySQL** (généralement nommé "mysql" ou "database")
4. **Onglet "Variables"** : Vous y trouverez toutes les informations de connexion
5. **Onglet "Query"** : Interface web pour exécuter des requêtes SQL

### 2. Via Railway CLI

```bash
# Installer Railway CLI si ce n'est pas déjà fait
npm install -g @railway/cli

# Se connecter
railway login

# Sélectionner votre projet
railway project select

# Se connecter à MySQL
railway mysql

# Ou exécuter une requête directement
railway mysql "SHOW DATABASES;"
railway mysql "SHOW TABLES;"
railway mysql "SELECT * FROM conges LIMIT 10;"
```

### 3. Via un client MySQL externe

1. **Récupérez les informations de connexion** dans Railway > Variables :
   ```
   RAILWAY_MYSQL_HOST
   RAILWAY_MYSQL_USER
   RAILWAY_MYSQL_PASSWORD
   RAILWAY_MYSQL_DATABASE
   RAILWAY_MYSQL_PORT
   ```

2. **Utilisez votre client préféré** (MySQL Workbench, DBeaver, TablePlus, etc.) :
   ```bash
   mysql -h RAILWAY_MYSQL_HOST -P RAILWAY_MYSQL_PORT -u RAILWAY_MYSQL_USER -p RAILWAY_MYSQL_DATABASE
   ```

### 4. Scripts d'initialisation disponibles

#### Script principal
```bash
# Exécuter le script d'initialisation complet
railway mysql < database/init-database.sql
```

#### Scripts individuels
```bash
# Tables des congés et permissions
railway mysql < database/conges_permissions_mysql.sql

# Tables de cours (si nécessaire)
railway mysql < database/add-cours-pdf-fields.sql

# Données de test (si nécessaire)
railway mysql < database/test_data.sql
```

## Vérification de la base de données

### Commandes SQL utiles

```sql
-- Voir toutes les bases de données
SHOW DATABASES;

-- Sélectionner votre base de données
USE gestion_formations;

-- Voir toutes les tables
SHOW TABLES;

-- Voir la structure d'une table
DESCRIBE conges;
DESCRIBE permissions;

-- Voir les vues créées
SHOW FULL TABLES WHERE Table_type = 'VIEW';

-- Voir les procédures stockées
SHOW PROCEDURE STATUS WHERE Db = 'gestion_formations';

-- Compter les enregistrements
SELECT COUNT(*) FROM conges;
SELECT COUNT(*) FROM permissions;
```

## Dépannage

### Si MySQL n'apparaît pas dans les services

1. **Vérifiez votre `railway.toml`** :
   ```toml
   [services.mysql]
     sourceDir = "/"
     image = "mysql:8.0"
   ```

2. **Redéployez le projet** :
   ```bash
   git add .
   git commit -m "Add MySQL service"
   git push
   ```

3. **Vérifiez les logs** dans Railway pour le service MySQL

### Si la connexion échoue

1. **Vérifiez les variables d'environnement** dans Railway
2. **Attendez quelques minutes** après le déploiement pour que MySQL soit prêt
3. **Redémarrez le service MySQL** depuis l'interface Railway

## Bonnes pratiques

1. **Sauvegardez régulièrement** :
   ```bash
   railway mysql:dump > backup_$(date +%Y%m%d).sql
   ```

2. **Utilisez des transactions** pour les modifications complexes

3. **Vérifiez les logs** de votre application backend pour les erreurs de connexion

4. **Testez la connexion** depuis votre backend avant d'exécuter des requêtes complexes
