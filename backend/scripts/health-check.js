const http = require('http');
const { sendEmailVerification } = require('../src/services/emailService');

async function healthCheck() {
  console.log('🔍 Health Check du service email...');
  
  try {
    // Test simple d'envoi d'email
    await sendEmailVerification({
      email: 'health-check@cfp-charpentier-marine.com',
      nom: 'Health',
      prenom: 'Check',
      code: '000000'
    });
    
    console.log('✅ Service email opérationnel');
    return { status: 'healthy', email: 'ok' };
    
  } catch (error) {
    console.error('❌ Service email indisponible:', error.message);
    return { status: 'unhealthy', email: 'error', error: error.message };
  }
}

// Endpoint de health check pour Railway
const server = http.createServer(async (req, res) => {
  if (req.url === '/health') {
    const health = await healthCheck();
    res.writeHead(health.status === 'healthy' ? 200 : 503, {
      'Content-Type': 'application/json'
    });
    res.end(JSON.stringify(health));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

// Démarrer le serveur de monitoring
const PORT = process.env.HEALTH_PORT || 3001;
server.listen(PORT, () => {
  console.log(`🔍 Health check server listening on port ${PORT}`);
});

module.exports = { healthCheck };
