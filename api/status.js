      // api/status.js
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  const apiKey = req.headers['x-api-key'] || req.query.apikey;
  if (apiKey !== 'admin') {
    return res.status(403).json({ error: 'Invalid API key' });
  }

  const filePath = path.join(__dirname, 'emaildata.txt');
  if (!fs.existsSync(filePath)) {
    return res.json({
      status: 'OK',
      message: 'Service aktif 🚀',
      total_email: 0,
      connect: 0,
      disconnect: 0,
      list_connect: [],
      list_disconnect: []
    });
  }

  const raw = fs.readFileSync(filePath, 'utf-8').trim();
  const lines = raw.split('\n').map(l => l.trim()).filter(l => l !== '');
  const limited = lines.slice(0, 11);

  let connectCount = 0;
  let disconnectCount = 0;
  let list_connect = [];
  let list_disconnect = [];

  for (const line of limited) {
    const [email, pass] = line.split(':').map(x => x.trim());
    if (!email || !pass) {
      list_disconnect.push(email || 'unknown');
      disconnectCount++;
      continue;
    }

    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user: email, pass },
        connectionTimeout: 7000
      });

      await transporter.verify();
      list_connect.push(email);
      connectCount++;
    } catch (err) {
      list_disconnect.push(email);
      disconnectCount++;
    }
  }

  return res.json({
    status: 'OK',
    message: 'Service aktif 🚀',
    total_email: limited.length,
    connect: connectCount,
    disconnect: disconnectCount,
    list_connect,
    list_disconnect
  });
};
