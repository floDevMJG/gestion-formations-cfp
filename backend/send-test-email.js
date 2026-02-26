const http = require('http');

function req(method, path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
        ...headers
      }
    };
    const req = http.request(options, (res) => {
      let buf = '';
      res.on('data', (chunk) => (buf += chunk));
      res.on('end', () => {
        try {
          const json = buf ? JSON.parse(buf) : {};
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(json);
          } else {
            reject(new Error(json.message || `HTTP ${res.statusCode}`));
          }
        } catch (e) {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({});
          } else {
            reject(new Error(`HTTP ${res.statusCode}`));
          }
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

(async () => {
  try {
    const email = process.argv[2] || 'toussaintbenjamin14@gmail.com';
    const role = process.argv[3] || 'apprenant';
    const nom = process.argv[4] || 'Test';
    const prenom = process.argv[5] || 'UI';
    const login = await req('POST', '/api/auth/login', { email: 'admin@cfp.com', password: 'admin123' });
    const token = login.token;
    const res = await req('POST', '/api/admin/users/test-email', { email, role, nom, prenom }, { Authorization: `Bearer ${token}` });
    console.log('OK:', res);
  } catch (e) {
    console.error('ERR:', e.message);
    process.exit(1);
  }
})();
