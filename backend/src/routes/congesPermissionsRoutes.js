const express = require('express');
const router = express.Router();
const congesPermissionsController = require('../controllers/congesPermissionsController');
const { upload } = require('../middleware/upload');
const auth = require('../middleware/auth'); // Importer le middleware d'authentification

// Route pour la demande de permission
router.post('/permissions/demande', auth, upload.array('documents', 5), congesPermissionsController.createPermission);

// Route pour la demande de congé
router.post('/conges/demande', auth, upload.array('documents', 5), congesPermissionsController.createConge);

// Routes admin: listes en attente
router.get('/permissions/en-attente', auth, congesPermissionsController.getPermissionsEnAttente);
router.get('/conges/en-attente', auth, congesPermissionsController.getCongesEnAttente);

// Routes admin: mise à jour statut
router.put('/permissions/:id/status', auth, congesPermissionsController.updatePermissionStatus);
router.put('/conges/:id/status', auth, congesPermissionsController.updateCongeStatus);

// Notifications synthétiques pour l'admin (demandes en attente)
router.get('/notifications/non-lues', auth, congesPermissionsController.getNotificationsNonLues);
router.put('/notifications/:id/lu', auth, congesPermissionsController.marquerNotificationCommeLue);

module.exports = router;
