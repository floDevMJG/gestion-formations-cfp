// Routes admin pour les ateliers
const express = require('express');
const router = express.Router();
const { Atelier, User } = require('../models');
const { authenticate, isAdmin } = require('../middlewares/auth');

// Middleware d'authentification admin
const authenticateAdmin = [authenticate, isAdmin];

// GET /api/admin/ateliers - Récupérer tous les ateliers (admin)
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const ateliers = await Atelier.findAll({
      include: [{
        model: User,
        as: 'formateur',
        attributes: ['id', 'nom', 'prenom'],
        required: false
      }],
      order: [['date', 'DESC'], ['heureDebut', 'DESC']]
    });
    
    // Formatter les données pour correspondre au frontend
    const ateliersFormatted = ateliers.map(atelier => ({
      id: atelier.id,
      titre: atelier.titre,
      description: atelier.description,
      date: atelier.date,
      heureDebut: atelier.heureDebut,
      heureFin: atelier.heureFin,
      salle: atelier.lieu, // lieu -> salle pour le frontend
      capacite: atelier.placesDisponibles, // placesDisponibles -> capacite
      inscrits: 0, // TODO: calculer depuis les inscriptions
      type: atelier.categorie || 'atelier',
      statut: 'actif', // TODO: ajouter ce champ au modèle
      formateur_id: atelier.formateurId,
      formateur: atelier.formateur ? `${atelier.formateur.prenom} ${atelier.formateur.nom}` : 'Non assigné',
      createdAt: atelier.createdAt
    }));
    
    res.json(ateliersFormatted);
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
    
    const nouvelAtelier = await Atelier.create({
      titre,
      description,
      date,
      heureDebut,
      heureFin,
      lieu: salle, // salle -> lieu
      placesDisponibles: capacite || 0, // capacite -> placesDisponibles
      categorie: type || 'atelier', // type -> categorie
      formateurId: formateur_id || null // formateur_id -> formateurId
    });
    
    res.status(201).json({ 
      message: 'Atelier créé avec succès', 
      atelier: nouvelAtelier 
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
    
    const updateData = {
      titre,
      description,
      date,
      heureDebut,
      heureFin,
      lieu: salle, // salle -> lieu
      placesDisponibles: capacite, // capacite -> placesDisponibles
      categorie: type, // type -> categorie
      formateurId: formateur_id // formateur_id -> formateurId
    };
    
    // Supprimer les valeurs undefined
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });
    
    const [updatedRowsCount] = await Atelier.update(updateData, {
      where: { id: atelierId }
    });
    
    if (updatedRowsCount === 0) {
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
    
    const deletedRowsCount = await Atelier.destroy({
      where: { id: atelierId }
    });
    
    if (deletedRowsCount === 0) {
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
