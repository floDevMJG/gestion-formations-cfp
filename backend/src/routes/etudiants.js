const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const { getInscriptionsByUserId } = require('../controllers/inscriptionController');

// Récupérer les inscriptions d'un étudiant spécifique
router.get('/:id/inscriptions', authenticate, getInscriptionsByUserId);

module.exports = router;
