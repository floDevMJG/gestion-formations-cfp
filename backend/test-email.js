const nodemailer = require('nodemailer');
const config = require('./src/config/config');

async function testEmail() {
  try {
    console.log('Configuration email:');
    console.log('Host:', config.email.host);
    console.log('User:', config.email.auth.user);
    console.log('Pass configured:', !!config.email.auth.pass);
    
    const transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: config.email.auth
    });
    
    console.log('\nTest de connexion SMTP...');
    await transporter.verify();
    console.log('✅ Connexion SMTP réussie !');
    
    const info = await transporter.sendMail({
      from: config.email.from,
      to: config.email.auth.user,
      subject: '✅ Test Email CFP Charpentier - Configuration OK',
      text: 'Félicitations ! Votre configuration email fonctionne parfaitement. Les apprenants et formateurs recevront bien leurs emails de validation.'
    });
    
    console.log('✅ Email de test envoyé avec succès !');
    console.log('📧 Message ID:', info.messageId);
    console.log('🎉 Votre système d\'email est maintenant opérationnel !');
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    if (error.code === 'EAUTH') {
      console.log('💡 Le mot de passe semble incorrect. Vérifiez que vous utilisez bien un mot de passe d\'application Gmail.');
    }
  }
}

testEmail();
