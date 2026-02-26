const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth');
const {
  sendMessage,
  getConversation,
  getUnreadMessagesCount,
  markMessageAsRead
} = require('../controllers/messageController');

// Toutes les routes de messages nécessitent une authentification
router.use(authenticate);

// Envoyer un message
router.post('/', sendMessage);

// Récupérer une conversation avec un autre utilisateur
router.get('/conversation/:participantId', getConversation);

// Récupérer le nombre de messages non lus pour l'utilisateur connecté
router.get('/unread/count', getUnreadMessagesCount);

// Marquer un message comme lu
router.put('/:id/read', markMessageAsRead);

module.exports = router;
