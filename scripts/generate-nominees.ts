import fs from 'fs';
import path from 'path';

// Paths
const nomineesPath = path.join(__dirname, 'nominees-2025.json');
const htmlPath = path.join(__dirname, '../docs/nominees-2025.html');

// Read nominees JSON
const nominees = JSON.parse(fs.readFileSync(nomineesPath, 'utf-8'));

// Generate nominee HTML
function nomineeHtml(nominee: any) {
  return `
            <details class="nominee" id="${nominee.id}">
                <summary>
                    <span class="nominee-title">${nominee.title}</span>
                    <h3 class="category">${nominee.category}</h3>
                    <span class="${nominee.badge.toLowerCase()}-badge">${nominee.badge}</span>
                </summary>
                <div class="nominee-details">
                    <p class="attribution">
                        <strong>Nominee:</strong> ${nominee.nominee}
                    </p>
                    <p class="attribution">
                        <strong>Reported by:</strong> ${nominee.reportedBy}
                    </p>
                    ${nominee.sections.map((section: any) => `<div class="nominee-section">
                        <h3>${section.heading}</h3>
                        <p>${section.content}</p>
                    </div>
                    `).join('')}<p>
                        <strong>Sources:</strong> ${nominee.sources.map((src: any) => `<a href="${src.url}" target="_blank" rel="noopener">${src.name}</a>`).join(' | ')}
                    </p>
                </div>
            </details>`;
}

// Read the existing HTML file
let html = fs.readFileSync(htmlPath, 'utf-8');

// Remove existing nominee sections (between <!-- BEGIN NOMINEES --> and <!-- END NOMINEES -->)
html = html.replace(
  /<!-- BEGIN NOMINEES -->(.|\n|\r)*?<!-- END NOMINEES -->/g,
  `<!-- BEGIN NOMINEES -->${nominees.map(nomineeHtml).join('\n')}\n            <!-- END NOMINEES -->`
);

// Write back the updated HTML
fs.writeFileSync(htmlPath, html, 'utf-8');

console.log('Nominee HTML and meta tags updated.');
