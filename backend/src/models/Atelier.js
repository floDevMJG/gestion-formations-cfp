const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Atelier = sequelize.define('Atelier', {
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
      allowNull: true
    },
    date: {
      type: DataTypes.DATEONLY, // Date seulement, sans heure
      allowNull: false
    },
    heureDebut: {
      type: DataTypes.TIME, // Heure de début
      allowNull: false
    },
    heureFin: {
      type: DataTypes.TIME, // Heure de fin
      allowNull: false
    },
    lieu: {
      type: DataTypes.STRING,
      allowNull: false
    },
    prix: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true
    },
    niveau: {
      type: DataTypes.ENUM('Débutant', 'Intermédiaire', 'Avancé', 'Tous niveaux'),
      allowNull: true,
      defaultValue: 'Tous niveaux'
    },
    categorie: {
      type: DataTypes.STRING,
      allowNull: true
    },
    placesDisponibles: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    formateurId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Peut être null si l'atelier n'est pas directement lié à un formateur (ex: atelier général)
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    tableName: 'Ateliers',
    timestamps: true
  });

  Atelier.associate = (models) => {
    Atelier.belongsTo(models.User, {
      foreignKey: 'formateurId',
      as: 'formateur'
    });
  };

  return Atelier;
};
