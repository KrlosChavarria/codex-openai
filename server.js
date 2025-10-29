import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4173;

const distPath = path.join(__dirname, 'dist');

app.use(express.static(distPath));

app.get('/api/state/:abbr', async (req, res) => {
  const { abbr } = req.params;
  try {
    const { default: states } = await import('./src/data/states.js');
    const state = states.find((s) => s.abbreviation.toLowerCase() === abbr.toLowerCase());
    if (!state) {
      return res.status(404).json({ error: 'State not found' });
    }
    return res.json(state);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load state data' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
