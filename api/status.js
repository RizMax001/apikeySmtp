module.exports = (req, res) => {
  const apiKey = req.headers["x-api-key"] || req.query.apikey;
  if (apiKey !== "merona") {
    return res.status(403).json({ error: "Invalid API key" });
  }

  // 🔧 Data manual (ubah sesuai real count)
  const total_email = 7;
  const connect = 7;
  const disconnect = 0;

  res.json({
    status: "OK",
    owner: "RizkyMaxz 💻",
    message: "Service aktif 🚀",
    total_email,
    connect,
    disconnect
  });
};
