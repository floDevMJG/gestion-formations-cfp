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
  origin: [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'https://formations-cfp.netlify.app',
    /\.netlify\.app$/
  ],
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

// Route de test simple
app.get('/', (req, res) => {
  res.json({ 
    message: 'Backend CFP is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/formations', formationsRoutes);
app.use('/api/conges-permissions', congesPermissionsRoutes);
app.use('/api/formateur', formateurRoutes);
app.use('/api/inscriptions', inscriptionsRoutes);
app.use('/api/ateliers', ateliersRoutes);
app.use('/api/etudiants', etudiantsRoutes);
app.use('/api/cours', coursRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/paiements', paiementsRoutes);
app.use('/api/test-email', testEmailRoutes);
// Routes OAuth Google
app.use('/api/auth', require('./routes/googleAuth'));

// Route de test
app.get('/api/status', (req, res) => {
  res.json({ status: 'API fonctionnelle', timestamp: new Date() });
});

// Servir les fichiers statiques en production
if (process.env.NODE_ENV === 'production') {
  // Ne pas essayer de servir le frontend build car il n'existe pas
  // Le frontend est déployé séparément
  
  app.get('*', (req, res) => {
    if (req.originalUrl.startsWith('/api/')) {
      return res.status(404).json({ error: 'Route API non trouvée' });
    }
    res.status(404).json({ error: 'Backend API - Frontend non disponible ici' });
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
    console.log('🔍 Démarrage du serveur...');
    
    // Démarrer le serveur immédiatement
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'développement'}`);
      console.log(`📊 Health check disponible sur /api/health`);
      console.log(`🏠 Route racine disponible sur /`);
    });

    // Tester la connexion BDD en arrière-plan
    console.log('🔍 Tentative de connexion à la base de données...');
    try {
      await sequelize.authenticate();
      console.log('✅ Connexion à la base de données établie');
      
      // Synchroniser les modèles
      await sequelize.sync({ alter: true });
      console.log('📚 Modèles synchronisés');
      
      // Créer un utilisateur admin par défaut
      await createDefaultUser();
      
    } catch (dbError) {
      console.error('❌ Erreur de connexion à la base de données:', dbError.message);
      console.log('⚠️ Le serveur continue sans base de données');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error.message);
    process.exit(1);
  }
};

// Démarrer le serveur
startServer();

module.exports = app;
