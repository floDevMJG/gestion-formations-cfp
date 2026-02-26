const express = require('express');
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const router = express.Router();

// Route d'authentification Google
router.get('/google', (req, res, next) => {
  const enabled = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;
  if (!enabled) {
    return res.status(503).json({ message: 'Authentification Google non configurée' });
  }
  const role = req.query.role === 'formateur' ? 'formateur' : 'apprenant';
  return passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
    state: role,
    prompt: 'select_account'
  })(req, res, next);
});

// Callback Google après authentification
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: 'http://localhost:3000/login?error=google_failed', session: false }),
  async (req, res) => {
    try {
      // Générer le token JWT
      const token = jwt.sign(
        { 
          id: req.user.id, 
          email: req.user.email, 
          role: req.user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      // Rediriger vers le frontend avec le token
      const created = req.user && req.user._createdViaGoogle ? 1 : 0;
      const redirectUrl = `http://localhost:3000/auth/google/success?token=${token}&created=${created}&user=${encodeURIComponent(JSON.stringify({
        id: req.user.id,
        email: req.user.email,
        nom: req.user.nom,
        prenom: req.user.prenom,
        role: req.user.role,
        statut: req.user.statut
      }))}`;
      
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('❌ Erreur callback Google:', error);
      res.redirect('http://localhost:3000/login?error=server_error');
    }
  }
);

// Route pour lier un compte Google à un utilisateur existant
router.post('/google/link', async (req, res) => {
  try {
    const { email, password, googleToken } = req.body;
    
    // Vérifier les identifiants de l'utilisateur
    const user = await User.findOne({ where: { email } });
    if (!user || !await user.validatePassword(password)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email ou mot de passe incorrect' 
      });
    }

    // Lier le compte Google
    const profile = jwt.decode(googleToken);
    user.googleId = profile.sub;
    user.emailVerified = true;
    await user.save();

    res.json({ 
      success: true, 
      message: 'Compte Google lié avec succès' 
    });
  } catch (error) {
    console.error('❌ Erreur liaison Google:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la liaison du compte Google' 
    });
  }
});

// Endpoint pour vérifier si Google OAuth est configuré
router.get('/google/enabled', (req, res) => {
  const enabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  res.json({ enabled });
});

module.exports = router;
