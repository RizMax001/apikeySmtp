const fs = require('fs')
const nodemailer = require('nodemailer')

const CONFIG = {
  API_KEY: 'admin',
  SMTP_HOST: 'smtp.gmail.com',
  SMTP_PORT: 465,
  SMTP_SECURE: true,
  DEFAULT_RECIPIENT: 'smb@support.whatsapp.com',
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

  const nomor = req.query.nomor
  if (!nomor) return res.status(400).json({ error: 'Nomor wajib diisi ?nomor=...' })

  try {
    const accounts = loadAccounts()
    if (!accounts.length) return res.status(500).json({ error: 'Tidak ada akun SMTP di dataimel.txt' })

    const subject = `Banding ${counter}`
    const text = `Helo pihak WhatsApp,
Perkenalkan nama saya (RizkyMaxz).
Saya ingin mengajukan banding tentang mendaftar nomor telepon.
Saat registrasi muncul teks "login tidak tersedia".
Mohon untuk memperbaiki masalah tersebut.
Nomor saya (+${nomor}).`

    const account = pickRandomAccount(accounts)
    const info = await sendMail({ account, to: CONFIG.DEFAULT_RECIPIENT, subject, text })

    logToFile(`SENT by ${account.user} → ${CONFIG.DEFAULT_RECIPIENT} | Subject: ${subject} | Nomor: +${nomor}`)

    counter++
    return res.json({ success: true, usedAccount: account.user, subject, info })
  } catch (err) {
    logToFile(`ERROR: ${err.message}`)
    return res.status(500).json({ error: err.message })
  }
}