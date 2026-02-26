// src/routes/inscriptions.js
const express = require('express');
const router = express.Router();
const { 
  createInscription, 
  getMyInscriptions, 
  confirmPayment, 
  getAllInscriptions, 
  updateInscriptionStatus 
} = require('../controllers/inscriptionController');
const { authenticate, isAdmin } = require('../middlewares/auth');

// Routes pour les utilisateurs connectés
router.post('/', authenticate, createInscription);
router.get('/mes-inscriptions', authenticate, getMyInscriptions);
router.put('/:inscriptionId/confirmer-paiement', authenticate, confirmPayment);

// Routes pour l'administration
router.get('/', authenticate, isAdmin, getAllInscriptions);
router.put('/:id/status', authenticate, isAdmin, updateInscriptionStatus);

module.exports = router;
