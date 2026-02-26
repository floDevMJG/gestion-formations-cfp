const express = require('express');
const router = express.Router();
const { sendApprenantValidatedEmail, sendFormateurValidatedEmail } = require('../utils/sendgrid-mailer');

router.get('/', async (req, res) => {
  try {
    const to = req.query.to;
    const role = req.query.role || 'apprenant';
    const nom = req.query.nom || 'Test';
    const prenom = req.query.prenom || 'User';
    if (!to) return res.status(400).json({ message: 'Paramètre to requis' });
    if (role === 'formateur') {
      await sendFormateurValidatedEmail({ email: to, nom, prenom, codeFormateur: 'CFP-0000' });
    } else {
      await sendApprenantValidatedEmail({ email: to, nom, prenom });
    }
    res.json({ success: true, to, role });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;
