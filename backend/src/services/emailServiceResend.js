const { Resend } = require('resend');

// Initialisation Resend - SERVICE ULTRA-FIABLE
const resend = new Resend(process.env.RESEND_API_KEY);

// Templates pour Resend - VERSION OPTIMISÉE
const formateurTemplate = (data) => ({
  subject: '✅ Compte formateur validé - CFP Charpentier Marine',
  html: `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;background:#fff;padding:30px;border-radius:10px;box-shadow:0 4px 6px rgba(0,0,0,0.1)">
      <div style="text-align:center;margin-bottom:30px">
        <div style="display:inline-block;background:#007bff;color:white;width:60px;height:60px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:15px">🎉</div>
        <h1 style="color:#007bff;margin:0;font-size:24px">Félicitations !</h1>
      </div>
      <p style="color:#333;font-size:16px;line-height:1.5">Bonjour <strong>${data.nom} ${data.prenom}</strong>,</p>
      <p style="color:#333;font-size:16px;line-height:1.5">Votre compte formateur a été validé avec succès.</p>
      ${data.adminMessage ? `<div style="background:#f8f9fa;border-left:4px solid #007bff;padding:15px;margin:20px 0;border-radius:4px"><p style="margin:0;color:#495057;font-size:14px"><em>💬 Message de l'administrateur : ${data.adminMessage}</em></p></div>` : ''}
      <div style="background:linear-gradient(135deg,#007bff 0%,#0056b3 100%);color:white;padding:30px;text-align:center;margin:30px 0;border-radius:8px">
        <p style="margin:0 0 15px 0;font-size:18px;font-weight:bold">🔑 Votre code formateur</p>
        <div style="font-size:32px;font-weight:bold;letter-spacing:3px;background:rgba(255,255,255,0.2);padding:15px;border-radius:4px;display:inline-block">${data.codeFormateur}</div>
        <p style="margin:15px 0 0 0;font-size:14px;opacity:0.9">Conservez ce code précieusement</p>
      </div>
      <div style="text-align:center;margin-top:30px">
        <a href="${process.env.FRONTEND_URL || 'https://formations-cfp.netlify.app'}/login" style="background:#28a745;color:white;padding:15px 30px;text-decoration:none;border-radius:5px;font-weight:bold;display:inline-block">🚀 Me connecter</a>
      </div>
      <div style="margin-top:30px;padding-top:20px;border-top:1px solid #eee;text-align:center;color:#666;font-size:12px">
        <p>© 2024 CFP Charpentier Marine - Tous droits réservés</p>
      </div>
    </div>
  `,
  text: `Compte formateur validé !\n\nBonjour ${data.nom} ${data.prenom},\n\nVotre compte formateur a été validé.\n\nCode formateur: ${data.codeFormateur}\n\nConnectez-vous: ${process.env.FRONTEND_URL || 'https://formations-cfp.netlify.app'}/login`
});

const apprenantTemplate = (data) => ({
  subject: '✅ Inscription validée - CFP Charpentier Marine',
  html: `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;background:#fff;padding:30px;border-radius:10px;box-shadow:0 4px 6px rgba(0,0,0,0.1)">
      <div style="text-align:center;margin-bottom:30px">
        <div style="display:inline-block;background:#28a745;color:white;width:60px;height:60px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:15px">✅</div>
        <h1 style="color:#28a745;margin:0;font-size:24px">Bienvenue !</h1>
      </div>
      <p style="color:#333;font-size:16px;line-height:1.5">Bonjour <strong>${data.nom} ${data.prenom}</strong>,</p>
      <p style="color:#333;font-size:16px;line-height:1.5">Votre inscription a été validée avec succès.</p>
      <div style="background:#d4edda;border-left:4px solid #28a745;padding:15px;margin:20px 0;border-radius:4px">
        <p style="margin:0;color:#155724;font-size:14px">🎯 Vous pouvez maintenant vous connecter et accéder à votre espace personnel.</p>
      </div>
      <div style="text-align:center;margin-top:30px">
        <a href="${process.env.FRONTEND_URL || 'https://formations-cfp.netlify.app'}/login" style="background:#007bff;color:white;padding:15px 30px;text-decoration:none;border-radius:5px;font-weight:bold;display:inline-block">🚀 Me connecter</a>
      </div>
      <div style="margin-top:30px;padding-top:20px;border-top:1px solid #eee;text-align:center;color:#666;font-size:12px">
        <p>© 2024 CFP Charpentier Marine - Tous droits réservés</p>
      </div>
    </div>
  `,
  text: `Inscription validée !\n\nBonjour ${data.nom} ${data.prenom},\n\nVotre inscription a été validée.\n\nConnectez-vous: ${process.env.FRONTEND_URL || 'https://formations-cfp.netlify.app'}/login`
});

// Envoi ultra-rapide et fiable avec Resend - VERSION PRODUCTION
const sendEmailResend = async (mailOptions) => {
  console.log(`📧 ENVOI EMAIL RESEND - MODE PRODUCTION`);
  console.log(`   📧 Destinataire: ${mailOptions.to}`);
  console.log(`   📧 Sujet: ${mailOptions.subject}`);
  console.log(`   📧 API Key: ${process.env.RESEND_API_KEY ? 'CONFIGURÉE' : 'MANQUANTE'}`);
  
  // Vérification de la clé API
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ ERREUR: RESEND_API_KEY manquante');
    throw new Error('RESEND_API_KEY non configurée');
  }
  
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: mailOptions.to,
      subject: mailOptions.subject,
      html: mailOptions.html,
      text: mailOptions.text
    });

    if (error) {
      console.error('❌ Erreur Resend:', error);
      throw new Error(`Resend API Error: ${error.message}`);
    }

    console.log(`✅ EMAIL ENVOYÉ AVEC SUCCÈS (Resend):`);
    console.log(`   📧 ID: ${data.id}`);
    console.log(`   📧 Destinataire: ${mailOptions.to}`);
    console.log(`   📧 From: ${process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'}`);
    
    return { messageId: data.id, envelope: { to: [mailOptions.to] } };
  } catch (error) {
    console.error('❌ Erreur envoi Resend:', error.message);
    throw error;
  }
};

// Fonctions d'envoi avec Resend - VERSION FINALE
const sendFormateurValidatedEmail = async (data) => {
  console.log('📧 ENVOI EMAIL FORMATEUR - RESEND');
  const template = formateurTemplate(data);
  return sendEmailResend({
    to: data.email,
    ...template
  });
};

const sendApprenantValidatedEmail = async (data) => {
  console.log('📧 ENVOI EMAIL APPRENANT - RESEND');
  const template = apprenantTemplate(data);
  return sendEmailResend({
    to: data.email,
    ...template
  });
};

const sendEmailVerification = async (data) => {
  console.log('📧 ENVOI EMAIL VÉRIFICATION - RESEND');
  return sendEmailResend({
    to: data.email,
    subject: '🔔 Vérifiez votre email - CFP Charpentier Marine',
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;background:#fff;padding:30px;border-radius:10px;box-shadow:0 4px 6px rgba(0,0,0,0.1)">
        <div style="text-align:center;margin-bottom:30px">
          <div style="display:inline-block;background:#ffc107;color:white;width:60px;height:60px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:15px">🔔</div>
          <h1 style="color:#ffc107;margin:0;font-size:24px">Vérification Email</h1>
        </div>
        <p style="color:#333;font-size:16px;line-height:1.5">Bonjour <strong>${data.nom} ${data.prenom}</strong>,</p>
        <p style="color:#333;font-size:16px;line-height:1.5">Veuillez vérifier votre adresse email avec le code ci-dessous:</p>
        <div style="background:#fff3cd;border-left:4px solid #ffc107;padding:20px;margin:30px 0;border-radius:4px;text-align:center">
          <p style="margin:0 0 15px 0;font-size:18px;font-weight:bold;color:#856404">🔑 Code de vérification</p>
          <div style="font-size:32px;font-weight:bold;letter-spacing:3px;color:#856404;background:rgba(255,193,7,0.1);padding:15px;border-radius:4px;display:inline-block">${data.code}</div>
        </div>
        <div style="margin-top:30px;padding-top:20px;border-top:1px solid #eee;text-align:center;color:#666;font-size:12px">
          <p>© 2024 CFP Charpentier Marine - Tous droits réservés</p>
        </div>
      </div>
    `,
    text: `Code de vérification: ${data.code}`
  });
};

// Vérification du service
console.log('✅ Service email Resend - MODE PRODUCTION PRÊT');
console.log(`   📧 API Key: ${process.env.RESEND_API_KEY ? 'CONFIGURÉE' : 'MANQUANTE'}`);
console.log(`   📧 From Email: ${process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'}`);

module.exports = {
  sendFormateurValidatedEmail,
  sendApprenantValidatedEmail,
  sendEmailVerification,
};
