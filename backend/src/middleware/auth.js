const jwt = require('jsonwebtoken');
const config = require('../config/config');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, config.jwtSecret);
    req.user = { id: decodedToken.id, role: decodedToken.role };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Requête non authentifiée !' });
  }
};
