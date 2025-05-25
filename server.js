import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

console.log('Starting server with environment:', {
  NAVER_CLIENT_ID: process.env.VITE_NAVER_CLIENT_ID ? 'Set' : 'Not set',
  NAVER_CLIENT_SECRET: process.env.VITE_NAVER_CLIENT_SECRET ? 'Set' : 'Not set'
});

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Naver-Client-Id, X-Naver-Client-Secret');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Proxy middleware configuration
const proxyOptions = {
  target: 'https://openapi.naver.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api/search': '/v1/search',
  },
  onProxyRes: function (proxyRes, req, res) {
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
  },
  onProxyReq: function(proxyReq, req) {
    const clientId = process.env.VITE_NAVER_CLIENT_ID;
    const clientSecret = process.env.VITE_NAVER_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error('Missing Naver API credentials');
      return;
    }

    proxyReq.setHeader('X-Naver-Client-Id', clientId);
    proxyReq.setHeader('X-Naver-Client-Secret', clientSecret);

    console.log('Proxy request headers set:', {
      'X-Naver-Client-Id': 'Set',
      'X-Naver-Client-Secret': 'Set'
    });
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.writeHead(500, {
      'Content-Type': 'application/json',
    });
    res.end(JSON.stringify({ error: 'Proxy error occurred', details: err.message }));
  }
};

app.use('/api/search', createProxyMiddleware(proxyOptions));

const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  app.use(express.static(resolve(__dirname, 'dist')));
  app.get('*', (req, res) => {
    if (req.url.startsWith('/api/')) return;
    res.sendFile(resolve(__dirname, 'dist', 'index.html'));
  });
} else {
  app.use(express.static('public'));
}

async function startServer() {
  try {
    if (!isProd) {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    }

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (e) {
    console.error('Error starting server:', e);
    process.exit(1);
  }
}

startServer();