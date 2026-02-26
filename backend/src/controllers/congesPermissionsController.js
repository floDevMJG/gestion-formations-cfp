const { Permission, Conge, User } = require('../models');

exports.createPermission = async (req, res) => {
  try {
    const {
      type_permission,
      date_permission,
      heure_debut,
      heure_fin,
      duree,
      jours_demandes,
      motif,
      retour_prevu,
      contact_urgence,
      telephone_urgence
    } = req.body;

    // L'ID de l'utilisateur est maintenant disponible via req.user grâce au middleware d'authentification
    const userId = req.user.id;

    // Gestion des documents uploadés
    const documents = req.files ? req.files.map(file => file.path) : [];

    const newPermission = await Permission.create({
      userId: userId, // Utiliser l'ID de l'utilisateur authentifié
      type_permission,
      date_permission,
      heure_debut,
      heure_fin,
      duree,
      jours_demandes,
      motif,
      retour_prevu,
      contact_urgence,
      telephone_urgence,
      documents,
      statut: 'en_attente'
    });

    res.status(201).json({ success: true, message: 'Demande de permission envoyée avec succès.', permission: newPermission });

  } catch (error) {
    console.error('Erreur lors de la création de la permission:', error);
    res.status(500).json({ success: false, error: 'Une erreur est survenue lors de la création de la demande de permission.' });
  }
};

exports.createConge = async (req, res) => {
  try {
    const {
      type_conge,
      date_debut,
      date_fin,
      jours_demandes,
      motif,
      contact_urgence,
      telephone_urgence
    } = req.body;

    const userId = req.user.id;
    const documents = req.files ? req.files.map(file => file.path) : [];

    const newConge = await Conge.create({
      userId,
      type_conge,
      date_debut,
      date_fin,
      jours_demandes,
      motif,
      contact_urgence,
      telephone_urgence,
      documents,
      statut: 'en_attente'
    });

    res.status(201).json({ success: true, message: 'Demande de congé envoyée avec succès.', conge: newConge });

  } catch (error) {
    console.error('Erreur lors de la création du congé:', error);
    res.status(500).json({ success: false, error: 'Une erreur est survenue lors de la création de la demande de congé.' });
  }
};

// Lister les permissions en attente (pour l'admin)
exports.getPermissionsEnAttente = async (req, res) => {
  try {
    const permissions = await Permission.findAll({
      where: { statut: 'en_attente' },
      include: [
        { model: User, as: 'user', attributes: ['id', 'nom', 'prenom', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    return res.json(permissions);
  } catch (error) {
    console.error('Erreur récupération permissions en attente:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Lister les congés en attente (pour l'admin)
exports.getCongesEnAttente = async (req, res) => {
  try {
    const conges = await Conge.findAll({
      where: { statut: 'en_attente' },
      include: [
        { model: User, attributes: ['id', 'nom', 'prenom', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    return res.json(conges);
  } catch (error) {
    console.error('Erreur récupération congés en attente:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Mettre à jour le statut d'une permission
exports.updatePermissionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { statut, motif_refus } = req.body;
    // Normaliser statut
    let newStatut = statut;
    if (statut === 'approuve') newStatut = 'approuvee';
    if (statut === 'refuse') newStatut = 'refusee';
    const permission = await Permission.findByPk(id);
    if (!permission) {
      return res.status(404).json({ message: 'Permission non trouvée' });
    }
    permission.statut = newStatut;
    if (motif_refus) {
      permission.motif_refus = motif_refus; // champ non défini, conservé pour compat si présent
    }
    await permission.save();
    return res.json({ message: 'Statut mis à jour', permission });
  } catch (error) {
    console.error('Erreur mise à jour statut permission:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Mettre à jour le statut d'un congé
exports.updateCongeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { statut, motif_refus } = req.body;
    let newStatut = statut;
    if (statut === 'approuve') newStatut = 'approuvee';
    if (statut === 'refuse') newStatut = 'refusee';
    const conge = await Conge.findByPk(id);
    if (!conge) {
      return res.status(404).json({ message: 'Congé non trouvé' });
    }
    conge.statut = newStatut;
    if (motif_refus) {
      conge.motif_refus = motif_refus;
    }
    await conge.save();
    return res.json({ message: 'Statut mis à jour', conge });
  } catch (error) {
    console.error('Erreur mise à jour statut congé:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Notifications "non lues" synthétiques pour l'admin (basées sur demandes en attente)
exports.getNotificationsNonLues = async (req, res) => {
  try {
    const permissions = await Permission.findAll({
      where: { statut: 'en_attente' },
      include: [{ model: User, as: 'user', attributes: ['nom', 'prenom', 'email'] }],
      order: [['createdAt', 'DESC']]
    });
    const conges = await Conge.findAll({
      where: { statut: 'en_attente' },
      include: [{ model: User, attributes: ['nom', 'prenom', 'email'] }],
      order: [['createdAt', 'DESC']]
    });
    const permissionNotifs = permissions.map(function (p) {
      const prenom = p.user && p.user.prenom ? p.user.prenom : '';
      const nom = p.user && p.user.nom ? p.user.nom : '';
      return {
        id: `permission-${p.id}`,
        entite_type: 'permission',
        entite_id: p.id,
        type_notification: 'permission_demande',
        titre: 'Demande de permission',
        message: `Demande de ${p.type_permission} pour le ${new Date(p.date_permission).toLocaleDateString()}`,
        user_name: `${prenom} ${nom}`.trim(),
        user_email: (p.user && p.user.email) ? p.user.email : ''
      };
    });
    const congeNotifs = conges.map(function (c) {
      const prenom = c.User && c.User.prenom ? c.User.prenom : '';
      const nom = c.User && c.User.nom ? c.User.nom : '';
      const email = c.User && c.User.email ? c.User.email : '';
      return {
        id: `conge-${c.id}`,
        entite_type: 'conge',
        entite_id: c.id,
        type_notification: 'conge_demande',
        titre: 'Demande de congé',
        message: `Congé ${c.type_conge} du ${new Date(c.date_debut).toLocaleDateString()} au ${new Date(c.date_fin).toLocaleDateString()}`,
        user_name: `${prenom} ${nom}`.trim(),
        user_email: email
      };
    });
    return res.json(permissionNotifs.concat(congeNotifs));
  } catch (error) {
    console.error('Erreur récupération notifications non lues (conges/permissions):', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Marquer une "notification" comme lue (no-op, l'UI la retire localement)
exports.marquerNotificationCommeLue = async (req, res) => {
  try {
    // Pas de persistance spéciale ici; l'élément disparaît après traitement ou restera tant qu'il est en attente
    return res.json({ message: 'Notification marquée comme lue' });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};
