require('dotenv').config();
const { sendFormateurValidatedEmail } = require('./src/services/emailService');

// Test simple pour Railway
async function testRailwayEmail() {
  console.log('🚀 TEST EMAIL POUR RAILWAY');
  console.log('==========================');

  try {
    const result = await sendFormateurValidatedEmail({
      email: 'andrianflorio@gmail.com',
      nom: 'Railway',
      prenom: 'Test',
      codeFormateur: 'CFP' + Date.now().toString(36).toUpperCase(),
      adminMessage: 'Test depuis Railway'
    });

    console.log('✅ EMAIL ENVOYÉ AVEC SUCCÈS SUR RAILWAY !');
    console.log('Message ID:', result.messageId);
    console.log('Vérifiez votre Gmail: andrianflorio@gmail.com');
    
  } catch (error) {
    console.error('❌ ERREUR EMAIL SUR RAILWAY:');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    console.error('Command:', error.command);
    
    if (error.message.includes('535')) {
      console.log('\n🔧 SOLUTION: Gmail Authentication Failed');
      console.log('1. Vérifiez EMAIL_PASS dans Railway');
      console.log('2. Utilisez un App Password Gmail');
      console.log('3. Activez "Accès moins sécurisé"');
    }
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('\n🔧 SOLUTION: Network Error');
      console.log('1. Vérifiez EMAIL_HOST=smtp.gmail.com');
      console.log('2. Vérifiez la connexion Railway');
    }
  }
}

testRailwayEmail();
