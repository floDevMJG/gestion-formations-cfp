// Controller ateliers admin avec debug complet
const express = require('express');
const router = express.Router();
const { Atelier, User } = require('../models');

// GET /api/admin/ateliers - Récupérer tous les ateliers (admin)
router.get('/', async (req, res) => {
  try {
    console.log('📗 Récupération des ateliers admin...');
    
    const ateliers = await Atelier.findAll({
      include: [{
        model: User,
        as: 'formateur',
        attributes: ['nom', 'prenom']
      }],
      // Ordre sûr pour éviter erreurs si colonnes spécifiques manquent
      order: [['createdAt', 'DESC']]
    });

    console.log('✅ Ateliers récupérés:', ateliers.length);
    
    const ateliersWithFormateurs = ateliers.map(atelier => {
      const { formateur, ...atelierData } = atelier.get({ plain: true });
      return {
        ...atelierData,
        formateur: formateur ? `${formateur.prenom} ${formateur.nom}` : 'Non assigné'
      };
    });
    
    res.json(ateliersWithFormateurs);
  } catch (error) {
    console.error('❌ Erreur récupération ateliers admin:', error);
    res.status(500).json({ 
      message: 'Erreur serveur', 
      error: error.message
    });
  }
});

// POST /api/admin/ateliers - Créer un nouvel atelier (admin)
router.post('/', async (req, res) => {
  try {
    console.log('📝 Création atelier admin...');
    console.log('📋 Données reçues:', req.body);
    
    const { titre, description, date, heureDebut, heureFin, lieu, prix, niveau, categorie, placesDisponibles, formateurId } = req.body;
    
    if (!titre || !date || !heureDebut || !heureFin || !lieu) {
      console.log('❌ Validation échouée - Champs manquants');
      return res.status(400).json({ 
        message: 'Champs obligatoires manquants',
        required: ['titre', 'date', 'heureDebut', 'heureFin', 'lieu'],
        received: req.body
      });
    }
    
    const nouvelAtelier = await Atelier.create({
      titre,
      description,
      date,
      heureDebut,
      heureFin,
      lieu,
      prix,
      niveau,
      categorie,
      placesDisponibles,
      formateurId
    });

    console.log('✅ Atelier créé avec ID:', nouvelAtelier.id);
    
    res.status(201).json({ 
      message: 'Atelier créé avec succès', 
      atelier: nouvelAtelier
    });
  } catch (error) {
    console.error('❌ Erreur création atelier admin:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la création de l\'atelier', 
      error: error.message
    });
  }
});

// DELETE /api/admin/ateliers/:id - Supprimer un atelier (admin)
router.delete('/:id', async (req, res) => {
  try {
    console.log('🗑️ Suppression atelier ID:', req.params.id);
    const atelierId = req.params.id;
    
    const result = await Atelier.destroy({
      where: { id: atelierId }
    });
    
    if (result === 0) {
      return res.status(404).json({ message: 'Atelier non trouvé' });
    }
    
    console.log('✅ Atelier supprimé avec succès');
    res.json({ message: 'Atelier supprimé avec succès' });
  } catch (error) {
    console.error('❌ Erreur suppression atelier admin:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la suppression de l\'atelier', 
      error: error.message 
    });
  }
});

module.exports = router;
