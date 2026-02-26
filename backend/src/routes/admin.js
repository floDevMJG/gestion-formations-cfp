// src/routes/admin.js
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth');
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  validateUser,
  testSendValidation,
  rejectUser,
  pendingUser,
  getPendingUsers,
  getPendingFormateurs,
  updateFormation,
  deleteFormation,
  getAllInscriptions,
  acceptInscription,
  rejectInscription,
  pendingInscription,
  deleteInscription,
  getStats,
  resendFormateurCodeEmail
} = require('../controllers/adminController');

router.use(authenticate);
const annoncesRoutes = require('./annonces');
router.use('/annonces', annoncesRoutes);
router.use(authorize(['admin', 'formateur']));

// Statistiques
router.get('/stats', getStats);

// Routes utilisateurs
router.get('/users', getAllUsers);
router.get('/users/pending', getPendingUsers); // Utilisateurs en attente de validation
router.get('/users/pending/formateurs', getPendingFormateurs); // Formateurs en attente de validation
router.get('/users/:id', getUserById);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.put('/users/:id/validate', validateUser); // Valider un utilisateur
router.post('/users/:id/resend-code', resendFormateurCodeEmail); // Renvoyer code formateur par email
router.put('/users/:id/reject', rejectUser); // Rejeter un utilisateur
router.put('/users/:id/pending', pendingUser); // Remettre en attente
router.delete('/users/:id', deleteUser);
router.post('/users/test-email', testSendValidation);

// Routes formations
router.put('/formations/:id', updateFormation);
router.delete('/formations/:id', deleteFormation);

// Routes inscriptions
router.get('/inscriptions', getAllInscriptions);
router.put('/inscriptions/:id/accept', acceptInscription);
router.put('/inscriptions/:id/reject', rejectInscription);
router.put('/inscriptions/:id/pending', pendingInscription);
router.delete('/inscriptions/:id', deleteInscription);

// Routes ateliers
const ateliersAdminRoutes = require('./ateliers-admin');
router.use('/ateliers', ateliersAdminRoutes);

module.exports = router;
