const nodemailer = require('nodemailer');
const config = require('../config/config');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  const { host, port, secure, auth } = config.email || {};
  if (!auth?.user || !auth?.pass) {
    console.warn('Email non configuré (EMAIL_USER/EMAIL_PASS manquants). Les emails seront journalisés.');
    return null;
  }
  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth
  });
  return transporter;
}

async function sendMail({ to, subject, html, text }) {
  const t = getTransporter();
  if (!t) {
    console.log('--- EMAIL (simulation) ---');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Text:', text);
    console.log('HTML:', html);
    console.log('--------------------------');
    return { simulated: true };
  }
  const info = await t.sendMail({
    from: config.email.from,
    to,
    subject,
    text,
    html
  });
  return info;
}

async function sendFormateurValidatedEmail({ email, nom, prenom, codeFormateur }) {
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
        <h1 style="color: white; margin: 0; font-size: 24px;"> Compte Validé</h1>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-top: 0;">Bonjour ${prenom} ${nom},</h2>
        <p style="color: #666; line-height: 1.6;">Votre compte formateur a été validé avec succès !</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
          <p style="margin: 0; color: #333;"><strong>Votre code d'accès formateur:</strong></p>
          <p style="font-size: 24px; font-weight: bold; color: #667eea; margin: 10px 0;">${codeFormateur}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${appUrl}/formateur/code" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
            Se Connecter
          </a>
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
        <h1 style="color: white; margin: 0; font-size: 24px;"> Compte Apprenant Validé</h1>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-top: 0;">Bonjour ${prenom} ${nom},</h2>
        <p style="color: #666; line-height: 1.6;">Votre compte apprenant a été validé avec succès par l'administrateur !</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50;">
          <p style="margin: 0; color: #333;">
            <strong> Votre compte est maintenant actif</strong><br>
            Vous pouvez accéder à votre espace personnel et suivre vos formations.
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${appUrl}/login" style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
            Se Connecter
          </a>
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

Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.

Vous pouvez saisir votre code ici: ${appUrl}/verify-email

CFP Charpentier Marine`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #111827;">
      <h2 style="color:#1f2937;">Vérification de votre adresse email</h2>
      <p>Bonjour <strong>${prenom} ${nom}</strong>,</p>
      <p>Pour finaliser votre inscription en tant que formateur, veuillez saisir le code de vérification suivant:</p>
      <div style="display:inline-block;padding:12px 16px;border-radius:8px;background:#ecfdf5;color:#065f46;font-weight:bold;letter-spacing:1px;">
        ${code}
      </div>
      <p style="margin-top:16px;">Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
      <p>Vous pouvez saisir votre code ici: <a href="${appUrl}/verify-email">${appUrl}/verify-email</a></p>
      <p style="margin-top:24px;">Bien cordialement,<br/>CFP Charpentier Marine</p>
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
