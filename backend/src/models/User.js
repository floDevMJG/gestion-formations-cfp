// src/models/User.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nom: {
      type: DataTypes.STRING,
      allowNull: false
    },
    prenom: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('admin', 'formateur', 'apprenant'),
      defaultValue: 'apprenant'
    },
    telephone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    adresse: {
      type: DataTypes.STRING,
      allowNull: true
    },
    dateNaissance: {
      type: DataTypes.DATE,
      allowNull: true
    },
    statut: {
      type: DataTypes.ENUM('actif', 'inactif', 'en_attente', 'valide', 'refuse', 'rejete'),
      defaultValue: 'en_attente'
    },
    codeFormateur: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Code spécial pour les formateurs validés par admin'
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Email vérifié par code'
    },
    emailVerificationCode: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Code de vérification envoyé par email'
    },
    emailVerificationExpires: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Expiration du code de vérification'
    },
    googleId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      comment: 'ID Google pour OAuth'
    },
    googleAccessToken: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Token d accès Google'
    },
    googleRefreshToken: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Token de rafraîchissement Google'
    }
  }, {
    tableName: 'users',
    timestamps: true
  });

  User.associate = (models) => {
    User.hasMany(models.Inscription, {
      foreignKey: 'userId',
      as: 'inscriptions'
    });
    
    User.hasMany(models.Paiement, {
      foreignKey: 'userId',
      as: 'paiements'
    });
    
    User.hasMany(models.Notification, {
      foreignKey: 'userId',
      as: 'notifications'
    });
    User.hasMany(models.Conge, {
      foreignKey: 'userId',
      as: 'conges'
    });
  };

  return User;
};
