module.exports = (req, res) => {
  res.status(200).json({
    message: "API Banding Nomor aktif 🚀",
    endpoints: ["/api/fixto", "/api/status", "/api/testsend"]
  })
}
