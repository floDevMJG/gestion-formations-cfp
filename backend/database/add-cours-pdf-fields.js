const { sequelize } = require('./src/models');

async function addCoursPdfFields() {
  try {
    console.log('🔄 Connexion à la base de données...');
    await sequelize.authenticate();
    console.log('✅ Connexion réussie');

    console.log('🔄 Ajout des champs PDF à la table Cours...');
    
    // Ajouter les champs pour les fichiers PDF
    await sequelize.query(`
      ALTER TABLE Cours 
      ADD COLUMN IF NOT EXISTS fichierUrl VARCHAR(500) NULL,
      ADD COLUMN IF NOT EXISTS fichierNom VARCHAR(255) NULL
    `);
    
    // Mettre à jour le type enum
    await sequelize.query(`
      ALTER TABLE Cours 
      MODIFY COLUMN type ENUM('cours', 'td', 'tp', 'examen', 'pdf') DEFAULT 'cours'
    `);
    
    console.log('✅ Champs ajoutés avec succès');
    
    // Vérifier la structure
    const [results] = await sequelize.query('DESCRIBE Cours');
    console.log('📋 Structure de la table Cours:');
    console.table(results);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await sequelize.close();
  }
}

addCoursPdfFields();
