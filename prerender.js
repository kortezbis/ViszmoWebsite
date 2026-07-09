import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pingIndexNow } from './scripts/indexnow-helper.js';
import { seoRoutes, SITE_ORIGIN, SITEMAP_LASTMOD } from './scripts/seo-content.js';
import { buildJsonLd, buildSitemapXml, buildStaticHtml, escapeHtml } from './scripts/seo-static-html.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.join(__dirname, 'dist');
const PUBLIC_DIR = path.join(__dirname, 'public');
const TEMPLATE_PATH = path.join(DIST_DIR, 'index.html');

function upsertMeta(html, attrName, attrValue, content) {
  const regex = new RegExp(`<meta\\s+${attrName}="${attrValue}"\\s+content="[^"]*"\\s*/?>`, 'i');
  const tag = `<meta ${attrName}="${attrValue}" content="${escapeHtml(content)}" />`;
  return regex.test(html) ? html.replace(regex, tag) : html;
}

function upsertLink(html, rel, href) {
  const regex = new RegExp(`<link\\s+rel="${rel}"\\s+href="[^"]*"\\s*/?>`, 'i');
  const tag = `<link rel="${rel}" href="${escapeHtml(href)}" />`;
  if (regex.test(html)) return html.replace(regex, tag);
  const headEndIndex = html.indexOf('</head>');
  if (headEndIndex === -1) return html;
  return `${html.slice(0, headEndIndex)}  ${tag}\n${html.slice(headEndIndex)}`;
}

function injectBeforeHeadClose(html, snippet) {
  const headEndIndex = html.indexOf('</head>');
  if (headEndIndex === -1) return html;
  return `${html.slice(0, headEndIndex)}${snippet}\n${html.slice(headEndIndex)}`;
}

function writeRouteHtml(route, html) {
  if (route === '/') {
    fs.writeFileSync(TEMPLATE_PATH, html, 'utf-8');
    console.log('Pre-rendered: / -> dist/index.html');
    return;
  }

  const targetDir = path.join(DIST_DIR, route.slice(1));
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(path.join(targetDir, 'index.html'), html, 'utf-8');
  console.log(`Pre-rendered: ${route} -> dist/${route.slice(1)}/index.html`);
}

async function prerender() {
  if (!fs.existsSync(TEMPLATE_PATH)) {
    console.error(`Build template not found at ${TEMPLATE_PATH}. Did you run "npm run build" first?`);
    process.exit(1);
  }

  const template = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
  console.log('Starting static pre-rendering for SEO routes...');

  Object.entries(seoRoutes).forEach(([route, meta]) => {
    let html = template;
    const fullUrl = `${SITE_ORIGIN}${route === '/' ? '' : route}`;

    html = html.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(meta.title)}</title>`);
    html = upsertMeta(html, 'name', 'description', meta.description);
    html = upsertMeta(html, 'name', 'keywords', meta.keywords);
    html = upsertMeta(html, 'name', 'robots', 'index, follow');

    html = upsertMeta(html, 'property', 'og:url', fullUrl);
    html = upsertMeta(html, 'property', 'og:title', meta.title);
    html = upsertMeta(html, 'property', 'og:description', meta.description);
    html = upsertMeta(html, 'property', 'twitter:url', fullUrl);
    html = upsertMeta(html, 'property', 'twitter:title', meta.title);
    html = upsertMeta(html, 'property', 'twitter:description', meta.description);

    html = upsertLink(html, 'canonical', fullUrl);

    const jsonLd = buildJsonLd(route, meta);
    html = injectBeforeHeadClose(
      html,
      `  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`,
    );

    const staticHtml = buildStaticHtml(route, meta);
    const rootRegex = /<div id="root"[^>]*>/i;
    html = html.replace(rootRegex, `$&${staticHtml}`);

    writeRouteHtml(route, html);
  });

  const sitemapXml = buildSitemapXml(seoRoutes, SITEMAP_LASTMOD);
  fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemapXml, 'utf-8');
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), sitemapXml, 'utf-8');
  console.log(`Generated sitemap.xml with ${Object.keys(seoRoutes).length} URLs`);

  console.log('Static pre-rendering successfully completed!');

  try {
    const preRenderedUrls = Object.keys(seoRoutes).map(
      (route) => `${SITE_ORIGIN}${route === '/' ? '' : route}`,
    );
    await pingIndexNow(preRenderedUrls);
  } catch (error) {
    console.error('[IndexNow] Error pinging IndexNow after pre-rendering:', error);
  }
}

prerender();
