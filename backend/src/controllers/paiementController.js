const { Paiement, Inscription, Formation } = require('../models');
const { Op } = require('sequelize');

exports.effectuerPaiementMobile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      inscriptionId,
      phoneNumber,
      operator,
      transactionId,
      montant,
      fraisScolarite,
      devise,
      methodePaiement
    } = req.body;

    if (!['orange', 'mvola', 'airtel', 'mobile'].includes((operator || '').toLowerCase())) {
      return res.status(400).json({ success: false, message: 'Opérateur non pris en charge' });
    }

    const numeroNettoye = String(phoneNumber || '').replace(/\D/g, '');
    if (numeroNettoye.length < 8) {
      return res.status(400).json({ success: false, message: 'Numéro de téléphone invalide' });
    }

    let formationId = null;
    if (inscriptionId) {
      const ins = await Inscription.findByPk(inscriptionId);
      if (ins) {
        formationId = ins.formationId;
      }
    }

    const referencePaiement = `PAY-${(operator || 'mobile').toUpperCase()}-${Date.now()}`;

    const paiement = await Paiement.create({
      userId,
      formationId,
      montant: parseFloat(montant || 0),
      methode: (operator || 'mobile').toLowerCase(),
      statut: 'en_attente',
      reference: referencePaiement,
      details: {
        operateur: operator,
        numero: phoneNumber,
        transactionId,
        fraisScolarite,
        devise,
        methodePaiement
      }
    });

    res.status(200).json({
      success: true,
      message: 'Code de confirmation envoyé',
      reference: referencePaiement,
      paiementId: paiement.id
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors du traitement du paiement', error: error.message });
  }
};

exports.verifierPaiement = async (req, res) => {
  try {
    const { reference, codeConfirmation } = req.body;
    const userId = req.user.id;
    const paiement = await Paiement.findOne({
      where: { reference, userId, statut: 'en_attente' }
    });
    if (!paiement) {
      return res.status(404).json({ success: false, message: 'Paiement non trouvé ou déjà traité' });
    }
    await paiement.update({ statut: 'termine', dateValidation: new Date() });
    if (paiement.formationId) {
      await Inscription.update(
        { statutPaiement: 'paye' },
        { where: { userId: paiement.userId, formationId: paiement.formationId } }
      );
    }
    res.json({
      success: true,
      message: 'Paiement confirmé avec succès',
      paiement: {
        id: paiement.id,
        reference: paiement.reference,
        montant: paiement.montant,
        methode: paiement.methode,
        date: paiement.dateValidation
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la vérification du paiement', error: error.message });
  }
};

// Pour l'historique des paiements
exports.getHistoriquePaiements = async (req, res) => {
  try {
    const userId = req.user.id;
    const paiements = await Paiement.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      include: ['formation']
    });
    res.json({ success: true, data: paiements });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération de l\'historique', error: error.message });
  }
};

exports.effectuerPaiementClassique = async (req, res) => {
  try {
    const userId = req.user.id;
    const { inscriptionId, montant, fraisScolarite, methodeFraisScolarite, devise } = req.body;
    let formationId = null;
    if (inscriptionId) {
      const ins = await Inscription.findByPk(inscriptionId);
      if (ins) {
        formationId = ins.formationId;
      }
    }
    const referencePaiement = `PAY-CLASSIQUE-${Date.now()}`;
    const paiement = await Paiement.create({
      userId,
      formationId,
      montant: parseFloat(montant || 0),
      methode: 'especes',
      statut: 'en_attente',
      reference: referencePaiement,
      details: { fraisScolarite, methodeFraisScolarite, devise }
    });
    res.status(200).json({ success: true, paiementId: paiement.id, reference: referencePaiement });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de l\'enregistrement du paiement', error: error.message });
  }
};
