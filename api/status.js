const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

module.exports = async (req, res) => {
  const apiKey = req.headers["x-api-key"] || req.query.apikey;
  if (apiKey !== "admin") {
    return res.status(403).json({ error: "Invalid API key" });
  }

  // 🧠 Coba dua lokasi: root dan /api/
  const rootPath = path.join(process.cwd(), "dataemail.txt");
  const apiPath = path.join(__dirname, "dataemail.txt");

  let filePath = "";
  if (fs.existsSync(rootPath)) filePath = rootPath;
  else if (fs.existsSync(apiPath)) filePath = apiPath;
  else {
    return res.json({
      status: "OK",
      message: "File dataemail.txt tidak ditemukan ⚠️",
      total_email: 0,
      connect: 0,
      disconnect: 0,
      file_checked: [rootPath, apiPath] // untuk debugging lokasi dicek
    });
  }

  // 🚀 Baca isi file
  const raw = fs.readFileSync(filePath, "utf-8").trim();
  if (!raw) {
    return res.json({
      status: "OK",
      message: "File dataemail.txt kosong ⚠️",
      total_email: 0,
      connect: 0,
      disconnect: 0
    });
  }

  const lines = raw.split("\n").map(l => l.trim()).filter(l => l !== "");
  const limited = lines.slice(0, 11);

  let connectCount = 0;
  let disconnectCount = 0;

  for (const line of limited) {
    const [email, pass] = line.split(":").map(x => x.trim());
    if (!email || !pass) {
      disconnectCount++;
      continue;
    }

    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
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
    status: "OK",
    message: "Service aktif 🚀",
    total_email: limited.length,
    connect: connectCount,
    disconnect: disconnectCount
  });
};
