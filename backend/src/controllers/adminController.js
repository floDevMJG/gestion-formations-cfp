// src/controllers/adminController.js
const { User, Formation, Inscription, Atelier } = require('../models');
const bcrypt = require('bcryptjs');
const { notifyFormateurValidated } = require('./notificationController');
const { sendFormateurValidatedEmail, sendApprenantValidatedEmail } = require('../utils/sendgrid-mailer');

// Gestion des utilisateurs
const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query; // Filtrer par rôle si fourni
    const where = role ? { role } : {};

    const users = await User.findAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    // Log pour déboguer les codes formateur
    if (role === 'formateur') {
      console.log('Utilisateurs formateurs récupérés:');
      users.forEach(user => {
        console.log(`- ${user.nom} ${user.prenom}: statut=${user.statut}, codeFormateur=${user.codeFormateur}`);
      });
    }

    res.json(users);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const createUser = async (req, res) => {
  try {
    const { nom, prenom, email, password, role } = req.body;
    
    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }
    
    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Déterminer le statut initial
    // Admin et formateur sont automatiquement validés, apprenants doivent attendre validation
    let statut = 'valide';
    if (role === 'apprenant') {
      statut = 'en_attente';
    }
    
    const user = await User.create({
      nom,
      prenom,
      email,
      password: hashedPassword,
      role: role || 'apprenant',
      statut
    });
    
    const userResponse = user.toJSON();
    delete userResponse.password;
    
    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: userResponse
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, prenom, email, role, password } = req.body;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé' });
      }
    }
    
    // Mettre à jour les champs
    if (nom) user.nom = nom;
    if (prenom) user.prenom = prenom;
    if (email) user.email = email;
    if (role) user.role = role;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    
    await user.save();
    
    const userResponse = user.toJSON();
    delete userResponse.password;
    
    res.json({
      message: 'Utilisateur mis à jour avec succès',
      user: userResponse
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    await user.destroy();
    
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Gestion des formations
const updateFormation = async (req, res) => {
  try {
    const { id } = req.params;
    const { titre, description, duree, niveau, places } = req.body;
    
    const formation = await Formation.findByPk(id);
    if (!formation) {
      return res.status(404).json({ message: 'Formation non trouvée' });
    }
    
    if (titre) formation.titre = titre;
    if (description) formation.description = description;
    if (duree) formation.duree = duree;
    if (niveau) formation.niveau = niveau;
    if (places) formation.places = places;
    
    await formation.save();
    
    res.json({
      message: 'Formation mise à jour avec succès',
      formation
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const deleteFormation = async (req, res) => {
  try {
    const { id } = req.params;
    
    const formation = await Formation.findByPk(id);
    if (!formation) {
      return res.status(404).json({ message: 'Formation non trouvée' });
    }
    
    await formation.destroy();
    
    res.json({ message: 'Formation supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Gestion des inscriptions
const getAllInscriptions = async (req, res) => {
  try {
    const { statut, formationId } = req.query;
    const where = {};

    if (statut) where.statutPaiement = statut;
    if (formationId) where.formationId = formationId;

    const inscriptions = await Inscription.findAll({
      where,
      order: [['dateInscription', 'DESC']]
    });

    // Récupérer les utilisateurs et formations séparément
    const inscriptionsWithDetails = await Promise.all(
      inscriptions.map(async (inscription) => {
        const user = await User.findByPk(inscription.userId, {
          attributes: ['id', 'nom', 'prenom', 'email', 'role']
        });
        const formation = await Formation.findByPk(inscription.formationId, {
          attributes: ['id', 'titre', 'description', 'duree']
        });
        return {
          ...inscription.toJSON(),
          User: user,
          Formation: formation
        };
      })
    );

    res.json(inscriptionsWithDetails);
  } catch (error) {
    console.error('Erreur lors de la récupération des inscriptions:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const acceptInscription = async (req, res) => {
  try {
    const { id } = req.params;
    
    const inscription = await Inscription.findByPk(id);
    if (!inscription) {
      return res.status(404).json({ message: 'Inscription non trouvée' });
    }
    
    inscription.statutPaiement = 'paye';
    await inscription.save();
    
    res.json({
      message: 'Inscription acceptée avec succès',
      inscription
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const rejectInscription = async (req, res) => {
  try {
    const { id } = req.params;

    const inscription = await Inscription.findByPk(id);
    if (!inscription) {
      return res.status(404).json({ message: 'Inscription non trouvée' });
    }

    inscription.statutPaiement = 'annule';
    await inscription.save();

    res.json({
      message: 'Inscription rejetée',
      inscription
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const pendingInscription = async (req, res) => {
  try {
    const { id } = req.params;

    const inscription = await Inscription.findByPk(id);
    if (!inscription) {
      return res.status(404).json({ message: 'Inscription non trouvée' });
    }

    inscription.statutPaiement = 'en_attente';
    await inscription.save();

    res.json({
      message: 'Inscription mise en attente',
      inscription
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const deleteInscription = async (req, res) => {
  try {
    const { id } = req.params;
    
    const inscription = await Inscription.findByPk(id);
    if (!inscription) {
      return res.status(404).json({ message: 'Inscription non trouvée' });
    }
    
    await inscription.destroy();
    
    res.json({ message: 'Inscription supprimée avec succès' });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const testSendValidation = async (req, res) => {
  try {
    const { email, nom = 'Test', prenom = 'User', role = 'apprenant', codeFormateur, message } = req.body || {};
    if (!email) {
      return res.status(400).json({ message: 'Email requis' });
    }
    if (role === 'formateur') {
      await sendFormateurValidatedEmail({ email, nom, prenom, codeFormateur: codeFormateur || 'CFP-0000', adminMessage: message });
      return res.json({ success: true, role, email });
    } else {
      await sendApprenantValidatedEmail({ email, nom, prenom });
      return res.json({ success: true, role, email });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// Fonction pour générer un code formateur unique
const generateFormateurCode = () => {
  const prefix = 'CFP';
  const randomNum = Math.floor(1000 + Math.random() * 9000); // 4 chiffres
  return `${prefix}-${randomNum}`;
};

// Renvoyer l'email avec le code formateur (sans régénérer le code)
const resendFormateurCodeEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body || {};
    if (!id || isNaN(id)) {
      return res.status(400).json({ message: 'ID utilisateur invalide' });
    }
    const user = await User.findByPk(parseInt(id));
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    if (user.role !== 'formateur') {
      return res.status(400).json({ message: 'Cet utilisateur n\'est pas un formateur' });
    }
    if (!user.codeFormateur) {
      return res.status(400).json({ message: 'Aucun code formateur associé. Validez le formateur d\'abord.' });
    }
    await sendFormateurValidatedEmail({
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      codeFormateur: user.codeFormateur,
      adminMessage: message
    });
    await notifyFormateurValidated(user.id, user.codeFormateur);
    res.json({ message: 'Email renvoyé avec le code formateur', codeFormateur: user.codeFormateur });
  } catch (error) {
    console.error('Erreur lors du renvoi de l\'email code formateur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Validation des utilisateurs (pour les apprenants et formateurs)
const validateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body; // Message optionnel de l'admin

    console.log(`Tentative de validation de l'utilisateur ID: ${id}`);

    // Vérifier que l'ID est valide
    if (!id || isNaN(id)) {
      return res.status(400).json({ message: 'ID utilisateur invalide' });
    }

    const user = await User.findByPk(parseInt(id));
    if (!user) {
      console.log(`Utilisateur avec ID ${id} non trouvé`);
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    console.log(`Validation de l'utilisateur: ${user.nom} ${user.prenom} (${user.email}) - Rôle: ${user.role}`);

    // Vérifier si l'utilisateur est déjà validé
    if (user.statut === 'valide') {
      return res.status(400).json({ message: 'Cet utilisateur est déjà validé' });
    }

  // Pour les formateurs: si email non vérifié, le marquer vérifié lors de la validation admin
  if (user.role === 'formateur' && !user.emailVerified) {
    user.emailVerified = true;
    console.log(`Email marqué comme vérifié par admin pour le formateur ${user.email}`);
  }

    user.statut = 'valide';

    // Si c'est un formateur, générer un code spécial
    if (user.role === 'formateur') {
      const codeFormateur = generateFormateurCode();
      user.codeFormateur = codeFormateur;
      console.log(`Code formateur généré: ${codeFormateur} pour ${user.email}`);

      // Créer une notification pour le formateur
      try {
        await notifyFormateurValidated(user.id, codeFormateur);
        console.log(`Notification envoyée au formateur ${user.email} avec code: ${codeFormateur}`);
      } catch (notifyError) {
        console.warn('Erreur lors de l\'envoi de la notification au formateur:', notifyError);
        // Ne pas bloquer la validation si la notification échoue
      }

      // Envoi d'email au formateur avec le code
      try {
        await sendFormateurValidatedEmail({
          email: user.email,
          nom: user.nom,
          prenom: user.prenom,
          codeFormateur,
          adminMessage: message
        });
        console.log(`Email de validation envoyé à ${user.email}`);
      } catch (mailError) {
        console.warn('Erreur lors de l\'envoi de l\'email de validation formateur:', mailError);
        // Ne pas bloquer la validation si l'email échoue
      }

      console.log(`Code formateur généré pour ${user.email}: ${codeFormateur}`);
      console.log(`Message admin: ${message || 'Aucun message'}`);
    } else if (user.role === 'apprenant') {
      // Envoi d'email à l'apprenant validé
      try {
        await sendApprenantValidatedEmail({
          email: user.email,
          nom: user.nom,
          prenom: user.prenom
        });
        console.log(`Email de validation envoyé à l'apprenant ${user.email}`);
      } catch (mailError) {
        console.warn('Erreur lors de l\'envoi de l\'email de validation apprenant:', mailError);
        // Ne pas bloquer la validation si l'email échoue
      }
    }

    console.log(`Sauvegarde de l'utilisateur ${user.email} avec statut: ${user.statut}, codeFormateur: ${user.codeFormateur}`);
    await user.save();
    console.log(`Utilisateur ${user.email} sauvegardé avec succès`);
    console.log(`Utilisateur ${user.email} validé avec succès`);

    const userResponse = user.toJSON();
    delete userResponse.password;

    console.log(`Réponse de validation - User:`, {
      id: userResponse.id,
      email: userResponse.email,
      role: userResponse.role,
      statut: userResponse.statut,
      codeFormateur: userResponse.codeFormateur
    });

    res.json({
      message: 'Utilisateur validé avec succès',
      user: userResponse,
      codeFormateur: user.role === 'formateur' ? user.codeFormateur : undefined
    });
  } catch (error) {
    console.error('Erreur lors de la validation utilisateur:', error);
    console.error('Détails de l\'erreur:', error.message);
    console.error('Stack:', error.stack);

    // Retourner un message d'erreur plus détaillé
    const errorMessage = error.message || 'Erreur serveur lors de la validation';
    res.status(500).json({
      message: `Erreur lors de la validation: ${errorMessage}`,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

const rejectUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    user.statut = 'rejete';
    await user.save();
    
    const userResponse = user.toJSON();
    delete userResponse.password;
    
    res.json({
      message: 'Utilisateur rejeté',
      user: userResponse
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Remettre un utilisateur en attente
const pendingUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    user.statut = 'en_attente';
    await user.save();
    
    const userResponse = user.toJSON();
    delete userResponse.password;
    
    res.json({
      message: 'Utilisateur remis en attente',
      user: userResponse
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Obtenir les utilisateurs en attente de validation
const getPendingUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { 
        role: 'apprenant',
        statut: 'en_attente'
      },
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
    
    res.json(users);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Obtenir les formateurs en attente
const getPendingFormateurs = async (req, res) => {
  try {
    const formateurs = await User.findAll({
      where: { 
        role: 'formateur',
        statut: 'en_attente'
      },
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
    
    res.json(formateurs);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Statistiques
const getStats = async (req, res) => {
  try {
    console.log('Récupération des statistiques...');
    const totalUsers = await User.count();
    console.log(`Total utilisateurs: ${totalUsers}`);
    const totalApprenants = await User.count({ where: { role: 'apprenant' } });
    console.log(`Total apprenants: ${totalApprenants}`);
    const totalFormateurs = await User.count({ where: { role: 'formateur' } });
    console.log(`Total formateurs: ${totalFormateurs}`);
    const totalFormations = await Formation.count();
    console.log(`Total formations: ${totalFormations}`);
    
    // Compter les ateliers avec Sequelize
    const totalAteliers = await Atelier.count();
    console.log(`Total ateliers: ${totalAteliers}`);
    
    const totalInscriptions = await Inscription.count();
    console.log(`Total inscriptions: ${totalInscriptions}`);
    const inscriptionsPayees = await Inscription.count({ where: { statutPaiement: 'paye' } });
    console.log(`Inscriptions payées: ${inscriptionsPayees}`);
    const inscriptionsEnAttente = await Inscription.count({ where: { statut: 'en_attente' } });
    console.log(`Inscriptions en attente: ${inscriptionsEnAttente}`);
    const usersEnAttente = await User.count({ where: { role: 'apprenant', statut: 'en_attente' } });
    console.log(`Utilisateurs en attente: ${usersEnAttente}`);
    const formateursEnAttente = await User.count({ where: { role: 'formateur', statut: 'en_attente' } });
    console.log(`Formateurs en attente: ${formateursEnAttente}`);
    
    const stats = {
      totalUsers,
      totalApprenants,
      totalFormateurs,
      totalFormations,
      totalAteliers,
      totalInscriptions,
      inscriptionsPayees,
      inscriptionsEnAttente,
      usersEnAttente,
      formateursEnAttente
    };

    console.log('Statistiques récupérées:', stats);
    res.json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = {
  // Utilisateurs
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  validateUser,
  testSendValidation,
  resendFormateurCodeEmail,
  rejectUser,
  pendingUser,
  getPendingUsers,
  getPendingFormateurs,
  // Formations
  updateFormation,
  deleteFormation,
  // Inscriptions
  getAllInscriptions,
  acceptInscription,
  rejectInscription,
  pendingInscription,
  deleteInscription,
  // Statistiques
  getStats
};
