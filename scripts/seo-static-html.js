import { SITE_ORIGIN } from './seo-content.js';

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildStaticHtml(route, meta) {
  const sectionsHtml = (meta.sections || [])
    .map(
      (section) => `
        <section>
          <h2>${escapeHtml(section.h2)}</h2>
          ${section.paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('\n          ')}
        </section>`,
    )
    .join('\n');

  const linksHtml = (meta.links || [])
    .map((link) => `<li><a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a></li>`)
    .join('\n            ');

  return `
    <main id="static-seo-content" lang="en" style="max-width:760px;margin:0 auto;padding:32px 24px 48px;font-family:Inter,system-ui,sans-serif;line-height:1.65;color:#0f172a;background:#fff;">
      <header style="margin-bottom:24px;">
        <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#0ea5e9;letter-spacing:.04em;text-transform:uppercase;">Viszmo</p>
        <h1 style="margin:0 0 16px;font-size:clamp(28px,4vw,40px);line-height:1.15;font-weight:800;color:#0f172a;">${escapeHtml(meta.h1)}</h1>
      </header>
      ${meta.paragraphs.map((p) => `<p style="margin:0 0 16px;font-size:18px;color:#334155;">${escapeHtml(p)}</p>`).join('\n      ')}
      ${sectionsHtml}
      <nav aria-label="Related pages" style="margin-top:32px;padding-top:24px;border-top:1px solid #e2e8f0;">
        <h2 style="margin:0 0 12px;font-size:16px;font-weight:700;color:#0f172a;">Explore Viszmo</h2>
        <ul style="margin:0;padding-left:20px;color:#0369a1;">
            ${linksHtml}
        </ul>
      </nav>
      <p style="margin-top:24px;font-size:14px;color:#64748b;">Full interactive experience loads with JavaScript enabled. Canonical URL: <a href="${escapeHtml(`${SITE_ORIGIN}${route === '/' ? '' : route}`)}">${escapeHtml(`${SITE_ORIGIN}${route === '/' ? '' : route}`)}</a></p>
    </main>`;
}

export function buildJsonLd(route, meta) {
  const url = `${SITE_ORIGIN}${route === '/' ? '' : route}`;

  if (route === '/') {
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          name: 'Viszmo',
          url: SITE_ORIGIN,
          logo: `${SITE_ORIGIN}/viszmofull.png`,
        },
        {
          '@type': 'WebSite',
          name: 'Viszmo',
          url: SITE_ORIGIN,
          description: meta.description,
        },
      ],
    };
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: meta.title,
    description: meta.description,
    url,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Viszmo',
      url: SITE_ORIGIN,
    },
  };
}

export function buildSitemapXml(routes, lastmod) {
  const defaults = {
    '/': { priority: '1.0', changefreq: 'weekly' },
    '/features': { priority: '0.8', changefreq: 'monthly' },
    '/pricing': { priority: '0.8', changefreq: 'monthly' },
    '/how-it-works': { priority: '0.8', changefreq: 'monthly' },
    '/contact': { priority: '0.5', changefreq: 'monthly' },
    '/help': { priority: '0.5', changefreq: 'monthly' },
  };

  const urls = Object.entries(routes)
    .map(([route, meta]) => {
      const loc = `${SITE_ORIGIN}${route === '/' ? '' : route}`;
      const settings = defaults[route] || {
        priority: meta.sitemapPriority || '0.9',
        changefreq: meta.sitemapChangefreq || 'weekly',
      };

      return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${settings.changefreq}</changefreq>
    <priority>${settings.priority}</priority>
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}
