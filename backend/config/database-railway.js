require('dotenv').config();

// Configuration spécifique pour InfinityFree MySQL
module.exports = {
  username: process.env.DB_USER || 'if0_38348735',
  password: process.env.DB_PASS || 'vGBFeP3qyT',
  database: process.env.DB_NAME || 'if0_38348735_gestion_formations',
  host: process.env.DB_HOST || 'sql103.infinityfree.com',
  port: process.env.DB_PORT || 3306,
  dialect: 'mysql',
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  },
  define: {
    timestamps: true,
    underscored: true
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};
