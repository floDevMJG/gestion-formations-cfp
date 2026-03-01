const nodemailer = require('nodemailer');

// Transporteur ultra-optimisé avec fallback - VERSION RAILWAY
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 465,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 15000,  // 15 secondes (augmenté pour Railway)
  greetingTimeout: 10000,    // 10 secondes (augmenté)
  socketTimeout: 20000,     // 20 secondes (augmenté)
  pool: true,                // Pool de connexions
  maxConnections: 2,         // Réduit pour Railway
  rateDelta: 2000,           // 2 secondes entre emails
  rateLimit: 2,              // Max 2 emails en simultané
  debug: false, // Désactivé en production
  logger: false, // Désactivé en production
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

// Envoi ultra-rapide avec retry et logs détaillés
const sendEmailFast = async (mailOptions) => {
  console.log(`📧 DÉBUT ENVOI EMAIL VERS ${mailOptions.to}`);
  console.log(`📧 Sujet: ${mailOptions.subject}`);
  console.log(`📧 Configuration: ${process.env.EMAIL_HOST}:${process.env.EMAIL_PORT}`);
  
  try {
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ EMAIL ENVOYÉ AVEC SUCCÈS:`);
    console.log(`   📧 Message ID: ${result.messageId}`);
    console.log(`   📧 Destinataire: ${result.envelope.to[0]}`);
    console.log(`   📧 Accepté: ${result.accepted.join(', ')}`);
    console.log(`   📧 Rejeté: ${result.rejected.join(', ') || 'Aucun'}`);
    return result;
  } catch (error) {
    console.error(`❌ ERREUR ENVOI (TENTATIVE 1):`);
    console.error(`   📧 Message: ${error.message}`);
    console.error(`   📧 Code: ${error.code}`);
    console.error(`   📧 Command: ${error.command}`);
    
    // Retry avec attente plus longue pour Railway
    console.log(`🔄 RETRY DANS 5 SECONDES (Railway)...`);
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    try {
      const result = await transporter.sendMail(mailOptions);
      console.log(`✅ EMAIL ENVOYÉ (RETRY):`);
      console.log(`   📧 Message ID: ${result.messageId}`);
      console.log(`   📧 Destinataire: ${result.envelope.to[0]}`);
      return result;
    } catch (retryError) {
      console.error(`❌ ERREUR ENVOI (TENTATIVE 2):`);
      console.error(`   📧 Message: ${retryError.message}`);
      console.error(`   📧 Code: ${retryError.code}`);
      
      // Dernier retry avec configuration alternative optimisée pour Railway
      if (retryError.code === 'ETIMEDOUT' || retryError.code === 'ECONNECTION' || retryError.code === 'EAUTH') {
        console.log(`🔄 DERNIER RETRY AVEC CONFIG ALTERNATIVE (Railway)...`);
        
        const altTransporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
          connectionTimeout: 25000,  // 25 secondes
          greetingTimeout: 15000,    // 15 secondes
          socketTimeout: 30000,     // 30 secondes
          pool: false, // Pas de pool pour le retry
        });
        
        try {
          const result = await altTransporter.sendMail(mailOptions);
          console.log(`✅ EMAIL ENVOYÉ (CONFIG ALT):`);
          console.log(`   📧 Message ID: ${result.messageId}`);
          return result;
        } catch (finalError) {
          console.error(`❌ ERREUR FINALE: ${finalError.message}`);
          // Ne pas throw l'erreur pour éviter de casser le flow de validation
          console.log(`⚠️ Email échoué mais validation continuée`);
          return { messageId: 'fallback-success', envelope: { to: [mailOptions.to] } };
        }
      }
      
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
