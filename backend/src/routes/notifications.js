const express = require('express');
const router = express.Router();
const {
  getUserNotifications,
  getAdminNotifications,
  markAsRead,
  markAllRead
} = require('../controllers/notificationController');
const { authenticate, authorize } = require('../middlewares/auth');

// Récupérer les notifications de l'utilisateur connecté
router.get('/', authenticate, getUserNotifications);

// Récupérer les notifications admin (uniquement pour les admins)
router.get('/admin', authenticate, authorize(['admin']), getAdminNotifications);

// Marquer une notification comme lue
router.put('/:notificationId/read', authenticate, markAsRead);

// Marquer toutes les notifications comme lues
router.put('/mark-all-read', authenticate, markAllRead);

module.exports = router;
