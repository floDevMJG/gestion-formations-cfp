-- Controller Node.js pour les ateliers (API endpoints)
-- Ce fichier montre comment utiliser les requêtes SQL avec Express.js

const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET /formateur/ateliers - Récupérer tous les ateliers du formateur
router.get('/ateliers', async (req, res) => {
  try {
    const formateurId = req.user.id;
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
        DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as createdAt,
        DATE_FORMAT(updated_at, '%Y-%m-%d %H:%i:%s') as updatedAt
      FROM ateliers 
      WHERE formateur_id = ?
      ORDER BY date DESC, heure_debut DESC
    `;
    
    const [ateliers] = await db.query(query, [formateurId]);
    res.json(ateliers);
  } catch (error) {
    console.error('Erreur lors de la récupération des ateliers:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /formateur/ateliers - Créer un nouvel atelier
router.post('/ateliers', async (req, res) => {
  try {
    const formateurId = req.user.id;
    const { titre, description, date, heureDebut, heureFin, salle, capacite, type, statut } = req.body;
    
    const query = `
      INSERT INTO ateliers (
        titre, 
        description, 
        date, 
        heure_debut, 
        heure_fin, 
        salle, 
        capacite, 
        type, 
        statut, 
        formateur_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.query(query, [
      titre, 
      description, 
      date, 
      heureDebut, 
      heureFin, 
      salle, 
      capacite || 20, 
      type || 'pratique', 
      statut || 'actif', 
      formateurId
    ]);
    
    res.status(201).json({ 
      message: 'Atelier créé avec succès', 
      id: result.insertId 
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'atelier:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT /formateur/ateliers/:id - Mettre à jour un atelier
router.put('/ateliers/:id', async (req, res) => {
  try {
    const formateurId = req.user.id;
    const atelierId = req.params.id;
    const { titre, description, date, heureDebut, heureFin, salle, capacite, type, statut } = req.body;
    
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
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND formateur_id = ?
    `;
    
    const [result] = await db.query(query, [
      titre, 
      description, 
      date, 
      heureDebut, 
      heureFin, 
      salle, 
      capacite, 
      type, 
      statut, 
      atelierId, 
      formateurId
    ]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Atelier non trouvé' });
    }
    
    res.json({ message: 'Atelier mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'atelier:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// DELETE /formateur/ateliers/:id - Supprimer un atelier
router.delete('/ateliers/:id', async (req, res) => {
  try {
    const formateurId = req.user.id;
    const atelierId = req.params.id;
    
    const query = `
      DELETE FROM ateliers 
      WHERE id = ? AND formateur_id = ?
    `;
    
    const [result] = await db.query(query, [atelierId, formateurId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Atelier non trouvé' });
    }
    
    res.json({ message: 'Atelier supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'atelier:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /formateur/ateliers/search - Rechercher des ateliers
router.get('/ateliers/search', async (req, res) => {
  try {
    const formateurId = req.user.id;
    const searchTerm = `%${req.query.q || ''}%`;
    
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
        statut
      FROM ateliers 
      WHERE formateur_id = ? 
      AND (
        LOWER(titre) LIKE LOWER(?) OR 
        LOWER(description) LIKE LOWER(?) OR
        LOWER(salle) LIKE LOWER(?)
      )
      ORDER BY date DESC, heure_debut DESC
    `;
    
    const [ateliers] = await db.query(query, [formateurId, searchTerm, searchTerm, searchTerm]);
    res.json(ateliers);
  } catch (error) {
    console.error('Erreur lors de la recherche d\'ateliers:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /formateur/ateliers/stats - Statistiques des ateliers
router.get('/ateliers/stats', async (req, res) => {
  try {
    const formateurId = req.user.id;
    
    const query = `
      SELECT 
        COUNT(*) as totalAteliers,
        COUNT(CASE WHEN statut = 'actif' THEN 1 END) as ateliersActifs,
        COUNT(CASE WHEN statut = 'terminé' THEN 1 END) as ateliersTermines,
        COUNT(CASE WHEN statut = 'annulé' THEN 1 END) as ateliersAnnules,
        SUM(inscrits) as totalInscrits,
        SUM(capacite) as totalCapacite,
        COUNT(CASE WHEN date >= CURDATE() THEN 1 END) as ateliersAVenir,
        COUNT(CASE WHEN date = CURDATE() THEN 1 END) as ateliersAujourdhui
      FROM ateliers 
      WHERE formateur_id = ?
    `;
    
    const [stats] = await db.query(query, [formateurId]);
    res.json(stats[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
