import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'image-proxy',
        configureServer(server) {
          server.middlewares.use('/api/proxy-image', async (req, res) => {
            try {
              const urlObj = new URL(req.url || '', `http://${req.headers.host || 'localhost:3000'}`);
              const target = urlObj.searchParams.get('url');
              if (!target) {
                res.statusCode = 400;
                res.end('Missing url parameter');
                return;
              }
              const upstream = await fetch(target, {
                headers: {
                  'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                  Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                  Referer: 'https://www.fragrantica.es/',
                },
              });
              if (!upstream.ok) {
                res.statusCode = upstream.status;
                res.end(`Upstream failed: ${upstream.status}`);
                return;
              }
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.setHeader('Content-Type', upstream.headers.get('content-type') || 'image/jpeg');
              res.setHeader('Cache-Control', 'public, max-age=86400');
              const buffer = await upstream.arrayBuffer();
              res.end(Buffer.from(buffer));
            } catch (err: any) {
              res.statusCode = 500;
              res.end(err.message);
            }
          });
        },
      },
    ],
    envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
