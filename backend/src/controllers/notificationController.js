const { Notification, User } = require('../models');

// Créer une notification
const createNotification = async (userId, message, type, lien = null, icone = null) => {
  try {
    console.log('Création de notification:', { userId, type, message: message.substring(0, 50) + '...' });
    const notification = await Notification.create({
      userId,
      message,
      type,
      lien,
      icone
    });
    console.log('Notification créée avec succès, ID:', notification.id);
    return notification;
  } catch (error) {
    console.error('Erreur lors de la création de la notification:', error);
    return null;
  }
};

// Notification pour nouvel formateur inscrit
const notifyNewFormateur = async (formateurId) => {
  try {
    console.log('Recherche du formateur ID:', formateurId);
    const formateur = await User.findByPk(formateurId, {
      attributes: ['nom', 'prenom', 'email']
    });

    if (!formateur) {
      console.error('Formateur non trouvé pour ID:', formateurId);
      return;
    }

    console.log('Création de notification pour formateur:', formateur.email);
    const notification = await createNotification(
      null, // notification admin (userId = null)
      `Nouveau formateur inscrit: ${formateur.nom} ${formateur.prenom} (${formateur.email})`,
      'new_formateur',
      '/admin/users?role=formateur',
      'user-plus'
    );

    if (notification) {
      console.log('Notification formateur créée avec succès, ID:', notification.id);
    } else {
      console.error('Échec de création de la notification formateur');
    }
  } catch (error) {
    console.error('Erreur lors de la notification de nouveau formateur:', error);
  }
};

// Notification pour formateur validé
const notifyFormateurValidated = async (formateurId, codeFormateur) => {
  try {
    const formateur = await User.findByPk(formateurId, {
      attributes: ['nom', 'prenom', 'email']
    });

    if (!formateur) return;

    await createNotification(
      formateurId,
      `Félicitations ! Votre compte formateur a été validé. Votre code d'accès est: ${codeFormateur}`,
      'formateur_validated',
      '/formateur/code-verification',
      'check-circle'
    );
  } catch (error) {
    console.error('Erreur lors de la notification de validation formateur:', error);
  }
};

// Notification pour nouvel étudiant inscrit
const notifyNewStudent = async (studentId) => {
  try {
    const student = await User.findByPk(studentId, {
      attributes: ['nom', 'prenom', 'email']
    });

    if (!student) return;

    await createNotification(
      null, // notification admin
      `Nouvel étudiant inscrit en attente de validation: ${student.nom} ${student.prenom} (${student.email})`,
      'new_student',
      '/admin/users?role=apprenant&statut=en_attente',
      'user-plus'
    );
  } catch (error) {
    console.error('Erreur lors de la notification de nouvel étudiant:', error);
  }
};

// Récupérer les notifications d'un utilisateur
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const notifications = await Notification.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      include: [{ model: User, attributes: ['id', 'nom', 'prenom'] }]
    });
    const mapped = notifications.map(n => {
      const json = n.toJSON();
      return {
        id: json.id,
        message: json.message,
        isRead: json.lue === true,
        createdAt: json.createdAt,
        updatedAt: json.updatedAt,
        user: json.User ? { id: json.User.id, nom: json.User.nom, prenom: json.User.prenom } : undefined
      };
    });
    res.json(mapped);
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer les notifications admin (où userId est null)
const getAdminNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: null },
      order: [['createdAt', 'DESC']]
    });
    const mapped = notifications.map(n => {
      const json = n.toJSON();
      return {
        id: json.id,
        message: json.message,
        isRead: json.lue === true,
        createdAt: json.createdAt,
        updatedAt: json.updatedAt
      };
    });
    res.json(mapped);
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications admin:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Marquer une notification comme lue
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;
    
    let notification = await Notification.findOne({
      where: { id: notificationId, userId }
    });
    
    if (!notification) {
      // Cas admin: notifications globales (userId null)
      if (req.user.role === 'admin') {
        notification = await Notification.findOne({
          where: { id: notificationId, userId: null }
        });
      }
      if (!notification) {
        return res.status(404).json({ message: 'Notification non trouvée' });
      }
    }
    
    notification.lue = true;
    await notification.save();
    
    res.json({ message: 'Notification marquée comme lue', notification: { id: notification.id, isRead: true } });
  } catch (error) {
    console.error('Erreur lors du marquage de la notification comme lue:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Marquer toutes les notifications comme lues
const markAllRead = async (req, res) => {
  try {
    const userId = req.user.id;
    await Notification.update({ lue: true }, { where: { userId } });
    res.json({ message: 'Toutes les notifications ont été marquées comme lues' });
  } catch (error) {
    console.error('Erreur lors du marquage global des notifications:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = {
  getUserNotifications,
  getAdminNotifications,
  markAsRead,
  markAllRead,
  createNotification,
  notifyNewFormateur,
  notifyFormateurValidated,
  notifyNewStudent
};
