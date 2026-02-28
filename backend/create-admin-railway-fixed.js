require('dotenv').config();
const bcrypt = require('bcryptjs');
const { User } = require('./src/models');

async function createAdminRailwayFixed() {
  console.log('🔧 CRÉATION ADMIN RAILWAY (VERSION CORRIGÉE)');
  console.log('==========================================');

  // Afficher la configuration actuelle
  console.log('\n📋 Configuration actuelle :');
  console.log(`• DB_HOST: ${process.env.DB_HOST}`);
  console.log(`• DB_USER: ${process.env.DB_USER}`);
  console.log(`• DB_NAME: ${process.env.DB_NAME}`);
  console.log(`• DB_PORT: ${process.env.DB_PORT}`);

  // Corriger les variables si nécessaire
  const correctConfig = {
    host: process.env.DB_HOST || process.env.MYSQL_HOST || 'mysql.railway.internal',
    user: process.env.DB_USER || process.env.MYSQL_USER || 'root',
    password: process.env.DB_PASS || process.env.MYSQL_PASSWORD || '',
    database: process.env.DB_NAME === '3306' ? 'railway' : (process.env.DB_NAME || process.env.MYSQL_DATABASE || 'railway'),
    port: parseInt(process.env.DB_PORT) || parseInt(process.env.MYSQL_PORT) || 3306
  };

  console.log('\n✅ Configuration corrigée :');
  console.log(`• Host: ${correctConfig.host}`);
  console.log(`• User: ${correctConfig.user}`);
  console.log(`• Database: ${correctConfig.database}`);
  console.log(`• Port: ${correctConfig.port}`);

  try {
    // Forcer la synchronisation des modèles
    await User.sequelize.authenticate();
    console.log('✅ Connexion à la base de données réussie');

    // Synchroniser la base de données
    await User.sequelize.sync({ force: false });
    console.log('✅ Base de données synchronisée');

    // Vérifier si un admin existe
    const existingAdmin = await User.findOne({ where: { role: 'admin' } });
    
    if (existingAdmin) {
      console.log('✅ Admin existant trouvé:', existingAdmin.email);
      
      // Mettre à jour le mot de passe
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await existingAdmin.update({ 
        password: hashedPassword,
        statut: 'valide',
        emailVerified: true
      });
      console.log('✅ Mot de passe admin mis à jour avec "admin123"');
      
    } else {
      console.log('❌ Aucun admin trouvé - Création...');
      
      // Créer un nouvel admin
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = await User.create({
        nom: 'Admin',
        prenom: 'CFP',
        email: 'admin@cfp-charpentier-marine.com',
        password: hashedPassword,
        role: 'admin',
        statut: 'valide',
        emailVerified: true,
        telephone: null,
        adresse: null,
        dateNaissance: null
      });

      console.log('✅ Admin créé avec succès !');
      console.log(`• ID: ${admin.id}`);
      console.log(`• Email: ${admin.email}`);
      console.log(`• Mot de passe: admin123`);
    }

    // Lister les utilisateurs en attente
    const usersEnAttente = await User.findAll({ 
      where: { statut: 'en_attente' },
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    if (usersEnAttente.length > 0) {
      console.log('\n👥 Utilisateurs en attente de validation:');
      usersEnAttente.forEach(user => {
        console.log(`• ID ${user.id}: ${user.nom} ${user.prenom} - ${user.email} (${user.role}) - Statut: ${user.statut}`);
      });
    } else {
      console.log('\n📭 Aucun utilisateur en attente de validation');
      
      // Créer un utilisateur de test si aucun n'existe
      console.log('\n🧪 Création d\'un utilisateur de test...');
      const testHashedPassword = await bcrypt.hash('password123', 10);
      const testUser = await User.create({
        nom: 'Test',
        prenom: 'Formateur',
        email: 'test.formateur@example.com',
        password: testHashedPassword,
        role: 'formateur',
        statut: 'en_attente',
        emailVerified: true,
        telephone: null,
        adresse: null,
        dateNaissance: null
      });
      
      console.log('✅ Utilisateur de test créé:');
      console.log(`• ID: ${testUser.id}`);
      console.log(`• Email: ${testUser.email}`);
      console.log(`• Rôle: ${testUser.role}`);
      console.log(`• Statut: ${testUser.statut}`);
    }

    console.log('\n🎯 ADMIN ET UTILISATEURS CRÉÉS !');
    console.log('1. Connectez-vous sur: https://formations-cfp.netlify.app/login');
    console.log('2. Email admin: admin@cfp-charpentier-marine.com');
    console.log('3. Mot de passe admin: admin123');
    console.log('4. Allez sur /admin/users');
    console.log('5. Validez un utilisateur pour tester l\'email');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error('📄 Stack:', error.stack);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n🔧 SOLUTION: Base de données inaccessible');
      console.log('1. Vérifiez que Railway MySQL tourne');
      console.log('2. Vérifiez les variables d\'environnement');
    }
    
    if (error.message.includes('ER_NO_SUCH_TABLE')) {
      console.log('\n🔧 SOLUTION: Table users n\'existe pas');
      console.log('1. Exécutez: npx sequelize-cli db:migrate');
      console.log('2. Ou créez la table manuellement');
    }
  } finally {
    if (User.sequelize) {
      await User.sequelize.close();
    }
  }
}

createAdminRailwayFixed();
