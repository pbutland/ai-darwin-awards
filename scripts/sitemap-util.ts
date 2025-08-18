import fs from 'fs';
import path from 'path';
import { getCommittedFileContents } from './git-utils.js';

// List of static HTML files to always include in the sitemap, with optional priority
const staticPages: Array<{ file: string; priority?: string; url?: string }> = [
  { file: 'index.html', url: '', priority: '1.0' }, // Use root URL for homepage
  { file: 'nominees-2025.html', priority: '0.9' },
  { file: 'faq.html', priority: '0.7' },
];


// Helper to get lastmod for a file, using git and previous sitemap.xml if available
function getLastMod({ filePath, url, prevSitemapMap }: { filePath: string, url: string, prevSitemapMap: Map<string, string> | null }): string {
  // If no previous sitemap, always use current mtime
  if (!prevSitemapMap) {
    try {
      const stats = fs.statSync(filePath);
      // Return local date in YYYY-MM-DD format
      return stats.mtime.toLocaleDateString('sv-SE');
    } catch {
      return '';
    }
  }
  // Compare file content to committed version
  const relPath = path.relative(process.cwd(), filePath);
  let committedContent: string | null = null;
  try {
    committedContent = getCommittedFileContents(relPath);
  } catch {}
  let changed = true;
  if (committedContent !== null) {
    try {
      const currentContent = fs.readFileSync(filePath, 'utf-8');
      changed = currentContent !== committedContent;
    } catch {
      changed = true;
    }
  }
  if (changed) {
    try {
      const stats = fs.statSync(filePath);
      // Return local date in YYYY-MM-DD format
      return stats.mtime.toLocaleDateString('sv-SE');
    } catch {
      return '';
    }
  } else {
    // Use previous lastmod from sitemap
    return prevSitemapMap.get(url) || '';
  }
}


// Helper to build a sitemap entry
function sitemapEntry(url: string, lastmod?: string, priority = '0.7') {
  return `<url>\n  <loc>${url}</loc>\n  ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}\n  <priority>${priority}</priority>\n</url>`;
}

export function parseSitemapLastmod(sitemapXml: string): Map<string, string> {
  const map = new Map<string, string>();
  const urlBlocks = sitemapXml.match(/<url>([\s\S]*?)<\/url>/g) || [];
  for (const block of urlBlocks) {
    const locMatch = block.match(/<loc>(.*?)<\/loc>/);
    const lastmodMatch = block.match(/<lastmod>(.*?)<\/lastmod>/);
    if (locMatch) {
      map.set(locMatch[1], lastmodMatch ? lastmodMatch[1] : '');
    }
  }
  return map;
}

export function generateSitemap(baseUrl: string, docsDir: string, nomineeSlugs: string[], prevSitemapXml?: string) {
  // Parse previous sitemap if available
  let prevSitemapMap: Map<string, string> | null = null;
  if (prevSitemapXml) {
    try {
      prevSitemapMap = parseSitemapLastmod(prevSitemapXml);
    } catch {
      prevSitemapMap = null;
    }
  }

  const staticEntries = staticPages.map(({ file, priority, url }) => {
    const filePath = path.join(docsDir, file);
    const pageUrl = url !== undefined ? url : file; // Use custom URL if provided, otherwise use filename
    const fullUrl = pageUrl ? `${baseUrl}/${pageUrl}` : baseUrl; // Handle root URL case
    const lastmod = getLastMod({ filePath, url: fullUrl, prevSitemapMap });
    return sitemapEntry(fullUrl, lastmod, priority || '0.7');
  });

  const nomineeEntries = nomineeSlugs.map(slug => {
    const filePath = path.join(docsDir, 'nominees', `${slug}.html`);
    const url = `${baseUrl}/nominees/${slug}.html`;
    const lastmod = getLastMod({ filePath, url, prevSitemapMap });
    return sitemapEntry(url, lastmod, '0.8');
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...staticEntries, ...nomineeEntries].join('\n')}\n</urlset>\n`;
  return sitemap;
}
