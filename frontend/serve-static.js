const express = require('express');
const path = require('path');

console.log('🚀 Démarrage du serveur frontend...');
console.log('📁 Répertoire de travail:', __dirname);
console.log('📂 Build directory:', path.join(__dirname, 'build'));

const app = express();

// Middleware pour logger les requêtes
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.url}`);
  next();
});

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'build')));

// Route de health check
app.get('/health', (req, res) => {
  console.log('💓 Health check appelé');
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'frontend'
  });
});

// Toutes les routes redirigées vers index.html (pour React Router)
app.get('*', (req, res) => {
  console.log(`🔄 Route * pour: ${req.url}`);
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Frontend servi sur le port ${PORT}`);
  console.log(`🌍 Serveur écoute sur 0.0.0.0:${PORT}`);
  console.log(`� Health check disponible sur /health et /`);
});
