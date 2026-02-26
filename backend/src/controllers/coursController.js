const { Cours, Formation, User, Inscription } = require('../models');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Vérifier si les modèles sont bien importés
console.log('Modèles importés:', { Cours: !!Cours, Formation: !!Formation, User: !!User });

// Configuration de multer pour l'upload des fichiers PDF
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/cours');
    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Générer un nom de fichier unique
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'cours-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accepter uniquement les fichiers PDF
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers PDF sont autorisés'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  }
});

// Récupérer tous les cours
exports.getAllCours = async (req, res) => {
  try {
    console.log('📚 getAllCours appelé par:', req.user?.email || 'non authentifié');
    
    const cours = await Cours.findAll({
      where: { type: 'pdf' }, // Ne récupérer que les cours PDF
      include: [
        {
          model: Formation,
          as: 'formation',
          attributes: ['id', 'titre']
        },
        {
          model: User,
          as: 'Formateur',
          attributes: ['id', 'nom', 'prenom']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log(`✅ ${cours.length} cours PDF trouvés`);
    res.status(200).json(cours);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des cours:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des cours',
      error: error.message 
    });
  }
};

// Créer un nouveau cours
exports.createCours = [
  upload.single('fichier'),
  async (req, res) => {
    try {
      const { titre, description, formationId } = req.body;
      
      // Récupérer l'ID du formateur depuis le token JWT
      const formateurId = req.user.id;
      
      if (!titre || !description || !formationId || !req.file) {
        return res.status(400).json({ 
          message: 'Tous les champs sont requis et un fichier PDF doit être fourni' 
        });
      }

      console.log('Données reçues:', { titre, description, formationId, formateurId, fichier: req.file.filename });

      // Vérifier si la formation existe
      const formation = await Formation.findByPk(formationId);
      if (!formation) {
        return res.status(404).json({ message: 'Formation non trouvée' });
      }

      // Créer le cours avec le type 'pdf'
      const cours = await Cours.create({
        titre,
        description,
        formationId,
        formateurId,
        type: 'pdf',
        fichierUrl: `uploads/cours/${req.file.filename}`,
        fichierNom: req.file.originalname,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      console.log('Cours créé:', cours.id);

      // Récupérer le cours avec les informations associées
      const coursComplet = await Cours.findByPk(cours.id, {
        include: [
          {
            model: Formation,
            as: 'formation',
            attributes: ['id', 'titre']
          },
          {
            model: User,
            as: 'Formateur',
            attributes: ['id', 'nom', 'prenom']
          }
        ]
      });

      res.status(201).json({
        message: 'Cours créé avec succès',
        cours: coursComplet
      });

    } catch (error) {
      console.error('Erreur lors de la création du cours:', error);
      res.status(500).json({ 
        message: 'Erreur lors de la création du cours',
        error: error.message 
      });
    }
  }
];

// Récupérer les cours d'un formateur
exports.getCoursByFormateur = async (req, res) => {
  try {
    const formateurId = req.user.id;
    
    const cours = await Cours.findAll({
      where: { 
        formateurId,
        type: 'pdf' // Ne récupérer que les cours PDF
      },
      include: [
        {
          model: Formation,
          as: 'formation',
          attributes: ['id', 'titre']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json(cours);
  } catch (error) {
    console.error('Erreur lors de la récupération des cours du formateur:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des cours du formateur',
      error: error.message 
    });
  }
};

// Récupérer un cours par son ID
exports.getCoursById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const cours = await Cours.findByPk(id, {
      include: [
        {
          model: Formation,
          as: 'formation',
          attributes: ['id', 'titre']
        },
        {
          model: User,
          as: 'Formateur',
          attributes: ['id', 'nom', 'prenom']
        }
      ]
    });

    if (!cours) {
      return res.status(404).json({ message: 'Cours non trouvé' });
    }

    res.status(200).json(cours);
  } catch (error) {
    console.error('Erreur lors de la récupération du cours:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération du cours',
      error: error.message 
    });
  }
};

// Mettre à jour un cours
exports.updateCours = async (req, res) => {
  try {
    const { id } = req.params;
    const { titre, description, formationId } = req.body;
    
    const cours = await Cours.findByPk(id);
    if (!cours) {
      return res.status(404).json({ message: 'Cours non trouvé' });
    }

    // Vérifier si l'utilisateur est le formateur du cours ou un admin
    if (cours.formateurId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Non autorisé à modifier ce cours' });
    }

    // Mettre à jour le cours
    await cours.update({
      titre: titre || cours.titre,
      description: description || cours.description,
      formationId: formationId || cours.formationId,
      updatedAt: new Date()
    });

    // Récupérer le cours mis à jour
    const coursMisAJour = await Cours.findByPk(id, {
      include: [
        {
          model: Formation,
          as: 'formation',
          attributes: ['id', 'titre']
        },
        {
          model: User,
          as: 'Formateur',
          attributes: ['id', 'nom', 'prenom']
        }
      ]
    });

    res.status(200).json({
      message: 'Cours mis à jour avec succès',
      cours: coursMisAJour
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du cours:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la mise à jour du cours',
      error: error.message 
    });
  }
};

// Supprimer un cours
exports.deleteCours = async (req, res) => {
  try {
    const { id } = req.params;
    
    const cours = await Cours.findByPk(id);
    if (!cours) {
      return res.status(404).json({ message: 'Cours non trouvé' });
    }

    // Vérifier si l'utilisateur est le formateur du cours ou un admin
    if (cours.formateurId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Non autorisé à supprimer ce cours' });
    }

    // Supprimer le fichier physique
    if (cours.fichierUrl) {
      const filePath = path.join(__dirname, '../../..', cours.fichierUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Supprimer le cours de la base de données
    await cours.destroy();

    res.status(200).json({ message: 'Cours supprimé avec succès' });

  } catch (error) {
    console.error('Erreur lors de la suppression du cours:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la suppression du cours',
      error: error.message 
    });
  }
};

// Télécharger un cours PDF
exports.downloadCours = async (req, res) => {
  try {
    const { id } = req.params;
    
    const cours = await Cours.findByPk(id);
    if (!cours) {
      return res.status(404).json({ message: 'Cours non trouvé' });
    }

    const filePath = path.join(__dirname, '../../..', cours.fichierUrl);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Fichier non trouvé' });
    }

    res.download(filePath, cours.fichierNom);

  } catch (error) {
    console.error('Erreur lors du téléchargement du cours:', error);
    res.status(500).json({ 
      message: 'Erreur lors du téléchargement du cours',
      error: error.message 
    });
  }
};

// Emploi du temps d'un apprenant
exports.getEmploiDuTempsApprenant = async (req, res) => {
  try {
    const apprenantId = parseInt(req.params.id);
    if (Number.isNaN(apprenantId)) {
      return res.status(400).json({ message: 'ID apprenant invalide' });
    }

    // Récupérer les formations auxquelles l'apprenant est inscrit
    const inscriptions = await Inscription.findAll({
      where: { userId: apprenantId },
      attributes: ['formationId']
    });
    const formationIds = inscriptions.map(i => i.formationId);

    if (formationIds.length === 0) {
      return res.status(200).json([]);
    }

    // Récupérer les cours planifiés (hors PDFs) liés à ces formations
    const cours = await Cours.findAll({
      where: {
        formationId: formationIds,
        type: ['cours', 'td', 'tp', 'examen']
      },
      include: [
        {
          model: Formation,
          as: 'formation',
          attributes: ['id', 'titre']
        },
        {
          model: User,
          as: 'Formateur',
          attributes: ['id', 'nom', 'prenom']
        }
      ],
      order: [['date', 'ASC'], ['heureDebut', 'ASC']]
    });

    // Mise en forme minimale attendue par le frontend
    const payload = cours.map(c => ({
      id: c.id,
      formationId: c.formationId,
      titre: c.titre || c.formation?.titre || 'Cours',
      description: c.description || '',
      date: c.date,
      heureDebut: c.heureDebut,
      heureFin: c.heureFin,
      salle: c.salle || 'Salle à définir',
      type: c.type || 'cours',
      formateur: c.Formateur ? { id: c.Formateur.id, nom: `${c.Formateur.nom || ''} ${c.Formateur.prenom || ''}`.trim() } : null
    }));

    res.status(200).json(payload);
  } catch (error) {
    console.error('Erreur lors de la récupération de l’emploi du temps apprenant:', error);
    res.status(500).json({
      message: 'Erreur lors de la récupération de l’emploi du temps',
      error: error.message
    });
  }
};
