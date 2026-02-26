const http = require('http');
const email = process.argv[2] || 'toussaintbenjamin14@gmail.com';
const role = process.argv[3] || 'apprenant';
const nom = process.argv[4] || 'Test';
const prenom = process.argv[5] || 'UI';
const path = `/api/test-email?to=${encodeURIComponent(email)}&role=${encodeURIComponent(role)}&nom=${encodeURIComponent(nom)}&prenom=${encodeURIComponent(prenom)}`;
http.get({ hostname: 'localhost', port: 5000, path }, (res) => {
  let buf = '';
  res.on('data', (c) => (buf += c));
  res.on('end', () => {
    try { console.log(JSON.parse(buf)); } catch (e) { console.log(buf); }
  });
}).on('error', (e) => {
  console.error('ERR', e.message);
  process.exit(1);
});
