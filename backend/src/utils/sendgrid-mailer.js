const sgMail = require('@sendgrid/mail');
const nodemailer = require('nodemailer');
const config = require('../config/config');

// Initialiser SendGrid avec votre API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

async function sendMail({ to, subject, html, text }) {
  // Utiliser Gmail directement comme service principal
  const backup = config.emailBackup || {};
  if (backup?.auth?.user && backup?.auth?.pass) {
    try {
      const sanitizedPass = String(backup.auth.pass || '').replace(/\s+/g, '');
      const transporter = nodemailer.createTransport({
        host: backup.host,
        port: backup.port,
        secure: backup.secure,
        auth: {
          user: backup.auth.user,
          pass: sanitizedPass
        }
      });
      const info = await transporter.sendMail({
        from: `${backup.auth.user}`,
        to,
        subject,
        text,
        html
      });
      console.log('✅ Email Gmail envoyé avec succès:', info.messageId);
      return info;
    } catch (smtpErr) {
      console.error('❌ Erreur Gmail:', smtpErr.message);
    }
  }

  // Fallback SendGrid si configuré
  const apiKey = process.env.SENDGRID_API_KEY || config.email.sendgridApiKey;
  if (apiKey) {
    try {
      sgMail.setApiKey(apiKey);
      const msg = {
        to,
        from: {
          email: process.env.EMAIL_FROM || config.email.from || 'no-reply@cfp-charpentier-marine.com',
          name: 'CFP Charpentier Marine'
        },
        subject,
        text,
        html
      };
      const result = await sgMail.send(msg);
      console.log('✅ Email SendGrid envoyé avec succès');
      return result;
    } catch (error) {
      console.error('❌ Erreur SendGrid:', error.response?.body || error.message);
    }
  }
  try {
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    const info = await transporter.sendMail({
      from: 'CFP Charpentier Marine <no-reply@example.com>',
      to,
      subject,
      text,
      html
    });
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log('✅ Email SMTP (Ethereal) envoyé:', info.messageId);
    if (previewUrl) {
      console.log('🔎 Preview URL:', previewUrl);
    }
    return { ethereal: true, messageId: info.messageId, previewUrl };
  } catch (etherealErr) {
    console.warn('⚠️ Aucun service email configuré. Journalisation uniquement.');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Text:', text);
    console.log('HTML:', html);
    return { simulated: true };
  }
}

async function sendFormateurValidatedEmail({ email, nom, prenom, codeFormateur, adminMessage }) {
  const appUrl = config.frontendUrl || 'http://localhost:3000';
  const subject = 'Validation de votre compte formateur - Code daccès';
  const text = `Bonjour ${prenom} ${nom},

Votre compte formateur a été validé.
Votre code d'accès formateur est: ${codeFormateur}

Vous pouvez maintenant vous connecter sur: ${appUrl}/formateur/code

Cordialement,
L'équipe CFP Charpentier Marine`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">✅ Compte Validé</h1>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-top: 0;">Bonjour ${prenom} ${nom},</h2>
        <p style="color: #666; line-height: 1.6;">Votre compte formateur a été validé avec succès !</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
          <p style="margin: 0; color: #333;"><strong>Votre code d'accès formateur:</strong></p>
          <p style="font-size: 24px; font-weight: bold; color: #667eea; margin: 10px 0;">${codeFormateur}</p>
        </div>
        
        ${adminMessage ? `<div style="background:#fff; padding:16px; border-radius:8px; border-left:4px solid #4B5563; color:#374151;">
          <p style="margin:0;"><strong>Message de l'administrateur:</strong></p>
          <p style="margin-top:8px;">${adminMessage}</p>
        </div>` : ''}
        
        <p style="color: #999; font-size: 14px; margin-top: 30px;">
          Cordialement,<br>
          L'équipe CFP Charpentier Marine
        </p>
      </div>
    </div>
  `;

  return sendMail({ to: email, subject, text, html });
}

async function sendApprenantValidatedEmail({ email, nom, prenom }) {
  const appUrl = config.frontendUrl || 'http://localhost:3000';
  const subject = 'Validation de votre compte apprenant';
  const text = `Bonjour ${prenom} ${nom},

Votre compte apprenant a été validé par l'administrateur.

Vous pouvez maintenant vous connecter sur: ${appUrl}/login

Cordialement,
L'équipe CFP Charpentier Marine`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); padding: 30px; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">🎉 Compte Apprenant Validé</h1>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-top: 0;">Bonjour ${prenom} ${nom},</h2>
        <p style="color: #666; line-height: 1.6;">Votre compte apprenant a été validé avec succès par l'administrateur !</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50;">
          <p style="margin: 0; color: #333;">
            <strong>✅ Votre compte est maintenant actif</strong><br>
            Vous pouvez accéder à votre espace personnel et suivre vos formations.
          </p>
        </div>
        
        <p style="color: #999; font-size: 14px; margin-top: 30px;">
          Cordialement,<br>
          L'équipe CFP Charpentier Marine
        </p>
      </div>
    </div>
  `;

  return sendMail({ to: email, subject, text, html });
}

async function sendEmailVerification({ email, nom, prenom, code }) {
  const appUrl = config.frontendUrl || 'http://localhost:3000';
  const subject = 'Vérification de votre adresse email';
  const text = `Bonjour ${prenom} ${nom},

Pour finaliser votre inscription en tant que formateur, veuillez saisir le code de vérification suivant:
Code: ${code}

Vous pouvez saisir votre code ici: ${appUrl}/verify-email

Bien cordialement,
CFP Charpentier Marine`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%); padding: 30px; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">🔐 Vérification Email</h1>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-top: 0;">Bonjour ${prenom} ${nom},</h2>
        <p style="color: #666; line-height: 1.6;">Pour finaliser votre inscription en tant que formateur, veuillez saisir le code de vérification suivant:</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FF6B6B;">
          <p style="margin: 0; color: #333;"><strong>Votre code de vérification:</strong></p>
          <p style="font-size: 32px; font-weight: bold; color: #FF6B6B; margin: 10px 0; letter-spacing: 3px;">${code}</p>
        </div>
        
        <p style="color: #999; font-size: 14px; margin-top: 30px;">
          Bien cordialement,<br>
          CFP Charpentier Marine
        </p>
      </div>
    </div>
  `;

  return sendMail({ to: email, subject, text, html });
}

module.exports = {
  sendMail,
  sendFormateurValidatedEmail,
  sendApprenantValidatedEmail,
  sendEmailVerification
};
