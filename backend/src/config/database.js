require('dotenv').config();
const { Sequelize } = require('sequelize');

const env = process.env.NODE_ENV || 'development';
const useSqlite = String(process.env.USE_SQLITE || '').toLowerCase() === 'true';

const config = {
  development: useSqlite ? {
    dialect: 'sqlite',
    storage: process.env.SQLITE_PATH || 'dev.sqlite',
    logging: console.log
  } : {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'gestion_formations',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'mysql',
    logging: console.log
  },
  test: {
    username: process.env.TEST_DB_USER || 'root',
    password: process.env.TEST_DB_PASSWORD || '',
    database: process.env.TEST_DB_NAME || 'gestion_formations_test',
    host: process.env.TEST_DB_HOST || '127.0.0.1',
    dialect: 'mysql',
    logging: false
  },
  production: {
    username: process.env.RAILWAY_MYSQL_USER || process.env.PROD_DB_USER,
    password: process.env.RAILWAY_MYSQL_PASSWORD || process.env.PROD_DB_PASSWORD,
    database: process.env.RAILWAY_MYSQL_DATABASE || process.env.PROD_DB_NAME,
    host: process.env.RAILWAY_MYSQL_HOST || process.env.PROD_DB_HOST,
    port: process.env.RAILWAY_MYSQL_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      },
      // Forcer IPv4
      family: 4
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
};

const dbConfig = config[env];

const sequelize = useSqlite
  ? new Sequelize({
      dialect: 'sqlite',
      storage: dbConfig.storage,
      logging: dbConfig.logging
    })
  : new Sequelize(
      dbConfig.database,
      dbConfig.username,
      dbConfig.password,
      {
        host: dbConfig.host,
        dialect: dbConfig.dialect,
        logging: dbConfig.logging,
        pool: dbConfig.pool
      }
    );

module.exports = sequelize;
