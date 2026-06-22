import path from 'path';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { app as apiApp, initDatabase } from './server/index.js';

async function bootstrap() {
  const PORT = 3000;

  // Initialize relational tables and defaults
  await initDatabase();

  // Create an Express wrapper to hold both the backend API and frontend service
  const mainApp = express();

  // 1. Mount API routes from /server/index.js
  mainApp.use(apiApp);

  // 2. Mount Vite assets or static bundle based on production mode
  if (process.env.NODE_ENV !== 'production') {
    console.log('Running in development mode. Initializing Vite middleware...');
    
    // Create a Vite dev server in middleware mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    // All request URLs that are not APIs will hit Vite
    mainApp.use(vite.middlewares);
  } else {
    console.log('Running in production mode. Serving static bundle from /dist...');
    
    const distPath = path.join(process.cwd(), 'dist');
    mainApp.use(express.static(distPath));
    
    // Fallback single-page routing to index.html
    mainApp.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Bind to port 3000 (standard for AIS containers) On host 0.0.0.0
  mainApp.listen(PORT, '0.0.0.0', () => {
    console.log(`=== E-Commerce Application online ===`);
    console.log(`Local Access: http://localhost:${PORT}`);
    console.log(`Development App URL: ${process.env.APP_URL || 'No active app URL environment configuration'}`);
  });
}

bootstrap().catch(err => {
  console.error('Core system failed to boot:', err);
});
