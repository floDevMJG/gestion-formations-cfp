module.exports = {
  dbName: process.env.DB_NAME || 'gestion_formations',
  dbUser: process.env.DB_USER || 'root',
  dbPass: process.env.DB_PASS || '',
  dbHost: process.env.DB_HOST || '127.0.0.1',
};
