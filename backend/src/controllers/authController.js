// src/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { notifyNewFormateur, notifyNewStudent } = require('./notificationController');
const { sendEmailVerification } = require('../utils/sendgrid-mailer');

const register = async (req, res) => {
  try {
    let { nom, prenom, email, password, role = 'apprenant', telephone, adresse, dateNaissance } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Déterminer le statut initial
    // Les administrateurs sont automatiquement validés
    // Les apprenants doivent être validés par l'admin
    // Les formateurs doivent être validés par l'admin
    let statut = 'valide';
    if (role === 'formateur') {
      statut = 'en_attente'; // Doit être validé par l'admin
    } else if (role === 'apprenant') {
      statut = 'en_attente'; // Doit être validé par l'admin
    }

    // Mapper 'etudiant' vers 'apprenant' pour la cohérence
    if (role === 'etudiant') {
      role = 'apprenant';
    }

    // Créer l'utilisateur
    const user = await User.create({
      nom,
      prenom,
      email,
      password: hashedPassword,
      role,
      statut,
      telephone: telephone || null,
      adresse: adresse || null,
      dateNaissance: dateNaissance || null
    });

    // Créer des notifications et vérifier l'email selon le rôle
    if (role === 'formateur') {
      console.log('Création de notification pour nouveau formateur:', user.email);
      await notifyNewFormateur(user.id);
      console.log('Notification formateur créée avec succès');
      // Générer et envoyer un code de vérification email
      const code = String(Math.floor(100000 + Math.random() * 900000)); // 6 chiffres
      user.emailVerified = false;
      user.emailVerificationCode = code;
      user.emailVerificationExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      await user.save();
      try {
        await sendEmailVerification({ email: user.email, nom: user.nom, prenom: user.prenom, code });
        console.log(`Email de vérification envoyé à ${user.email}`);
      } catch (mailError) {
        console.warn('Erreur envoi email de vérification:', mailError.message);
      }
    } else if (role === 'apprenant') {
      console.log('Création de notification pour nouvel apprenant:', user.email);
      await notifyNewStudent(user.id);
      console.log('Notification apprenant créée avec succès');
    }

    // Générer un token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Ne pas renvoyer le mot de passe
    const userResponse = user.toJSON();
    delete userResponse.password;

    res.status(201).json({
      message: role === 'formateur'
        ? 'Inscription réussie. Un code de vérification a été envoyé à votre email.'
        : 'Inscription réussie',
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ message: 'Erreur lors de l\'inscription' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, codeFormateur } = req.body;

    // Trouver l'utilisateur
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Vérifier le mot de passe, avec compatibilité mots de passe en clair (migration)
    let isPasswordValid = false;
    const stored = user.password || '';
    const looksHashed = typeof stored === 'string' && stored.startsWith('$2');
    if (looksHashed) {
      isPasswordValid = await bcrypt.compare(password, stored);
    } else {
      // Mot de passe probablement non haché dans la base (ancien dump)
      isPasswordValid = password === stored;
      if (isPasswordValid) {
        try {
          const newHash = await bcrypt.hash(password, 10);
          user.password = newHash;
          await user.save(); // mise à jour silencieuse vers hash
        } catch (e) {
          console.error('Erreur lors du re-hash du mot de passe legacy:', e.message);
        }
      }
    }
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Assouplir la vérification de statut: permettre la connexion pour tous les rôles
    // L'accès fin (permissions) est géré par les middlewares des routes.

    // Pour les formateurs validés, vérifier le code si fourni
    if (user.role === 'formateur' && (user.statut === 'valide' || user.statut === 'actif' || user.statut === 'en_attente')) {
      // Si le code n'est pas fourni, indiquer qu'il est requis
      if (!codeFormateur) {
        return res.status(200).json({
          message: 'Code formateur requis',
          requiresCode: true,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            nom: user.nom,
            prenom: user.prenom
          }
        });
      }

      // Vérifier le code
      console.log(`Vérification du code pour ${user.email}. Attendu: '${user.codeFormateur}', Reçu: '${codeFormateur}'`);
      if (user.codeFormateur !== codeFormateur) {
        return res.status(401).json({ 
          message: 'Code formateur incorrect',
          requiresCode: true
        });
      }
    }

    // Générer un token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Ne pas renvoyer le mot de passe
    const userResponse = user.toJSON();
    delete userResponse.password;

    // S'assurer que le rôle est bien inclus
    console.log('User connecté:', {
      id: userResponse.id,
      email: userResponse.email,
      role: userResponse.role,
      nom: userResponse.nom
    });

    res.json({
      message: 'Connexion réussie',
      user: {
        id: userResponse.id,
        nom: userResponse.nom,
        prenom: userResponse.prenom,
        email: userResponse.email,
        role: userResponse.role || 'apprenant',
        statut: userResponse.statut || 'valide'
      },
      token,
      requiresCode: false
    });

  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ message: 'Erreur lors de la connexion' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    res.json(user);
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const updateMe = async (req, res) => {
  try {
    const allowed = ['nom', 'prenom', 'email', 'telephone', 'adresse', 'dateNaissance', 'bio'];
    const payload = {};
    allowed.forEach((k) => {
      if (Object.prototype.hasOwnProperty.call(req.body, k)) {
        payload[k] = req.body[k];
      }
    });
    if (payload.email) {
      const existing = await User.findOne({ where: { email: payload.email } });
      if (existing && existing.id !== req.user.id) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé' });
      }
    }
    const [affected] = await User.update(payload, { where: { id: req.user.id } });
    if (!affected) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    const updated = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    res.json(updated);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
const verifyFormateurCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: 'Email et code sont requis' });
    }
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    if (user.role !== 'formateur') {
      return res.status(400).json({ message: 'Ce compte n\'est pas un formateur' });
    }
    const expected = user.codeFormateur || '';
    const provided = String(code).trim();
    console.log(`Vérification dédiée du code pour ${email}: attendu='${expected}', reçu='${provided}'`);
    if (!expected) {
      return res.status(400).json({ message: 'Aucun code formateur défini pour cet utilisateur', valid: false });
    }
    const valid = expected === provided;
    if (!valid) {
      return res.status(401).json({ message: 'Code formateur incorrect', valid: false });
    }
    return res.json({ valid: true, message: 'Code formateur valide' });
  } catch (error) {
    console.error('Erreur lors de la vérification du code formateur:', error);
    res.status(500).json({ message: 'Erreur lors de la vérification du code' });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: 'Email et code sont requis' });
    }
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    const expected = user.emailVerificationCode || '';
    const expires = user.emailVerificationExpires || null;
    const now = new Date();
    if (!expected) {
      return res.status(400).json({ message: 'Aucun code de vérification en attente' });
    }
    if (expires && now > expires) {
      return res.status(400).json({ message: 'Code expiré. Veuillez redemander la vérification.' });
    }
    const provided = String(code).trim();
    if (expected !== provided) {
      return res.status(401).json({ message: 'Code incorrect' });
    }
    user.emailVerified = true;
    user.emailVerificationCode = null;
    user.emailVerificationExpires = null;
    await user.save();
    return res.json({ message: 'Email vérifié avec succès' });
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'email:', error);
    res.status(500).json({ message: 'Erreur lors de la vérification de l\'email' });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateMe,
  verifyFormateurCode,
  verifyEmail
};
