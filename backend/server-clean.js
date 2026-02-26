require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
const PORT = 5000;

// Configuration de la base de données
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gestion_formations',
  charset: 'utf8mb4'
};

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connexion à la base de données
let db;
async function connectDB() {
  try {
    db = await mysql.createConnection(dbConfig);
    console.log('✅ Base de données connectée:', dbConfig.database);
    
    // Test de connexion avec une requête simple
    const [rows] = await db.execute('SELECT COUNT(*) as count FROM users');
    console.log('👥 Utilisateurs dans la base:', rows[0].count);
    
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error.message);
    process.exit(1);
  }
}

// Route de test
app.get('/api/test', (req, res) => {
  res.json({ message: 'Le serveur fonctionne correctement !' });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Quelque chose a mal tourné !' });
});

// Démarrer le serveur
async function startServer() {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`\n🚀 Serveur démarré sur http://localhost:${PORT}`);
      console.log(`📡 Environnement: ${process.env.NODE_ENV || 'développement'}`);
      console.log(`🕒 ${new Date().toLocaleString()}\n`);
      console.log('Endpoints disponibles:');
      console.log(`- GET  /api/test - Tester si le serveur fonctionne`);
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
}

startServer().catch(console.error);
