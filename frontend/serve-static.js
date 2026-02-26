const express = require('express');
const path = require('path');
const app = express();

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'build')));

// Toutes les routes redirigées vers index.html (pour React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Frontend servi sur le port ${PORT}`);
  console.log(`📊 Health check disponible sur /`);
});
