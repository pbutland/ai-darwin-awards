import fs from 'fs';
import path from 'path';
import { getCommittedFileContents } from './git-utils.js';

const excludePages = new Set<string>([
  '404.html',
  'site-map.html'
]);

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
    // File unchanged from git - use previous sitemap lastmod if available
    const prevLastmod = prevSitemapMap.get(url);
    if (prevLastmod) {
      return prevLastmod;
    }
    // File wasn't in previous sitemap - use git commit date or mtime as fallback
    try {
      const stats = fs.statSync(filePath);
      return stats.mtime.toLocaleDateString('sv-SE');
    } catch {
      return '';
    }
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

function getPriority(file: string): string {
  // Homepage gets highest priority
  if (file === 'index.html') return '1.0';
  
  // Year-based nominee pages and results pages
  if (/^nominees-\d{4}\.html$/.test(file)) return '0.9';
  if (file.includes('results/') && file.endsWith('/results.html')) return '0.9';
  
  // Vote and winners pages
  if (file === 'vote.html' || file === 'winners.html' || /^winners-\d{4}\.html$/.test(file)) return '0.9';
  
  // Individual nominee and result pages
  if (file.startsWith('nominees/') || file.includes('results/')) return '0.8';
  
  // Everything else (FAQ, etc.)
  return '0.7';
}

function getUrlPath(file: string): string {
  // Homepage should be root URL
  if (file === 'index.html') return '';
  return file;
}

function scanDirectory(dir: string, baseDir: string, relativePath: string = ''): Array<{ file: string; priority: string }> {
  const pages: Array<{ file: string; priority: string }> = [];
  
  const entries = fs.readdirSync(dir);
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const relPath = relativePath ? `${relativePath}/${entry}` : entry;
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Recursively scan subdirectories
      pages.push(...scanDirectory(fullPath, baseDir, relPath));
    } else if (stat.isFile() && entry.endsWith('.html')) {
      pages.push({ file: relPath, priority: getPriority(relPath) });
    }
  }
  
  return pages;
}

function scanAllPages(docsDir: string): Array<{ file: string; priority: string }> {
  return scanDirectory(docsDir, docsDir);
}

export function updateSitemapFile(baseUrl: string, docsDir: string) {
  // Read existing sitemap for lastmod preservation
  const sitemapPath = path.join(docsDir, 'sitemap.xml');
  let prevSitemapXml: string | undefined;
  try {
    prevSitemapXml = fs.readFileSync(sitemapPath, 'utf-8');
  } catch {}

  // Parse previous sitemap if available
  let prevSitemapMap: Map<string, string> | null = null;
  if (prevSitemapXml) {
    try {
      prevSitemapMap = parseSitemapLastmod(prevSitemapXml);
    } catch {
      prevSitemapMap = null;
    }
  }

  // Scan for all pages
  const allPages = scanAllPages(docsDir).filter(({ file }) => !excludePages.has(file));

  // Generate entries for all pages
  const entries = allPages.map(({ file, priority }) => {
    const filePath = path.join(docsDir, file);
    const urlPath = getUrlPath(file);
    const fullUrl = urlPath ? `${baseUrl}/${urlPath}` : baseUrl;
    const lastmod = getLastMod({ filePath, url: fullUrl, prevSitemapMap });
    return sitemapEntry(fullUrl, lastmod, priority);
  });

  // Generate and write sitemap
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`;
  fs.writeFileSync(sitemapPath, sitemap, 'utf-8');
  console.log('Sitemap updated at docs/sitemap.xml');
}
