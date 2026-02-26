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
    const r = http.request(options, (res) => {
      let buf = '';
      res.on('data', (c) => (buf += c));
      res.on('end', () => {
        try {
          const j = buf ? JSON.parse(buf) : {};
          if (res.statusCode >= 200 && res.statusCode < 300) return resolve(j);
          return reject(new Error(j.message || `HTTP ${res.statusCode}`));
        } catch (e) {
          return reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}
(async () => {
  try {
    const ts = Date.now();
    const email = `formateur${ts}@gmail.com`;
    const password = 'pass123';
    const nom = 'Test';
    const prenom = 'Formateur';
    const reg = await req('POST', '/api/auth/register', { email, password, nom, prenom, role: 'formateur' });
    const admin = await req('POST', '/api/auth/login', { email: 'admin@cfp.com', password: 'admin123' });
    const token = admin.token;
    const validate = await req('PUT', `/api/admin/users/${reg.user.id}/validate`, {}, { Authorization: `Bearer ${token}` });
    const code = validate.codeFormateur;
    const login = await req('POST', '/api/auth/login', { email, password, codeFormateur: code });
    console.log('FLOW OK:', { email, code, loginUserRole: login.user.role });
  } catch (e) {
    console.error('FLOW ERR:', e.message);
    process.exit(1);
  }
})();
