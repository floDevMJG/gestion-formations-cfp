const db = require('../config/database');
const { QueryTypes } = require('sequelize');

const createAnnonceFormateurs = async (req, res) => {
  try {
    const { titre, contenu } = req.body;
    if (!titre || !contenu) {
      return res.status(400).json({ message: 'Titre et contenu sont requis' });
    }
    const createdBy = req.user?.id || null;
    await db.query(
      'INSERT INTO annonces_formateurs (titre, contenu, created_by) VALUES (?, ?, ?)',
      { replacements: [titre, contenu, createdBy], type: QueryTypes.INSERT }
    );
    res.status(201).json({ message: 'Annonce créée' });
  } catch (e) {
    console.error('Erreur création annonce formateurs:', e);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const listAnnoncesFormateurs = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, titre, contenu, created_by as createdBy, created_at as createdAt FROM annonces_formateurs ORDER BY created_at DESC'
    );
    // When using sequelize.query with SELECT, rows is already the array
    res.json(rows || []);
  } catch (e) {
    console.error('Erreur liste annonce formateurs:', e);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const createAnnonceApprenants = async (req, res) => {
  try {
    const { titre, contenu } = req.body;
    if (!titre || !contenu) {
      return res.status(400).json({ message: 'Titre et contenu sont requis' });
    }
    const createdBy = req.user?.id || null;
    await db.query(
      'INSERT INTO annonces_apprenants (titre, contenu, created_by) VALUES (?, ?, ?)',
      { replacements: [titre, contenu, createdBy], type: QueryTypes.INSERT }
    );
    res.status(201).json({ message: 'Annonce créée' });
  } catch (e) {
    console.error('Erreur création annonce apprenants:', e);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const listAnnoncesApprenants = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, titre, contenu, created_by as createdBy, created_at as createdAt FROM annonces_apprenants ORDER BY created_at DESC'
    );
    res.json(rows || []);
  } catch (e) {
    console.error('Erreur liste annonce apprenants:', e);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = {
  createAnnonceFormateurs,
  listAnnoncesFormateurs,
  createAnnonceApprenants,
  listAnnoncesApprenants
};
