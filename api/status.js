module.exports = (req, res) => {
  const apiKey = req.headers['x-api-key'] || req.query.apikey
  if (apiKey !== 'admin') {
    return res.status(403).json({ error: 'Invalid API key' })
  }

  res.json({ status: 'OK', message: 'Service aktif 🚀' })
}
