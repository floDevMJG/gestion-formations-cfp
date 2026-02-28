const { User } = require('../models');
const db = require('../config/database');
const { QueryTypes } = require('sequelize');

// Obtenir tous les ateliers
const getAllAteliers = async (req, res) => {
  try {
    console.log('🔍 Début de la récupération des ateliers');
    console.log('Utilisateur authentifié:', req.user ? `ID: ${req.user.id}, Role: ${req.user.role}` : 'Non connecté');
    
    let query = `
      SELECT 
        id,
        titre,
        description,
        DATE_FORMAT(date, '%Y-%m-%d') as date,
        TIME_FORMAT(heure_debut, '%H:%i') as heureDebut,
        TIME_FORMAT(heure_fin, '%H:%i') as heureFin,
        salle,
        capacite,
        inscrits,
        type,
        statut,
        formateur_id,
        DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as createdAt
      FROM ateliers
    `;
    const replacements = [];
    
    // Si l'utilisateur est un formateur, ne renvoyer que ses ateliers
    if (req.user && req.user.role === 'formateur') {
      query += ` WHERE formateur_id = ?`;
      replacements.push(req.user.id);
      console.log('Filtrage pour le formateur ID:', req.user.id);
    } else {
      console.log('Aucun filtre appliqué - Tous les ateliers seront retournés');
    }
    
    query += ' ORDER BY date DESC, heure_debut DESC';
    console.log('Requête SQL:', query);
    
    const rows = await db.query(query, { replacements, type: QueryTypes.SELECT });
    console.log('Nombre d\'ateliers trouvés dans la base de données:', rows.length);
    // Ajouter le nom du formateur si disponible
    console.log('Données brutes des ateliers:', JSON.stringify(rows, null, 2));
    
    const result = await Promise.all(rows.map(async (a) => {
      if (a.formateur_id) {
        const fs = await db.query(
          'SELECT nom, prenom FROM users WHERE id = ?',
          { replacements: [a.formateur_id], type: QueryTypes.SELECT }
        );
        const f = fs[0];
        const formateur = f ? `${f.prenom} ${f.nom}` : 'Non assigné';
        return Object.assign({}, a, {
          formateur,
          lieu: a.salle,
          participants: a.inscrits,
          heure: `${a.heureDebut} - ${a.heureFin}`
        });
      }
      return Object.assign({}, a, {
        formateur: 'Non assigné',
        lieu: a.salle,
        participants: a.inscrits,
        heure: `${a.heureDebut} - ${a.heureFin}`
      });
    }));
    console.log('Résultat final envoyé au client:', JSON.stringify(result, null, 2));
    res.json(result);
  } catch (error) {
    console.error('❌ Erreur dans getAllAteliers:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de la récupération des ateliers',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Obtenir un atelier par ID
const getAtelierById = async (req, res) => {
  try {
    const rows = await db.query(
      `SELECT 
         id,
         titre,
         description,
         DATE_FORMAT(date, '%Y-%m-%d') as date,
         TIME_FORMAT(heure_debut, '%H:%i') as heureDebut,
         TIME_FORMAT(heure_fin, '%H:%i') as heureFin,
         salle,
         capacite,
         inscrits,
         type,
         statut,
         formateur_id,
         DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as createdAt
       FROM ateliers WHERE id = ?`,
      { replacements: [req.params.id], type: QueryTypes.SELECT }
    );
    const atelier = rows[0];
    if (!atelier) {
      return res.status(404).json({ message: 'Atelier non trouvé' });
    }
    if (atelier.formateur_id) {
      const fs = await db.query(
        'SELECT nom, prenom FROM users WHERE id = ?',
        { replacements: [atelier.formateur_id], type: QueryTypes.SELECT }
      );
      const f = fs[0];
      atelier.formateur = f ? `${f.prenom} ${f.nom}` : 'Non assigné';
    } else {
      atelier.formateur = 'Non assigné';
    }
    atelier.lieu = atelier.salle;
    atelier.participants = atelier.inscrits;
    atelier.heure = `${atelier.heureDebut} - ${atelier.heureFin}`;
    res.json(atelier);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'atelier:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Créer un atelier (pour Admin et Formateur)
const createAtelier = async (req, res) => {
  try {
    const {
      titre,
      description,
      date,
      heureDebut,
      heureFin,
      salle,
      capacite,
      type,
      statut,
      formateur_id,
      formateurId
    } = req.body;

    let finalFormateurId = formateur_id || formateurId || null;
    if (req.user?.role === 'formateur') {
      finalFormateurId = req.user.id;
    }

    // Validation minimale
    if (!titre || !date || !heureDebut || !heureFin || !salle) {
      return res.status(400).json({ message: 'Champs obligatoires manquants' });
    }

    const insertQuery = `
      INSERT INTO ateliers (
        titre, description, date, heure_debut, heure_fin, salle, capacite, inscrits, type, statut, formateur_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      titre,
      description || '',
      date,
      heureDebut,
      heureFin,
      salle,
      capacite || 20,
      0,
      type || 'pratique',
      statut || 'actif',
      finalFormateurId
    ];
    const [result] = await db.query(insertQuery, { replacements: values, type: QueryTypes.INSERT });

    res.status(201).json({ message: 'Atelier créé avec succès', id: result.insertId });
  } catch (error) {
    console.error('Erreur lors de la création de l\'atelier:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Mettre à jour un atelier (pour Admin et Formateur, ou formateur si c'est le sien)
const updateAtelier = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      titre,
      description,
      date,
      heureDebut,
      heureFin,
      salle,
      capacite,
      type,
      statut,
      formateur_id,
      formateurId
    } = req.body;

    // Vérifier l'existence
    const existingRows = await db.query('SELECT formateur_id FROM ateliers WHERE id = ?', { replacements: [id], type: QueryTypes.SELECT });
    const existing = existingRows[0];
    if (!existing) {
      return res.status(404).json({ message: 'Atelier non trouvé' });
    }

    // Permissions: si formateur, ne peut modifier que ses ateliers
    if (req.user?.role === 'formateur' && existing.formateur_id !== req.user.id) {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à modifier cet atelier' });
    }

    const updateQuery = `
      UPDATE ateliers
      SET 
        titre = ?, 
        description = ?, 
        date = ?, 
        heure_debut = ?, 
        heure_fin = ?, 
        salle = ?, 
        capacite = ?, 
        type = ?, 
        statut = ?,
        formateur_id = ?
      WHERE id = ?
    `;
    const values = [
      titre,
      description,
      date,
      heureDebut,
      heureFin,
      salle,
      capacite,
      type,
      statut,
      req.user?.role === 'formateur' ? req.user.id : (formateur_id || formateurId || existing.formateur_id),
      id
    ];
    await db.query(updateQuery, { replacements: values, type: QueryTypes.UPDATE });

    res.json({ message: 'Atelier mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'atelier:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Supprimer un atelier (pour Admin et Formateur, ou formateur si c'est le sien)
const deleteAtelier = async (req, res) => {
  try {
    const { id } = req.params;

    const existingRows = await db.query('SELECT formateur_id FROM ateliers WHERE id = ?', { replacements: [id], type: QueryTypes.SELECT });
    const existing = existingRows[0];
    if (!existing) {
      return res.status(404).json({ message: 'Atelier non trouvé' });
    }

    // Vérifier les permissions
    if (req.user?.role === 'formateur' && existing.formateur_id !== req.user.id) {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à supprimer cet atelier' });
    }

    await db.query('DELETE FROM ateliers WHERE id = ?', { replacements: [id], type: QueryTypes.DELETE });

    res.json({ message: 'Atelier supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'atelier:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = {
  getAllAteliers,
  getAtelierById,
  createAtelier,
  updateAtelier,
  deleteAtelier
};
