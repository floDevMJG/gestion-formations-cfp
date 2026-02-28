const nodemailer = require('nodemailer');

// Transporteur ultra-optimisé
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 465,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 3000,  // 3 secondes
  greetingTimeout: 2000,     // 2 secondes
  socketTimeout: 5000,       // 5 secondes
  pool: true,                // Pool de connexions
  maxConnections: 5,         // Max 5 connexions
  rateDelta: 1000,           // 1 email par seconde max
  rateLimit: 5,              // Max 5 emails en simultané
});

// Templates ultra-légers
const formateurTemplate = (data) => ({
  subject: '✅ Compte formateur validé - CFP Charpentier Marine',
  html: `
    <div style="font-family:Arial;max-width:600px;margin:0 auto;background:#fff;padding:30px;border-radius:10px">
      <h1 style="color:#007bff;text-align:center">🎉 Félicitations !</h1>
      <p>Bonjour <strong>${data.nom} ${data.prenom}</strong>,</p>
      <p>Votre compte formateur a été validé.</p>
      ${data.adminMessage ? `<p><em>Message admin: ${data.adminMessage}</em></p>` : ''}
      <div style="background:#f8f9fa;border:2px dashed #007bff;padding:20px;text-align:center;margin:20px 0">
        <p><strong>Votre code formateur:</strong></p>
        <div style="font-size:32px;font-weight:bold;color:#007bff;letter-spacing:3px">${data.codeFormateur}</div>
      </div>
      <p><a href="${process.env.FRONTEND_URL || 'https://formations-cfp.netlify.app'}/login" style="background:#007bff;color:white;padding:12px 30px;text-decoration:none;border-radius:5px">Me connecter</a></p>
    </div>
  `,
  text: `Compte formateur validé ! Code: ${data.codeFormateur}. Connectez-vous: ${process.env.FRONTEND_URL || 'https://formations-cfp.netlify.app'}/login`
});

const apprenantTemplate = (data) => ({
  subject: '✅ Inscription validée - CFP Charpentier Marine',
  html: `
    <div style="font-family:Arial;max-width:600px;margin:0 auto;background:#fff;padding:30px;border-radius:10px">
      <h1 style="color:#28a745;text-align:center">✅ Bienvenue !</h1>
      <p>Bonjour <strong>${data.nom} ${data.prenom}</strong>,</p>
      <p>Votre inscription a été validée.</p>
      <p><a href="${process.env.FRONTEND_URL || 'https://formations-cfp.netlify.app'}/login" style="background:#28a745;color:white;padding:12px 30px;text-decoration:none;border-radius:5px">Me connecter</a></p>
    </div>
  `,
  text: `Inscription validée ! Connectez-vous: ${process.env.FRONTEND_URL || 'https://formations-cfp.netlify.app'}/login`
});

// Envoi ultra-rapide avec retry minimal
const sendEmailFast = async (mailOptions) => {
  try {
    console.log(`📧 Envoi rapide vers ${mailOptions.to}`);
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email envoyé: ${result.messageId}`);
    return result;
  } catch (error) {
    console.error(`❌ Erreur email: ${error.message}`);
    // Un seul retry rapide
    await new Promise(resolve => setTimeout(resolve, 500));
    try {
      const result = await transporter.sendMail(mailOptions);
      console.log(`✅ Email envoyé (retry): ${result.messageId}`);
      return result;
    } catch (retryError) {
      console.error(`❌ Erreur retry: ${retryError.message}`);
      throw retryError;
    }
  }
};

// Fonctions d'envoi
const sendFormateurValidatedEmail = async (data) => {
  const template = formateurTemplate(data);
  return sendEmailFast({
    from: `"CFP Charpentier Marine" <${process.env.EMAIL_FROM}>`,
    to: data.email,
    ...template
  });
};

const sendApprenantValidatedEmail = async (data) => {
  const template = apprenantTemplate(data);
  return sendEmailFast({
    from: `"CFP Charpentier Marine" <${process.env.EMAIL_FROM}>`,
    to: data.email,
    ...template
  });
};

const sendEmailVerification = async (data) => {
  return sendEmailFast({
    from: `"CFP Charpentier Marine" <${process.env.EMAIL_FROM}>`,
    to: data.email,
    subject: '🔔 Vérifiez votre email - CFP Charpentier Marine',
    html: `
      <div style="font-family:Arial;max-width:600px;margin:0 auto;background:#fff;padding:30px;border-radius:10px">
        <h1 style="color:#ffc107;text-align:center">🔔 Vérification Email</h1>
        <p>Bonjour <strong>${data.nom} ${data.prenom}</strong>,</p>
        <div style="background:#fff3cd;border:2px dashed #ffc107;padding:20px;text-align:center;margin:20px 0">
          <p><strong>Code de vérification:</strong></p>
          <div style="font-size:32px;font-weight:bold;color:#856404;letter-spacing:3px">${data.code}</div>
        </div>
      </div>
    `,
    text: `Code vérification: ${data.code}`
  });
};

// Vérification silencieuse
setImmediate(() => {
  transporter.verify().then(() => {
    console.log('✅ Service email prêt');
  }).catch(() => {
    console.log('⚠️ Service email en attente');
  });
});

module.exports = {
  sendFormateurValidatedEmail,
  sendApprenantValidatedEmail,
  sendEmailVerification,
};
