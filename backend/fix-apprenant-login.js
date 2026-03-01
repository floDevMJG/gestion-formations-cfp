require('dotenv').config();
const { sequelize } = require('./src/config/database');
const User = require('./src/models/User');

async function fixApprenantLogin() {
  console.log('🔧 CORRECTION CONNEXION APPRENANT');
  console.log('===============================');

  try {
    await sequelize.authenticate();
    console.log('✅ Base de données connectée');

    // 1. Vérifier les apprenants existants
    console.log('\n👥 Vérification des apprenants...');
    const apprenants = await User.findAll({
      where: { role: 'apprenant' }
    });

    console.log(`📊 Apprenants trouvés: ${apprenants.length}`);

    if (apprenants.length === 0) {
      console.log('\n❌ Aucun apprenant trouvé dans la base');
      console.log('🔧 Solution: Créer des apprenants de test');
      
      // Créer des apprenants de test
      const testApprenants = [
        {
          nom: 'Test',
          prenom: 'Apprenant1',
          email: 'apprenant1@test.com',
          password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'password'
          role: 'apprenant',
          statut: 'valide',
          emailVerified: true
        },
        {
          nom: 'Test',
          prenom: 'Apprenant2',
          email: 'apprenant2@test.com',
          password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'password'
          role: 'apprenant',
          statut: 'valide',
          emailVerified: true
        }
      ];

      for (const apprenant of testApprenants) {
        await User.create(apprenant);
        console.log(`✅ Apprenant créé: ${apprenant.email} (password: password)`);
      }
    } else {
      console.log('\n📋 Apprenants existants:');
      apprenants.forEach(apprenant => {
        console.log(`• ${apprenant.email} - Statut: ${apprenant.statut} - Validé: ${apprenant.emailVerified}`);
      });

      // 2. Valider automatiquement les apprenants en attente
      console.log('\n🔧 Validation des apprenants en attente...');
      const apprenantsEnAttente = await User.update(
        { statut: 'valide', emailVerified: true },
        { where: { role: 'apprenant', statut: 'en_attente' } }
      );

      console.log(`✅ ${apprenantsEnAttente[0]} apprenants validés automatiquement`);
    }

    // 3. Lister tous les apprenants validés
    const apprenantsValides = await User.findAll({
      where: { role: 'apprenant', statut: 'valide' },
      attributes: ['id', 'nom', 'prenom', 'email', 'statut', 'role']
    });

    console.log('\n🎯 APPRENANTS DISPONIBLES POUR CONNEXION:');
    console.log('==========================================');
    
    if (apprenantsValides.length === 0) {
      console.log('❌ Aucun apprenant validé trouvé');
    } else {
      apprenantsValides.forEach(apprenant => {
        console.log(`✅ Email: ${apprenant.email}`);
        console.log(`   Nom: ${apprenant.nom} ${apprenant.prenom}`);
        console.log(`   Statut: ${apprenant.statut}`);
        console.log(`   Mot de passe: password`);
        console.log('');
      });
    }

    console.log('🔗 TEST DE CONNEXION:');
    console.log('Allez sur: https://formations-cfp.netlify.app/login');
    console.log('Utilisez les identifiants ci-dessus');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await sequelize.close();
  }
}

fixApprenantLogin();
