// src/controllers/inscriptionController.js
const { Inscription, Formation, User, Notification, Paiement } = require('../models');

// Fonction utilitaire pour créer une notification
const createNotification = async (userId, message, type = 'info') => {
  try {
    await Notification.create({
      userId,
      message,
      lue: false
    });
  } catch (error) {
    console.error('Erreur lors de la création de la notification:', error);
  }
};

const createInscription = async (req, res) => {
  try {
    const { formationId, montant, methodePaiement, numeroTelephone } = req.body;
    const userId = req.user.id; // Récupéré depuis le middleware d'authentification

    // Vérifier si la formation existe
    const formation = await Formation.findByPk(formationId);
    if (!formation) {
      return res.status(404).json({ message: 'Formation non trouvée' });
    }

    // Vérifier si l'utilisateur est déjà inscrit à cette formation
    const existingInscription = await Inscription.findOne({
      where: {
        userId,
        formationId
      }
    });

    if (existingInscription) {
      return res.status(400).json({ message: 'Vous êtes déjà inscrit à cette formation' });
    }

    // Générer une référence de paiement unique
    const referencePaiement = `PAY-${Date.now()}-${userId}-${formationId}`;

    // Créer l'inscription
    const inscription = await Inscription.create({
      userId,
      formationId,
      dateInscription: new Date(),
      montant: parseFloat(montant) || 0,
      methodePaiement,
      numeroTelephone,
      statut: 'en_attente',
      statutPaiement: 'en_attente',
      referencePaiement
    });

    // Créer une notification pour les administrateurs
    try {
      const apprenant = await User.findByPk(userId, { attributes: ['nom', 'prenom', 'email'] });
      const admins = await User.findAll({ where: { role: 'admin' }, attributes: ['id'] });
      const messageAdmin = `Nouvelle inscription à "${formation.titre}" par ${apprenant?.nom || ''} ${apprenant?.prenom || ''} (${apprenant?.email || 'email inconnu'}).`;
      const adminNotifications = admins.map(a => ({
        userId: a.id,
        message: messageAdmin,
        lue: false
      }));
      if (adminNotifications.length) {
        await Notification.bulkCreate(adminNotifications);
      }
    } catch (notifyErr) {
      console.error('Erreur création notification admin (inscription):', notifyErr);
    }

    res.status(201).json({
      message: 'Inscription créée avec succès',
      inscription,
      referencePaiement
    });

  } catch (error) {
    console.error('Erreur lors de la création de l\'inscription:', error);
    res.status(500).json({ message: 'Erreur lors de la création de l\'inscription' });
  }
};

const getMyInscriptions = async (req, res) => {
  try {
    const userId = req.user.id;

    const inscriptions = await Inscription.findAll({
      where: { userId },
      order: [['dateInscription', 'DESC']]
    });

    // Récupérer les informations des formations séparément
    const inscriptionsWithFormations = await Promise.all(
      inscriptions.map(async (inscription) => {
        const formation = await Formation.findByPk(inscription.formationId, {
          attributes: ['id', 'titre', 'description', 'duree']
        });
        return {
          ...inscription.toJSON(),
          Formation: formation
        };
      })
    );

    res.json(inscriptionsWithFormations);
  } catch (error) {
    console.error('Erreur lors de la récupération des inscriptions:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const confirmPayment = async (req, res) => {
  try {
    const { inscriptionId } = req.params;
    const userId = req.user.id;

    const inscription = await Inscription.findOne({
      where: {
        id: inscriptionId,
        userId
      }
    });

    if (!inscription) {
      return res.status(404).json({ message: 'Inscription non trouvée' });
    }

    // Mettre à jour le statut du paiement
    inscription.statutPaiement = 'paye';
    await inscription.save();

    // Créer un enregistrement de paiement dans l'historique si absent
    try {
      const reference = `PAY-INS-${Date.now()}-${userId}-${inscription.formationId}`;
      await Paiement.create({
        userId,
        formationId: inscription.formationId,
        montant: parseFloat(inscription.montant || 0),
        methode: inscription.methodePaiement === 'especes' ? 'especes' : 'mvola',
        statut: 'termine',
        reference,
        details: {
          source: 'inscription',
          referenceInscription: inscription.referencePaiement,
          numeroTelephone: inscription.numeroTelephone
        },
        dateValidation: new Date()
      });
    } catch (e) {
      console.error('Erreur lors de la création du paiement historique:', e.message);
      // Ne pas bloquer la réponse principale
    }

    res.json({
      message: 'Paiement confirmé avec succès',
      inscription
    });

  } catch (error) {
    console.error('Erreur lors de la confirmation du paiement:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer les inscriptions d'un utilisateur spécifique (admin ou l'utilisateur lui-même)
const getInscriptionsByUserId = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id, 10);
    if (Number.isNaN(userId)) {
      return res.status(400).json({ message: 'ID utilisateur invalide' });
    }
    // Sécurité: seul l'utilisateur concerné ou un admin peuvent accéder
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({ message: 'Accès refusé' });
    }
    const inscriptions = await Inscription.findAll({
      where: { userId },
      include: [
        { model: Formation, as: 'formation', attributes: ['id', 'titre', 'description', 'duree'] }
      ],
      order: [['dateInscription', 'DESC']]
    });
    return res.json(inscriptions);
  } catch (error) {
    console.error('Erreur lors de la récupération des inscriptions (par utilisateur):', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};
// Récupérer toutes les inscriptions (pour admin)
const getAllInscriptions = async (req, res) => {
  console.log('Récupération des inscriptions avec les paramètres:', req.query);
  try {
    const { statut } = req.query || {};
    const whereClause = {};
    // Filtrer sur le statut d'inscription (validation), pas le statut de paiement
    if (statut) {
      whereClause.statut = statut;
    } else {
      whereClause.statut = 'en_attente';
    }
    console.log('Requête avec les conditions (Inscription.statut):', JSON.stringify(whereClause, null, 2));

    const inscriptions = await Inscription.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'nom', 'prenom', 'email'],
          required: true
        },
        {
          model: Formation,
          as: 'formation',
          attributes: ['id', 'titre'],
          required: true
        }
      ],
      order: [['dateInscription', 'DESC']]
    });

    // Formater la réponse pour coller à ce qu'attend le frontend actuel
    const formattedInscriptions = inscriptions.map(ins => {
      const inscription = ins.get ? ins.get({ plain: true }) : ins;
      return {
        id: inscription.id,
        dateInscription: inscription.dateInscription,
        // Le frontend affiche 'Validée/Refusée/En attente' à partir de 'statutPaiement'
        // On mappe donc 'statut' (validee/refusee/en_attente) vers ce champ consommé par l'UI
        statutPaiement: inscription.statut,
        montant: inscription.montant,
        methodePaiement: inscription.methodePaiement,
        numeroTelephone: inscription.numeroTelephone,
        nom: inscription.user?.nom,
        prenom: inscription.user?.prenom,
        email: inscription.user?.email,
        formation_titre: inscription.formation?.titre,
        formation_id: inscription.formation?.id
      };
    });
    
    console.log(`Nombre d'inscriptions trouvées: ${formattedInscriptions.length}`);
    res.json(formattedInscriptions);
  } catch (error) {
    console.error('Erreur lors de la récupération des inscriptions:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la récupération des inscriptions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Mettre à jour le statut d'une inscription (pour admin)
const updateInscriptionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, motifRejet } = req.body;
    
    const inscription = await Inscription.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'email', 'nom', 'prenom'] },
        { model: Formation, as: 'formation', attributes: ['id', 'titre'] }
      ]
    });
    
    if (!inscription) {
      return res.status(404).json({ message: 'Inscription non trouvée' });
    }
    
    // Mettre à jour le statut d'inscription (validation)
    // Valeurs attendues: 'validee' | 'refusee' | 'en_attente'
    inscription.statut = status;
    if (motifRejet) {
      inscription.motifRejet = motifRejet;
    }
    await inscription.save();

    // Créer une notification pour l'utilisateur
    const statusMessage = status === 'validee' 
      ? `Votre inscription à la formation "${inscription.formation?.titre || 'la formation'}" a été validée avec succès.`
      : `Votre inscription à la formation "${inscription.formation?.titre || 'la formation'}" a été refusée.`;
    
    if (inscription.user) {
      await createNotification(
        inscription.userId,
        statusMessage,
        status === 'validee' ? 'success' : 'error'
      );
    }

    // Si l'inscription est validée, on peut envoyer un email de confirmation
    if (status === 'validee' && inscription.user?.email) {
      // Ici, vous pouvez ajouter l'envoi d'email de confirmation
      // Par exemple : sendConfirmationEmail(inscription.User.email, inscription.Formation?.titre || 'la formation');
    }

    res.json({ 
      message: 'Statut de l\'inscription mis à jour avec succès',
      inscription: {
        ...inscription.toJSON(),
        nom: inscription.user?.nom,
        prenom: inscription.user?.prenom,
        email: inscription.user?.email,
        formation_titre: inscription.formation?.titre
      }
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut de l\'inscription:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la mise à jour du statut de l\'inscription',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createInscription,
  getMyInscriptions,
  confirmPayment,
  getAllInscriptions,
  updateInscriptionStatus,
  getInscriptionsByUserId
};
