const isAdmin = (req, res, next) => {
  // Vérifier si l'utilisateur est authentifié et a le rôle admin
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  
  // Si l'utilisateur n'est pas admin
  return res.status(403).json({
    message: 'Accès refusé. Droits administrateur requis.'
  });
};

module.exports = isAdmin;
