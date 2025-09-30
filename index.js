const express = require("express")
const app = express()

app.get("/", (req, res) => {
  res.send("Halo, deploy Node.js berhasil 🚀")
})

module.exports = app
