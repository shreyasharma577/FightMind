import http from 'http';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  generateFighterFromPrompt,
  modifyFighterFromPrompt,
  getTacticalCoachAdvice,
  getFighterEvolutions,
  AI_MODEL_NAME
} from './src/server/ai.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getPort(): number {
  const portArgIndex = process.argv.indexOf('--port');
  if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
    return parseInt(process.argv[portArgIndex + 1], 10);
  }
  // Cloud Run sets PORT=8080 for the external container entry, but inside the container
  // Nginx already listens on 8080 and reverse-proxies to 3000.
  if (process.env.PORT && process.env.PORT !== '8080') {
    return parseInt(process.env.PORT, 10);
  }
  return 3000;
}

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const PORT = getPort();
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '5mb' }));

  // Health and info check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      game: 'FIGHT//MIND',
      model: AI_MODEL_NAME,
      hasApiKey: Boolean(process.env.GEMINI_API_KEY)
    });
  });

  // Download full project source code ZIP
  app.get('/api/download-zip', (req, res) => {
    const zipPath = path.resolve(__dirname, 'public', 'fightmind_source_code.zip');
    res.download(zipPath, 'fightmind_source_code.zip', (err) => {
      if (err) {
        console.error('Error downloading zip:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Failed to download zip file' });
        }
      }
    });
  });

  // Generate character from prompt
  app.post('/api/generate-fighter', async (req, res) => {
    try {
      const { prompt, archetype } = req.body;
      if (!prompt || typeof prompt !== 'string') {
        res.status(400).json({ error: 'Character description prompt is required' });
        return;
      }
      const fighter = await generateFighterFromPrompt(prompt, archetype);
      res.json({ fighter });
    } catch (err: any) {
      console.error('Error generating fighter:', err);
      res.status(500).json({ error: err.message || 'Failed to generate fighter' });
    }
  });

  // Modify character incrementally
  app.post('/api/modify-fighter', async (req, res) => {
    try {
      const { currentFighter, instruction } = req.body;
      if (!currentFighter || !instruction) {
        res.status(400).json({ error: 'currentFighter and instruction are required' });
        return;
      }
      const fighter = await modifyFighterFromPrompt(currentFighter, instruction);
      res.json({ fighter });
    } catch (err: any) {
      console.error('Error modifying fighter:', err);
      res.status(500).json({ error: err.message || 'Failed to modify fighter' });
    }
  });

  // Tactical coach reasoning
  app.post('/api/fighter-coach', async (req, res) => {
    try {
      const { playerFighter, opponentFighter, telemetry } = req.body;
      const advice = await getTacticalCoachAdvice(playerFighter, opponentFighter, telemetry || {});
      res.json(advice);
    } catch (err: any) {
      console.error('Error getting coach advice:', err);
      res.status(500).json({ error: err.message || 'Failed to get coach advice' });
    }
  });

  // Character evolution
  app.post('/api/evolve-fighter', async (req, res) => {
    try {
      const { fighter, telemetry } = req.body;
      const evolutions = await getFighterEvolutions(fighter, telemetry || {});
      res.json({ evolutions });
    } catch (err: any) {
      console.error('Error getting evolutions:', err);
      res.status(500).json({ error: err.message || 'Failed to get evolutions' });
    }
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server,
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`FIGHT//MIND server running on http://0.0.0.0:${PORT} [Model: ${AI_MODEL_NAME}]`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server start error:', err);
  process.exit(1);
});
