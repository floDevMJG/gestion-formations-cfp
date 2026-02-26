const mysql = require('mysql2/promise');

async function addGoogleFields() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'gestion_formations'
    });

    console.log('🔧 Ajout des champs Google OAuth...');

    // Ajouter googleId
    try {
      await connection.execute('ALTER TABLE Users ADD COLUMN googleId VARCHAR(255) NULL UNIQUE AFTER emailVerificationExpires');
      console.log('✅ Champ googleId ajouté');
    } catch (error) {
      if (error.code !== 'ER_DUP_FIELDNAME') {
        console.log('⚠️ Erreur googleId:', error.message);
      }
    }

    // Ajouter googleAccessToken
    try {
      await connection.execute('ALTER TABLE Users ADD COLUMN googleAccessToken TEXT NULL AFTER googleId');
      console.log('✅ Champ googleAccessToken ajouté');
    } catch (error) {
      if (error.code !== 'ER_DUP_FIELDNAME') {
        console.log('⚠️ Erreur googleAccessToken:', error.message);
      }
    }

    // Ajouter googleRefreshToken
    try {
      await connection.execute('ALTER TABLE Users ADD COLUMN googleRefreshToken TEXT NULL AFTER googleAccessToken');
      console.log('✅ Champ googleRefreshToken ajouté');
    } catch (error) {
      if (error.code !== 'ER_DUP_FIELDNAME') {
        console.log('⚠️ Erreur googleRefreshToken:', error.message);
      }
    }

    // Créer l'index
    try {
      await connection.execute('CREATE INDEX idx_users_google_id ON Users(googleId)');
      console.log('✅ Index googleId créé');
    } catch (error) {
      if (error.code !== 'ER_DUP_KEYNAME') {
        console.log('⚠️ Erreur index:', error.message);
      }
    }

    console.log('🎉 Migration terminée avec succès !');
    await connection.end();

  } catch (error) {
    console.error('❌ Erreur de migration:', error);
    process.exit(1);
  }
}

addGoogleFields();
