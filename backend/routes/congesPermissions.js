const express = require('express');
const router = express.Router();
const db = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuration de multer pour l'upload de documents
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/documents/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers PDF, Word et images sont autorisés'));
    }
  }
});

// ==================== CONGÉS ====================

// Soumettre une demande de congé
router.post('/conges/demande', upload.array('documents', 5), async (req, res) => {
  const connection = await db.getConnection();
  try {
    const {
      user_id,
      user_name,
      user_email,
      user_role,
      type_conge,
      date_debut,
      date_fin,
      jours_demandes,
      motif,
      contact_urgence,
      telephone_urgence
    } = req.body;

    // Vérifier la disponibilité des jours
    const [stats] = await connection.execute(
      'SELECT total_jours_annuel, jours_pris_annee FROM conges_stats WHERE user_id = ? AND annee = YEAR(CURRENT_DATE)',
      [user_id]
    );

    if (stats.length === 0) {
      return res.status(400).json({ error: 'Statistiques utilisateur non trouvées' });
    }

    const joursRestants = stats[0].total_jours_annuel - stats[0].jours_pris_annee;
    if (joursRestants < parseInt(jours_demandes)) {
      return res.status(400).json({ 
        error: `Jours insuffisants. Il vous reste ${joursRestants} jours sur ${stats[0].total_jours_annuel}` 
      });
    }

    // Préparer les documents
    let documents = null;
    if (req.files && req.files.length > 0) {
      documents = JSON.stringify(req.files.map(file => file.filename));
    }

    // Insérer la demande de congé
    const [result] = await connection.execute(
      `INSERT INTO conges (
        user_id, user_name, user_email, user_role,
        type_conge, date_debut, date_fin, jours_demandes,
        motif, contact_urgence, telephone_urgence,
        statut, date_demande, documents
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'en_attente', NOW(), ?)`,
      [
        user_id, user_name, user_email, user_role,
        type_conge, date_debut, date_fin, jours_demandes,
        motif, contact_urgence, telephone_urgence,
        documents
      ]
    );

    const congeId = result.insertId;

    // Créer la notification pour l'admin
    await connection.execute(
      `INSERT INTO notifications_absences (
        type_notification, user_id, user_name, user_email, user_role,
        entite_type, entite_id, titre, message
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'conge_demande',
        user_id,
        user_name,
        user_email,
        user_role,
        'conge',
        congeId,
        'Nouvelle demande de congé',
        `${user_name} a demandé un congé ${type_conge} du ${date_debut} au ${date_fin} (${jours_demandes} jours). Motif: ${motif}`
      ]
    );

    res.status(201).json({ 
      success: true, 
      message: 'Demande de congé soumise avec succès',
      congeId: congeId
    });

  } catch (error) {
    console.error('Erreur demande congé:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la demande de congé' });
  } finally {
    connection.release();
  }
});

// Obtenir les congés d'un utilisateur
router.get('/conges/user/:userId', async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { userId } = req.params;
    const [conges] = await connection.execute(
      'SELECT * FROM conges WHERE user_id = ? ORDER BY date_demande DESC',
      [userId]
    );

    // Parser les documents JSON
    conges.forEach(conge => {
      if (conge.documents) {
        try {
          congé.documents = JSON.parse(conge.documents);
        } catch (e) {
          congé.documents = [];
        }
      }
    });

    res.json(conges);
  } catch (error) {
    console.error('Erreur récupération congés:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    connection.release();
  }
});

// Obtenir les congés en attente (pour admin)
router.get('/conges/en-attente', async (req, res) => {
  const connection = await db.getConnection();
  try {
    const [conges] = await connection.execute(
      'SELECT * FROM conges WHERE statut = "en_attente" ORDER BY date_demande DESC'
    );

    // Parser les documents JSON
    conges.forEach(conge => {
      if (conge.documents) {
        try {
          congé.documents = JSON.parse(conge.documents);
        } catch (e) {
          congé.documents = [];
        }
      }
    });

    res.json(conges);
  } catch (error) {
    console.error('Erreur récupération congés en attente:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    connection.release();
  }
});

// Approuver/Refuser un congé
router.put('/conges/:id/status', async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { id } = req.params;
    const { statut, validateur_name, motif_refus } = req.body;

    if (!['approuve', 'refuse'].includes(statut)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }

    // Récupérer les informations du congé
    const [conge] = await connection.execute(
      'SELECT * FROM conges WHERE id = ?',
      [id]
    );

    if (conge.length === 0) {
      return res.status(404).json({ error: 'Congé non trouvé' });
    }

    // Mettre à jour le statut
    await connection.execute(
      'UPDATE conges SET statut = ?, date_validation = NOW(), validateur_name = ?, motif_refus = ? WHERE id = ?',
      [statut, validateur_name, motif_refus || null, id]
    );

    // Créer la notification pour le formateur
    const notificationType = statut === 'approuve' ? 'conge_approuve' : 'conge_refuse';
    const titre = statut === 'approuve' ? 'Congé approuvé' : 'Congé refusé';
    const message = statut === 'approuve' 
      ? `Votre demande de congé a été approuvée par ${validateur_name}`
      : `Votre demande de congé a été refusée par ${validateur_name}. Motif: ${motif_refus}`;

    await connection.execute(
      `INSERT INTO notifications_absences (
        type_notification, user_id, user_name, user_email, user_role,
        entite_type, entite_id, titre, message
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        notificationType,
        conge[0].user_id,
        conge[0].user_name,
        conge[0].user_email,
        conge[0].user_role,
        'conge',
        id,
        titre,
        message
      ]
    );

    res.json({ 
      success: true, 
      message: `Demande de congé ${statut === 'approuve' ? 'approuvée' : 'refusée'} avec succès`
    });

  } catch (error) {
    console.error('Erreur mise à jour statut congé:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    connection.release();
  }
});

// ==================== PERMISSIONS ====================

// Soumettre une demande de permission
router.post('/permissions/demande', upload.array('documents', 5), async (req, res) => {
  const connection = await db.getConnection();
  try {
    const {
      user_id,
      user_name,
      user_email,
      user_role,
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

    // Vérifier la disponibilité des heures
    const [stats] = await connection.execute(
      'SELECT total_jours_mensuel, heures_prises_mois FROM conges_stats WHERE user_id = ? AND annee = YEAR(CURRENT_DATE) AND mois = MONTH(CURRENT_DATE)',
      [user_id]
    );

    if (stats.length === 0) {
      return res.status(400).json({ error: 'Statistiques utilisateur non trouvées' });
    }

    const heuresRestantes = (stats[0].total_jours_mensuel * 8) - stats[0].heures_prises_mois;
    if (heuresRestantes < parseFloat(duree)) {
      return res.status(400).json({ 
        error: `Heures insuffisantes. Il vous reste ${heuresRestantes.toFixed(1)} heures ce mois-ci` 
      });
    }

    // Préparer les documents
    let documents = null;
    if (req.files && req.files.length > 0) {
      documents = JSON.stringify(req.files.map(file => file.filename));
    }

    // Insérer la demande de permission
    const [result] = await connection.execute(
      `INSERT INTO permissions (
        user_id, user_name, user_email, user_role,
        type_permission, date_permission, heure_debut, heure_fin, duree, jours_demandes,
        motif, retour_prevu, contact_urgence, telephone_urgence,
        statut, date_demande, documents
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'en_attente', NOW(), ?)`,
      [
        user_id, user_email, user_role,
        type_permission, date_permission, heure_debut, heure_fin, duree, jours_demandes,
        motif, retour_prevu, contact_urgence, telephone_urgence,
        documents
      ]
    );

    const permissionId = result.insertId;

    // Créer la notification pour l'admin
    await connection.execute(
      `INSERT INTO notifications_absences (
        type_notification, user_id, user_name, user_email, user_role,
        entite_type, entite_id, titre, message
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'permission_demande',
        user_id,
        user_name,
        user_email,
        user_role,
        'permission',
        permissionId,
        'Nouvelle demande de permission',
        `${user_name} a demandé une permission ${type_permission} le ${date_permission} de ${heure_debut} à ${heure_fin} (${duree} heures). Motif: ${motif}`
      ]
    );

    res.status(201).json({ 
      success: true, 
      message: 'Demande de permission soumise avec succès',
      permissionId: permissionId
    });

  } catch (error) {
    console.error('Erreur demande permission:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la demande de permission' });
  } finally {
    connection.release();
  }
});

// Obtenir les permissions d'un utilisateur
router.get('/permissions/user/:userId', async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { userId } = req.params;
    const [permissions] = await connection.execute(
      'SELECT * FROM permissions WHERE user_id = ? ORDER BY date_demande DESC',
      [userId]
    );

    // Parser les documents JSON
    permissions.forEach(permission => {
      if (permission.documents) {
        try {
          permission.documents = JSON.parse(permission.documents);
        } catch (e) {
          permission.documents = [];
        }
      }
    });

    res.json(permissions);
  } catch (error) {
    console.error('Erreur récupération permissions:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    connection.release();
  }
});

// Obtenir les permissions en attente (pour admin)
router.get('/permissions/en-attente', async (req, res) => {
  const connection = await db.getConnection();
  try {
    const [permissions] = await connection.execute(
      'SELECT * FROM permissions WHERE statut = "en_attente" ORDER BY date_demande DESC'
    );

    // Parser les documents JSON
    permissions.forEach(permission => {
      if (permission.documents) {
        try {
          permission.documents = JSON.parse(permission.documents);
        } catch (e) {
          permission.documents = [];
        }
      }
    });

    res.json(permissions);
  } catch (error) {
    console.error('Erreur récupération permissions en attente:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    connection.release();
  }
});

// Approuver/Refuser une permission
router.put('/permissions/:id/status', async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { id } = req.params;
    const { statut, validateur_name, motif_refus } = req.body;

    if (!['approuve', 'refuse'].includes(statut)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }

    // Récupérer les informations de la permission
    const [permission] = await connection.execute(
      'SELECT * FROM permissions WHERE id = ?',
      [id]
    );

    if (permission.length === 0) {
      return res.status(404).json({ error: 'Permission non trouvée' });
    }

    // Mettre à jour le statut
    await connection.execute(
      'UPDATE permissions SET statut = ?, date_validation = NOW(), validateur_name = ?, motif_refus = ? WHERE id = ?',
      [statut, validateur_name, motif_refus || null, id]
    );

    // Créer la notification pour le formateur
    const notificationType = statut === 'approuve' ? 'permission_approuve' : 'permission_refuse';
    const titre = statut === 'approuve' ? 'Permission approuvée' : 'Permission refusée';
    const message = statut === 'approuve' 
      ? `Votre demande de permission a été approuvée par ${validateur_name}`
      : `Votre demande de permission a été refusée par ${validateur_name}. Motif: ${motif_refus}`;

    await connection.execute(
      `INSERT INTO notifications_absences (
        type_notification, user_id, user_name, user_email, user_role,
        entite_type, entite_id, titre, message
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        notificationType,
        permission[0].user_id,
        permission[0].user_name,
        permission[0].user_email,
        permission[0].user_role,
        'permission',
        id,
        titre,
        message
      ]
    );

    res.json({ 
      success: true, 
      message: `Demande de permission ${statut === 'approuve' ? 'approuvée' : 'refusée'} avec succès`
    });

  } catch (error) {
    console.error('Erreur mise à jour statut permission:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    connection.release();
  }
});

// ==================== NOTIFICATIONS ====================

// Obtenir les notifications non lues (pour admin)
router.get('/notifications/non-lues', async (req, res) => {
  const connection = await db.getConnection();
  try {
    const [notifications] = await connection.execute(
      'SELECT * FROM notifications_absences WHERE lu = FALSE ORDER BY created_at DESC LIMIT 50'
    );

    res.json(notifications);
  } catch (error) {
    console.error('Erreur récupération notifications:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    connection.release();
  }
});

// Marquer une notification comme lue
router.put('/notifications/:id/lu', async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { id } = req.params;
    await connection.execute(
      'UPDATE notifications_absences SET lu = TRUE, date_lecture = NOW() WHERE id = ?',
      [id]
    );

    res.json({ success: true, message: 'Notification marquée comme lue' });
  } catch (error) {
    console.error('Erreur mise à jour notification:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    connection.release();
  }
});

// Obtenir les statistiques d'un utilisateur
router.get('/stats/user/:userId', async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { userId } = req.params;
    const [stats] = await connection.execute(
      'SELECT * FROM v_conges_stats_calculées WHERE user_id = ?',
      [userId]
    );

    if (stats.length === 0) {
      return res.status(404).json({ error: 'Statistiques non trouvées' });
    }

    res.json(stats[0]);
  } catch (error) {
    console.error('Erreur récupération statistiques:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    connection.release();
  }
});

module.exports = router;
