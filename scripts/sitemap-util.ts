import fs from 'fs';
import path from 'path';

// List of static HTML files to always include in the sitemap, with optional priority
const staticPages: Array<{ file: string; priority?: string }> = [
  { file: 'index.html', priority: '1.0' },
  { file: 'nominees-2025.html', priority: '0.9' },
  { file: 'faq.html', priority: '0.7' },
];

// Helper to get lastmod for a file
function getLastMod(filePath: string): string {
  try {
    const stats = fs.statSync(filePath);
    return stats.mtime.toISOString().split('T')[0];
  } catch {
    return '';
  }
}

// Helper to build a sitemap entry
function sitemapEntry(url: string, lastmod?: string, priority = '0.7') {
  return `<url>\n  <loc>${url}</loc>\n  ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}\n  <priority>${priority}</priority>\n</url>`;
}

export function generateSitemap(baseUrl: string, docsDir: string, nomineeSlugs: string[]) {
  const staticEntries = staticPages.map(({ file, priority }) => {
    const filePath = path.join(docsDir, file);
    return sitemapEntry(`${baseUrl}/${file}`, getLastMod(filePath), priority || '0.7');
  });

  const nomineeEntries = nomineeSlugs.map(slug => {
    const filePath = path.join(docsDir, 'nominees', `${slug}.html`);
    return sitemapEntry(`${baseUrl}/nominees/${slug}.html`, getLastMod(filePath), '0.8');
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...staticEntries, ...nomineeEntries].join('\n')}\n</urlset>\n`;
  return sitemap;
}
