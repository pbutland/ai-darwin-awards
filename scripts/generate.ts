import fs from 'fs';
import path from 'path';
import { nomineeHtml, nomineeDetailHtml, getSlug, generateJsonLdNominees } from './nominees-util.js';
import { generateRSSFeed } from './rss-utils.js';
import { updateSitemapFile } from './sitemap-util.js';
import { 
  generateResultsPages, 
  groupResultsByYear, 
  calculateYearSummary,
  extractWinnerInfo,
  type Nominee,
  type ResultsNominee,
  type WinnerInfo
} from './results-util.js';

// ============================================================================
// Configuration
// ============================================================================

const docsDir = path.join(__dirname, '../docs');
const baseUrl = 'https://aidarwinawards.org';

const paths = {
  nominees: path.join(docsDir, 'data/v1/nominees.json'),
  results: path.join(docsDir, 'data/v1/results.json'),
  nomineesDir: path.join(docsDir, 'nominees'),
  resultsBaseDir: path.join(docsDir, 'results'),
  nomineeTemplate: path.join(__dirname, 'templates/nominee-template.html'),
  resultsTemplate: path.join(__dirname, 'templates/results-template.html'),
  resultsNomineeTemplate: path.join(__dirname, 'templates/results-nominee-template.html'),
  countdownJs: path.join(docsDir, 'js/countdown.js'),
  rssXml: path.join(docsDir, 'rss.xml')
};

// ============================================================================
// Nominee Generation
// ============================================================================

function generateNominees() {
  console.log('\n=== Generating Nominee Pages ===\n');

  const nominees = JSON.parse(fs.readFileSync(paths.nominees, 'utf-8'));

  // Ensure output dir exists
  fs.mkdirSync(paths.nomineesDir, { recursive: true });

  // Read template
  const nomineeTemplate = fs.readFileSync(paths.nomineeTemplate, 'utf-8');

  // Generate detail pages in reverse order
  for (let i = nominees.length - 1; i >= 0; i--) {
    const nominee = nominees[i];
    const slug = getSlug(nominee);
    const outPath = path.join(paths.nomineesDir, `${slug}.html`);
    
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
    const yearHtmlPath = path.join(docsDir, `nominees-${year}.html`);
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

  console.log('✓ Nominee HTML and detail pages generated.');

  // Calculate the most recent nominee date and update JavaScript
  const lastNomineeDate = nominees
    .filter((n: any) => n.badge === 'Verified')
    .map((n: any) => new Date(n.reportedDate))
    .sort((a: Date, b: Date) => b.getTime() - a.getTime())[0]
    .toISOString().split('T')[0];

  // Update the JavaScript file with the latest nominee date
  let jsContent = fs.readFileSync(paths.countdownJs, 'utf-8');
  jsContent = jsContent.replace(
    /const lastNomineeDate = '[^']*';/,
    `const lastNomineeDate = '${lastNomineeDate}';`
  );
  fs.writeFileSync(paths.countdownJs, jsContent, 'utf-8');
  console.log(`✓ Updated countdown date to: ${lastNomineeDate}`);

  return nominees;
}

// ============================================================================
// Results Generation
// ============================================================================

function generateResults(nominees: Nominee[]): WinnerInfo[] | undefined {
  console.log('\n=== Generating Results Pages ===\n');

  // Check if results file exists
  if (!fs.existsSync(paths.results)) {
    console.log('⊘ No results file found. Skipping results generation.');
    return undefined;
  }

  const allResults: ResultsNominee[] = JSON.parse(fs.readFileSync(paths.results, 'utf-8'));

  // Group results by year
  const resultsByYear = groupResultsByYear(allResults, nominees);

  // Generate results for each year
  resultsByYear.forEach((yearResults, year) => {
    console.log(`\nGenerating results for ${year}...`);
    
    const summary = calculateYearSummary(yearResults);
    const outputDir = path.join(paths.resultsBaseDir, year);
    
    generateResultsPages(
      year,
      yearResults,
      nominees,
      paths.resultsTemplate,
      outputDir,
      paths.resultsNomineeTemplate,
      summary
    );

    console.log(`✓ Completed results for ${year}`);
  });

  console.log('\n✓ Results generation complete!');
  
  // Extract winner information for RSS feed
  return extractWinnerInfo(resultsByYear);
}

// ============================================================================
// Shared Generation (RSS, Sitemap)
// ============================================================================

function generateSharedFiles(nominees: Nominee[], winnerInfo?: WinnerInfo[]) {
  console.log('\n=== Generating Shared Files ===\n');

  // Generate sitemap.xml
  updateSitemapFile(baseUrl, docsDir);
  console.log('✓ Sitemap generated');

  // Write RSS feed with winner announcements
  const rssContent = generateRSSFeed(nominees, winnerInfo);
  fs.writeFileSync(paths.rssXml, rssContent, 'utf-8');
  console.log('✓ RSS feed generated');
}

// ============================================================================
// Main Execution
// ============================================================================

try {
  console.log('🚀 Starting site generation...\n');
  
  const nominees = generateNominees();
  const winnerInfo = generateResults(nominees);
  generateSharedFiles(nominees, winnerInfo);
  
  console.log('\n✅ Site generation complete!\n');
} catch (error) {
  console.error('\n❌ Error during generation:', error);
  process.exit(1);
}
