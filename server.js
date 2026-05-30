/**
 * Custom Next.js server with Socket.IO
 * ✅ cPanel Compatible
 * 
 * Run: node server.js   (instead of `next start`)
 * Dev: node server.js   (instead of `next dev`)
 *
 * For cPanel Node.js Manager:
 *   - Application Startup File: server.js
 *   - Passenger will assign a dynamic PORT
 *   - Server will automatically use it via process.env.PORT
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
const hostname = process.env.HOSTNAME || 'localhost';

const app     = next({ dev });
const handle  = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Attach Socket.IO
  initSocketServer(httpServer);

  httpServer.listen(port, hostname, () => {
    console.log(`🚀 Server ready on http://${hostname}:${port} [${dev ? 'dev' : 'production'}]`);
    if (process.env.PORT) {
      console.log(`✅ Running on cPanel-assigned port: ${port}`);
    }
  });
});

