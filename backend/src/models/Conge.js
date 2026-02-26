const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Conge = sequelize.define('Conge', {
    type_conge: {
      type: DataTypes.STRING,
      allowNull: false
    },
    date_debut: {
      type: DataTypes.DATE,
      allowNull: false
    },
    date_fin: {
      type: DataTypes.DATE,
      allowNull: false
    },
    jours_demandes: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    motif: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    documents: {
      type: DataTypes.JSON,
      allowNull: true
    },
    contact_urgence: {
      type: DataTypes.STRING,
      allowNull: true
    },
    telephone_urgence: {
      type: DataTypes.STRING,
      allowNull: true
    },
    statut: {
      type: DataTypes.STRING,
      defaultValue: 'en_attente' // en_attente, approuvee, refusee
    }
  });

  Conge.associate = (models) => {
    Conge.belongsTo(models.User, { foreignKey: 'userId' });
  };

  return Conge;
};
