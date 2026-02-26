const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
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
  statut: {
    type: DataTypes.ENUM('en_attente', 'valide', 'refuse'),
    defaultValue: 'valide',
    comment: 'Statut de validation pour les formateurs',
    validate: {
      isIn: {
        args: [['en_attente', 'valide', 'refuse']],
        msg: 'Le statut doit être soit "en_attente", "valide" ou "refuse"'
      },
      isFormateurNeedsValidation(value) {
        if (this.role === 'formateur' && !['en_attente', 'valide', 'refuse'].includes(value)) {
          throw new Error('Le statut est requis pour les formateurs');
        }
      }
    }
  }
}, {
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
      // Par défaut, les formateurs sont en attente de validation
      if (user.role === 'formateur' && user.statut === undefined) {
        user.statut = 'en_attente';
      } else if (user.role !== 'formateur') {
        // Les autres rôles sont automatiquement validés
        user.statut = 'valide';
      }
    },
    beforeUpdate: async (user) => {
      // Si le rôle est modifié pour devenir formateur, mettre en attente de validation
      if (user.changed('role') && user.role === 'formateur' && !user.statut) {
        user.statut = 'en_attente';
      } else if (user.changed('role') && user.role !== 'formateur') {
        // Si le rôle est modifié pour autre chose que formateur, marquer comme valide
        user.statut = 'valide';
      }
    }
  }
});

module.exports = User;