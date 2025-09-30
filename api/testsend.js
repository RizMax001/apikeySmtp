const fs = require('fs')
const nodemailer = require('nodemailer')

const CONFIG = {
  API_KEY: 'admin',
  SMTP_HOST: 'smtp.gmail.com',
  SMTP_PORT: 465,
  SMTP_SECURE: true,
  LOG_FILE: __dirname + '/../email_logs.txt'
}

function loadAccounts() {
  const raw = fs.readFileSync(__dirname + '/../dataimel.txt', 'utf8')
  return raw
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const [user, pass] = line.split(':')
      return { user, pass }
    })
}

let counter = 1

function pickRandomAccount(accounts) {
  const idx = Math.floor(Math.random() * accounts.length)
  return accounts[idx]
}

function logToFile(entry) {
  fs.appendFileSync(CONFIG.LOG_FILE, `[${new Date().toISOString()}] ${entry}\n`)
}

async function sendMail({ account, to, subject, text }) {
  const transporter = nodemailer.createTransport({
    host: CONFIG.SMTP_HOST,
    port: CONFIG.SMTP_PORT,
    secure: CONFIG.SMTP_SECURE,
    auth: { user: account.user, pass: account.pass }
  })
  return transporter.sendMail({ from: account.user, to, subject, text })
}

module.exports = async (req, res) => {
  const apiKey = req.headers['x-api-key'] || req.query.apikey
  if (apiKey !== CONFIG.API_KEY) return res.status(403).json({ error: 'Invalid API key' })

  const email = req.query.email
  const nomor = req.query.nomor
  if (!email || !nomor) {
    return res.status(400).json({ error: 'Gunakan ?email=alamat&nomor=12345' })
  }

  try {
    const accounts = loadAccounts()
    if (!accounts.length) return res.status(500).json({ error: 'Tidak ada akun SMTP di dataimel.txt' })

    const subject = `Test Banding ${counter}`
    const text = `Test kirim.\nNomor: +${nomor}\n#${counter}`

    const account = pickRandomAccount(accounts)
    const info = await sendMail({ account, to: email, subject, text })

    logToFile(`TEST by ${account.user} → ${email} | Subject: ${subject} | Nomor: +${nomor}`)

    counter++
    return res.json({ success: true, usedAccount: account.user, subject, info })
  } catch (err) {
    logToFile(`ERROR: ${err.message}`)
    return res.status(500).json({ error: err.message })
  }
}