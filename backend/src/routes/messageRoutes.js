const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticate } = require('../middlewares/auth');

// Protéger toutes les routes avec l'authentification
router.use(authenticate);

// Récupérer la liste des conversations (doit être avant /:userId)
router.get('/conversations', messageController.getConversations);

// Récupérer les messages non lus (doit être avant /:userId)
router.get('/unread', messageController.getUnreadMessagesCount);

// Récupérer les messages d'une conversation spécifique
router.get('/conversation/:userId', messageController.getConversation);

// Envoyer un message
router.post('/', messageController.sendMessage);

// Marquer un message comme lu
router.put('/:id/read', messageController.markMessageAsRead);

module.exports = router;
