const fs = require('fs')
const nodemailer = require('nodemailer')

const CONFIG = {
  API_KEY: 'merona',
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
  console.log(`[LOG] ${new Date().toISOString()} ${entry}`)
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
  if (apiKey !== CONFIG.API_KEY) {
    return res.status(403).json({
      success: false,
      error: 'Invalid API key',
      hint: 'Gunakan header x-api-key atau ?apikey=admin'
    })
  }

  const email = req.query.email
  const pesan = req.query.pesan // sekarang pakai 'pesan' bukan 'nomor'

  if (!email || !pesan) {
    return res.status(400).json({
      success: false,
      error: 'Parameter kurang',
      usage: '/api/testsend?apikey=admin&email=target@example.com&pesan=Isi pesan panjang di sini'
    })
  }

  try {
    const accounts = loadAccounts()
    if (!accounts.length) {
      return res.status(500).json({
        success: false,
        error: 'Tidak ada akun SMTP di dataimel.txt'
      })
    }

    const subject = `Test Banding ${counter}`
    const text = `Halo,\n\n${pesan}\n\n#${counter}`

    const account = pickRandomAccount(accounts)
    const info = await sendMail({ account, to: email, subject, text })

    logToFile(`TEST by ${account.user} → ${email} | Subject: ${subject} | Pesan: ${pesan}`)

    counter++
    return res.json({
      success: true,
      message: 'Email berhasil dikirim',
      usedAccount: account.user,
      to: email,
      subject,
      isi: pesan,
      messageId: info.messageId || null
    })
  } catch (err) {
    logToFile(`ERROR: ${err.message}`)
    return res.status(500).json({
      success: false,
      error: err.message
    })
  }
}
