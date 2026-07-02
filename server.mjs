// server.mjs — Node.js/Express host used by Zeabur (and any VPS deploy).
//
// Why this file exists:
//   The original project was built for Vercel's serverless runtime, where
//   each api/*.js file is deployed as a discrete function and the React
//   build is served by Vercel's static edge. Zeabur (and any traditional
//   VPS) needs a single long-running Node.js process that BOTH serves the
//   React static build AND routes /api/* requests to the same handler
//   functions.
//
//   This file provides that host. It:
//     1. Serves the compiled React app from ./build
//     2. Imports each api/*.js file's default export and mounts it at the
//        matching /api/... path via a Vercel→Express adapter
//     3. Falls back to index.html for unknown paths (SPA client routing)
//
// Vercel deploys are unaffected — they ignore this file. When Vercel
// deploys the same repo, it still uses the individual api/*.js files
// directly through its own runtime.
//
// Local dev: `npm run build && npm run serve` starts the exact same
// server on port 3000 that Zeabur runs in production.

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Express body parsing — Vercel Functions auto-parse JSON bodies into
// req.body, so the handlers assume that. Do the same here.
app.use(express.json({ limit: '5mb' }));

// Trust the reverse proxy Zeabur / Aliyun puts in front of us, so
// req.ip / X-Forwarded-* are meaningful in the handlers if they read them.
app.set('trust proxy', true);

// ---- Vercel handler → Express adapter ---------------------------------
// A Vercel handler is `async function(req, res)` returning nothing; it
// writes to res with res.status(...).json(...) or res.status(...).send(...).
// Express handlers have the same shape, so we just call the imported
// default export directly and let Express handle any unhandled promise.
function mount(pathname, importPromise) {
  app.all(pathname, async (req, res, next) => {
    try {
      const mod = await importPromise;
      const handler = mod?.default;
      if (typeof handler !== 'function') {
        return res.status(500).json({ error: `Handler at ${pathname} has no default export.` });
      }
      await handler(req, res);
    } catch (err) {
      console.error(`[${pathname}] handler threw:`, err);
      if (!res.headersSent) {
        res.status(500).json({ error: `Internal server error at ${pathname}: ${err?.message || 'unknown'}` });
      } else {
        next(err);
      }
    }
  });
}

// Dynamic imports so a missing file doesn't crash the whole server at
// startup — the specific endpoint 500s instead.
mount('/api/validate-registration',        import('./api/validate-registration.js'));
mount('/api/consume-registration-code',    import('./api/consume-registration-code.js'));
mount('/api/send-email',                    import('./api/send-email.js'));
mount('/api/registration-codes',           import('./api/registration-codes.js'));
mount('/api/admin-users',                   import('./api/admin-users.js'));
mount('/api/admin-create-student',         import('./api/admin-create-student.js'));
mount('/api/admin-delete-attempt',         import('./api/admin-delete-attempt.js'));
mount('/api/admin-archive-attempt',        import('./api/admin-archive-attempt.js'));
mount('/api/admin-student-preview',        import('./api/admin-student-preview.js'));
mount('/api/runtime-config',                import('./api/runtime-config.js'));

// ---- Static React build + SPA fallback --------------------------------
const buildDir = path.join(__dirname, 'build');
app.use(express.static(buildDir, {
  // Long cache for hashed assets; index.html stays no-cache so new
  // deploys are picked up immediately.
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('index.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    } else if (/\.(js|css|woff2?|png|jpg|svg|ico)$/.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

// SPA fallback — any GET request that didn't match an API route or a static
// file falls through to index.html so client-side React Router works.
// Uses an explicit string prefix check instead of a regex so there's no
// chance of accidentally catching /api/* requests.
app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  if (req.path.startsWith('/api/')) {
    // If we got here it means no API route matched — return a proper 404
    // instead of the React index.html so the client can distinguish a
    // missing endpoint from a rendering issue.
    return res.status(404).json({ error: `No API route registered for ${req.path}` });
  }
  res.sendFile(path.join(buildDir, 'index.html'));
});

// ---- Boot -------------------------------------------------------------
const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[server.mjs] listening on port ${PORT}`);
  console.log(`[server.mjs] serving React build from ${buildDir}`);
});
