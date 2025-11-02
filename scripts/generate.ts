import fs from 'fs';
import path from 'path';
import { nomineeHtml, nomineeDetailHtml, getSlug, generateJsonLdNominees } from './nominees-util.js';
import { generateRSSFeed } from './rss-utils.js';
import { updateSitemapFile } from './sitemap-util.js';

// Paths
const nomineesPath = path.join(__dirname, '../docs/data/v1/nominees.json');
const htmlPath = path.join(__dirname, '../docs/nominees-2025.html');
const nomineesDir = path.join(__dirname, '../docs/nominees');
const nomineeTemplatePath = path.join(__dirname, 'templates/nominee-template.html');
const docsDir = path.join(__dirname, '../docs');
const baseUrl = 'https://aidarwinawards.org';

// Read nominees JSON
const nominees = JSON.parse(fs.readFileSync(nomineesPath, 'utf-8'));

// Ensure output dir exists
if (!fs.existsSync(nomineesDir)) {
  fs.mkdirSync(nomineesDir, { recursive: true });
}

// Read template
const nomineeTemplate = fs.readFileSync(nomineeTemplatePath, 'utf-8');

// Generate detail pages in reverse order
for (let i = nominees.length - 1; i >= 0; i--) {
  const nominee = nominees[i];
  const slug = getSlug(nominee);
  const outPath = path.join(nomineesDir, `${slug}.html`);
  // Determine previous and next nominees (if any)
  const prevNominee = i < nominees.length - 1 ? nominees[i + 1] : null;
  const nextNominee = i > 0 ? nominees[i - 1] : null;
  const nomineeYear = String(new Date(nominee.reportedDate).getFullYear());
  // Replace [YEAR] in the template
  const nomineeTemplateForYear = nomineeTemplate.replace(/\[YEAR\]/g, nomineeYear);
  const html = nomineeDetailHtml(nominee, nomineeTemplateForYear, prevNominee, nextNominee);
  fs.writeFileSync(outPath, html, 'utf-8');
  console.log(`Generated: docs/nominees/${slug}.html`);
}

// Update nominees-2025.html

// Group nominees by year
const nomineesByYear: Record<string, typeof nominees> = {};
for (const nominee of nominees) {
  const year = String(new Date(nominee.reportedDate).getFullYear());
  if (!nomineesByYear[year]) nomineesByYear[year] = [];
  nomineesByYear[year].push(nominee);
}

// For each year, update nominees-YYYY.html
for (const year of Object.keys(nomineesByYear)) {
  const yearNominees = nomineesByYear[year];
  const yearHtmlPath = path.join(__dirname, `../docs/nominees-${year}.html`);
  let yearHtml = fs.readFileSync(yearHtmlPath, 'utf-8');

  // Replace the HTML nominees section
  yearHtml = yearHtml.replace(
    /<!-- BEGIN NOMINEES -->(.|\n|\r)*?<!-- END NOMINEES -->/g,
    `<!-- BEGIN NOMINEES -->${yearNominees.map(nomineeHtml).join('\n')}
            <!-- END NOMINEES -->`
  );
  // Replace the JSON-LD hasPart array
  const jsonLdNominees = generateJsonLdNominees(yearNominees);
  const jsonLdString = JSON.stringify(jsonLdNominees, null, 2).replace(/(?<=\n)^/gm, '            ');
  yearHtml = yearHtml.replace(
    /"hasPart": \[[\s\S]*?\]/,
    `"hasPart": ${jsonLdString}`
  );
  fs.writeFileSync(yearHtmlPath, yearHtml, 'utf-8');
  console.log(`Nominee HTML generated for year ${year}: docs/nominees-${year}.html`);
}

console.log('Nominee HTML and detail pages generated.');

// Calculate the most recent nominee date and update JavaScript
const lastNomineeDate = nominees
  .filter((n: any) => n.badge === 'Verified')
  .map((n: any) => new Date(n.reportedDate))
  .sort((a: Date, b: Date) => b.getTime() - a.getTime())[0]
  .toISOString().split('T')[0];

// Update the JavaScript file with the latest nominee date
const jsPath = path.join(__dirname, '../docs/js/countdown.js');
let jsContent = fs.readFileSync(jsPath, 'utf-8');
jsContent = jsContent.replace(
  /const lastNomineeDate = '[^']*';/,
  `const lastNomineeDate = '${lastNomineeDate}';`
);
fs.writeFileSync(jsPath, jsContent, 'utf-8');
console.log(`Updated countdown date to: ${lastNomineeDate}`);

// Generate sitemap.xml
updateSitemapFile(baseUrl, docsDir);

// Write RSS feed to project root as /rss.xml
const rssContent = generateRSSFeed(nominees);
fs.writeFileSync(path.join(__dirname, '../docs/rss.xml'), rssContent, 'utf-8');
console.log('RSS feed generated at /rss.xml');
