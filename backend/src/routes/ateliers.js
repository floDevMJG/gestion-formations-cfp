const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth');
const {
  getAllAteliers,
  getAtelierById,
  createAtelier,
  updateAtelier,
  deleteAtelier
} = require('../controllers/atelierController');

// Routes pour tous les utilisateurs (lire) - Publiques
router.get('/', getAllAteliers);
router.get('/:id', getAtelierById);

// Middleware d'authentification pour les routes protégées
router.use(authenticate);

// Routes pour Admin et Formateur (créer, modifier, supprimer)
router.post('/', authorize(['admin', 'formateur']), createAtelier);
router.put('/:id', authorize(['admin', 'formateur']), updateAtelier);
router.delete('/:id', authorize(['admin', 'formateur']), deleteAtelier);

module.exports = router;
