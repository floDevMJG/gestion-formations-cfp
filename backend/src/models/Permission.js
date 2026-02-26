const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Permission = sequelize.define('Permission', {
    type_permission: {
      type: DataTypes.STRING,
      allowNull: false
    },
    date_permission: {
      type: DataTypes.DATE,
      allowNull: false
    },
    heure_debut: {
      type: DataTypes.TIME,
      allowNull: false
    },
    heure_fin: {
      type: DataTypes.TIME,
      allowNull: false
    },
    duree: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    jours_demandes: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    motif: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    statut: {
      type: DataTypes.STRING,
      defaultValue: 'en_attente' // en_attente, approuvee, refusee
    },
    documents: {
      type: DataTypes.JSON, // Stocker les chemins des fichiers
      allowNull: true
    },
    retour_prevu: {
      type: DataTypes.STRING,
      allowNull: true
    },
    contact_urgence: {
      type: DataTypes.STRING,
      allowNull: true
    },
    telephone_urgence: {
      type: DataTypes.STRING,
      allowNull: true
    }
  });

  Permission.associate = (models) => {
    Permission.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return Permission;
};
