// src/models/Inscription.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Inscription = sequelize.define('Inscription', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    formationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    dateInscription: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    statut: {
      type: DataTypes.ENUM('en_attente', 'validee', 'refusee'),
      defaultValue: 'en_attente',
    },
    montant: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    methodePaiement: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    numeroTelephone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    statutPaiement: {
      type: DataTypes.ENUM('en_attente', 'paye', 'annule'),
      defaultValue: 'en_attente',
    },
    referencePaiement: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    motifRejet: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'inscriptions',
    timestamps: true
  });

  Inscription.associate = (models) => {
    Inscription.belongsTo(models.User, { 
      foreignKey: 'userId',
      as: 'user'
    });
    
    Inscription.belongsTo(models.Formation, { 
      foreignKey: 'formationId',
      as: 'formation'
    });
  };

  return Inscription;
};
