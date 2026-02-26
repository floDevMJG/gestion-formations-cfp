const express = require('express');
const cors = require('cors');

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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5000,
    message: 'Serveur de test fonctionnel'
  });
});

// Route de test
app.get('/', (req, res) => {
  res.json({ message: 'Backend test server is running!' });
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur de test démarré sur le port ${PORT}`);
  console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'développement'}`);
  console.log(`📊 Health check disponible sur /api/health`);
});
