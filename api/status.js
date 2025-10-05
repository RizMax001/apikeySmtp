const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  const apiKey = req.headers['x-api-key'] || req.query.apikey;
  if (apiKey !== 'admin') {
    return res.status(403).json({ error: 'Invalid API key' });
  }

  const filePath = path.join(__dirname, '../emaildata.txt');
  if (!fs.existsSync(filePath)) {
    return res.json({
      status: 'OK',
      message: 'Service aktif 🚀',
      total_email: 0,
      connect: 0,
      disconnect: 0
    });
  }

  const data = fs.readFileSync(filePath, 'utf-8').trim();
  const lines = data.split('\n').filter(line => line.trim() !== '');

  let connectCount = 0;
  let disconnectCount = 0;

  // Batasi ke 11 email saja
  const limitedEmails = lines.slice(0, 11);

  // Cek setiap email
  for (const line of limitedEmails) {
    const [email, apppw] = line.split(':');
    if (!email || !apppw) continue;

    try {
      // Buat transport SMTP
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: email.trim(),
          pass: apppw.trim()
        }
      });

      // Coba verifikasi koneksi SMTP
      await transporter.verify();
      connectCount++;
    } catch (err) {
      disconnectCount++;
    }
  }

  res.json({
    status: 'OK',
    message: 'Service aktif 🚀',
    total_email: limitedEmails.length,
    connect: connectCount,
    disconnect: disconnectCount
  });
};
