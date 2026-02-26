const express = require('express');
const router = express.Router();
const coursController = require('../controllers/coursController');
const { authenticate } = require('../middlewares/auth');

console.log('📚 Route cours chargée, contrôleur:', Object.keys(coursController));

// Routes pour les cours
router.post('/', authenticate, coursController.createCours);
router.get('/', authenticate, coursController.getAllCours);
router.get('/formateur', authenticate, coursController.getCoursByFormateur);
router.get('/apprenant/:id/emploi-du-temps', authenticate, coursController.getEmploiDuTempsApprenant);
router.get('/:id', authenticate, coursController.getCoursById);
router.put('/:id', authenticate, coursController.updateCours);
router.delete('/:id', authenticate, coursController.deleteCours);
router.get('/:id/download', authenticate, coursController.downloadCours);

module.exports = router;
