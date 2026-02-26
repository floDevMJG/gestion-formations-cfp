require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const passport = require('./src/config/passport');
const app = express();
const PORT = 5000; // Forcer le port 5000

// Configuration de la base de données
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gestion_formations',
  charset: 'utf8mb4'
};

// Configuration de multer pour le téléchargement de fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Configuration de multer pour le téléchargement de fichiers
const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // 5MB max
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (file.size > maxSize) {
      return cb(new Error('La taille du fichier dépasse 5MB'));
    }
    
    // Vérifier le type de fichier
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées'));
    }
  }
});

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

// Middlewares
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialiser Passport
app.use(passport.initialize());
app.use(passport.session());

// Créer le dossier uploads s'il n'existe pas
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Servir les fichiers statiques du dossier 'uploads'
app.use('/uploads', express.static(uploadDir));

// Route racine
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>API Gestion des Formations</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          line-height: 1.6; 
          max-width: 800px; 
          margin: 0 auto; 
          padding: 20px;
          color: #333;
        }
        h1 { color: #2c3e50; }
        .endpoint { 
          background: #f8f9fa; 
          padding: 15px; 
          border-radius: 5px; 
          margin-bottom: 10px;
          border-left: 4px solid #3498db;
        }
        .method { 
          display: inline-block; 
          padding: 3px 8px; 
          border-radius: 3px; 
          color: white; 
          font-weight: bold; 
          font-size: 0.8em;
          margin-right: 10px;
        }
        .get { background-color: #2ecc71; }
        .post { background-color: #3498db; }
        .put { background-color: #f39c12; }
        .delete { background-color: #e74c3c; }
        a { 
          color: #2980b9; 
          text-decoration: none;
        }
        a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <h1>API Gestion des Formations</h1>
      <p>Bienvenue sur l'API de gestion des formations. Voici les endpoints disponibles :</p>
      
      <h2>Authentification</h2>
      <div class="endpoint">
        <span class="method post">POST</span>
        <a href="/api/auth/login">/api/auth/login</a> - Connexion utilisateur
      </div>
      <div class="endpoint">
        <span class="method post">POST</span>
        <a href="/api/auth/register">/api/auth/register</a> - Inscription utilisateur
      </div>

      <h2>Utilisateurs</h2>
      <div class="endpoint">
        <span class="method get">GET</span>
        <a href="/api/users">/api/users</a> - Liste des utilisateurs
      </div>

      <h2>Cours</h2>
      <div class="endpoint">
        <span class="method get">GET</span>
        <a href="/api/cours">/api/cours</a> - Liste des cours
      </div>

      <h2>Formations</h2>
      <div class="endpoint">
        <span class="method get">GET</span>
        <a href="/api/formations">/api/formations</a> - Liste des formations
      </div>

      <h2>Statistiques</h2>
      <div class="endpoint">
        <span class="method get">GET</span>
        <a href="/api/statistics">/api/statistics</a> - Statistiques de l'application
      </div>
      <div class="endpoint">
        <span class="method get">GET</span>
        <a href="/api/admin/stats">/api/admin/stats</a> - Statistiques administratives
      </div>

      <p style="margin-top: 30px; font-size: 0.9em; color: #7f8c8d;">
        Développé avec Node.js, Express et MySQL
      </p>
    </body>
    </html>
  `);
});

// Routes API
app.get('/api/statistics', async (req, res) => {
  try {
    const [usersByRole] = await db.execute('SELECT role, COUNT(*) as count FROM users GROUP BY role');
    const [totalUsers] = await db.execute('SELECT COUNT(*) as total FROM users');
    const [totalCours] = await db.execute('SELECT COUNT(*) as total FROM cours');
    const [totalFormations] = await db.execute('SELECT COUNT(*) as total FROM formations');

    const statistics = {
      users: {
        total: totalUsers[0].total,
        byRole: usersByRole.reduce((acc, item) => {
          acc[item.role] = item.count;
          return acc;
        }, {})
      },
      cours: { total: totalCours[0].total },
      formations: { total: totalFormations[0].total }
    };

    res.json(statistics);
  } catch (error) {
    console.error('❌ Erreur statistiques:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/admin/stats', async (req, res) => {
  try {
    console.log('Début de la récupération des statistiques...');
    
    // Récupération des statistiques utilisateurs par rôle
    const [usersByRole] = await db.execute('SELECT role, COUNT(*) as count FROM users GROUP BY role');
    console.log('usersByRole:', usersByRole);
    
    // Récupération des totaux
    const [totalUsers] = await db.execute('SELECT COUNT(*) as total FROM users');
    console.log('totalUsers:', totalUsers[0].total);
    
    const [totalApprenants] = await db.execute("SELECT COUNT(*) as total FROM users WHERE role = 'apprenant'");
    console.log('totalApprenants:', totalApprenants[0].total);
    
    const [totalFormateurs] = await db.execute("SELECT COUNT(*) as total FROM users WHERE role = 'formateur'");
    console.log('totalFormateurs:', totalFormateurs[0].total);
    
    const [totalFormations] = await db.execute('SELECT COUNT(*) as total FROM formations');
    console.log('totalFormations:', totalFormations[0]?.total || 0);
    
    const [totalAteliers] = await db.execute('SELECT COUNT(*) as total FROM ateliers');
    console.log('totalAteliers:', totalAteliers[0]?.total || 0);
    
    const [totalInscriptions] = await db.execute('SELECT COUNT(*) as total FROM inscriptions');
    console.log('totalInscriptions:', totalInscriptions[0]?.total || 0);
    
    // Comptage des inscriptions en attente
    const [inscriptionsEnAttente] = await db.execute("SELECT COUNT(*) as total FROM inscriptions WHERE statut = 'en_attente'");
    console.log('inscriptionsEnAttente:', inscriptionsEnAttente[0]?.total || 0);
    
    // Comptage des utilisateurs en attente de validation
    const [usersEnAttente] = await db.execute("SELECT COUNT(*) as total FROM users WHERE statut = 'en_attente' AND role = 'apprenant'");
    console.log('usersEnAttente:', usersEnAttente[0]?.total || 0);
    
    const [formateursEnAttente] = await db.execute("SELECT COUNT(*) as total FROM users WHERE statut = 'en_attente' AND role = 'formateur'");
    console.log('formateursEnAttente:', formateursEnAttente[0]?.total || 0);

    // Format des données attendu par le frontend
    const statistics = {
      totalUsers: totalUsers[0].total,
      totalApprenants: totalApprenants[0].total,
      totalFormateurs: totalFormateurs[0].total,
      totalFormations: totalFormations[0]?.total || 0,
      totalAteliers: totalAteliers[0]?.total || 0, // Si la table n'existe pas, retourne 0
      totalInscriptions: totalInscriptions[0]?.total || 0,
      inscriptionsEnAttente: inscriptionsEnAttente[0]?.total || 0,
      usersEnAttente: usersEnAttente[0]?.total || 0,
      formateursEnAttente: formateursEnAttente[0]?.total || 0,
      usersByRole: usersByRole.reduce((acc, item) => {
        acc[item.role] = item.count;
        return acc;
      }, {})
    };

    console.log('Statistiques générées:', statistics);
    res.json(statistics);
  } catch (error) {
    console.error('❌ Erreur admin/stats:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Annonces apprenants (public pour apprenants connectés côté frontend)
app.get('/api/admin/annonces/public/apprenants', async (req, res) => {
  try {
    // Vérifier l'existence de la table
    const [tableCheck] = await db.execute('SHOW TABLES LIKE "annonces_apprenants"');
    if (tableCheck.length === 0) {
      return res.json([]);
    }
    const [rows] = await db.execute(
      'SELECT id, titre, contenu, created_at AS createdAt FROM annonces_apprenants ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('❌ Erreur annonces apprenants:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Récupérer tous les ateliers avec pagination
app.get('/api/ateliers', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Vérifier si la table ateliers existe
    const [tableCheck] = await db.execute('SHOW TABLES LIKE "ateliers"');
    
    if (tableCheck.length === 0) {
      return res.json({ data: [], total: 0, page, totalPages: 0 });
    }
    
    // Récupérer le nombre total d'ateliers
    const [countResult] = await db.execute('SELECT COUNT(*) as total FROM ateliers');
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);
    
    // Récupérer les ateliers avec pagination
    const [ateliers] = await db.execute(
      'SELECT * FROM ateliers ORDER BY COALESCE(createdAt, date_creation, id) DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    
    res.json({
      data: ateliers,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des ateliers:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des ateliers' });
  }
});

// Récupérer un atelier par son ID
app.get('/api/ateliers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [atelier] = await db.execute('SELECT * FROM ateliers WHERE id = ?', [id]);
    
    if (atelier.length === 0) {
      return res.status(404).json({ message: 'Atelier non trouvé' });
    }
    
    res.json(atelier[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'atelier:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération de l\'atelier' });
  }
});

// Créer un nouvel atelier
app.post('/api/ateliers', upload.single('image'), async (req, res) => {
  try {
    const { titre, description, date_debut, date_fin, lieu, places_disponibles, prix } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;
    
    if (!titre || !description || !date_debut || !date_fin || !lieu || !places_disponibles || !prix) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires' });
    }
    
    const [result] = await db.execute(
      'INSERT INTO ateliers (titre, description, date_debut, date_fin, lieu, places_disponibles, prix, image_url, date_creation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      [titre, description, date_debut, date_fin, lieu, places_disponibles, prix, image_url]
    );
    
    const [newAtelier] = await db.execute('SELECT * FROM ateliers WHERE id = ?', [result.insertId]);
    
    res.status(201).json(newAtelier[0]);
  } catch (error) {
    console.error('Erreur lors de la création de l\'atelier:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la création de l\'atelier' });
  }
});

// Mettre à jour un atelier
app.put('/api/ateliers/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { titre, description, date_debut, date_fin, lieu, places_disponibles, prix } = req.body;
    
    // Vérifier si l'atelier existe
    const [existingAtelier] = await db.execute('SELECT * FROM ateliers WHERE id = ?', [id]);
    if (existingAtelier.length === 0) {
      return res.status(404).json({ message: 'Atelier non trouvé' });
    }
    
    let image_url = existingAtelier[0].image_url;
    if (req.file) {
      image_url = `/uploads/${req.file.filename}`;
    }
    
    await db.execute(
      'UPDATE ateliers SET titre = ?, description = ?, date_debut = ?, date_fin = ?, lieu = ?, places_disponibles = ?, prix = ?, image_url = ? WHERE id = ?',
      [titre, description, date_debut, date_fin, lieu, places_disponibles, prix, image_url, id]
    );
    
    const [updatedAtelier] = await db.execute('SELECT * FROM ateliers WHERE id = ?', [id]);
    res.json(updatedAtelier[0]);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'atelier:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour de l\'atelier' });
  }
});

// Supprimer un atelier
app.delete('/api/ateliers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier si l'atelier existe
    const [existingAtelier] = await db.execute('SELECT * FROM ateliers WHERE id = ?', [id]);
    if (existingAtelier.length === 0) {
      return res.status(404).json({ message: 'Atelier non trouvé' });
    }
    
    await db.execute('DELETE FROM ateliers WHERE id = ?', [id]);
    
    res.status(204).send();
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'atelier:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression de l\'atelier' });
  }
});

// Ancien endpoint conservé pour la rétrocompatibilité
app.get('/api/admin/ateliers', async (req, res) => {
  try {
    // Vérifier si la table ateliers existe
    const [tableCheck] = await db.execute('SHOW TABLES LIKE "ateliers"');
    
    if (tableCheck.length === 0) {
      // Si la table n'existe pas, retourner un tableau vide
      res.json([]);
    } else {
      // Vérifier les colonnes disponibles dans la table ateliers
      const [columns] = await db.execute('DESCRIBE ateliers');
      const hasCreatedAt = columns.some(col => col.Field === 'createdAt');
      const hasDateCreation = columns.some(col => col.Field === 'date_creation');
      
      let query = 'SELECT * FROM ateliers';
      if (hasCreatedAt) {
        query += ' ORDER BY createdAt DESC LIMIT 5';
      } else if (hasDateCreation) {
        query += ' ORDER BY date_creation DESC LIMIT 5';
      } else {
        query += ' LIMIT 5';
      }
      
      const [ateliers] = await db.execute(query);
      res.json(ateliers);
    }
  } catch (error) {
    console.error('❌ Erreur admin/ateliers:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/admin/users', async (req, res) => {
  try {
    const [users] = await db.execute('SELECT id, email, nom, prenom, role, statut FROM users ORDER BY createdAt DESC');
    res.json(users);
  } catch (error) {
    console.error('❌ Erreur admin/users:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/admin/notifications', async (req, res) => {
  try {
    // Simuler des notifications pour l'instant
    const notifications = [
      {
        id: 1,
        type: 'info',
        title: 'Nouvelle inscription',
        message: 'Un nouvel utilisateur s\'est inscrit',
        time: 'Il y a 5 minutes',
        read: false
      },
      {
        id: 2,
        type: 'success',
        title: 'Formation complétée',
        message: 'Un apprenant a terminé sa formation',
        time: 'Il y a 1 heure',
        read: false
      }
    ];
    res.json(notifications);
  } catch (error) {
    console.error('❌ Erreur admin/notifications:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/messages/unread/count', async (req, res) => {
  try {
    // Simuler des messages non lus pour l'instant
    res.json({ count: 3 });
  } catch (error) {
    console.error('❌ Erreur messages/unread/count:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/formateur/notifications', async (req, res) => {
  try {
    // Simuler des notifications pour formateur
    const notifications = [
      {
        id: 1,
        type: 'info',
        title: 'Cours aujourd\'hui',
        message: 'Vous avez un cours prévu aujourd\'hui à 14h',
        time: 'Aujourd\'hui',
        read: false
      }
    ];
    res.json(notifications);
  } catch (error) {
    console.error('❌ Erreur formateur/notifications:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const [users] = await db.execute('SELECT id, email, nom, prenom, role, statut FROM users ORDER BY createdAt DESC');
    res.json(users);
  } catch (error) {
    console.error('❌ Erreur utilisateurs:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/cours', async (req, res) => {
  try {
    const [cours] = await db.execute(`
      SELECT 
        c.*, 
        f.titre as formation_titre,
        u.nom as formateurNom,
        u.prenom as formateurPrenom
      FROM cours c 
      LEFT JOIN formations f ON c.formationId = f.id
      LEFT JOIN users u ON c.formateurId = u.id
    `);
    res.json(cours);
  } catch (error) {
    console.error('❌ Erreur cours:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/cours/apprenant/:id/emploi-du-temps', async (req, res) => {
  const userId = req.params.id;
  try {
    const [cours] = await db.execute(`
      SELECT 
        c.*, 
        f.titre as formation_titre,
        u.nom as formateurNom,
        u.prenom as formateurPrenom
      FROM cours c 
      LEFT JOIN formations f ON c.formationId = f.id
      LEFT JOIN users u ON c.formateurId = u.id
      LEFT JOIN inscriptions i ON i.formationId = f.id AND i.userId = ?
      WHERE i.id IS NOT NULL
    `, [userId]);
    res.json(cours);
  } catch (error) {
    console.error('❌ Erreur emploi du temps:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer toutes les formations avec les détails d'inscription pour un utilisateur
app.get('/api/formations', async (req, res) => {
  try {
    const [formations] = await db.execute('SELECT * FROM formations ORDER BY createdAt DESC');
    
    // Si un userId est fourni, on récupère aussi les informations d'inscription
    if (req.query.userId) {
      let inscriptions = [];
      try {
        const [insc] = await db.execute(
          'SELECT * FROM inscriptions WHERE userId = ?', 
          [req.query.userId]
        );
        inscriptions = insc;
      } catch (e) {
        try {
          const [insc] = await db.execute(
            'SELECT * FROM Inscriptions WHERE userId = ?', 
            [req.query.userId]
          );
          inscriptions = insc;
        } catch (e2) {
          console.warn('Table inscriptions non trouvée, utilisation de données vides');
        }
      }
      
      // Fusionner les données des formations avec les inscriptions
      const formationsAvecInscription = formations.map(formation => {
        const inscription = inscriptions.find(i => i.formationId === formation.id);
        return {
          ...formation,
          estInscrit: !!inscription,
          statut: inscription ? (inscription.statut || inscription.statutPaiement || 'en_attente') : 'non_inscrit',
          progression: inscription ? (inscription.progression ?? 0) : 0,
          dateInscription: inscription ? inscription.dateInscription : null
        };
      });
      
      return res.json(formationsAvecInscription);
    }
    
    res.json(formations);
  } catch (error) {
    console.error('❌ Erreur formations:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer une seule formation par son ID
app.get('/api/formations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute('SELECT * FROM formations WHERE id = ?', [id]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'Formation non trouvée' });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de la formation:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route de login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    console.log('🔐 TENTATIVE DE CONNEXION BACKEND:');
    console.log('   Email:', email);
    console.log('   Password:', password ? '***' : 'undefined');
    
    // Vérifier si l'utilisateur existe et est actif/valide
    const [users] = await db.execute(
      'SELECT * FROM users WHERE email = ? AND statut IN ("actif", "valide")',
      [email]
    );
    
    console.log('   Utilisateur trouvé:', users.length > 0 ? '✅' : '❌');
    
    if (users.length === 0) {
      console.log('   Raison: Utilisateur non trouvé ou non actif');
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
    
    const user = users[0];
    console.log('   Utilisateur:', { email: user.email, role: user.role, statut: user.statut });
    
    // Pour l'instant, on accepte le mot de passe sans vérification (à améliorer plus tard)
    // Dans un vrai projet, il faudrait vérifier: bcrypt.compare(password, user.password)
    
    const token = 'token_' + Date.now() + '_' + user.id;
    
    console.log('   Token généré:', token.substring(0, 20) + '...');
    console.log('   Connexion réussie !');
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        nom: user.nom,
        prenom: user.prenom,
        statut: user.statut
      }
    });
  } catch (error) {
    console.error('❌ Erreur login:', error.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Configuration de multer pour le téléchargement de fichiers
const multer = require('multer');
const fs = require('fs');

// Créer le dossier uploads s'il n'existe pas
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'photo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées (jpeg, jpg, png, gif)'));
    }
  }
});

// Route d'inscription
app.post('/api/auth/register', upload.single('photo'), async (req, res) => {
  const { nom, prenom, email, password, role, telephone, adresse } = req.body;
  
  try {
    // Vérifier si l'email est déjà utilisé
    const [existingUser] = await db.execute(
      'SELECT id FROM Users WHERE email = ?',
      [email]
    );
    
    if (existingUser.length > 0) {
      // Supprimer la photo téléchargée si l'email existe déjà
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ 
        error: 'Cet email est déjà utilisé' 
      });
    }
    
    // Gérer le chemin de la photo
    let photoPath = null;
    if (req.file) {
      photoPath = '/uploads/' + req.file.filename;
    }
    
    // Hacher le mot de passe (à implémenter avec bcrypt plus tard)
    const hashedPassword = password; // À remplacer par un vrai hachage
    
    // Insérer le nouvel utilisateur
    const [result] = await db.execute(
      'INSERT INTO Users (nom, prenom, email, password, telephone, adresse, role, statut, photo, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, "en_attente", ?, NOW(), NOW())',
      [nom, prenom, email, hashedPassword, telephone || null, adresse || null, role || 'apprenant', photoPath]
    );
    
    res.status(201).json({
      success: true,
      message: 'Inscription réussie ! Votre compte est en attente de validation par un administrateur.',
      user: {
        id: result.insertId,
        nom,
        prenom,
        email,
        telephone: telephone || null,
        adresse: adresse || null,
        role: role || 'apprenant',
        statut: 'en_attente',
        photo: photoPath
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur inscription:', error);
    // Supprimer la photo téléchargée en cas d'erreur
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ 
      error: 'Erreur lors de l\'inscription. Veuillez réessayer plus tard.' 
    });
  }
});

// Servir les fichiers statiques
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes pour les inscriptions
app.use('/api/inscriptions', require('./src/routes/inscriptions'));

// Routes pour Google OAuth
app.use('/auth', require('./src/routes/googleAuth'));

// Route pour créer un paiement mobile
app.post('/api/paiements/mobile', async (req, res) => {
  try {
    const { inscriptionId, phoneNumber, operator, transactionId, montant, fraisScolarite, devise, methodePaiement, statut } = req.body;

    // const [result] = await db.execute(
    //   'INSERT INTO Paiements (inscriptionId, datePaiement, montant, methodePaiement, statut, transactionId, operateur, numeroTelephone) VALUES (?, NOW(), ?, ?, ?, ?, ?, ?)',
    //   [inscriptionId, montant, methodePaiement, statut, transactionId, operator, phoneNumber]
    // );

    res.status(201).json({ message: 'Paiement mobile enregistré avec succès', paiementId: 1 });
  } catch (error) {
    console.error('Erreur lors de la création du paiement mobile:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route pour créer un paiement classique
app.post('/api/paiements/classique', async (req, res) => {
  try {
    const { inscriptionId, montant, fraisScolarite, methodePaiement, methodeFraisScolarite, devise, statut } = req.body;

    const [result] = await db.execute(
      'INSERT INTO Paiements (inscriptionId, datePaiement, montant, methodePaiement, statut) VALUES (?, NOW(), ?, ?, ?)',
      [inscriptionId, montant, methodePaiement, statut]
    );

    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    console.error('Erreur lors de la création du paiement classique:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Démarrage du serveur
async function startServer() {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`🚀 Serveur backend démarré sur http://localhost:${PORT}`);
    console.log('📊 API disponibles:');
    console.log('   GET /api/statistics');
    console.log('   GET /api/admin/stats');
    console.log('   GET /api/users');
    console.log('   GET /api/cours');
    console.log('   GET /api/formations');
    console.log('   POST /api/auth/login');
    console.log('   POST /api/auth/register');
  });
}

startServer().catch(console.error);
