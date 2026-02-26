const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const {
  effectuerPaiementMobile,
  verifierPaiement,
  getHistoriquePaiements,
  effectuerPaiementClassique
} = require('../controllers/paiementController');

router.use(authenticate);
router.post('/mobile', effectuerPaiementMobile);
router.post('/classique', effectuerPaiementClassique);
router.post('/verifier', verifierPaiement);
router.get('/historique', getHistoriquePaiements);

module.exports = router;
