/**
 * Post-build prerender (SSG) for the blog: /blog and every /blog/:slug.
 *
 * Why: the app is a client-rendered SPA, so crawlers fetching a blog URL used
 * to receive an empty shell (`<div id="root"></div>`). This script loads each
 * blog route in headless Chromium against the freshly built ./dist, captures
 * the fully rendered DOM (RouteSeo has already written the per-route title,
 * meta, canonical, OG tags and Article/FAQ/Breadcrumb JSON-LD into <head>),
 * and writes it as a static HTML file. Apache serves the real file before the
 * SPA fallback, so crawlers see full article content in the initial HTML while
 * human visitors still boot the SPA from the same page (scripts are kept).
 *
 * Run: npm run prerender (also runs automatically at the end of `npm run build`).
 * Chrome resolution: CHROME_PATH env, then a cached chrome-headless-shell,
 * then system browsers. When nothing is found the script auto-installs
 * chrome-headless-shell via npx (this is what makes CI prerendering work with
 * zero workflow changes); if that also fails it SKIPS gracefully (warns,
 * exit 0) so local builds never break. Set PRERENDER_NO_INSTALL=1 to skip the
 * auto-install, PRERENDER_STRICT=1 to fail the build when the browser binary
 * is present but broken.
 *
 * Executed with tsx (devDependency); not part of `tsc -b`.
 */
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import puppeteer from 'puppeteer-core';
import { discoverBlogPosts } from './generate-sitemap.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, '..');
const DIST = path.join(REPO, 'dist');

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
  '.pdf': 'application/pdf',
};

/**
 * Returns a usable Chrome binary, auto-installing chrome-headless-shell when
 * none is found (this is what makes CI prerendering work with zero workflow
 * changes). Returns null when installation is disabled or fails — the caller
 * then skips prerendering gracefully.
 */
function ensureChrome(): string | null {
  const found = resolveChrome();
  if (found) return found;
  if (process.env.PRERENDER_NO_INSTALL === '1') return null;
  console.log('[prerender] no Chrome found — installing chrome-headless-shell…');
  try {
    // --path pins the install under $HOME/.cache (the tool appends the
    // browser name itself); without it the tool installs into the current
    // working directory (the repo).
    const cacheDir = path.join(process.env.HOME ?? '/tmp', '.cache');
    fs.mkdirSync(cacheDir, { recursive: true });
    execFileSync(
      'npx',
      ['-y', '@puppeteer/browsers', 'install', '--path', cacheDir, 'chrome-headless-shell@stable'],
      { stdio: 'inherit', timeout: 5 * 60 * 1000, cwd: REPO },
    );
  } catch {
    console.warn('[prerender] chrome-headless-shell install failed.');
    return null;
  }
  return findHeadlessShell();
}

/** A binary path counts only if it actually executes (Ubuntu's
 *  /usr/bin/chromium-browser is a snap shim that fails at launch). */
function isUsableChrome(p: string): boolean {
  try {
    execFileSync(p, ['--version'], { stdio: 'ignore', timeout: 15000 });
    return true;
  } catch {
    return false;
  }
}

/** Finds any usable Chrome/Chromium binary already on the system. */
function resolveChrome(): string | null {
  const fromEnv = process.env.CHROME_PATH;
  if (fromEnv && fs.existsSync(fromEnv) && isUsableChrome(fromEnv)) return fromEnv;
  // chrome-headless-shell installed via `npx @puppeteer/browsers install`
  // — preferred over /usr/bin stubs (Ubuntu's chromium-browser is a snap shim).
  const shell = findHeadlessShell();
  if (shell && isUsableChrome(shell)) return shell;
  for (const p of ['/usr/bin/chromium-browser', '/usr/bin/chromium', '/usr/bin/google-chrome']) {
    if (fs.existsSync(p) && isUsableChrome(p)) return p;
  }
  for (const bin of ['chrome', 'chromium-browser', 'chromium', 'google-chrome']) {
    try {
      const found = execFileSync('which', [bin], { encoding: 'utf8' }).trim().split('\n')[0];
      if (found && fs.existsSync(found) && isUsableChrome(found)) return found;
    } catch {
      /* not on PATH */
    }
  }
  return null;
}

/** chrome-headless-shell installed via `npx @puppeteer/browsers install`
 *  (used in this sandbox; CI auto-installs it — see ensureChrome()). */
function findHeadlessShell(): string | null {
  try {
    const home = process.env.HOME ?? '';
    const base = path.join(home, '.cache/chrome-headless-shell');
    if (fs.existsSync(base)) {
      for (const ver of fs.readdirSync(base)) {
        const p = path.join(base, ver, 'chrome-headless-shell-linux64', 'chrome-headless-shell');
        if (fs.existsSync(p)) return p;
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}

/** Minimal static server for ./dist with SPA fallback (mirrors .htaccess). */
function startServer(): Promise<{ port: number; close: () => Promise<void> }> {
  return new Promise((resolve) => {
    const server = createServer((req: IncomingMessage, res: ServerResponse) => {
      const urlPath = decodeURIComponent((req.url ?? '/').split('?')[0]);
      let file = path.join(DIST, urlPath);
      if (urlPath.endsWith('/')) file = path.join(file, 'index.html');
      if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        file = path.join(DIST, 'index.html'); // SPA fallback
      }
      const ext = path.extname(file).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME[ext] ?? 'application/octet-stream' });
      fs.createReadStream(file).pipe(res);
    });
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      const port = typeof addr === 'object' && addr ? addr.port : 0;
      resolve({ port, close: () => new Promise((r) => server.close(() => r())) });
    });
  });
}

async function prerenderRoute(
  browser: import('puppeteer-core').Browser,
  base: string,
  route: string,
): Promise<{ ok: boolean; html?: string; reason?: string }> {
  const page = await browser.newPage();
  try {
    await page.goto(`${base}${route}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    // Wait for the React app to render the article (blog chunk is lazy-loaded).
    await page
      .waitForFunction(
        () => {
          const root = document.getElementById('root');
          return !!root && root.querySelector('article h1, main h1, article h2');
        },
        { timeout: 20000 },
      )
      .catch(() => {});
    // Let lazy images / fonts settle briefly.
    await new Promise((r) => setTimeout(r, 800));
    const h1Count = await page.evaluate(
      () => document.getElementById('root')?.querySelectorAll('h1').length ?? 0,
    );
    if (h1Count !== 1) {
      return { ok: false, reason: `expected exactly 1 h1 in #root, found ${h1Count}` };
    }
    const html = await page.evaluate(() => '<!doctype html>\n' + document.documentElement.outerHTML);
    return { ok: true, html };
  } catch (err) {
    return { ok: false, reason: String(err).slice(0, 160) };
  } finally {
    await page.close().catch(() => {});
  }
}

async function main(): Promise<void> {
  if (!fs.existsSync(DIST)) {
    console.warn('[prerender] ./dist not found — run `vite build` first. Skipping.');
    return;
  }
  const chromePath = ensureChrome();
  if (!chromePath) {
    console.warn(
      '[prerender] no Chrome/Chromium available (set CHROME_PATH or allow the ' +
        'auto-install) — skipping prerender, SPA shell only.',
    );
    return;
  }

  const posts = discoverBlogPosts();
  const routes = ['/blog', ...posts.map((p) => `/blog/${p.slug}`)];
  console.log(`[prerender] chrome: ${chromePath} — prerendering ${routes.length} routes`);

  const { port, close } = await startServer();
  const base = `http://127.0.0.1:${port}`;
  let browser: import('puppeteer-core').Browser;
  try {
    browser = await puppeteer.launch({
      executablePath: chromePath,
      args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--headless=new'],
    });
  } catch (err) {
    // A found-but-broken binary (e.g. Ubuntu's snap stub) must not break
    // local builds. CI sets PRERENDER_STRICT=1 to fail loudly instead.
    const msg = `[prerender] could not launch ${chromePath}: ${String(err).split('\n')[0]}`;
    if (process.env.PRERENDER_STRICT === '1') {
      console.error(msg);
      await close();
      process.exit(1);
    }
    console.warn(`${msg} — skipping prerender, SPA shell only.`);
    await close();
    return;
  }

  let okCount = 0;
  const failures: string[] = [];
  try {
    for (const route of routes) {
      const result = await prerenderRoute(browser, base, route);
      if (!result.ok || !result.html) {
        failures.push(`${route}: ${result.reason ?? 'unknown'}`);
        console.warn(`[prerender] SKIP ${route} — ${result.reason ?? 'unknown'}`);
        continue;
      }
      // /blog → dist/blog/index.html ; /blog/<slug> → dist/blog/<slug>/index.html
      const outDir = path.join(DIST, ...route.split('/').filter(Boolean));
      fs.mkdirSync(outDir, { recursive: true });
      const stamped =
        result.html + `\n<!-- prerendered ${new Date().toISOString()} -->\n`;
      fs.writeFileSync(path.join(outDir, 'index.html'), stamped, 'utf8');
      okCount++;
    }
  } finally {
    await browser.close().catch(() => {});
    await close();
  }

  console.log(`[prerender] done: ${okCount}/${routes.length} routes prerendered`);
  if (failures.length > 0) {
    console.warn(`[prerender] failures:\n  - ${failures.join('\n  - ')}`);
  }
}

main().catch((err) => {
  console.error('[prerender] fatal:', err);
  process.exit(1);
});
