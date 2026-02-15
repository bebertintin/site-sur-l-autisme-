require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'news.json');

function readData(){
  try{ return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }catch(e){ return []; }
}
function writeData(arr){
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(arr, null, 2));
}

// helper: check admin basic auth when ADMIN_USER is set
function isAdminAuthenticated(req){
  if(!process.env.ADMIN_USER) return true; // no auth required
  const auth = (req.headers['authorization'] || '');
  if(!auth.startsWith('Basic ')) return false;
  try{
    const creds = Buffer.from(auth.slice(6), 'base64').toString('utf8');
    const idx = creds.indexOf(':');
    if(idx === -1) return false;
    const user = creds.slice(0, idx);
    const pass = creds.slice(idx+1);
    return user === process.env.ADMIN_USER && pass === process.env.ADMIN_PASS;
  }catch(e){ return false; }
}

app.get('/api/news', (req, res) => {
  res.json(readData());
});

// admin-only listing (protected by BASIC auth when ADMIN_USER is set)
app.get('/api/admin/news', (req, res) => {
  if(!isAdminAuthenticated(req)) return res.status(401).set('WWW-Authenticate','Basic realm="Admin area"').json({ error: 'unauthorized' });
  res.json(readData());
});

app.post('/api/news', (req, res) => {
  // if ADMIN_USER is configured, require Basic auth for publishing to server
  if(process.env.ADMIN_USER && !isAdminAuthenticated(req)){
    return res.status(401).set('WWW-Authenticate','Basic realm="Admin area"').json({ error: 'unauthorized' });
  }

  const { title, date, content, notifyEmail } = req.body;
  if(!title || !content) return res.status(400).json({ error: 'title and content required' });
  const item = { id: Date.now(), title, date: date || new Date().toISOString().slice(0,10), content, notifyEmail };
  const arr = readData();
  arr.push(item);
  writeData(arr);

  // respond immediately
  res.status(201).json(item);

  // send notification emails (non‑blocking) if SMTP configured
  (async () => {
    if(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS){
      try{
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: String(process.env.SMTP_SECURE) === 'true',
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        });

        const from = process.env.EMAIL_FROM || process.env.SMTP_USER;

        function renderEmailHtml(item, target){
          const safe = (s)=>String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
          const publicUrl = process.env.PUBLIC_URL || '';
          const articleLink = publicUrl ? `<p><a href="${publicUrl.replace(/\/$/,'')}/actualites-archive.html">Voir sur le site</a></p>` : '';
          return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:Arial,sans-serif;color:#0b2540} .header{background:#005792;color:#fff;padding:12px;border-radius:6px} .content{padding:12px} .meta{color:#6b7280;font-size:0.9rem;margin-bottom:8px} .footer{margin-top:18px;color:#6b7280;font-size:0.85rem}</style></head><body><div class="header"><strong>Site d\'information — Autisme</strong></div><div class="content"><div class="meta">${safe(target)} • ${safe(item.date)}</div><h2 style="margin:0 0 8px">${safe(item.title)}</h2><div>${safe(item.content).replace(/\n/g,'<br>')}</div>${articleLink}<div class="footer">Si besoin, consultez nos actualités.</div></div></body></html>`;
        }

        // confirmation to submitter (HTML + plain text)
        if(notifyEmail){
          await transporter.sendMail({
            from,
            to: notifyEmail,
            subject: `Réception de votre proposition — ${item.title}`,
            text: `Merci pour votre proposition.\n\nTitre: ${item.title}\nDate: ${item.date}\n\n${item.content}`,
            html: renderEmailHtml(item, 'Confirmation de réception')
          });
        }

        // notification to admin (optional)
        if(process.env.ADMIN_EMAIL){
          await transporter.sendMail({
            from,
            to: process.env.ADMIN_EMAIL,
            subject: `Nouvelle proposition: ${item.title}`,
            text: `Nouvelle proposition reçue.\n\nTitre: ${item.title}\nDate: ${item.date}\n\n${item.content}`,
            html: renderEmailHtml(item, 'Nouvelle proposition')
          });
        }
      }catch(err){
        console.error('Mail send failed:', err && err.message ? err.message : err);
      }
    }
  })();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend demo running: http://localhost:${PORT}/api/news`));
