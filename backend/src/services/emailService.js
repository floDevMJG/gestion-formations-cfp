const nodemailer = require('nodemailer');

// Configuration du transporteur avec timeout court
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 465,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 5000, // 5 secondes timeout
  greetingTimeout: 3000,    // 3 secondes timeout
  socketTimeout: 10000,      // 10 secondes timeout
});

// Vérification rapide de la connexion
const verifyConnection = async () => {
  try {
    await transporter.verify();
    console.log('✅ Service email Gmail connecté et prêt');
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion email:', error.message);
    return false;
  }
};

// Vérifier la connexion au démarrage
verifyConnection();

// Template HTML pour validation formateur
const formateurValidatedTemplate = (data) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Validation Formateur - CFP Charpentier Marine</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid #007bff; }
        .header h1 { color: #007bff; margin: 0; font-size: 28px; }
        .content { padding: 20px 0; }
        .code-box { background: #f8f9fa; border: 2px dashed #007bff; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px; }
        .code { font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 3px; margin: 10px 0; }
        .footer { text-align: center; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
        .admin-message { background: #e7f3ff; border-left: 4px solid #007bff; padding: 15px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Félicitations !</h1>
            <p>Votre compte formateur a été validé</p>
        </div>
        <div class="content">
            <p>Bonjour <strong>${data.nom} ${data.prenom}</strong>,</p>
            <p>Nous avons le plaisir de vous informer que votre compte formateur a été validé par notre équipe.</p>
            
            ${data.adminMessage ? `
            <div class="admin-message">
                <strong>📝 Message de l'administrateur :</strong><br>
                ${data.adminMessage}
            </div>
            ` : ''}
            
            <div class="code-box">
                <p><strong>Votre code formateur unique :</strong></p>
                <div class="code">${data.codeFormateur}</div>
                <p>Conservez ce code précieusement, il vous sera demandé lors de vos formations.</p>
            </div>
            
            <p>Vous pouvez maintenant vous connecter et commencer à utiliser la plateforme.</p>
            <p><a href="${process.env.FRONTEND_URL || 'https://formations-cfp.netlify.app'}/login" style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Me connecter</a></p>
        </div>
        <div class="footer">
            <p>CFP Charpentier Marine - Formation Professionnelle</p>
            <p>Cet email a été envoyé automatiquement, merci de ne pas répondre.</p>
        </div>
    </div>
</body>
</html>
`;

// Template texte pour validation formateur
const formateurValidatedTextTemplate = (data) => `
FÉLICITATIONS - COMPTE FORMATEUR VALIDÉ

Bonjour ${data.nom} ${data.prenom},

Votre compte formateur a été validé par notre équipe.

${data.adminMessage ? `Message de l'administrateur: ${data.adminMessage}` : ''}

Votre code formateur unique: ${data.codeFormateur}

Conservez ce code précieusement, il vous sera demandé lors de vos formations.

Connectez-vous: ${process.env.FRONTEND_URL || 'https://formations-cfp.netlify.app'}/login

CFP Charpentier Marine - Formation Professionnelle
`;

// Template HTML pour validation apprenant
const apprenantValidatedTemplate = (data) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Validation Apprenant - CFP Charpentier Marine</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid #28a745; }
        .header h1 { color: #28a745; margin: 0; font-size: 28px; }
        .content { padding: 20px 0; }
        .footer { text-align: center; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Bienvenue !</h1>
            <p>Votre inscription a été validée</p>
        </div>
        <div class="content">
            <p>Bonjour <strong>${data.nom} ${data.prenom}</strong>,</p>
            <p>Nous avons le plaisir de vous informer que votre inscription a été validée par notre équipe.</p>
            <p>Vous pouvez maintenant vous connecter et accéder à la plateforme.</p>
            <p><a href="${process.env.FRONTEND_URL || 'https://formations-cfp.netlify.app'}/login" style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Me connecter</a></p>
        </div>
        <div class="footer">
            <p>CFP Charpentier Marine - Formation Professionnelle</p>
            <p>Cet email a été envoyé automatiquement, merci de ne pas répondre.</p>
        </div>
    </div>
</body>
</html>
`;

// Template texte pour validation apprenant
const apprenantValidatedTextTemplate = (data) => `
BIENVENUE - INSCRIPTION VALIDÉE

Bonjour ${data.nom} ${data.prenom},

Votre inscription a été validée par notre équipe.

Vous pouvez maintenant vous connecter et accéder à la plateforme.

Connectez-vous: ${process.env.FRONTEND_URL || 'https://formations-cfp.netlify.app'}/login

CFP Charpentier Marine - Formation Professionnelle
`;

// Fonction d'envoi d'email avec retry rapide
const sendEmailWithRetry = async (mailOptions, maxRetries = 2) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📧 Tentative d'envoi ${attempt}/${maxRetries} vers ${mailOptions.to}`);
      const result = await transporter.sendMail(mailOptions);
      console.log('✅ Email envoyé avec succès:', result.messageId);
      return result;
    } catch (error) {
      console.error(`❌ Erreur tentative ${attempt}:`, error.message);
      if (attempt === maxRetries) {
        throw error;
      }
      // Attendre 1 seconde avant de réessayer
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
};

// Envoi email validation formateur
const sendFormateurValidatedEmail = async (data) => {
  try {
    const mailOptions = {
      from: `"CFP Charpentier Marine" <${process.env.EMAIL_FROM}>`,
      to: data.email,
      subject: '✅ Votre compte formateur a été validé - CFP Charpentier Marine',
      html: formateurValidatedTemplate(data),
      text: formateurValidatedTextTemplate(data),
    };

    const result = await sendEmailWithRetry(mailOptions);
    console.log(`📧 Email validation formateur envoyé à ${data.email}:`, result.messageId);
    return result;
  } catch (error) {
    console.error('❌ Erreur envoi email validation formateur:', error.message);
    throw error;
  }
};

// Envoi email validation apprenant
const sendApprenantValidatedEmail = async (data) => {
  try {
    const mailOptions = {
      from: `"CFP Charpentier Marine" <${process.env.EMAIL_FROM}>`,
      to: data.email,
      subject: '✅ Votre inscription a été validée - CFP Charpentier Marine',
      html: apprenantValidatedTemplate(data),
      text: apprenantValidatedTextTemplate(data),
    };

    const result = await sendEmailWithRetry(mailOptions);
    console.log(`📧 Email validation apprenant envoyé à ${data.email}:`, result.messageId);
    return result;
  } catch (error) {
    console.error('❌ Erreur envoi email validation apprenant:', error.message);
    throw error;
  }
};

// Envoi email vérification
const sendEmailVerification = async (data) => {
  try {
    const mailOptions = {
      from: `"CFP Charpentier Marine" <${process.env.EMAIL_FROM}>`,
      to: data.email,
      subject: '🔔 Vérifiez votre adresse email - CFP Charpentier Marine',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Vérification Email - CFP Charpentier Marine</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
                .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid #ffc107; }
                .header h1 { color: #ffc107; margin: 0; font-size: 28px; }
                .content { padding: 20px 0; }
                .code-box { background: #fff3cd; border: 2px dashed #ffc107; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px; }
                .code { font-size: 32px; font-weight: bold; color: #856404; letter-spacing: 3px; margin: 10px 0; }
                .footer { text-align: center; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔔 Vérification Email</h1>
                    <p>Confirmez votre adresse email</p>
                </div>
                <div class="content">
                    <p>Bonjour <strong>${data.nom} ${data.prenom}</strong>,</p>
                    <p>Merci de vous être inscrit sur notre plateforme. Pour finaliser votre inscription, veuillez vérifier votre adresse email avec le code suivant :</p>
                    
                    <div class="code-box">
                        <p><strong>Code de vérification :</strong></p>
                        <div class="code">${data.code}</div>
                        <p>Ce code expire dans 30 minutes.</p>
                    </div>
                    
                    <p>Retournez sur la page d'inscription et entrez ce code pour activer votre compte.</p>
                </div>
                <div class="footer">
                    <p>CFP Charpentier Marine - Formation Professionnelle</p>
                    <p>Cet email a été envoyé automatiquement, merci de ne pas répondre.</p>
                </div>
            </div>
        </body>
        </html>
      `,
      text: `
VÉRIFICATION EMAIL - CFP CHARPENTIER MARINE

Bonjour ${data.nom} ${data.prenom},

Merci de vous être inscrit sur notre plateforme.

Code de vérification: ${data.code}
Ce code expire dans 30 minutes.

Retournez sur la page d'inscription et entrez ce code pour activer votre compte.

CFP Charpentier Marine - Formation Professionnelle
      `,
    };

    const result = await sendEmailWithRetry(mailOptions);
    console.log(`📧 Email vérification envoyé à ${data.email}:`, result.messageId);
    return result;
  } catch (error) {
    console.error('❌ Erreur envoi email vérification:', error.message);
    throw error;
  }
};

module.exports = {
  sendFormateurValidatedEmail,
  sendApprenantValidatedEmail,
  sendEmailVerification,
  verifyConnection,
};
