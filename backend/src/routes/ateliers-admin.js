// Routes admin pour les ateliers
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { QueryTypes } = require('sequelize');
const { authenticate, isAdmin } = require('../middlewares/auth');

// Middleware d'authentification admin
const authenticateAdmin = [authenticate, isAdmin];

// GET /api/admin/ateliers - Récupérer tous les ateliers (admin)
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const query = `
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
      ORDER BY date DESC, heure_debut DESC
    `;
    
    const ateliers = await db.query(query, { type: QueryTypes.SELECT });
    
    // Récupérer les informations des formateurs
    const ateliersWithFormateurs = await Promise.all(
      ateliers.map(async (atelier) => {
        if (atelier.formateur_id) {
          const formateurs = await db.query(
            'SELECT nom, prenom FROM Users WHERE id = ?',
            { replacements: [atelier.formateur_id], type: QueryTypes.SELECT }
          );
          const formateur = formateurs[0];
          return {
            ...atelier,
            formateur: formateur ? `${formateur.prenom} ${formateur.nom}` : 'Non assigné'
          };
        }
        return {
          ...atelier,
          formateur: 'Non assigné'
        };
      })
    );
    
    res.json(ateliersWithFormateurs);
  } catch (error) {
    console.error('Erreur lors de la récupération des ateliers (admin):', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// POST /api/admin/ateliers - Créer un nouvel atelier (admin)
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const { titre, description, date, heureDebut, heureFin, salle, capacite, type, statut, formateur_id } = req.body;
    
    // Validation
    if (!titre || !description || !date || !heureDebut || !heureFin || !salle) {
      return res.status(400).json({ 
        message: 'Champs obligatoires manquants',
        required: ['titre', 'description', 'date', 'heureDebut', 'heureFin', 'salle']
      });
    }
    
    const query = `
      INSERT INTO ateliers (
        titre, 
        description, 
        date, 
        heure_debut, 
        heure_fin, 
        salle, 
        capacite, 
        inscrits, 
        type, 
        statut, 
        formateur_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      titre, 
      description, 
      date, 
      heureDebut, 
      heureFin, 
      salle, 
      capacite || 20, 
      0, // inscrits commence à 0
      type || 'pratique', 
      statut || 'actif', 
      formateur_id || null
    ];
    
    const [result] = await db.query(query, { replacements: values, type: QueryTypes.INSERT });
    
    res.status(201).json({ 
      message: 'Atelier créé avec succès', 
      id: result.insertId 
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'atelier (admin):', error);
    res.status(500).json({ 
      message: 'Erreur lors de la création de l\'atelier', 
      error: error.message 
    });
  }
});

// PUT /api/admin/ateliers/:id - Mettre à jour un atelier (admin)
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const atelierId = req.params.id;
    const { titre, description, date, heureDebut, heureFin, salle, capacite, type, statut, formateur_id } = req.body;
    
    const query = `
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
        formateur_id = ?,
        updated_at = CURRENT_TIMESTAMP
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
      formateur_id,
      atelierId
    ];
    
    const [result] = await db.query(query, { replacements: values, type: QueryTypes.UPDATE });
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Atelier non trouvé' });
    }
    
    res.json({ message: 'Atelier mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'atelier (admin):', error);
    res.status(500).json({ 
      message: 'Erreur lors de la mise à jour de l\'atelier', 
      error: error.message 
    });
  }
});

// DELETE /api/admin/ateliers/:id/delete - Supprimer un atelier (admin)
router.delete('/:id/delete', authenticateAdmin, async (req, res) => {
  try {
    const atelierId = req.params.id;
    
    const [result] = await db.query('DELETE FROM ateliers WHERE id = ?', { replacements: [atelierId], type: QueryTypes.DELETE });
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Atelier non trouvé' });
    }
    
    res.json({ message: 'Atelier supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'atelier (admin):', error);
    res.status(500).json({ 
      message: 'Erreur lors de la suppression de l\'atelier', 
      error: error.message 
    });
  }
});

module.exports = router;
