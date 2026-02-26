const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../models');
const jwt = require('jsonwebtoken');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || 'votre_google_client_id',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'votre_google_client_secret',
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
  scope: ['profile', 'email'],
  passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    // Vérifier si l'utilisateur existe déjà
    let user = await User.findOne({ where: { email: profile.emails[0].value } });

    if (user) {
      // L'utilisateur existe, le mettre à jour avec les infos Google
      user.googleId = profile.id;
      user.googleAccessToken = accessToken;
      user.googleRefreshToken = refreshToken;
      user.emailVerified = true;
      await user.save();
      // Indiquer au flux que c'est une connexion d'un utilisateur existant
      user._createdViaGoogle = false;
      return done(null, user);
    }

    // Créer un nouvel utilisateur
    const [nom, prenom] = profile.displayName.split(' ');
    const desiredRole = (req.query?.state === 'formateur') ? 'formateur' : 'apprenant';
    const statut = desiredRole === 'formateur' ? 'en_attente' : 'valide';
    
    user = await User.create({
      googleId: profile.id,
      email: profile.emails[0].value,
      nom: nom || profile.displayName,
      prenom: prenom || '',
      role: desiredRole,
      statut,
      emailVerified: true,
      googleAccessToken: accessToken,
      googleRefreshToken: refreshToken,
      password: Math.random().toString(36).slice(-8), // Mot de passe aléatoire
      telephone: null,
      adresse: null,
      dateNaissance: null
    });

    console.log(`✅ Nouvel utilisateur créé via Google: ${profile.emails[0].value}`);
    // Indiquer au flux que c'est une nouvelle création
    user._createdViaGoogle = true;
    return done(null, user);
  } catch (error) {
    console.error('❌ Erreur Google OAuth:', error);
    return done(error, null);
  }
}));

module.exports = passport;
