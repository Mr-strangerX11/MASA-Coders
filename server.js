/**
 * Custom Next.js server with Socket.IO
 * Run: node server.js   (instead of `next start`)
 * Dev: node server.js   (instead of `next dev`)
 *
 * Set in package.json:
 *   "start": "NODE_ENV=production node server.js"
 *   "dev":   "node server.js"
 */
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { initSocketServer } from './src/lib/socket/server.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const dev  = process.env.NODE_ENV !== 'production';
const port = parseInt(process.env.PORT || '3000', 10);

const app     = next({ dev });
const handle  = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Attach Socket.IO
  initSocketServer(httpServer);

  httpServer.listen(port, () => {
    console.log(`🚀 Server ready on http://localhost:${port} [${dev ? 'dev' : 'production'}]`);
  });
});
