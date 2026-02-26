// models/Paiement.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Paiement = sequelize.define('Paiement', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    formationId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    montant: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    methode: {
        type: DataTypes.ENUM('orange', 'mvola', 'airtel', 'carte', 'especes'),
        allowNull: false
    },
    statut: {
        type: DataTypes.ENUM('en_attente', 'termine', 'annule', 'echec'),
        defaultValue: 'en_attente'
    },
    reference: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    details: {
        type: DataTypes.JSON,
        allowNull: true
    },
    dateValidation: {
      type: DataTypes.DATE,
      allowNull: true
    },
    codeValidation: {
      type: DataTypes.STRING,
      allowNull: true
    },
    operateur: {
      type: DataTypes.STRING,
      allowNull: true
    },
    numeroTelephone: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'Paiements',
    timestamps: true
  });

  Paiement.associate = (models) => {
    Paiement.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    
    Paiement.belongsTo(models.Formation, {
      foreignKey: 'formationId',
      as: 'formation'
    });
  };

  return Paiement;
};