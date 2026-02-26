require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gestion_formations'
};

async function createAdmin() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // Vérifier si l'admin existe déjà
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE email = ?', 
      ['admin@cfp.com']
    );

    if (users.length > 0) {
      console.log('✅ L\'administrateur existe déjà :', users[0].email);
      return;
    }

    // Créer l'admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await connection.execute(
      `INSERT INTO users 
      (nom, prenom, email, password, role, statut, telephone, adresse, createdAt, updatedAt) 
      VALUES (?, ?, ?, ?, 'admin', 'actif', '0612345678', 'Adresse admin', NOW(), NOW())`,
      ['Admin', 'Système', 'admin@cfp.com', hashedPassword]
    );

    console.log('✅ Administrateur créé avec succès !');
    console.log('   Email: admin@cfp.com');
    console.log('   Mot de passe: admin123');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'administrateur :', error);
  } finally {
    await connection.end();
  }
}

createAdmin();
