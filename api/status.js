const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  const apiKey = req.headers['x-api-key'] || req.query.apikey;
  if (apiKey !== 'admin') {
    return res.status(403).json({ error: 'Invalid API key' });
  }

  // Coba cari file di beberapa lokasi agar selalu terbaca
  let filePath = path.resolve('./emaildata.txt');
  if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, 'emaildata.txt');
  }

  // Jika file tidak ada
  if (!fs.existsSync(filePath)) {
    return res.json({
      status: 'OK',
      message: 'Service aktif 🚀',
      total_email: 0,
      connect: 0,
      disconnect: 0
    });
  }

  // Baca isi file
  const rawData = fs.readFileSync(filePath, 'utf-8').trim();
  if (!rawData) {
    return res.json({
      status: 'OK',
      message: 'Service aktif 🚀',
      total_email: 0,
      connect: 0,
      disconnect: 0
    });
  }

  // Pisahkan baris email
  const lines = rawData.split('\n').filter(l => l.trim() !== '');
  const limitedEmails = lines.slice(0, 11); // maksimal 11 email

  let connectCount = 0;
  let disconnectCount = 0;
  const listConnect = [];
  const listDisconnect = [];

  // Loop untuk cek koneksi SMTP tiap email
  for (const line of limitedEmails) {
    const [email, apppw] = line.split(':');
    if (!email || !apppw) continue;

    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: email.trim(),
          pass: apppw.trim()
        },
        connectionTimeout: 5000
      });

      await transporter.verify();
      connectCount++;
      listConnect.push(email.trim());
    } catch {
      disconnectCount++;
      listDisconnect.push(email.trim());
    }
  }

  // Kirim hasil
  res.json({
    status: 'OK',
    message: 'Service aktif 🚀',
    total_email: limitedEmails.length,
    connect: connectCount,
    disconnect: disconnectCount,
    list_connect: listConnect,
    list_disconnect: listDisconnect
  });
};
