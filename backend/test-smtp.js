const { sendApprenantValidatedEmail } = require('./src/utils/sendgrid-mailer');
const args = process.argv.slice(2);
const getArg = (name) => {
  const p = `--${name}=`;
  const f = args.find(s => s.startsWith(p));
  return f ? f.slice(p.length) : '';
};
process.env.EMAIL_HOST = getArg('host') || 'smtp.gmail.com';
process.env.EMAIL_PORT = getArg('port') || '587';
process.env.EMAIL_SECURE = getArg('secure') || 'false';
process.env.EMAIL_USER = getArg('user') || '';
const passb64 = getArg('passb64') || '';
process.env.EMAIL_PASS = passb64 ? Buffer.from(passb64, 'base64').toString('utf8') : (getArg('pass') || '');
(async () => {
  try {
    const to = getArg('to') || 'toussaintbenjamin14@gmail.com';
    const result = await sendApprenantValidatedEmail({
      email: to,
      nom: 'Test',
      prenom: 'Apprenant'
    });
    console.log('✅ SMTP envoyé');
    console.log('📧 Résultat:', result);
  } catch (error) {
    console.error('❌ Erreur SMTP:', error.message);
    if (error.response?.body) {
      console.error('Détails:', JSON.stringify(error.response.body, null, 2));
    }
  }
})();
