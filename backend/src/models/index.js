const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const User = require('./User');
const Formation = require('./Formation');
const Inscription = require('./Inscription');
const Paiement = require('./Paiement');
const Notification = require('./Notification');
const Atelier = require('./Atelier');
const Message = require('./Message');
const Cours = require('./Cours');
const Permission = require('./Permission');
const Conge = require('./Conge');

// Initialisation des modèles
const models = {
  User: User(sequelize),
  Formation: Formation(sequelize),
  Inscription: Inscription(sequelize),
  Paiement: Paiement(sequelize),
  Notification: Notification(sequelize),
  Atelier: Atelier(sequelize),
  Message: Message(sequelize),
  Cours: Cours(sequelize),
  Permission: Permission(sequelize),
  Conge: Conge(sequelize)
};

// Définition des relations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

models.sequelize = sequelize;
models.Sequelize = require('sequelize');

module.exports = models;
