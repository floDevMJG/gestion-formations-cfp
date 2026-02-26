const mysql = require('mysql2/promise');

async function checkUsers() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'gestion_formations'
    });
    
    console.log('🔍 VÉRIFICATION DES UTILISATEURS DANS LA BASE:');
    console.log('=============================================');
    
    // Vérifier tous les utilisateurs
    const [allUsers] = await connection.execute('SELECT email, role, statut FROM users');
    console.log('📋 TOUS LES UTILISATEURS:');
    allUsers.forEach(user => {
      console.log(`  • ${user.email} - ${user.role} - ${user.statut}`);
    });
    
    // Vérifier la condition actuelle du login
    const [activeUsers] = await connection.execute('SELECT email, role, statut FROM users WHERE statut IN ("actif", "valide")');
    console.log('\n✅ UTILISATEURS ACTIFS/VALIDES (peuvent se connecter):');
    activeUsers.forEach(user => {
      console.log(`  • ${user.email} - ${user.role} - ${user.statut}`);
    });
    
    // Vérifier les autres statuts
    const [otherUsers] = await connection.execute('SELECT email, role, statut FROM users WHERE statut NOT IN ("actif", "valide")');
    console.log('\n❌ UTILISATEURS NON ACTIFS (ne peuvent pas se connecter):');
    otherUsers.forEach(user => {
      console.log(`  • ${user.email} - ${user.role} - ${user.statut}`);
    });
    
    await connection.end();
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

checkUsers();
