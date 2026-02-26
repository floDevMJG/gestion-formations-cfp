const express = require('express'); const router = express.Router();
const { Formation } = require('../models');

router.get('/', async (req,res)=>{
  const list = await Formation.findAll();
  res.json(list);
});

router.post('/', async (req,res)=>{
  const data = req.body;
  const f = await Formation.create(data);
  res.status(201).json(f);
});

router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ message: 'ID invalide' });
    }
    const formation = await Formation.findByPk(id);
    if (!formation) {
      return res.status(404).json({ message: 'Formation non trouvée' });
    }
    res.json(formation);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
