const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth');
const {
  createAnnonceFormateurs,
  listAnnoncesFormateurs,
  createAnnonceApprenants,
  listAnnoncesApprenants
} = require('../controllers/annonceController');

// Only admin can manage announcements
router.use('/formateurs', authenticate, authorize(['admin']));
router.use('/apprenants', authenticate, authorize(['admin']));

router.get('/formateurs', listAnnoncesFormateurs);
router.post('/formateurs', createAnnonceFormateurs);
router.get('/apprenants', listAnnoncesApprenants);
router.post('/apprenants', createAnnonceApprenants);

router.get('/public/formateurs', authenticate, listAnnoncesFormateurs);
router.get('/public/apprenants', authenticate, listAnnoncesApprenants);

module.exports = router;
