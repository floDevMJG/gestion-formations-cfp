const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Cours = sequelize.define('Cours', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    formationId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Formations',
        key: 'id'
      }
    },
    formateurId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    titre: DataTypes.STRING,
    description: DataTypes.TEXT,
    date: DataTypes.DATE,
    heureDebut: DataTypes.TIME,
    heureFin: DataTypes.TIME,
    salle: DataTypes.STRING,
    type: { 
      type: DataTypes.STRING, 
      defaultValue: 'cours' // 'cours', 'td', 'tp', 'examen', 'pdf'
    },
    // Champs pour les fichiers PDF
    fichierUrl: DataTypes.STRING,
    fichierNom: DataTypes.STRING
  }, {
    tableName: 'Cours',
    timestamps: true
  });

  Cours.associate = (models) => {
    Cours.belongsTo(models.Formation, { foreignKey: 'formationId', as: 'formation' });
    Cours.belongsTo(models.User, { foreignKey: 'formateurId', as: 'Formateur' });
  };

  return Cours;
};
