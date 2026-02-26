const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const messageRoutes = require('./routes/messageRoutes');
const formationsRoutes = require('./routes/formations');
const congesPermissionsRoutes = require('./routes/congesPermissionsRoutes');
const formateurRoutes = require('./routes/formateurRoutes');
const inscriptionsRoutes = require('./routes/inscriptions');
const ateliersRoutes = require('./routes/ateliers');
const etudiantsRoutes = require('./routes/etudiants');
const coursRoutes = require('./routes/cours');
const config = require('./config/config');
const passport = require('./config/passport');
const notificationsRoutes = require('./routes/notifications');
const paiementsRoutes = require('./routes/paiements');
const testEmailRoutes = require('./routes/testEmail');

// Importer les modèles
require('./models/User');
require('./models/Message');
require('./models/Cours');

const app = express();

// Configuration CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Middleware pour parser le JSON
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialiser Passport (sans session)
app.use(passport.initialize());

// Servir les fichiers uploadés
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Configuration du port (prend PORT depuis .env, sinon 5000)
const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;

// Health check endpoint pour Railway
app.get('/api/health', async (req, res) => {
  let dbStatus = 'non_testee';
  
  // Tester la connexion à la base de données
  try {
    await sequelize.authenticate();
    dbStatus = 'connectee';
  } catch (error) {
    dbStatus = `erreur: ${error.message}`;
  }
  
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    database: dbStatus,
    mysql_vars: {
      host: process.env.RAILWAY_MYSQL_HOST ? 'configure' : 'manquant',
      user: process.env.RAILWAY_MYSQL_USER ? 'configure' : 'manquant',
      database: process.env.RAILWAY_MYSQL_DATABASE ? 'configure' : 'manquant',
      port: process.env.RAILWAY_MYSQL_PORT || 'manquant'
    }
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/formations', formationsRoutes);
app.use('/api/conges-permissions', congesPermissionsRoutes);
app.use('/api/formateur', formateurRoutes);
app.use('/api/inscriptions', inscriptionsRoutes); // Ajout de la route des inscriptions
app.use('/api/ateliers', ateliersRoutes); // Ateliers publics et protégés
app.use('/api/etudiants', etudiantsRoutes); // Inscriptions par étudiant
app.use('/api/cours', coursRoutes); // PDF et emploi du temps
app.use('/api/notifications', notificationsRoutes); // Notifications utilisateurs/admin
app.use('/api/paiements', paiementsRoutes);
app.use('/api/test-email', testEmailRoutes);
// Routes OAuth Google
app.use('/api/auth', require('./routes/googleAuth'));

// Page d'accueil informative
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>API Gestion des Formations</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 900px; margin: 40px auto; color: #2c3e50; }
          h1 { color: #34495e; }
          .endpoint { background: #f8f9fa; padding: 12px 16px; border-radius: 6px; margin: 10px 0; border-left: 4px solid #3498db; }
          .method { display: inline-block; padding: 2px 8px; border-radius: 4px; color: #fff; font-weight: 600; font-size: 12px; margin-right: 8px; }
          .get { background: #2ecc71; } .post { background: #3498db; } .put { background: #f39c12; } .delete { background: #e74c3c; }
          a { color: #2980b9; text-decoration: none; } a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <h1>API Gestion des Formations</h1>
        <p>Bienvenue. Le serveur est en cours d'exécution. Endpoints principaux:</p>
        <div class="endpoint"><span class="method get">GET</span><a href="/api/status">/api/status</a> - Statut API</div>
        <div class="endpoint"><span class="method post">POST</span>/api/auth/login - Connexion</div>
        <div class="endpoint"><span class="method post">POST</span>/api/auth/register - Inscription</div>
        <div class="endpoint"><span class="method get">GET</span>/api/formations - Formations</div>
        <div class="endpoint"><span class="method get">GET</span>/api/admin/stats - Statistiques (admin)</div>
        <div class="endpoint"><span class="method get">GET</span>/api/inscriptions - Inscriptions (admin)</div>
      </body>
    </html>
  `);
});

// Route temporaire pour les cours (solution de contournement)
app.get('/api/cours', async (req, res) => {
  try {
    console.log('📚 Route /api/cours appelée');
    const { Cours, Formation, User } = require('./models');
    
    const cours = await Cours.findAll({
      where: { type: 'pdf' },
      include: [
        {
          model: Formation,
          as: 'formation',
          attributes: ['id', 'titre']
        },
        {
          model: User,
          as: 'Formateur',
          attributes: ['id', 'nom', 'prenom']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log(`✅ ${cours.length} cours trouvés`);
    res.status(200).json(cours);
  } catch (error) {
    console.error('❌ Erreur:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// Route de test
app.get('/api/status', (req, res) => {
  res.json({ status: 'API fonctionnelle', timestamp: new Date() });
});

// Servir les fichiers statiques en production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../gestion-formations-cfp-frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../gestion-formations-cfp-frontend/build', 'index.html'));
  });
}

// Gestion des erreurs 404
app.use((req, res, next) => {
  // Si la requête est pour l'API, renvoyer une erreur JSON
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(404).json({ error: 'Route API non trouvée' });
  }
  // Sinon, laisser le gestionnaire de routage React gérer la route
  next();
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error('Erreur:', err);
  res.status(500).json({ 
    error: err.message || 'Une erreur est survenue sur le serveur' 
  });
});

// Configuration du port (déjà défini plus haut)

// Fonction pour créer un utilisateur admin par défaut
const createDefaultUser = async () => {
  try {
    const { User } = require('./models');
    const adminExists = await User.findOne({ where: { email: 'admin@cfp.com' } });
    
    if (!adminExists) {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      await User.create({
        nom: 'Admin',
        prenom: 'Administrateur',
        email: 'admin@cfp.com',
        password: hashedPassword,
        role: 'admin',
        statut: 'actif',
        emailVerified: true
      });
      console.log('✅ Compte administrateur créé avec succès');
    }
  } catch (error) {
    console.error('❌ Erreur lors de la création du compte admin:', error);
  }
};

// Démarrage du serveur
const startServer = async () => {
  try {
    console.log('🔍 Tentative de connexion à la base de données...');
    console.log(`📍 Host: ${process.env.DB_HOST || process.env.MYSQLHOST || 'localhost'}`);
    console.log(`👤 User: ${process.env.DB_USER || process.env.MYSQLUSER || 'root'}`);
    console.log(`🗄️  Database: ${process.env.DB_NAME || process.env.MYSQLDATABASE || 'gestion_formations'}`);
    
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie avec succès.');

    try {
      const models = require('./models');
      if (models && models.sequelize && models.sequelize.sync) {
        await models.sequelize.sync();
        console.log('✅ Schéma synchronisé');
      }
    } catch (syncAllErr) {
      console.warn('⚠️ Synchronisation du schéma échouée:', syncAllErr.message);
    }

    // S'assurer que les tables indispensables existent sans altérer les existantes
    try {
      const { Atelier } = require('./models');
      if (Atelier && Atelier.sync) {
        await Atelier.sync(); // crée la table si elle n'existe pas
        console.log('✅ Table Ateliers vérifiée/créée si nécessaire.');
      }
    } catch (syncErr) {
      console.error('❌ Erreur lors de la vérification/création de la table Ateliers:', syncErr.message);
    }

    // Vérifier/ajouter les colonnes de vérification email sur Users si absentes
    try {
      const [results] = await sequelize.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = 'Users' 
          AND COLUMN_NAME IN ('emailVerified','emailVerificationCode','emailVerificationExpires')
      `);
      const existing = new Set(results.map(r => r.COLUMN_NAME));
      const addEmailVerified = !existing.has('emailVerified');
      const addCode = !existing.has('emailVerificationCode');
      const addExpires = !existing.has('emailVerificationExpires');
      if (addEmailVerified) {
        await sequelize.query(`ALTER TABLE Users ADD COLUMN emailVerified TINYINT(1) NOT NULL DEFAULT 0`);
        console.log('✅ Colonne emailVerified ajoutée');
      }
      if (addCode) {
        await sequelize.query(`ALTER TABLE Users ADD COLUMN emailVerificationCode VARCHAR(32) NULL`);
        console.log('✅ Colonne emailVerificationCode ajoutée');
      }
      if (addExpires) {
        await sequelize.query(`ALTER TABLE Users ADD COLUMN emailVerificationExpires DATETIME NULL`);
        console.log('✅ Colonne emailVerificationExpires ajoutée');
      }
    } catch (colErr) {
      console.warn('⚠️ Vérification/ajout des colonnes Users échouée:', colErr.message);
    }

    // Créer un utilisateur admin par défaut
    await createDefaultUser();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'développement'}`);
      console.log(`📊 Health check disponible sur /api/health`);
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error.message);
    process.exit(1);
  }
};

// Démarrer le serveur
startServer();

module.exports = app;
