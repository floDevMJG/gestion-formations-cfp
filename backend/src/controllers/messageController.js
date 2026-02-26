const { Message, User } = require('../models');
const { Op } = require('sequelize');

// Envoyer un message
const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user.id; // L'expéditeur est l'utilisateur connecté

    if (!receiverId || !content) {
      return res.status(400).json({ message: 'Receiver ID and content are required.' });
    }

    // Vérifier si le destinataire existe
    const receiver = await User.findByPk(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Destinataire non trouvé.' });
    }

    const message = await Message.create({
      senderId,
      receiverId,
      content,
      read: false
    });

    res.status(201).json({
      message: 'Message envoyé avec succès.',
      data: message
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// Récupérer les messages (conversation entre deux utilisateurs)
const getConversation = async (req, res) => {
  try {
    const { userId: participantId } = req.params; // L'autre participant de la conversation
    const userId = req.user.id; // L'utilisateur connecté

    if (!participantId) {
      return res.status(400).json({ message: 'Participant ID is required.' });
    }

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: userId, receiverId: participantId },
          { senderId: participantId, receiverId: userId }
        ]
      },
      include: [
        { model: User, as: 'sender', attributes: ['id', 'nom', 'prenom', 'email', 'role'] },
        { model: User, as: 'receiver', attributes: ['id', 'nom', 'prenom', 'email', 'role'] }
      ],
      order: [['createdAt', 'ASC']]
    });

    res.json(messages);
  } catch (error) {
    console.error('Erreur lors de la récupération de la conversation:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// Récupérer la liste des conversations (pour l'affichage type Messenger)
const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Récupérer tous les messages impliquant l'utilisateur
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      include: [
        { model: User, as: 'sender', attributes: ['id', 'nom', 'prenom', 'email', 'role'] },
        { model: User, as: 'receiver', attributes: ['id', 'nom', 'prenom', 'email', 'role'] }
      ],
      order: [['createdAt', 'DESC']] // Les plus récents d'abord
    });

    // Grouper par utilisateur
    const conversationsMap = new Map();
    
    messages.forEach(msg => {
      const isSender = msg.senderId === userId;
      const otherUser = isSender ? msg.receiver : msg.sender;
      
      // Si l'autre utilisateur n'existe plus (supprimé), on ignore
      if (!otherUser) return;

      const otherUserId = otherUser.id;
      
      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          user: otherUser,
          lastMessage: msg,
          unreadCount: 0
        });
      }
      
      // Compter les messages non lus envoyés PAR l'autre utilisateur
      if (!isSender && !msg.read) {
        conversationsMap.get(otherUserId).unreadCount++;
      }
    });

    const conversations = Array.from(conversationsMap.values());
    
    res.json(conversations);
  } catch (error) {
    console.error('Erreur lors de la récupération des conversations:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// Récupérer les messages non lus pour un utilisateur
const getUnreadMessagesCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await Message.count({
      where: {
        receiverId: userId,
        read: false
      }
    });

    res.json({ count });
  } catch (error) {
    console.error('Erreur lors de la récupération du nombre de messages non lus:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// Marquer un message comme lu
const markMessageAsRead = async (req, res) => {
  try {
    const { id } = req.params; // ID du message à marquer comme lu
    const userId = req.user.id; // L'utilisateur connecté doit être le destinataire

    const message = await Message.findByPk(id);

    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé.' });
    }

    // S'assurer que seul le destinataire peut marquer le message comme lu
    if (message.receiverId !== userId) {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à marquer ce message comme lu.' });
    }

    if (!message.read) {
      message.read = true;
      await message.save();
    }

    res.json({ message: 'Message marqué comme lu.', data: message });
  } catch (error) {
    console.error('Erreur lors du marquage du message comme lu:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

module.exports = {
  sendMessage,
  getConversation,
  getConversations,
  getUnreadMessagesCount,
  markMessageAsRead
};
