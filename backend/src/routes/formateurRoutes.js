const express = require('express');
const router = express.Router();
const formateurController = require('../controllers/formateurController');
const { authenticate, authorize } = require('../middlewares/auth');
const db = require('../config/database');
const models = require('../models');

// Route pour récupérer les notifications
router.get('/notifications', authenticate, formateurController.getNotifications);

// Ateliers d'un formateur (ses propres ateliers)
router.get('/ateliers', authenticate, authorize(['formateur', 'admin']), async (req, res, next) => {
  try {
    const query = `
      SELECT 
        id,
        titre,
        description,
        DATE_FORMAT(date, '%Y-%m-%d') as date,
        TIME_FORMAT(heure_debut, '%H:%i') as heureDebut,
        TIME_FORMAT(heure_fin, '%H:%i') as heureFin,
        salle,
        capacite,
        inscrits,
        type,
        statut,
        formateur_id,
        DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as createdAt
      FROM ateliers
      WHERE formateur_id = ?
      ORDER BY date DESC, heure_debut DESC
    `;
    const [rows] = await db.query(query, [req.user.id]);
    return res.json(rows);
  } catch (e) {
    next(e);
  }
});

// Statistiques du formateur
router.get('/stats', authenticate, authorize(['formateur', 'admin']), async (req, res, next) => {
  try {
    const formateurId = req.user.id;
    let totalCours = 0;
    let totalEtudiants = 0;
    let totalHeures = 0;
    let experience = 0;

    try {
      totalCours = await models.Cours.count({ where: { formateurId } });
    } catch (_) {}

    try {
      // Si une table d'inscriptions par cours existe, adapter ici. Par défaut 0.
      totalEtudiants = 0;
    } catch (_) {}

    try {
      const [rows] = await models.sequelize.query(
        'SELECT SUM(TIMESTAMPDIFF(MINUTE, heureDebut, heureFin)) AS minutes FROM Cours WHERE formateurId = ?',
        { replacements: [formateurId] }
      );
      const minutes = rows && rows[0] && rows[0].minutes ? Number(rows[0].minutes) : 0;
      totalHeures = Math.max(0, Math.round(minutes / 60));
    } catch (_) {}

    try {
      const user = await models.User.findByPk(formateurId);
      if (user && user.createdAt) {
        const years = (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 365);
        experience = Math.max(0, Math.floor(years));
      }
    } catch (_) {}

    return res.json({
      totalCours,
      totalEtudiants,
      totalHeures,
      experience
    });
  } catch (e) {
    next(e);
  }
});

// Mise à jour du profil formateur
router.put('/profile', authenticate, authorize(['formateur', 'admin']), async (req, res, next) => {
  try {
    const allowed = ['nom', 'prenom', 'email', 'telephone', 'adresse'];
    const payload = {};
    allowed.forEach((k) => {
      if (Object.prototype.hasOwnProperty.call(req.body, k)) {
        payload[k] = req.body[k];
      }
    });

    const [affected] = await models.User.update(payload, { where: { id: req.user.id } });
    if (!affected) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    const updated = await models.User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    return res.json({ message: 'Profil mis à jour', user: updated });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
