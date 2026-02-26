const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Formation = sequelize.define('Formation', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    titre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    duree: {
      type: DataTypes.STRING,
      allowNull: false
    },
    placesDisponibles: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    dateDebut: {
      type: DataTypes.DATEONLY
    },
    statut: {
      type: DataTypes.ENUM('ouverte', 'en_cours', 'terminee', 'annulee'),
      defaultValue: 'ouverte'
    },
    prix: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: 'formations',
    timestamps: true
  });

  Formation.associate = (models) => {
    Formation.hasMany(models.Inscription, {
      foreignKey: 'formationId',
      as: 'inscriptions'
    });
    
    Formation.hasMany(models.Paiement, {
      foreignKey: 'formationId',
      as: 'paiements'
    });
  };

  return Formation;
};