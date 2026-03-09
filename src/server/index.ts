// Bun HTTP Server - serves static files and handles WebSocket upgrades
import { handleWS } from './ws-server.ts';

const PORT = parseInt(process.env.PORT || '3000');

const server = Bun.serve({
  port: PORT,
  
  async fetch(req, server) {
    const url = new URL(req.url);
    
    // WebSocket upgrade
    if (url.pathname === '/ws') {
      const success = server.upgrade(req);
      if (success) return undefined;
      return new Response('WebSocket upgrade failed', { status: 400 });
    }
    
    // API proxy for OMV RPC (optional CORS handling)
    if (url.pathname === '/api') {
      const omvUrl = new URL(req.url);
      omvUrl.host = process.env.OMV_HOST ? new URL(process.env.OMV_HOST).host : 'localhost';
      omvUrl.port = process.env.OMV_HOST ? new URL(process.env.OMV_HOST).port : '80';
      
      const response = await fetch(omvUrl.toString(), {
        method: req.method,
        headers: {
          'Content-Type': 'application/json',
          ...Object.fromEntries(req.headers.entries()),
        },
        body: req.body,
      });
      
      return new Response(response.body, {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Serve static files from dist/ or public/
    let filePath = url.pathname;
    if (filePath === '/') filePath = '/index.html';
    
    const distFile = Bun.file(`dist${filePath}`);
    if (await distFile.exists()) {
      return new Response(distFile);
    }
    
    const publicFile = Bun.file(`public${filePath}`);
    if (await publicFile.exists()) {
      return new Response(publicFile);
    }
    
    // Fallback to index.html for SPA routing
    const indexHtml = Bun.file('dist/index.html');
    if (await indexHtml.exists()) {
      return new Response(indexHtml);
    }
    
    return new Response('Not Found', { status: 404 });
  },
  
  websocket: {
    open(ws) {
      handleWS(ws as unknown as WSConnection);
    },
    message(ws, message) {
      // Handled in handleWS
    },
    close(ws) {
      // Handled in handleWS
    },
  },
});

console.log(`Server running at http://localhost:${PORT}`);
