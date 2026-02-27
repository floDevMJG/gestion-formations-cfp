const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Presence = sequelize.define('Presence', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    coursId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'cours',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    statut: { 
      type: DataTypes.STRING, 
      defaultValue: 'absent' // 'present', 'absent', 'retard', 'justifie'
    },
    date: DataTypes.DATE,
    remarque: DataTypes.TEXT
  }, {
    tableName: 'presences',
    timestamps: true
  });

  Presence.associate = (models) => {
    Presence.belongsTo(models.Cours, { foreignKey: 'coursId' });
    Presence.belongsTo(models.User, { foreignKey: 'userId' });
  };

  return Presence;
};
