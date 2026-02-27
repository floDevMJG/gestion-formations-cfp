const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lue: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    tableName: 'notifications',
    timestamps: true
  });

  Notification.associate = (models) => {
    Notification.belongsTo(models.User, { foreignKey: 'userId' });
  };

  return Notification;
};
