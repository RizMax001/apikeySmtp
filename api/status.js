const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  const apiKey = req.headers['x-api-key'] || req.query.apikey;
  if (apiKey !== 'admin') {
    return res.status(403).json({ error: 'Invalid API key' });
  }

  // cari file dataemail.txt di root project
  const filePath = path.join(process.cwd(), 'dataemail.txt');

  // kalau file gak ada
  if (!fs.existsSync(filePath)) {
    return res.json({
      status: 'OK',
      message: 'File dataemail.txt tidak ditemukan ⚠️',
      total_email: 0,
      connect: 0,
      disconnect: 0
    });
  }

  const raw = fs.readFileSync(filePath, 'utf-8').trim();
  if (!raw) {
    return res.json({
      status: 'OK',
      message: 'File dataemail.txt kosong ⚠️',
      total_email: 0,
      connect: 0,
      disconnect: 0
    });
  }

  const lines = raw.split('\n').map(l => l.trim()).filter(l => l !== '');
  const limited = lines.slice(0, 11); // cek maksimal 11 email

  let connectCount = 0;
  let disconnectCount = 0;

  for (const line of limited) {
    const [email, pass] = line.split(':').map(x => x.trim());
    if (!email || !pass) {
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
      connectCount++;
    } catch {
      disconnectCount++;
    }
  }

  return res.json({
    status: 'OK',
    message: 'Service aktif 🚀',
    total_email: limited.length,
    connect: connectCount,
    disconnect: disconnectCount
  });
};
