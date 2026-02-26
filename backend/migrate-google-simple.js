const mysql = require('mysql2/promise');

async function addGoogleFieldsSimple() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'gestion_formations'
    });

    console.log('🔧 Ajout des champs Google OAuth (version simplifiée)...');

    // Vérifier si les champs existent déjà
    const [rows] = await connection.execute('DESCRIBE Users');
    const columns = rows.map(row => row.Field);

    // Ajouter googleId s'il n'existe pas
    if (!columns.includes('googleId')) {
      try {
        await connection.execute('ALTER TABLE Users ADD COLUMN googleId VARCHAR(255) NULL');
        console.log('✅ Champ googleId ajouté');
      } catch (error) {
        console.log('⚠️ Erreur googleId:', error.message);
      }
    }

    // Ajouter googleAccessToken s'il n'existe pas
    if (!columns.includes('googleAccessToken')) {
      try {
        await connection.execute('ALTER TABLE Users ADD COLUMN googleAccessToken TEXT NULL');
        console.log('✅ Champ googleAccessToken ajouté');
      } catch (error) {
        console.log('⚠️ Erreur googleAccessToken:', error.message);
      }
    }

    // Ajouter googleRefreshToken s'il n'existe pas
    if (!columns.includes('googleRefreshToken')) {
      try {
        await connection.execute('ALTER TABLE Users ADD COLUMN googleRefreshToken TEXT NULL');
        console.log('✅ Champ googleRefreshToken ajouté');
      } catch (error) {
        console.log('⚠️ Erreur googleRefreshToken:', error.message);
      }
    }

    console.log('🎉 Migration terminée !');
    await connection.end();

  } catch (error) {
    console.error('❌ Erreur de migration:', error);
    process.exit(1);
  }
}

addGoogleFieldsSimple();
