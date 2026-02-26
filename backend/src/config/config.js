require('dotenv').config();

module.exports = {
  // Configuration de la base de données MySQL
  dbName: process.env.DB_NAME || 'gestion_formations',
  dbUser: process.env.DB_USER || 'root',
  dbPass: process.env.DB_PASS || '',
  dbHost: process.env.DB_HOST || 'localhost',
  
  // Configuration JWT
  jwtSecret: process.env.JWT_SECRET || 'votre_secret_jwt_tres_securise',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '30d',
  
  // Configuration de l'email (SendGrid)
  email: {
    // Configuration SendGrid
    sendgridApiKey: process.env.SENDGRID_API_KEY || '',
    from: process.env.EMAIL_FROM || 'no-reply@cfp-charpentier-marine.com'
  },
  
  // Configuration email alternative (Gmail - backup)
  emailBackup: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASS || ''
    }
  },
  
  // Configuration du serveur
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // URL du frontend pour les liens dans les emails
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
};
