const { sendApprenantValidatedEmail } = require('./src/utils/sendgrid-mailer');

async function testSendGrid() {
  try {
    console.log('📧 Test SendGrid...');
    
    const result = await sendApprenantValidatedEmail({
      email: 'toussaintbenjamin14@gmail.com',
      nom: 'Test',
      prenom: 'Apprenant'
    });
    
    console.log('✅ Email SendGrid envoyé avec succès !');
    console.log('📧 Résultat:', result);
    
  } catch (error) {
    console.error('❌ Erreur SendGrid:', error.message);
    if (error.response?.body) {
      console.error('Détails:', JSON.stringify(error.response.body, null, 2));
    }
  }
}

testSendGrid();
