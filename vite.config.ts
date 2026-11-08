import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { getNews } from './api/news';

// Scans the real ambient folder at build/dev time. No server directory listing is required.
function ambientManifest() {
  const id = 'virtual:ambient-tracks';
  return {
    name: 'asadcore-ambient-manifest',
    enforce: 'pre' as const,
    resolveId(source: string) { if (source === id) return id; },
    load(mid: string) {
      if (mid !== id) return;
      const dir = path.resolve(process.cwd(), 'public/audio/ambient');
      let files: string[] = [];
      try { files = fs.readdirSync(dir).filter(f => /\.(mp3|ogg|wav|m4a)$/i.test(f)).sort(); } catch {}
      return `export default ${JSON.stringify(files.map(f => '/audio/ambient/' + f))};`;
    }
  };
}

function newsApi() {
  return {
    name: 'asadcore-news-api',
    configureServer(server: any) {
      server.middlewares.use('/api/news', async (_req: any, res: any) => {
        try { const items = await getNews(); res.setHeader('Content-Type', 'application/json'); res.setHeader('Cache-Control', 's-maxage=900'); res.end(JSON.stringify({ items, cachedAt: Date.now() })); }
        catch { res.statusCode = 200; res.end(JSON.stringify({ items: [] })); }
      });
    },
    configurePreviewServer(server: any) {
      server.middlewares.use('/api/news', async (_req: any, res: any) => {
        try { const items = await getNews(); res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ items, cachedAt: Date.now() })); }
        catch { res.end(JSON.stringify({ items: [] })); }
      });
    }
  };
}

export default defineConfig({
  plugins: [ambientManifest(), newsApi()],
  build: { target: 'es2022', chunkSizeWarningLimit: 900 },
  server: { host: '0.0.0.0', port: 5173, allowedHosts: true },
  preview: { host: '0.0.0.0', port: 4173, allowedHosts: true }
});
