import fs from 'fs';
import path from 'path';
import { nomineeHtml, nomineeDetailHtml, getSlug, generateJsonLdNominees } from './nominees-util.js';
import { generateSitemap } from './sitemap-util.js';

// Paths
const nomineesPath = path.join(__dirname, '../docs/data/v1/nominees.json');
const htmlPath = path.join(__dirname, '../docs/nominees-2025.html');
const nomineesDir = path.join(__dirname, '../docs/nominees');
const nomineeTemplatePath = path.join(__dirname, 'nominee-template.html');
const docsDir = path.join(__dirname, '../docs');
const sitemapPath = path.join(docsDir, 'sitemap.xml');
const baseUrl = 'https://aidarwinawards.org';

// Read nominees JSON
const nominees = JSON.parse(fs.readFileSync(nomineesPath, 'utf-8'));

// Ensure output dir exists
if (!fs.existsSync(nomineesDir)) {
  fs.mkdirSync(nomineesDir, { recursive: true });
}

// Read template
const nomineeTemplate = fs.readFileSync(nomineeTemplatePath, 'utf-8');

// Generate detail pages
for (const nominee of nominees) {
  const slug = getSlug(nominee);
  const outPath = path.join(nomineesDir, `${slug}.html`);
  const html = nomineeDetailHtml(nominee, nomineeTemplate);
  fs.writeFileSync(outPath, html, 'utf-8');
  console.log(`Generated: docs/nominees/${slug}.html`);
}

// Update nominees-2025.html
let html = fs.readFileSync(htmlPath, 'utf-8');

// Replace the HTML nominees section
html = html.replace(
  /<!-- BEGIN NOMINEES -->(.|\n|\r)*?<!-- END NOMINEES -->/g,
  `<!-- BEGIN NOMINEES -->${nominees.map(nomineeHtml).join('\n')}
            <!-- END NOMINEES -->`
);

// Replace the JSON-LD hasPart array
const jsonLdNominees = generateJsonLdNominees(nominees);
const jsonLdString = JSON.stringify(jsonLdNominees, null, 2).replace(/(?<=\n)^/gm, '            ');
html = html.replace(
  /"hasPart": \[[\s\S]*?\]/,
  `"hasPart": ${jsonLdString}`
);

fs.writeFileSync(htmlPath, html, 'utf-8');

console.log('Nominee HTML and detail pages generated.');

// Generate sitemap.xml
const nomineeSlugs = nominees.map(getSlug);
let prevSitemapXml: string | undefined = undefined;
try {
  prevSitemapXml = fs.readFileSync(sitemapPath, 'utf-8');
} catch {}
const sitemapXml = generateSitemap(baseUrl, docsDir, nomineeSlugs, prevSitemapXml);
fs.writeFileSync(sitemapPath, sitemapXml, 'utf-8');
console.log('Sitemap generated at docs/sitemap.xml');
