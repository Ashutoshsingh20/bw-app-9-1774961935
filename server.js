import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA = path.join(__dirname, 'data', 'db.json');
fs.mkdirSync(path.dirname(DATA), { recursive: true });
if (!fs.existsSync(DATA)) fs.writeFileSync(DATA, JSON.stringify({ assets: [], tickets: [], energy: [] }, null, 2));
const readDb = () => JSON.parse(fs.readFileSync(DATA, 'utf8'));
const writeDb = (db) => fs.writeFileSync(DATA, JSON.stringify(db, null, 2));

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));
app.get('/api/assets', (_req, res) => res.json(readDb().assets));
app.post('/api/assets', (req, res) => { const db = readDb(); const asset = { id: nanoid(8), ...req.body }; db.assets.push(asset); writeDb(db); res.status(201).json(asset); });
app.get('/api/tickets', (_req, res) => res.json(readDb().tickets));
app.post('/api/tickets', (req, res) => { const db = readDb(); const ticket = { id: nanoid(8), status: 'open', ...req.body, createdAt: new Date().toISOString() }; db.tickets.push(ticket); writeDb(db); res.status(201).json(ticket); });
app.post('/api/tickets/:id/close', (req, res) => { const db = readDb(); const t = db.tickets.find(x => x.id === req.params.id); if (!t) return res.status(404).json({ error: 'not found' }); t.status = 'closed'; t.closedAt = new Date().toISOString(); writeDb(db); res.json(t); });
app.get('/api/energy', (_req, res) => res.json(readDb().energy));
app.post('/api/energy', (req, res) => { const db = readDb(); const e = { id: nanoid(8), ...req.body, recordedAt: new Date().toISOString() }; db.energy.push(e); writeDb(db); res.status(201).json(e); });
app.get('/api/dashboard', (_req, res) => { const db = readDb(); res.json({ assets: db.assets.length, tickets: db.tickets.length, openTickets: db.tickets.filter(t => t.status !== 'closed').length, energy: db.energy.length }); });

app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) return res.sendFile(path.join(__dirname, 'public', 'index.html'));
  next();
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Running on http://localhost:${port}`));
