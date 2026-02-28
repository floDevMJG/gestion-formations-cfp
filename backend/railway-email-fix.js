// Script à exécuter sur Railway pour garantir l'envoi d'email
// Copiez ce code dans la console Railway ou exécutez-le directement

require('dotenv').config();
const { sendFormateurValidatedEmail } = require('./src/services/emailService');

async function testEmailOnRailway() {
  console.log('🔧 TEST EMAIL SUR RAILWAY');
  console.log('========================');

  console.log('\n📋 Configuration Railway:');
  console.log(`• EMAIL_USER: ${process.env.EMAIL_USER}`);
  console.log(`• EMAIL_HOST: ${process.env.EMAIL_HOST}`);
  console.log(`• EMAIL_PORT: ${process.env.EMAIL_PORT}`);
  console.log(`• EMAIL_SECURE: ${process.env.EMAIL_SECURE}`);
  console.log(`• EMAIL_FROM: ${process.env.EMAIL_FROM}`);
  console.log(`• EMAIL_PASS configuré: ${process.env.EMAIL_PASS ? 'OUI' : 'NON'}`);

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('\n❌ VARIABLES EMAIL MANQUANTES DANS RAILWAY !');
    console.log('🔧 AJOUTEZ CES VARIABLES DANS RAILWAY:');
    console.log('EMAIL_USER=toussaintbenjamin108@gmail.com');
    console.log('EMAIL_PASS=nyfimyhouwdywyxz');
    console.log('EMAIL_HOST=smtp.gmail.com');
    console.log('EMAIL_PORT=465');
    console.log('EMAIL_SECURE=true');
    console.log('EMAIL_FROM=Toussaintbenjamin108@gmail.com');
    return;
  }

  try {
    console.log('\n📧 Test d\'envoi d\'email depuis Railway...');
    const startTime = Date.now();

    const result = await sendFormateurValidatedEmail({
      email: 'andrianflorio@gmail.com',
      nom: 'Test',
      prenom: 'Railway',
      codeFormateur: 'CFP-RAILWAY-' + Date.now().toString(36).toUpperCase(),
      adminMessage: 'Test depuis Railway - ' + new Date().toISOString()
    });

    const duration = Date.now() - startTime;
    console.log(`✅ EMAIL ENVOYÉ DEPUIS RAILWAY en ${duration}ms`);
    console.log(`📧 Message ID: ${result.messageId}`);
    console.log(`📧 Destinataire: ${result.envelope.to[0]}`);
    console.log(`📧 Accepté: ${result.accepted.join(', ')}`);

    console.log('\n🎯 VÉRIFIEZ VOTRE GMAIL:');
    console.log('1. Adresse: andrianflorio@gmail.com');
    console.log('2. Sujet: "✅ Compte formateur validé"');
    console.log('3. Expéditeur: CFP Charpentier Marine');
    console.log('4. Cherchez dans Spam/Promotions si nécessaire');

  } catch (error) {
    console.error('\n❌ ERREUR EMAIL SUR RAILWAY:');
    console.error(`Message: ${error.message}`);
    console.error(`Code: ${error.code}`);
    
    if (error.code === 'EAUTH') {
      console.log('\n🔧 SOLUTION AUTHENTIFICATION:');
      console.log('1. Vérifiez EMAIL_USER dans Railway');
      console.log('2. Vérifiez EMAIL_PASS (mot de passe app Gmail)');
      console.log('3. Activez "Accès moins sécurisé" dans Gmail');
    }
    
    if (error.code === 'ECONNECTION') {
      console.log('\n🔧 SOLUTION CONNEXION:');
      console.log('1. Vérifiez que Railway peut accéder à smtp.gmail.com');
      console.log('2. Vérifiez EMAIL_PORT (465)');
      console.log('3. Vérifiez EMAIL_SECURE (true)');
    }
  }
}

// Exécuter le test
testEmailOnRailway();
