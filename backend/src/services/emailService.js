const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

class EmailService {
  constructor() {
    this.transporter = null;
    this.isInitialized = false;
    this.initializeTransporter();
  }

  async initializeTransporter() {
    try {
      // Configuration Gmail SMTP
      const config = {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 465,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS?.replace(/\s+/g, '') // Enlever les espaces
        }
      };

      console.log('📧 Configuration Gmail:', {
        host: config.host,
        port: config.port,
        secure: config.secure,
        user: config.auth.user
      });

      this.transporter = nodemailer.createTransport(config);
      
      // Tester la connexion
      await this.transporter.verify();
      this.isInitialized = true;
      console.log('✅ Service email Gmail initialisé avec succès');
      
    } catch (error) {
      console.error('❌ Erreur initialisation email service:', error.message);
      this.isInitialized = false;
    }
  }

  async sendEmail({ to, subject, html, text }) {
    if (!this.isInitialized) {
      await this.initializeTransporter();
    }

    if (!this.isInitialized) {
      throw new Error('Service email non disponible');
    }

    try {
      const mailOptions = {
        from: {
          name: 'CFP Charpentier Marine',
          address: process.env.EMAIL_FROM || process.env.EMAIL_USER
        },
        to,
        subject,
        text,
        html
      };

      console.log('📧 Envoi d\'email:', {
        to,
        subject,
        from: mailOptions.from
      });

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email envoyé avec succès:', result.messageId);
      console.log('📨 Détails:', {
        messageId: result.messageId,
        envelope: result.envelope,
        accepted: result.accepted,
        rejected: result.rejected
      });
      return result;
      
    } catch (error) {
      console.error('❌ Erreur envoi email:', {
        message: error.message,
        code: error.code,
        command: error.command,
        response: error.response
      });
      throw error;
    }
  }

  // Template pour email de validation formateur
  async sendFormateurValidation({ email, nom, prenom, codeFormateur, adminMessage }) {
    const subject = '✅ Votre compte formateur a été validé - CFP Charpentier Marine';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Validation Compte Formateur</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2c3e50; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .code-box { background: #e74c3c; color: white; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0; }
          .footer { background: #34495e; color: white; padding: 15px; text-align: center; font-size: 12px; }
          .btn { display: inline-block; padding: 12px 24px; background: #3498db; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Compte Formateur Validé</h1>
          </div>
          <div class="content">
            <p>Bonjour <strong>${prenom} ${nom}</strong>,</p>
            <p>Nous avons le plaisir de vous informer que votre compte formateur a été validé par notre équipe administrative.</p>
            
            <p>Votre code d'accès formateur est :</p>
            <div class="code-box">${codeFormateur}</div>
            
            ${adminMessage ? `<p><strong>Message de l'administrateur :</strong></p><p>${adminMessage}</p>` : ''}
            
            <p>Vous pouvez maintenant vous connecter et accéder à toutes les fonctionnalités réservées aux formateurs.</p>
            
            <a href="${process.env.FRONTEND_URL}" class="btn">Me connecter maintenant</a>
            
            <p>Cordialement,<br>L'équipe CFP Charpentier Marine</p>
          </div>
          <div class="footer">
            <p>© 2024 CFP Charpentier Marine - Centre de Formation Professionnelle</p>
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Bonjour ${prenom} ${nom},
      
      Votre compte formateur a été validé !
      
      Votre code d'accès formateur est : ${codeFormateur}
      
      ${adminMessage ? `Message de l'administrateur : ${adminMessage}` : ''}
      
      Connectez-vous dès maintenant : ${process.env.FRONTEND_URL}
      
      Cordialement,
      L'équipe CFP Charpentier Marine
    `;

    return this.sendEmail({ to: email, subject, html, text });
  }

  // Template pour email de validation apprenant
  async sendApprenantValidation({ email, nom, prenom }) {
    const subject = '✅ Votre inscription a été validée - CFP Charpentier Marine';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Inscription Validée</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #27ae60; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .footer { background: #34495e; color: white; padding: 15px; text-align: center; font-size: 12px; }
          .btn { display: inline-block; padding: 12px 24px; background: #3498db; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 Inscription Validée</h1>
          </div>
          <div class="content">
            <p>Bonjour <strong>${prenom} ${nom}</strong>,</p>
            <p>Nous avons le plaisir de vous informer que votre inscription a été validée par notre équipe.</p>
            
            <p>Vous pouvez maintenant vous connecter et accéder à votre espace personnel pour :</p>
            <ul>
              <li>Consulter les formations disponibles</li>
              <li>Voir les ateliers programmés</li>
              <li>Suivre votre progression</li>
            </ul>
            
            <a href="${process.env.FRONTEND_URL}" class="btn">Me connecter maintenant</a>
            
            <p>Nous sommes ravis de vous accueillir au CFP Charpentier Marine !</p>
            
            <p>Cordialement,<br>L'équipe CFP Charpentier Marine</p>
          </div>
          <div class="footer">
            <p>© 2024 CFP Charpentier Marine - Centre de Formation Professionnelle</p>
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Bonjour ${prenom} ${nom},
      
      Votre inscription a été validée !
      
      Vous pouvez maintenant vous connecter et accéder à toutes les fonctionnalités.
      
      Connectez-vous : ${process.env.FRONTEND_URL}
      
      Cordialement,
      L'équipe CFP Charpentier Marine
    `;

    return this.sendEmail({ to: email, subject, html, text });
  }

  // Template pour email de vérification (inscription formateur)
  async sendEmailVerification({ email, nom, prenom, code }) {
    const subject = '🔐 Vérification de votre email - CFP Charpentier Marine';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Vérification Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f39c12; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .code-box { background: #e67e22; color: white; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0; }
          .footer { background: #34495e; color: white; padding: 15px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Vérification Email</h1>
          </div>
          <div class="content">
            <p>Bonjour <strong>${prenom} ${nom}</strong>,</p>
            <p>Merci de vous être inscrit comme formateur au CFP Charpentier Marine.</p>
            
            <p>Pour finaliser votre inscription, veuillez utiliser ce code de vérification :</p>
            <div class="code-box">${code}</div>
            
            <p>Ce code est valable pendant 30 minutes.</p>
            
            <p>Une fois votre email vérifié, votre compte sera soumis à validation par notre équipe administrative.</p>
            
            <p>Cordialement,<br>L'équipe CFP Charpentier Marine</p>
          </div>
          <div class="footer">
            <p>© 2024 CFP Charpentier Marine - Centre de Formation Professionnelle</p>
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Bonjour ${prenom} ${nom},
      
      Merci de votre inscription comme formateur au CFP Charpentier Marine.
      
      Votre code de vérification est : ${code}
      
      Ce code est valable pendant 30 minutes.
      
      Cordialement,
      L'équipe CFP Charpentier Marine
    `;

    return this.sendEmail({ to: email, subject, html, text });
  }
}

// Exporter une instance singleton
const emailService = new EmailService();

module.exports = {
  sendFormateurValidatedEmail: (data) => emailService.sendFormateurValidation(data),
  sendApprenantValidatedEmail: (data) => emailService.sendApprenantValidation(data),
  sendEmailVerification: (data) => emailService.sendEmailVerification(data),
  sendMail: (data) => emailService.sendEmail(data)
};
